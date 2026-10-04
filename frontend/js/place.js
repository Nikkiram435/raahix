// Place details: place.html?id=... Featured place ("f7") local data se, baaki backend (Geoapify data) se.

const root = document.getElementById("placeDetail");
const ID_OK = /^[A-Za-z0-9_-]{1,100}$/;
let place = null;
let isSaved = false;
let pending = false;

function whereOf(p) {
    return p.address || [p.area, p.city].filter(Boolean).join(", ");
}

// Google Maps ka seedha search link (bina key ke). Hours, phone aur reviews wahin dikhte hain.
function mapsUrl(p) {
    return "https://www.google.com/maps/search/?api=1&query=" + encodeURIComponent(p.name + ", " + whereOf(p));
}

function showMessage(title, text) {
    root.innerHTML = "";
    const box = el("div", "empty-state");
    box.append(el("div", "empty-art", "🧭"), el("h3", "", title), el("p", "", text));
    const link = el("a", "setup-btn", "Back to Explore");
    link.href = "explore.html";
    box.append(link);
    root.append(box);
}

async function toggleSave() {
    if (!getToken()) {
        window.location.href = "login.html";
        return;
    }
    if (pending) return;
    pending = true;

    const was = isSaved;
    isSaved = !was;
    render();

    try {
        if (was) await Saved.unsave(place.id);
        else await Saved.save(place.id);
    } catch (err) {
        isSaved = was;
        render();
        alert(err.message);
    } finally {
        pending = false;
    }
}

function infoRow(label, valueNode) {
    const row = el("div", "info-row");
    row.append(el("span", "info-label", label), valueNode);
    return row;
}

function buildInfo(p) {
    const rows = el("div", "info-rows");
    if (p.address) rows.append(infoRow("Address", el("span", "", p.address)));

    if (p.phone) {
        const a = el("a", "", p.phone);
        a.href = "tel:" + p.phone.replace(/[^0-9+]/g, "");
        rows.append(infoRow("Phone", a));
    }

    if (p.website && /^https?:\/\//i.test(p.website)) {
        let host = p.website;
        try { host = new URL(p.website).hostname; } catch (err) {}
        const a = el("a", "", host);
        a.href = p.website;
        a.target = "_blank";
        a.rel = "noopener noreferrer";
        rows.append(infoRow("Website", a));
    }

    if (p.hours) rows.append(infoRow("Hours", el("span", "", p.hours)));
    return rows;
}

function similarPlaces() {
    const sameCity = PLACES.filter((p) => p.id !== place.id && p.city === place.city);
    const sameCategory = PLACES.filter((p) => p.id !== place.id && p.city !== place.city && p.category === place.category);
    return sameCity.concat(sameCategory).slice(0, 4);
}

function render() {
    root.innerHTML = "";
    document.title = place.name + " — RAAHIX";

    const hero = el("div", "detail-hero trip-cover cover-" + coverIndex(place.id));
    const emoji = el("span", "place-emoji", emojiFor(place));
    emoji.setAttribute("aria-hidden", "true");
    hero.append(emoji, el("span", "trip-badge", place.category), el("h1", "", place.name), el("p", "", whereOf(place)));

    const actions = el("div", "place-actions");
    const save = el("button", "btn-ghost-outline" + (isSaved ? " saved" : ""), isSaved ? "♥ Saved" : "♡ Save");
    save.type = "button";
    save.setAttribute("aria-pressed", String(isSaved));
    save.addEventListener("click", toggleSave);

    const maps = el("a", "create-trip-btn", "Open in Google Maps");
    maps.href = mapsUrl(place);
    maps.target = "_blank";
    maps.rel = "noopener noreferrer";
    actions.append(save, maps);

    root.append(hero, actions);

    if (place.about) {
        // Featured place: hamara likha description aur tips
        const about = el("section", "place-section");
        about.append(el("h2", "", "About"), el("p", "place-about", place.about));
        const tags = el("div", "trip-tags");
        (place.tags || "").split(",").forEach((t) => { if (t.trim()) tags.append(el("span", "", t.trim())); });
        about.append(tags);

        const tips = el("section", "place-section");
        tips.append(el("h2", "", "Good to know"));
        const list = el("ul", "tips-list");
        (place.tips || []).forEach((t) => list.append(el("li", "", t)));
        tips.append(list, el("p", "weather-note", "Opening hours, phone and reviews change often. Use the Google Maps button for the latest."));
        root.append(about, tips);

        const similar = similarPlaces();
        if (similar.length) {
            const section = el("section", "place-section");
            section.append(el("h2", "", "Similar places"));
            const grid = el("div", "place-grid");
            similar.forEach((p) => grid.append(buildPlaceCard(p, false, null)));
            section.append(grid);
            root.append(section);
        }
    } else {
        // Backend wali place: OpenStreetMap ka data
        const info = el("section", "place-section");
        info.append(el("h2", "", "Details"), buildInfo(place));
        info.append(el("p", "weather-note",
            "Details come from OpenStreetMap contributors and can be incomplete or out of date. Use Google Maps for hours, photos and reviews."));
        root.append(info);

        const more = el("a", "create-trip-btn", "More " + place.category.toLowerCase() + " in " + place.city);
        more.href = "explore.html?city=" + encodeURIComponent(place.city) + "&cat=" + encodeURIComponent(place.category);
        root.append(more);
    }
}

async function init() {
    const id = new URLSearchParams(window.location.search).get("id") || "";
    if (!ID_OK.test(id)) return showMessage("We couldn't find this place", "The link looks wrong.");

    place = PLACES.find((p) => p.id === id) || null;

    if (!place) {
        if (!getToken()) {
            window.location.href = "login.html";
            return;
        }
        root.append(el("p", "list-note", "Loading place..."));
        try {
            place = await Places.get(id);
        } catch (err) {
            if (err.message === "Place not found.") {
                return showMessage("We couldn't find this place", "Open it from Explore so we can load its details.");
            }
            return showMessage("Something went wrong", err.message);
        }
    }

    render();

    if (!getToken()) return;
    try {
        isSaved = (await Saved.list()).includes(place.id);
        render();
    } catch (err) {
        // Saved ki halat na mile toh bhi page theek rehta hai
    }
}

init();