// My Trips: backend (database) se trips laata hai aur cards dikhata hai.

requireLogin();

const list = document.getElementById("tripList");
const emptyState = document.getElementById("tripsEmpty");
const filterSelect = document.getElementById("tripFilter");

let trips = [];

function el(tag, className, text) {
    const node = document.createElement(tag);
    if (className) node.className = className;
    if (text !== undefined) node.textContent = text;
    return node;
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
    del.addEventListener("click", async () => {
        if (!confirm("Delete your trip to " + trip.destination + "?")) return;
        del.disabled = true;
        try {
            await Trips.remove(trip.id);
            trips = trips.filter((t) => t.id !== trip.id);
            render();
        } catch (err) {
            del.disabled = false;
            alert(err.message);
        }
    });
    body.append(del);

    card.append(cover, body);
    return card;
}

function render() {
    const mode = filterSelect.value;
    const today = localToday();

    const shown = trips.filter((t) => {
        if (mode === "upcoming") return t.endDate >= today;
        if (mode === "past") return t.endDate < today;
        return true;
    });

    list.innerHTML = "";
    emptyState.style.display = trips.length === 0 ? "block" : "none";

    if (trips.length > 0 && shown.length === 0) {
        list.append(el("p", "list-note", "No " + mode + " trips."));
        return;
    }

    shown
        .slice()
        .sort((a, b) => a.startDate.localeCompare(b.startDate))
        .forEach((t) => list.append(buildCard(t)));
}

async function init() {
    emptyState.style.display = "none";
    list.innerHTML = "";
    list.append(el("p", "list-note", "Loading your trips..."));

    try {
        trips = await Trips.list();
    } catch (err) {
        list.innerHTML = "";
        list.append(el("p", "list-note", err.message));
        return;
    }
    render();
}

filterSelect.addEventListener("change", render);
init();