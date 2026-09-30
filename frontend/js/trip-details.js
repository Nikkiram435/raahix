// Trip details: URL se ?id=... leke us trip ki detail aur din-ba-din plan dikhata hai.
// Phase 6 mein yahi data backend se aayega.

const root = document.getElementById("tripDetail");
const MAX_DAYS_SHOWN = 30;

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

function saveTrip(updated) {
    try {
        const trips = loadTrips().map((t) => (t.id === updated.id ? updated : t));
        localStorage.setItem("raahix_trips", JSON.stringify(trips));
    } catch (err) {
        alert("Couldn't save your changes in this browser.");
    }
}

function localToday() {
    const d = new Date();
    return d.getFullYear() + "-" +
        String(d.getMonth() + 1).padStart(2, "0") + "-" +
        String(d.getDate()).padStart(2, "0");
}

function fmt(date, opts) {
    return date.toLocaleDateString("en-IN", opts);
}

function dayCount(start, end) {
    const ms = new Date(end + "T00:00:00") - new Date(start + "T00:00:00");
    return Math.round(ms / 86400000) + 1;
}

function notFound() {
    const box = el("div", "empty-state");
    box.append(
        el("div", "empty-art", "🧭"),
        el("h3", "", "We couldn't find this trip"),
        el("p", "", "It may have been deleted, or it was saved in a different browser.")
    );
    const link = el("a", "setup-btn", "Back to my trips");
    link.href = "dashboard.html";
    box.append(link);
    root.append(box);
}

function buildStat(label, value) {
    const box = el("div", "stat");
    box.append(el("small", "", label), el("strong", "", value));
    return box;
}

function buildDayCard(trip, index) {
    const date = new Date(trip.startDate + "T00:00:00");
    date.setDate(date.getDate() + index);

    const card = el("div", "day-card");
    const title = el("h3", "", "Day " + (index + 1));
    title.append(el("small", "", fmt(date, { weekday: "short", day: "numeric", month: "short" })));

    const ul = el("ul", "activity-list");
    const items = (trip.plan && trip.plan[index]) || [];

    items.forEach((text, i) => {
        const li = el("li");
        li.append(el("span", "", text));
        const remove = el("button", "activity-remove", "Remove");
        remove.type = "button";
        remove.addEventListener("click", () => {
            items.splice(i, 1);
            trip.plan[index] = items;
            saveTrip(trip);
            render();
        });
        li.append(remove);
        ul.append(li);
    });

    const form = el("form", "activity-form");
    const input = el("input");
    input.type = "text";
    input.placeholder = "Add a place or activity";
    input.maxLength = 80;
    input.setAttribute("aria-label", "Add activity for day " + (index + 1));
    const add = el("button", "", "Add");
    add.type = "submit";
    form.append(input, add);

    form.addEventListener("submit", (e) => {
        e.preventDefault();
        const text = input.value.trim();
        if (!text) return;
        trip.plan = trip.plan || {};
        trip.plan[index] = (trip.plan[index] || []).concat(text);
        saveTrip(trip);
        render();
    });

    card.append(title, ul, form);
    return card;
}

function render() {
    root.innerHTML = "";

    const id = Number(new URLSearchParams(window.location.search).get("id"));
    const trip = loadTrips().find((t) => t.id === id);
    if (!trip) return notFound();

    document.title = trip.destination + " — RAAHIX";

    const days = dayCount(trip.startDate, trip.endDate);
    const isPast = trip.endDate < localToday();
    const start = new Date(trip.startDate + "T00:00:00");
    const end = new Date(trip.endDate + "T00:00:00");
    const longFmt = { day: "numeric", month: "short", year: "numeric" };

    // Hero
    const hero = el("div", "detail-hero trip-cover cover-" + (trip.id % 6));
    hero.append(
        el("span", "trip-badge", isPast ? "Past" : "Upcoming"),
        el("h1", "", trip.destination),
        el("p", "", fmt(start, longFmt) + " to " + fmt(end, longFmt))
    );

    // Stats
    const perDay = trip.budget
        ? "₹" + Math.round(trip.budget / (trip.travelers * days)).toLocaleString("en-IN")
        : "Not set";
    const stats = el("div", "stat-grid");
    stats.append(
        buildStat("Duration", days + (days === 1 ? " day" : " days")),
        buildStat("Travelers", String(trip.travelers)),
        buildStat("Budget", trip.budget ? "₹" + trip.budget.toLocaleString("en-IN") : "Not set"),
        buildStat("Per person per day", perDay)
    );

    // Day by day header
    const head = el("div", "detail-head");
    head.append(el("h2", "", "Day by day"));
    const ask = el("a", "create-trip-btn", "Ask RAAHIX to plan");
    ask.href = "assistant.html";
    head.append(ask);

    // Days
    const dayList = el("div", "day-list");
    const shown = Math.min(days, MAX_DAYS_SHOWN);
    for (let i = 0; i < shown; i++) dayList.append(buildDayCard(trip, i));

    root.append(hero, stats, head, dayList);

    if (days > MAX_DAYS_SHOWN) {
        root.append(el("p", "list-note", "Showing the first " + MAX_DAYS_SHOWN + " days of " + days + "."));
    }
}

render();