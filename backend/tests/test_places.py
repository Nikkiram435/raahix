# Places ke tests. Asli Geoapify ko kabhi call nahi karte, uski jagah nakli jawab lagate hain.

import pytest

import places_routes

GEO = {"results": [{
    "lon": 73.8, "lat": 15.4, "formatted": "Goa, India",
    "bbox": {"lon1": 73.6, "lat1": 14.9, "lon2": 74.3, "lat2": 15.8},
}]}

SEARCH = {"city": "Goa"}


def feature(pid, name, cats):
    return {"properties": {
        "place_id": pid, "name": name, "categories": cats,
        "formatted": name + ", Goa", "lat": 15.5, "lon": 73.8, "city": "Goa",
    }}


@pytest.fixture(autouse=True)
def fake_geoapify(monkeypatch):
    places_routes._geo_cache.clear()
    places_routes._page_cache.clear()
    places_routes._recent.clear()
    monkeypatch.setattr(places_routes, "API_KEY", "test-key")

    fake = {
        "calls": [],
        "details": {"website": "example.com", "contact": {"phone": "+91 98765 43210"}, "opening_hours": "Mo-Su 09:00-18:00"},
    }

    def fake_get(path, params):
        fake["calls"].append(path)
        if path == "/v1/geocode/search":
            return GEO
        if path == "/v2/places":
            if params["offset"] == 0:
                unnamed = [{"properties": {"place_id": f"u{i}", "name": ""}} for i in range(18)]
                return {"features": [
                    feature("p1", "Beach Shack", ["catering.restaurant"]),
                    feature("p2", "Sea View Hotel", ["accommodation.hotel"]),
                ] + unnamed}   # kul 20, yaani aur pages hain
            return {"features": []}
        if path == "/v2/place-details":
            return {"features": [{"properties": fake["details"]}]}
        raise AssertionError("unexpected call " + path)

    monkeypatch.setattr(places_routes, "geoapify_get", fake_get)
    return fake


def test_places_need_login(client):
    assert client.get("/api/places", params=SEARCH).status_code == 401


def test_places_without_key(client, alice, monkeypatch):
    monkeypatch.setattr(places_routes, "API_KEY", None)
    assert client.get("/api/places", params=SEARCH, headers=alice).status_code == 503


def test_search_skips_unnamed_and_maps_categories(client, alice):
    res = client.get("/api/places", params=SEARCH, headers=alice)
    assert res.status_code == 200
    body = res.json()
    assert body["place"] == "Goa, India"
    assert [(p["id"], p["category"]) for p in body["items"]] == [("p1", "Restaurants"), ("p2", "Stays")]
    assert body["has_more"] is True


def test_last_page_has_no_more(client, alice):
    res = client.get("/api/places", params={**SEARCH, "page": 1}, headers=alice)
    assert res.json() == {"place": "Goa, India", "items": [], "has_more": False}


def test_same_search_is_cached(client, alice, fake_geoapify):
    for _ in range(2):
        assert client.get("/api/places", params=SEARCH, headers=alice).status_code == 200
    assert fake_geoapify["calls"].count("/v2/places") == 1


def test_bad_search_input(client, alice):
    assert client.get("/api/places", params={**SEARCH, "category": "Banks"}, headers=alice).status_code == 422
    assert client.get("/api/places", params={"city": "   "}, headers=alice).status_code == 422
    assert client.get("/api/places", headers=alice).status_code == 422
    assert client.get("/api/places", params={**SEARCH, "page": -1}, headers=alice).status_code == 422


def test_details_are_fetched_once_and_cleaned(client, alice, fake_geoapify):
    client.get("/api/places", params=SEARCH, headers=alice)
    first = client.get("/api/places/p1", headers=alice).json()
    assert first["website"] == "https://example.com"
    assert first["phone"] == "+91 98765 43210"
    assert first["hours"] == "Mo-Su 09:00-18:00"

    client.get("/api/places/p1", headers=alice)
    assert fake_geoapify["calls"].count("/v2/place-details") == 1


def test_unsafe_website_is_dropped(client, alice, fake_geoapify):
    fake_geoapify["details"] = {"website": "javascript:alert(1)"}
    client.get("/api/places", params=SEARCH, headers=alice)
    assert client.get("/api/places/p1", headers=alice).json()["website"] is None


def test_unknown_place_is_404(client, alice):
    assert client.get("/api/places/nope", headers=alice).status_code == 404


def test_lookup_keeps_order_and_ignores_bad_ids(client, alice):
    client.get("/api/places", params=SEARCH, headers=alice)
    res = client.get("/api/places/lookup", params={"ids": "p2,bad id!,p1,nope"}, headers=alice)
    assert [p["id"] for p in res.json()] == ["p2", "p1"]

def test_wiki_link_is_kept(client, alice, fake_geoapify):
    fake_geoapify["details"] = {"wiki_and_media": {"wikipedia": "en:Gateway of India"}}
    client.get("/api/places", params=SEARCH, headers=alice)
    assert client.get("/api/places/p1", headers=alice).json()["wiki"] == "en:Gateway of India"


def test_bad_wiki_value_is_dropped(client, alice, fake_geoapify):
    fake_geoapify["details"] = {"wiki_and_media": {"wikipedia": "../evil:x"}}
    client.get("/api/places", params=SEARCH, headers=alice)
    assert client.get("/api/places/p1", headers=alice).json()["wiki"] is None