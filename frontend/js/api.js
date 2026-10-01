// Backend se baat karne ke liye common helper. Har page ka JS isi ko use karega.

const API_BASE = "http://127.0.0.1:8000";

function getToken() {
    try { return localStorage.getItem("raahix_token"); } catch (err) { return null; }
}

function setSession(token, user) {
    try {
        localStorage.setItem("raahix_token", token);
        localStorage.setItem("raahix_user", JSON.stringify({ name: user.name, email: user.email }));
        return true;
    } catch (err) {
        return false;
    }
}

function clearSession() {
    try {
        localStorage.removeItem("raahix_token");
        localStorage.removeItem("raahix_user");
    } catch (err) {}
}

function readError(status, data) {
    if (status === 422) return "Please check your details and try again.";
    if (data && typeof data.detail === "string") return data.detail;
    return "Something went wrong. Please try again.";
}

async function apiRequest(path, { method = "GET", body, auth = false } = {}) {
    const headers = {};
    if (body !== undefined) headers["Content-Type"] = "application/json";
    if (auth) {
        const token = getToken();
        if (token) headers.Authorization = "Bearer " + token;
    }

    let res;
    try {
        res = await fetch(API_BASE + path, {
            method,
            headers,
            body: body !== undefined ? JSON.stringify(body) : undefined,
        });
    } catch (err) {
        throw new Error("Can't reach the server. Is the backend running?");
    }

    let data = null;
    try { data = await res.json(); } catch (err) {}

    if (!res.ok) throw new Error(readError(res.status, data));
    return data;
}