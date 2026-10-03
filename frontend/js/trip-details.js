// Trip details: backend se trip laata hai, din-ba-din plan dikhata aur badalta hai.
// Neeche mausam (weather) bhi dikhta hai, jo /api/weather se aata hai.

requireLogin();

const root = document.getElementById("tripDetail");
const MAX_DAYS_SHOWN = 30;
let trip = null;
let busy = false;

// Mausam ki halat: "loading", "ok" ya "error"
let weather = { state: "loading", data: null, message: "" };

function el(tag, className, text) {
    const node = document.createElement(tag);
    if (className) node.className = className;
    if (text !== undefined) node.textContent = text;
    return node;
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

// ---------- Mausam ----------

// Open-Meteo ke weather code ka matlab (WMO codes)
function weatherInfo(code) {
    if (code === 0) return { icon: "☀️", label: "Clear" };
    if (code === 1) return { icon: "🌤️", label: "Mostly clear" };
    if (code === 2) return { icon: "⛅", label: "Partly cloudy" };
    if (code === 3) return { icon: "☁️", label: "Overcast" };
    if (code === 45 || code === 48) return { icon: "🌫️", label: "Fog" };
    if (code >= 51 && code <= 55) return { icon: "🌦️", label: "Drizzle" };
    if (code === 56 || code === 57) return { icon: "🌧️", label: "Freezing drizzle" };
    if (code >= 61 && code <= 65) return { icon: "🌧️", label: "Rain" };
    if (code === 66 || code === 67) return { icon: "🌧️", label: "Freezing rain" };
    if (code >= 71 && code <= 77) return { icon: "❄️", label: "Snow" };
    if (code >= 80 && code <= 82) return { icon: "🌦️", label: "Rain showers" };
    if (code === 85 || code === 86) return { icon: "🌨️", label: "Snow showers" };
    if (code === 95) return { icon: "⛈️", label: "Thunderstorm" };
    if (code === 96 || code === 99) return { icon: "⛈️", label: "Thunderstorm, hail" };
    return { icon: "🌡️", label: "No data" };
}

function formatTemp(n) {
    return n === null || n === undefined ? "-" : Math.round(n) + "°";
}

function buildWeatherCard(d) {
    const info = weatherInfo(d.code);
    const date = new Date(d.date + "T00:00:00");

    const card = el("div", "weather-card");
    const icon = el("span", "weather-icon", info.icon);
    icon.setAttribute("aria-hidden", "true");

    card.append(
        el("small", "", fmt(date, { weekday: "short", day: "numeric", month: "short" })),
        icon,
        el("strong", "", formatTemp(d.temp_max) + " / " + formatTemp(d.temp_min)),
        el("small", "", info.label),
        el("small", "weather-rain", d.rain_chance === null || d.rain_chance === undefined ? "" : "Rain " + d.rain_chance + "%")
    );
    return card;
}

// weatherBox ke andar mausam ka section bharta hai (poora page dobara nahi banata)
function fillWeather(box) {
    if (!box || !trip) return;
    box.innerHTML = "";

    const head = el("div", "detail-head");
    head.append(el("h2", "", "Weather"));
    box.append(head);

    if (weather.state === "loading") {
        box.append(el("p", "weather-note", "Loading the forecast..."));
        return;
    }
    if (weather.state === "error") {
        box.append(el("p", "weather-note", weather.message));
        return;
    }

    // Sirf wahi din jo trip ki dates mein aate hain
    const days = weather.data.days.filter((d) => d.date >= trip.startDate && d.date <= trip.endDate);

    if (days.length === 0) {
        const over = trip.endDate < localToday();
        box.append(el("p", "weather-note",
            over
                ? "This trip is over, so there's no forecast to show."
                : "Forecasts only cover the next 16 days. Check back closer to your trip."));
        return;
    }

    box.append(el("p", "weather-note", "Forecast for " + weather.data.place));

    const row = el("div", "weather-row");
    days.forEach((d) => row.append(buildWeatherCard(d)));
    box.append(row);

    const total = dayCount(trip.startDate, trip.endDate);
    if (days.length < total) {
        box.append(el("p", "weather-note", "Showing " + days.length + " of " + total +
            " days. Only days within the 16-day forecast are available."));
    }
}

async function loadWeather() {
    try {
        const data = await Weather.forCity(trip.destination);
        weather = { state: "ok", data: data, message: "" };
    } catch (err) {
        weather = { state: "error", data: null, message: err.message };
    }
    fillWeather(document.getElementById("weatherBox"));
}

// ---------- Trip ----------

function showNotFound() {
    root.innerHTML = "";
    const box = el("div", "empty-state");
    box.append(
        el("div", "empty-art", "🧭"),
        el("h3", "", "We couldn't find this trip"),
        el("p", "", "It may have been deleted, or it belongs to a different account.")
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

// Poora plan backend ko bhejte hain, jawab mein naya trip aata hai
async function savePlan(newPlan) {
    if (busy) return;
    busy = true;
    try {
        trip = await Trips.update(trip.id, { plan: newPlan });
        render();
    } catch (err) {
        alert(err.message);
    } finally {
        busy = false;
    }
}

function copyPlan() {
    return JSON.parse(JSON.stringify(trip.plan || {}));
}

function buildDayCard(index) {
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
            const plan = copyPlan();
            plan[index] = items.filter((_, n) => n !== i);
            savePlan(plan);
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
        const plan = copyPlan();
        plan[index] = items.concat(text);
        savePlan(plan);
    });

    card.append(title, ul, form);
    return card;
}

function render() {
    root.innerHTML = "";

    document.title = trip.destination + " — RAAHIX";

    const days = dayCount(trip.startDate, trip.endDate);
    const isPast = trip.endDate < localToday();
    const start = new Date(trip.startDate + "T00:00:00");
    const end = new Date(trip.endDate + "T00:00:00");
    const longFmt = { day: "numeric", month: "short", year: "numeric" };

    const hero = el("div", "detail-hero trip-cover cover-" + (trip.id % 6));
    hero.append(
        el("span", "trip-badge", isPast ? "Past" : "Upcoming"),
        el("h1", "", trip.destination),
        el("p", "", fmt(start, longFmt) + " to " + fmt(end, longFmt))
    );

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

    // Mausam ka section (id isliye ki baad mein load hone par yahi bhara jaaye)
    const weatherBox = el("div", "weather-section");
    weatherBox.id = "weatherBox";
    fillWeather(weatherBox);

    const head = el("div", "detail-head");
    head.append(el("h2", "", "Day by day"));
    const ask = el("a", "create-trip-btn", "Ask RAAHIX to plan");
    ask.href = "assistant.html";
    head.append(ask);

    const dayList = el("div", "day-list");
    const shown = Math.min(days, MAX_DAYS_SHOWN);
    for (let i = 0; i < shown; i++) dayList.append(buildDayCard(i));

    root.append(hero, stats, weatherBox, head, dayList);

    if (days > MAX_DAYS_SHOWN) {
        root.append(el("p", "list-note", "Showing the first " + MAX_DAYS_SHOWN + " days of " + days + "."));
    }
}

async function load() {
    const id = Number(new URLSearchParams(window.location.search).get("id"));
    if (!Number.isInteger(id) || id <= 0) return showNotFound();

    root.append(el("p", "list-note", "Loading your trip..."));

    try {
        trip = await Trips.get(id);
    } catch (err) {
        if (err.message === "Trip not found.") return showNotFound();
        root.innerHTML = "";
        root.append(el("p", "list-note", err.message));
        return;
    }
    render();
    loadWeather();   // trip dikhne ke baad mausam alag se aata hai
}

load();