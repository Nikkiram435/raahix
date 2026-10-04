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

// Login ke bina kholne wale pages: login par bhej do
function requireLogin() {
    if (!getToken()) window.location.href = "login.html";
}

function readError(status, data) {
    if (data && typeof data.detail === "string") return data.detail;
    if (status === 422) {
        // Backend ka pehla message dikhao (jaise "End date can't be before the start date.")
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

    // Token purana ya galat ho toh dobara login karwao
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
// Backend snake_case use karta hai (start_date), frontend camelCase (startDate).
// Yeh dono ke beech ka anuvaad yahin hota hai.

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

    // changes mein sirf wahi daalo jo badalna hai, jaise { plan: {...} } ya { expenses: [...] }
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
        return apiRequest("/api/saved", { auth: true });   // [1, 7, ...] place ids
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