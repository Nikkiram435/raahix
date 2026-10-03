# Trips ke tests, khaaskar yeh ki ek user doosre ki trip kabhi nahi dekh sakta.

TRIP = {
    "destination": "Goa",
    "start_date": "2026-10-10",
    "end_date": "2026-10-14",
    "travelers": 2,
    "budget": 25000,
    "styles": ["Relaxed", "Food"],
}


def create_trip(client, headers, **overrides):
    res = client.post("/api/trips", json={**TRIP, **overrides}, headers=headers)
    assert res.status_code == 201, res.text
    return res.json()


def test_trips_need_login(client):
    assert client.get("/api/trips").status_code == 401
    assert client.post("/api/trips", json=TRIP).status_code == 401


def test_create_list_and_get(client, alice):
    trip = create_trip(client, alice)
    assert trip["destination"] == "Goa"
    assert trip["plan"] == {}
    assert trip["expenses"] == []

    listed = client.get("/api/trips", headers=alice).json()
    assert [t["id"] for t in listed] == [trip["id"]]

    one = client.get(f"/api/trips/{trip['id']}", headers=alice)
    assert one.status_code == 200
    assert one.json()["budget"] == 25000


def test_create_rejects_bad_data(client, alice):
    def post(**overrides):
        return client.post("/api/trips", json={**TRIP, **overrides}, headers=alice)

    assert post(end_date="2026-10-05").status_code == 422        # end, start se pehle
    assert post(travelers=0).status_code == 422
    assert post(budget=-1).status_code == 422
    assert post(destination="   ").status_code == 422
    assert post(end_date="2028-10-14").status_code == 422        # 366 din se lambi trip


def test_plan_and_expenses_are_saved_and_do_not_overwrite_each_other(client, alice):
    trip = create_trip(client, alice)
    url = f"/api/trips/{trip['id']}"

    plan = {"0": ["Baga Beach", "Fort Aguada"], "1": ["Fontainhas walking tour"]}
    assert client.patch(url, json={"plan": plan}, headers=alice).status_code == 200

    expense = {"id": 1, "category": "Food", "amount": 1200, "note": "Seafood dinner"}
    assert client.patch(url, json={"expenses": [expense]}, headers=alice).status_code == 200

    saved = client.get(url, headers=alice).json()
    assert saved["plan"] == plan                       # kharcha jodne se plan nahi mita
    assert saved["expenses"][0]["amount"] == 1200


def test_update_rejects_bad_data(client, alice):
    trip = create_trip(client, alice)
    url = f"/api/trips/{trip['id']}"

    assert client.patch(url, json={"end_date": "2026-10-01"}, headers=alice).status_code == 422
    assert client.patch(url, json={"plan": {"abc": ["x"]}}, headers=alice).status_code == 422
    bad_expense = {"id": 1, "category": "Gold", "amount": 10}
    assert client.patch(url, json={"expenses": [bad_expense]}, headers=alice).status_code == 422


def test_other_user_cannot_see_change_or_delete_a_trip(client, alice, bob):
    trip = create_trip(client, alice)
    url = f"/api/trips/{trip['id']}"

    assert client.get(url, headers=bob).status_code == 404
    assert client.patch(url, json={"budget": 1}, headers=bob).status_code == 404
    assert client.delete(url, headers=bob).status_code == 404
    assert client.get("/api/trips", headers=bob).json() == []

    # Bob ki koshish ke baad bhi Alice ki trip jaisi thi waisi hai
    still = client.get(url, headers=alice)
    assert still.status_code == 200
    assert still.json()["budget"] == 25000


def test_delete_trip(client, alice):
    trip = create_trip(client, alice)
    url = f"/api/trips/{trip['id']}"
    assert client.delete(url, headers=alice).status_code == 204
    assert client.get(url, headers=alice).status_code == 404