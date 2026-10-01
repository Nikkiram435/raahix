// Saved: backend (database) mein save kiye hue places dikhata hai.

requireLogin();

const grid = document.getElementById("savedGrid");
const emptyState = document.getElementById("savedEmpty");
const countEl = document.getElementById("placesCount");

let savedIds = [];
const pending = new Set();

function el(tag, className, text) {
    const node = document.createElement(tag);
    if (className) node.className = className;
    if (text !== undefined) node.textContent = text;
    return node;
}

async function removePlace(id) {
    if (pending.has(id)) return;
    pending.add(id);
    try {
        await Saved.unsave(id);
        savedIds = savedIds.filter((x) => x !== id);
        render();
    } catch (err) {
        alert(err.message);
    } finally {
        pending.delete(id);
    }
}

function buildCard(place) {
    const card = el("article", "place-card");

    const cover = el("div", "place-cover trip-cover cover-" + (place.id % 6), place.emoji);
    cover.append(el("span", "place-cat", place.category));

    const heart = el("button", "heart-btn", "♥");
    heart.type = "button";
    heart.setAttribute("aria-pressed", "true");
    heart.setAttribute("aria-label", "Remove " + place.name + " from saved");
    heart.addEventListener("click", () => removePlace(place.id));
    cover.append(heart);

    const body = el("div", "place-body");
    body.append(
        el("h3", "", place.name),
        el("p", "place-city", place.city),
        el("p", "place-tags", place.tags)
    );

    card.append(cover, body);
    return card;
}

function render() {
    // Sirf wahi ids dikhao jo abhi PLACES mein maujood hain
    const places = PLACES.filter((p) => savedIds.includes(p.id));

    grid.innerHTML = "";
    countEl.textContent = String(places.length);
    emptyState.hidden = places.length > 0;

    places.forEach((p) => grid.append(buildCard(p)));
}

async function init() {
    emptyState.hidden = true;
    grid.append(el("p", "list-note", "Loading your saved places..."));

    try {
        savedIds = await Saved.list();
    } catch (err) {
        grid.innerHTML = "";
        grid.append(el("p", "list-note", err.message));
        return;
    }
    render();
}

init();