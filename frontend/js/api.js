const API_BASE =
    (location.hostname === "127.0.0.1" || location.hostname === "localhost") && location.port === "5500"
        ? "http://127.0.0.1:8000"
        : "";

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


function requireLogin() {
    if (!getToken()) window.location.href = "login.html";
}

function readError(status, data) {
    if (data && typeof data.detail === "string") return data.detail;
    if (status === 422) {

        const first = data && Array.isArray(data.detail) ? data.detail[0] : null;
        if (first && typeof first.msg === "string") return first.msg.replace(/^Value error, /, "");
        return "Please check your details and try again.";
    }
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


    if (res.status === 401 && auth) {
        clearSession();
        window.location.href = "login.html";
        throw new Error("Please log in again.");
    }

    let data = null;
    try { data = await res.json(); } catch (err) {}

    if (!res.ok) throw new Error(readError(res.status, data));
    return data;
}

// ---------- Trips ----------


function tripFromApi(t) {
    return {
        id: t.id,
        destination: t.destination,
        startDate: t.start_date,
        endDate: t.end_date,
        travelers: t.travelers,
        budget: t.budget,
        styles: t.styles || [],
        plan: t.plan || {},
        expenses: t.expenses || [],
    };
}

const Trips = {
    async list() {
        const data = await apiRequest("/api/trips", { auth: true });
        return data.map(tripFromApi);
    },

    async get(id) {
        return tripFromApi(await apiRequest("/api/trips/" + encodeURIComponent(id), { auth: true }));
    },

    async create(trip) {
        const data = await apiRequest("/api/trips", {
            method: "POST",
            auth: true,
            body: {
                destination: trip.destination,
                start_date: trip.startDate,
                end_date: trip.endDate,
                travelers: trip.travelers,
                budget: trip.budget,
                styles: trip.styles,
            },
        });
        return tripFromApi(data);
    },


    async update(id, changes) {
        const data = await apiRequest("/api/trips/" + encodeURIComponent(id), {
            method: "PATCH",
            auth: true,
            body: changes,
        });
        return tripFromApi(data);
    },

    async remove(id) {
        await apiRequest("/api/trips/" + encodeURIComponent(id), { method: "DELETE", auth: true });
    },
};

// ---------- Saved places ----------

const Saved = {
    async list() {
        return apiRequest("/api/saved", { auth: true });   
    },

    async save(placeId) {
        await apiRequest("/api/saved/" + encodeURIComponent(placeId), { method: "PUT", auth: true });
    },

    async unsave(placeId) {
        await apiRequest("/api/saved/" + encodeURIComponent(placeId), { method: "DELETE", auth: true });
    },
};

// ---------- Weather ----------

const Weather = {
    async forCity(city) {
        return apiRequest("/api/weather?city=" + encodeURIComponent(city), { auth: true });
    },
};

// ---------- Places (Geoapify, backend ke through) ----------

const Places = {
    async search(city, category, page) {
        return apiRequest(
            "/api/places?city=" + encodeURIComponent(city) +
            "&category=" + encodeURIComponent(category) + "&page=" + page,
            { auth: true }
        );
    },

    async get(id) {
        return apiRequest("/api/places/" + encodeURIComponent(id), { auth: true });
    },

    async lookup(ids) {
        return apiRequest("/api/places/lookup?ids=" + encodeURIComponent(ids.join(",")), { auth: true });
    },
};

