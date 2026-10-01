// Itinerary: trip ka din-ba-din plan timeline mein dikhata hai (sirf padhne ke liye).
// Plan badalne ke liye trip-details.html use hota hai.

requireLogin();

const MAX_DAYS = 30;

const $ = (id) => document.getElementById(id);
const picker = $("tripPicker");
const copyMsg = $("copyMsg");

let trips = [];

function el(tag, className, text) {
    const node = document.createElement(tag);
    if (className) node.className = className;
    if (text !== undefined) node.textContent = text;
    return node;
}

function currentTrip() {
    return trips.find((t) => t.id === Number(picker.value));
}

function dayCount(start, end) {
    const ms = new Date(end + "T00:00:00") - new Date(start + "T00:00:00");
    return Math.round(ms / 86400000) + 1;
}

function dayDate(trip, index) {
    const d = new Date(trip.startDate + "T00:00:00");
    d.setDate(d.getDate() + index);
    return d;
}

function shortDate(date) {
    return date.toLocaleDateString("en-IN", { weekday: "short", day: "numeric", month: "short" });
}

function longDate(dateStr) {
    return new Date(dateStr + "T00:00:00").toLocaleDateString("en-IN", {
        day: "numeric", month: "short", year: "numeric",
    });
}

function activitiesFor(trip, index) {
    return (trip.plan && trip.plan[index]) || [];
}

function render() {
    const trip = currentTrip();
    if (!trip) return;

    copyMsg.textContent = "";
    const days = dayCount(trip.startDate, trip.endDate);
    const shown = Math.min(days, MAX_DAYS);

    let total = 0;
    for (let i = 0; i < shown; i++) total += activitiesFor(trip, i).length;

    $("itinTitle").textContent = trip.destination;
    $("itinMeta").textContent =
        longDate(trip.startDate) + " to " + longDate(trip.endDate) +
        " (" + days + (days === 1 ? " day" : " days") + "), " +
        total + (total === 1 ? " activity planned" : " activities planned");

    $("editLink").href = "trip-details.html?id=" + trip.id;

    const timeline = $("timeline");
    timeline.innerHTML = "";

    for (let i = 0; i < shown; i++) {
        const items = activitiesFor(trip, i);
        const card = el("div", "tl-day" + (items.length ? "" : " empty"));

        const title = el("h3", "", "Day " + (i + 1));
        title.append(el("small", "", shortDate(dayDate(trip, i))));
        card.append(title);

        if (items.length) {
            const ul = el("ul", "tl-list");
            items.forEach((text) => ul.append(el("li", "", text)));
            card.append(ul);
        } else {
            const note = el("p", "tl-empty", "Nothing planned yet. ");
            const link = el("a", "", "Add activities");
            link.href = "trip-details.html?id=" + trip.id;
            note.append(link);
            card.append(note);
        }

        timeline.append(card);
    }

    if (days > MAX_DAYS) {
        timeline.append(el("p", "list-note", "Showing the first " + MAX_DAYS + " days of " + days + "."));
    }
}

function buildText(trip) {
    const days = dayCount(trip.startDate, trip.endDate);
    const lines = [
        trip.destination + " (" + longDate(trip.startDate) + " to " + longDate(trip.endDate) + ")",
        "",
    ];
    for (let i = 0; i < Math.min(days, MAX_DAYS); i++) {
        lines.push("Day " + (i + 1) + " - " + shortDate(dayDate(trip, i)));
        const items = activitiesFor(trip, i);
        if (items.length) items.forEach((t) => lines.push("  - " + t));
        else lines.push("  (nothing planned yet)");
        lines.push("");
    }
    return lines.join("\n").trim();
}

function showCopyMessage(text, type) {
    copyMsg.textContent = text;
    copyMsg.className = "form-message " + type;
}

$("copyBtn").addEventListener("click", async () => {
    const trip = currentTrip();
    if (!trip) return;
    try {
        await navigator.clipboard.writeText(buildText(trip));
        showCopyMessage("Itinerary copied. You can paste it anywhere.", "success");
    } catch (err) {
        showCopyMessage("Couldn't copy automatically. Please try again or copy it by hand.", "error");
    }
});

picker.addEventListener("change", () => {
    try { localStorage.setItem("raahix_itin_trip", picker.value); } catch (err) {}
    render();
});

async function init() {
    try {
        trips = (await Trips.list()).sort((a, b) => a.startDate.localeCompare(b.startDate));
    } catch (err) {
        picker.hidden = true;
        document.querySelector(".content-area").append(el("p", "list-note", err.message));
        return;
    }

    if (trips.length === 0) {
        $("itinEmpty").hidden = false;
        picker.hidden = true;
        return;
    }

    trips.forEach((t) => {
        const opt = el("option", "", t.destination + " (" + t.startDate + ")");
        opt.value = String(t.id);
        picker.append(opt);
    });

    let saved = null;
    try { saved = localStorage.getItem("raahix_itin_trip"); } catch (err) {}
    const fromUrl = new URLSearchParams(window.location.search).get("id");
    const wanted = fromUrl || saved;
    if (wanted && trips.some((t) => String(t.id) === wanted)) picker.value = wanted;

    $("itinView").hidden = false;
    render();
}

init();