// Saved: Explore mein heart kiye hue places dikhata hai.
// places-data.js se PLACES aur loadSaved() / toggleSaved() aate hain.

const grid = document.getElementById("savedGrid");
const emptyState = document.getElementById("savedEmpty");
const countEl = document.getElementById("placesCount");

function el(tag, className, text) {
    const node = document.createElement(tag);
    if (className) node.className = className;
    if (text !== undefined) node.textContent = text;
    return node;
}

function buildCard(place) {
    const card = el("article", "place-card");

    const cover = el("div", "place-cover trip-cover cover-" + (place.id % 6), place.emoji);
    cover.append(el("span", "place-cat", place.category));

    const heart = el("button", "heart-btn", "♥");
    heart.type = "button";
    heart.setAttribute("aria-pressed", "true");
    heart.setAttribute("aria-label", "Remove " + place.name + " from saved");
    heart.addEventListener("click", () => {
        toggleSaved(place.id);
        render();
    });
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
    const savedIds = loadSaved();
    // Sirf wahi ids dikhao jo abhi PLACES mein maujood hain
    const places = PLACES.filter((p) => savedIds.includes(p.id));

    grid.innerHTML = "";
    countEl.textContent = String(places.length);
    emptyState.hidden = places.length > 0;

    places.forEach((p) => grid.append(buildCard(p)));
}

render();