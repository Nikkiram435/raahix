# /api/places: Geoapify (OpenStreetMap data) se places. API key sirf server par rehti hai.
# Sirf login kiye hue user ke liye, aur har jawab yaad rakha jaata hai taaki free quota bache.

import logging
import os
import re
import time
from collections import defaultdict, deque
from typing import Annotated, Literal
from urllib.parse import urlparse

import httpx
from dotenv import load_dotenv
from fastapi import APIRouter, Depends, HTTPException, Path, Query
from pydantic import BaseModel, ConfigDict
from sqlalchemy import select
from sqlalchemy.orm import Session

from auth_routes import get_current_user
from database import get_db
from models import Place, User

load_dotenv()
log = logging.getLogger("raahix.places")

API_KEY = os.getenv("GEOAPIFY_API_KEY")
BASE = "https://api.geoapify.com"
PAGE_SIZE = 20

router = APIRouter(prefix="/api/places", tags=["places"])

Category = Literal["All", "Experiences", "Restaurants", "Stays", "Locations"]
CATEGORY_QUERIES = {
    "All": "tourism.sights,tourism.attraction,catering.restaurant,accommodation,entertainment",
    "Experiences": "entertainment,leisure.park,beach,national_park",
    "Restaurants": "catering.restaurant,catering.cafe",
    "Stays": "accommodation",
    "Locations": "tourism.sights,tourism.attraction,heritage",
}

ID_RE = re.compile(r"^[A-Za-z0-9_-]{1,100}$")
PlaceId = Annotated[str, Path(pattern=r"^[A-Za-z0-9_-]{1,100}$")]

GEO_TTL = 86400      # city ki location 24 ghante yaad
PAGE_TTL = 3600      # places ka page 1 ghanta yaad
MAX_CACHE = 500
_geo_cache: dict = {}
_page_cache: dict = {}

# Ek user 10 minute mein 60 baar tak (quota bachane ke liye)
WINDOW_SECONDS = 600
MAX_REQUESTS = 60
_recent: dict[int, deque] = defaultdict(deque)


def check_rate_limit(user_id: int) -> None:
    now = time.monotonic()
    q = _recent[user_id]
    while q and now - q[0] > WINDOW_SECONDS:
        q.popleft()
    if len(q) >= MAX_REQUESTS:
        raise HTTPException(status_code=429, detail="Too many requests. Please wait a few minutes.")
    q.append(now)


class PlaceOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: str
    name: str
    category: str
    city: str
    address: str
    lat: float | None
    lon: float | None


class PlaceDetailOut(PlaceOut):
    phone: str | None
    website: str | None
    hours: str | None


class PlacesPage(BaseModel):
    place: str
    items: list[PlaceOut]
    has_more: bool


def geoapify_get(path: str, params: dict) -> dict:
    """Geoapify ko call. Error aane par key kabhi log ya jawab mein nahi jaati."""
    try:
        with httpx.Client(timeout=10.0) as http:
            res = http.get(BASE + path, params={**params, "apiKey": API_KEY})
            res.raise_for_status()
            return res.json()
    except httpx.HTTPStatusError as err:
        log.error("Geoapify %s returned %s", path, err.response.status_code)
        if err.response.status_code == 429:
            raise HTTPException(status_code=503, detail="The daily places limit is used up. Please try again tomorrow.")
        raise HTTPException(status_code=502, detail="Places aren't available right now. Please try again later.")
    except (httpx.HTTPError, ValueError) as err:
        log.error("Geoapify %s failed: %s", path, type(err).__name__)
        raise HTTPException(status_code=502, detail="Places aren't available right now. Please try again later.")


def _num(v):
    try:
        return float(v)
    except (TypeError, ValueError):
        return None


def locate(city: str) -> dict:
    key = city.lower()
    hit = _geo_cache.get(key)
    if hit and time.monotonic() - hit[0] < GEO_TTL:
        return hit[1]

    data = geoapify_get("/v1/geocode/search", {"text": city, "limit": 1, "format": "json"})
    results = data.get("results") or []
    if not results:
        raise HTTPException(status_code=404, detail="We couldn't find that place.")
    r = results[0]
    lon, lat = _num(r.get("lon")), _num(r.get("lat"))
    if lon is None or lat is None:
        raise HTTPException(status_code=502, detail="Places aren't available right now. Please try again later.")

    # Poora shehar/state dhundhne ke liye bounding box, na mile toh 15 km ka gola
    bbox = r.get("bbox") if isinstance(r.get("bbox"), dict) else {}
    corners = [_num(bbox.get(k)) for k in ("lon1", "lat1", "lon2", "lat2")]
    area = "rect:" + ",".join(str(c) for c in corners) if None not in corners else f"circle:{lon},{lat},15000"

    info = {"lon": lon, "lat": lat, "filter": area, "label": str(r.get("formatted") or city)[:120]}
    if len(_geo_cache) >= MAX_CACHE:
        _geo_cache.clear()
    _geo_cache[key] = (time.monotonic(), info)
    return info


def category_of(cats) -> str:
    cats = [c for c in (cats or []) if isinstance(c, str)]
    for prefix, label in (
        ("catering", "Restaurants"), ("accommodation", "Stays"), ("entertainment", "Experiences"),
        ("leisure", "Experiences"), ("beach", "Experiences"), ("national_park", "Experiences"),
        ("natural", "Experiences"),
    ):
        if any(c.startswith(prefix) for c in cats):
            return label
    return "Locations"


def feature_to_row(props: dict, fallback_city: str):
    pid = str(props.get("place_id") or "")
    name = str(props.get("name") or "").strip()
    if not name or not ID_RE.match(pid):
        return None   # bina naam ya ganda id wali places nahi dikhate
    return {
        "id": pid,
        "name": name[:200],
        "category": category_of(props.get("categories")),
        "city": str(props.get("city") or fallback_city)[:120],
        "address": str(props.get("formatted") or props.get("address_line2") or "")[:300],
        "lat": _num(props.get("lat")),
        "lon": _num(props.get("lon")),
    }


def save_places(db: Session, rows: list[dict]) -> None:
    if not rows:
        return
    existing = {p.id: p for p in db.scalars(select(Place).where(Place.id.in_([r["id"] for r in rows]))).all()}
    for r in rows:
        place = existing.get(r["id"])
        if place:
            for k, v in r.items():
                setattr(place, k, v)   # phone/website/hours ko nahi chhuete
        else:
            db.add(Place(**r))
    db.commit()


def first_text(*values):
    for v in values:
        if isinstance(v, str) and v.strip():
            return v.strip()
    return None


def safe_url(v):
    """OpenStreetMap ka data bharosemand nahi hota, isliye sirf http/https links."""
    if not v:
        return None
    v = v[:300]
    if re.match(r"^[A-Za-z][A-Za-z0-9+.-]*:", v) and not v.lower().startswith(("http://", "https://")):
        return None
    if "://" not in v:
        v = "https://" + v
    try:
        host = urlparse(v).hostname
    except ValueError:
        return None
    return v if host and "." in host else None


def safe_phone(v):
    if not v:
        return None
    cleaned = re.sub(r"[^0-9+() -]", "", v.split(";")[0]).strip()
    return cleaned[:40] if len(re.sub(r"\D", "", cleaned)) >= 6 else None


def extract_details(props: dict):
    ds = props.get("datasource") if isinstance(props.get("datasource"), dict) else {}
    raw = ds.get("raw") if isinstance(ds.get("raw"), dict) else {}
    contact = props.get("contact") if isinstance(props.get("contact"), dict) else {}
    phone = first_text(contact.get("phone"), props.get("phone"), raw.get("phone"), raw.get("contact:phone"))
    website = first_text(props.get("website"), contact.get("website"), raw.get("website"), raw.get("contact:website"))
    hours = first_text(props.get("opening_hours"), raw.get("opening_hours"))
    return safe_phone(phone), safe_url(website), (hours[:200] if hours else None)


@router.get("", response_model=PlacesPage)
def search_places(
    city: str = Query(min_length=1, max_length=80),
    category: Category = "All",
    page: int = Query(0, ge=0, le=50),
    user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    if not API_KEY:
        raise HTTPException(status_code=503, detail="More places aren't set up yet.")
    name = city.strip()
    if not name:
        raise HTTPException(status_code=422, detail="Please enter a city.")

    key = (name.lower(), category, page)
    hit = _page_cache.get(key)
    if hit and time.monotonic() - hit[0] < PAGE_TTL:
        return hit[1]

    check_rate_limit(user.id)
    geo = locate(name)
    data = geoapify_get("/v2/places", {
        "categories": CATEGORY_QUERIES[category],
        "filter": geo["filter"],
        "bias": f"proximity:{geo['lon']},{geo['lat']}",   # shehar ke beech se paas waale pehle
        "limit": PAGE_SIZE,
        "offset": page * PAGE_SIZE,
        "lang": "en",
    })

    features = data.get("features") or []
    rows, seen = [], set()
    for f in features:
        props = (f or {}).get("properties") or {}
        row = feature_to_row(props, name.title())
        if row and row["id"] not in seen:
            seen.add(row["id"])
            rows.append(row)
    save_places(db, rows)

    result = PlacesPage(
        place=geo["label"],
        items=[PlaceOut(**r) for r in rows],
        has_more=len(features) >= PAGE_SIZE,
    )
    if len(_page_cache) >= MAX_CACHE:
        _page_cache.clear()
    _page_cache[key] = (time.monotonic(), result)
    return result


# /lookup, /{place_id} se pehle likhna zaroori hai
@router.get("/lookup", response_model=list[PlaceOut])
def lookup_places(
    ids: str = Query(max_length=3200),
    user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """Saved page ke liye: ids ke hisaab se places (database mein jo hain)."""
    wanted = [i for i in ids.split(",") if ID_RE.match(i)][:100]
    if not wanted:
        return []
    rows = db.scalars(select(Place).where(Place.id.in_(wanted))).all()
    order = {pid: n for n, pid in enumerate(wanted)}
    return sorted(rows, key=lambda p: order[p.id])


@router.get("/{place_id}", response_model=PlaceDetailOut)
def get_place(place_id: PlaceId, user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    place = db.get(Place, place_id)
    if place is None:
        raise HTTPException(status_code=404, detail="Place not found.")

    # Details sirf ek baar laate hain (1 credit), phir database se
    if not place.details_fetched and API_KEY:
        try:
            check_rate_limit(user.id)
            data = geoapify_get("/v2/place-details", {"id": place_id, "features": "details"})
        except HTTPException:
            data = None   # details na mile toh bhi basic info dikhao
        if data is not None:
            features = data.get("features") or []
            if features:
                props = (features[0] or {}).get("properties") or {}
                place.phone, place.website, place.hours = extract_details(props)
            place.details_fetched = True
            db.commit()
            db.refresh(place)
    return place