# Saved places ke tests.

def test_saved_needs_login(client):
    assert client.get("/api/saved").status_code == 401
    assert client.put("/api/saved/1").status_code == 401


def test_save_list_and_unsave(client, alice):
    assert client.put("/api/saved/7", headers=alice).status_code == 204
    assert client.put("/api/saved/1", headers=alice).status_code == 204
    assert client.get("/api/saved", headers=alice).json() == [7, 1]

    assert client.delete("/api/saved/7", headers=alice).status_code == 204
    assert client.get("/api/saved", headers=alice).json() == [1]


def test_saving_twice_does_not_duplicate(client, alice):
    assert client.put("/api/saved/7", headers=alice).status_code == 204
    assert client.put("/api/saved/7", headers=alice).status_code == 204
    assert client.get("/api/saved", headers=alice).json() == [7]


def test_unsaving_something_not_saved_is_fine(client, alice):
    assert client.delete("/api/saved/9", headers=alice).status_code == 204


def test_invalid_place_id_is_rejected(client, alice):
    assert client.put("/api/saved/0", headers=alice).status_code == 422
    assert client.put("/api/saved/2000000", headers=alice).status_code == 422


def test_each_user_has_their_own_saved_list(client, alice, bob):
    client.put("/api/saved/7", headers=alice)

    assert client.get("/api/saved", headers=bob).json() == []

    # Bob ka unsave Alice ki list ko nahi chhoota
    assert client.delete("/api/saved/7", headers=bob).status_code == 204
    assert client.get("/api/saved", headers=alice).json() == [7]