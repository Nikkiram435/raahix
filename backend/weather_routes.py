# /api/weather?city=Goa: city ka 16 din ka mausam (Open-Meteo se, bina API key ke).
# Sirf login kiye hue user ke liye. Har city ka jawab 30 minute yaad rakha jaata hai.

import logging
import time

import httpx
from fastapi import APIRouter, Depends, HTTPException, Query
from pydantic import BaseModel

from auth_routes import get_current_user
from models import User

log = logging.getLogger("raahix.weather")

router = APIRouter(prefix="/api/weather", tags=["weather"])

GEOCODE_URL = "https://geocoding-api.open-meteo.com/v1/search"
FORECAST_URL = "https://api.open-meteo.com/v1/forecast"

CACHE_SECONDS = 1800
MAX_CACHE = 200
_cache: dict[str, tuple[float, "WeatherOut"]] = {}


class WeatherDay(BaseModel):
    date: str
    temp_max: float | None
    temp_min: float | None
    rain_mm: float | None
    rain_chance: int | None
    code: int | None


class WeatherOut(BaseModel):
    place: str
    days: list[WeatherDay]


def pick(values: list, i: int):
    """List se i-th cheez, ya None agar nahi hai."""
    return values[i] if isinstance(values, list) and i < len(values) else None


@router.get("", response_model=WeatherOut)
def get_weather(
    city: str = Query(min_length=1, max_length=80),
    user: User = Depends(get_current_user),
):
    name = city.strip()
    if not name:
        raise HTTPException(status_code=422, detail="Please enter a city.")

    key = name.lower()
    cached = _cache.get(key)
    if cached and time.monotonic() - cached[0] < CACHE_SECONDS:
        return cached[1]

    try:
        with httpx.Client(timeout=10.0) as http:
            geo = http.get(
                GEOCODE_URL,
                params={"name": name, "count": 1, "language": "en", "format": "json"},
            )
            geo.raise_for_status()
            results = geo.json().get("results") or []
            if not results:
                raise HTTPException(status_code=404, detail="We couldn't find that place.")
            place = results[0]

            forecast = http.get(
                FORECAST_URL,
                params={
                    "latitude": place["latitude"],
                    "longitude": place["longitude"],
                    "daily": "weather_code,temperature_2m_max,temperature_2m_min,"
                             "precipitation_sum,precipitation_probability_max",
                    "timezone": "auto",
                    "forecast_days": 16,
                },
            )
            forecast.raise_for_status()
            daily = forecast.json().get("daily") or {}
    except HTTPException:
        raise
    except (httpx.HTTPError, ValueError, KeyError) as err:
        log.error("Weather lookup failed: %s", type(err).__name__)
        raise HTTPException(
            status_code=502,
            detail="Weather isn't available right now. Please try again later.",
        )

    dates = daily.get("time") or []
    days = [
        WeatherDay(
            date=str(d),
            temp_max=pick(daily.get("temperature_2m_max"), i),
            temp_min=pick(daily.get("temperature_2m_min"), i),
            rain_mm=pick(daily.get("precipitation_sum"), i),
            rain_chance=pick(daily.get("precipitation_probability_max"), i),
            code=pick(daily.get("weather_code"), i),
        )
        for i, d in enumerate(dates)
    ]

    label_parts = [place.get("name"), place.get("admin1"), place.get("country")]
    label = ", ".join(str(p) for p in label_parts if p)

    result = WeatherOut(place=label or name, days=days)

    if len(_cache) >= MAX_CACHE:
        _cache.clear()
    _cache[key] = (time.monotonic(), result)
    return result