// My Trips: browser mein save hui trips dikhata hai.
// Phase 6 mein yahi data backend se fetch() hoga.

const list = document.getElementById("tripList");
const emptyState = document.getElementById("tripsEmpty");
const filterSelect = document.getElementById("tripFilter");

function el(tag, className, text) {
    const node = document.createElement(tag);
    if (className) node.className = className;
    if (text !== undefined) node.textContent = text;
    return node;
}

function loadTrips() {
    try {
        return JSON.parse(localStorage.getItem("raahix_trips") || "[]");
    } catch (err) {
        return [];
    }
}

function saveTrips(trips) {
    try {
        localStorage.setItem("raahix_trips", JSON.stringify(trips));
    } catch (err) {
        alert("Couldn't update your trips in this browser.");
    }
}

function localToday() {
    const d = new Date();
    const month = String(d.getMonth() + 1).padStart(2, "0");
    const day = String(d.getDate()).padStart(2, "0");
    return d.getFullYear() + "-" + month + "-" + day;
}

function formatDate(dateStr) {
    return new Date(dateStr + "T00:00:00").toLocaleDateString("en-IN", {
        day: "numeric", month: "short", year: "numeric",
    });
}

function dayCount(start, end) {
    const ms = new Date(end + "T00:00:00") - new Date(start + "T00:00:00");
    return Math.round(ms / 86400000) + 1;
}

function buildCard(trip) {
    const isPast = trip.endDate < localToday();
    const days = dayCount(trip.startDate, trip.endDate);

    const card = el("article", "trip-card");

    const cover = el("div", "trip-cover cover-" + (trip.id % 6));
    cover.append(el("span", "trip-badge", isPast ? "Past" : "Upcoming"));

    const body = el("div", "trip-body");

    const title = el("a", "trip-title", trip.destination);
    title.href = "trip-details.html?id=" + trip.id;

    const dates = el("p", "trip-dates",
        formatDate(trip.startDate) + " to " + formatDate(trip.endDate) +
        " (" + days + (days === 1 ? " day)" : " days)"));

    const people = trip.travelers === 1 ? "1 traveler" : trip.travelers + " travelers";
    const budget = trip.budget ? "₹" + trip.budget.toLocaleString("en-IN") : "No budget set";
    const meta = el("p", "trip-meta", people + ", " + budget);

    body.append(title, dates, meta);

    if (trip.styles && trip.styles.length) {
        const tags = el("div", "trip-tags");
        trip.styles.forEach((s) => tags.append(el("span", "", s)));
        body.append(tags);
    }

    const del = el("button", "trip-delete", "Delete trip");
    del.type = "button";
    del.addEventListener("click", () => {
        if (!confirm("Delete your trip to " + trip.destination + "?")) return;
        saveTrips(loadTrips().filter((t) => t.id !== trip.id));
        render();
    });
    body.append(del);

    card.append(cover, body);
    return card;
}

function render() {
    const all = loadTrips();
    const mode = filterSelect.value;
    const today = localToday();

    const shown = all.filter((t) => {
        if (mode === "upcoming") return t.endDate >= today;
        if (mode === "past") return t.endDate < today;
        return true;
    });

    list.innerHTML = "";
    emptyState.style.display = all.length === 0 ? "block" : "none";

    if (all.length > 0 && shown.length === 0) {
        list.append(el("p", "list-note", "No " + mode + " trips."));
        return;
    }

    shown
        .sort((a, b) => a.startDate.localeCompare(b.startDate))
        .forEach((t) => list.append(buildCard(t)));
}

filterSelect.addEventListener("change", render);
render();