# Saved places ke tests (place id ab text: "f7" ya Geoapify ki id).

def test_saved_needs_login(client):
    assert client.get("/api/saved").status_code == 401
    assert client.put("/api/saved/f1").status_code == 401


def test_save_list_and_unsave(client, alice):
    assert client.put("/api/saved/f7", headers=alice).status_code == 204
    assert client.put("/api/saved/abc123", headers=alice).status_code == 204
    assert client.get("/api/saved", headers=alice).json() == ["f7", "abc123"]

    assert client.delete("/api/saved/f7", headers=alice).status_code == 204
    assert client.get("/api/saved", headers=alice).json() == ["abc123"]


def test_saving_twice_does_not_duplicate(client, alice):
    assert client.put("/api/saved/f7", headers=alice).status_code == 204
    assert client.put("/api/saved/f7", headers=alice).status_code == 204
    assert client.get("/api/saved", headers=alice).json() == ["f7"]


def test_unsaving_something_not_saved_is_fine(client, alice):
    assert client.delete("/api/saved/f9", headers=alice).status_code == 204


def test_invalid_place_id_is_rejected(client, alice):
    assert client.put("/api/saved/bad.id", headers=alice).status_code == 422
    assert client.put("/api/saved/" + "a" * 101, headers=alice).status_code == 422


def test_each_user_has_their_own_saved_list(client, alice, bob):
    client.put("/api/saved/f7", headers=alice)

    assert client.get("/api/saved", headers=bob).json() == []
    assert client.delete("/api/saved/f7", headers=bob).status_code == 204
    assert client.get("/api/saved", headers=alice).json() == ["f7"]