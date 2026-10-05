CHAT_BODY = {"messages": [{"role": "user", "content": "Hello"}]}


def test_health(client):
    res = client.get("/api/health")
    assert res.status_code == 200
    assert res.json()["status"] == "ok"


def test_chat_needs_login(client):
    assert client.post("/api/chat", json=CHAT_BODY).status_code == 401


def test_chat_without_ai_key_fails_cleanly(client, alice):
    res = client.post("/api/chat", json=CHAT_BODY, headers=alice)
    assert res.status_code == 503


def test_chat_rejects_bad_conversations(client, alice):
    ends_with_assistant = {"messages": [
        {"role": "user", "content": "Hi"},
        {"role": "assistant", "content": "Hello"},
    ]}
    assert client.post("/api/chat", json=ends_with_assistant, headers=alice).status_code == 422
    empty_message = {"messages": [{"role": "user", "content": ""}]}
    assert client.post("/api/chat", json=empty_message, headers=alice).status_code == 422


def test_weather_needs_login(client):
    assert client.get("/api/weather", params={"city": "Goa"}).status_code == 401
