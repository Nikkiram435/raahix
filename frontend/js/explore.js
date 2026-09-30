// Explore: city, search aur category se places filter karta hai.
// Heart button se place save hota hai (browser mein).

const grid = document.getElementById("placeGrid");
const countEl = document.getElementById("resultCount");
const citySelect = document.getElementById("citySelect");
const searchInput = document.getElementById("searchInput");
const tabs = document.querySelectorAll("#categoryTabs .tab");

let activeCategory = "All";

function el(tag, className, text) {
    const node = document.createElement(tag);
    if (className) node.className = className;
    if (text !== undefined) node.textContent = text;
    return node;
}

function buildCard(place, isSaved) {
    const card = el("article", "place-card");

    const cover = el("div", "place-cover trip-cover cover-" + (place.id % 6), place.emoji);
    cover.append(el("span", "place-cat", place.category));

    const heart = el("button", "heart-btn", isSaved ? "♥" : "♡");
    heart.type = "button";
    heart.setAttribute("aria-pressed", String(isSaved));
    heart.setAttribute("aria-label", (isSaved ? "Remove " : "Save ") + place.name);
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
    const city = citySelect.value;
    const query = searchInput.value.trim().toLowerCase();
    const saved = loadSaved();

    const shown = PLACES.filter((p) => {
        if (city !== "All" && p.city !== city) return false;
        if (activeCategory !== "All" && p.category !== activeCategory) return false;
        if (query) {
            const haystack = (p.name + " " + p.city + " " + p.category + " " + p.tags).toLowerCase();
            if (!haystack.includes(query)) return false;
        }
        return true;
    });

    grid.innerHTML = "";
    countEl.textContent = shown.length + (shown.length === 1 ? " place" : " places");

    if (shown.length === 0) {
        const box = el("div", "empty-state");
        box.style.gridColumn = "1 / -1";
        box.append(
            el("div", "empty-art", "🔍"),
            el("h3", "", "No places match"),
            el("p", "", "Try a different city, category or search word.")
        );
        grid.append(box);
        return;
    }

    shown.forEach((p) => grid.append(buildCard(p, saved.includes(p.id))));
}

// City dropdown places-data se banta hai
const cities = ["All", ...new Set(PLACES.map((p) => p.city))];
cities.forEach((c) => {
    const opt = el("option", "", c === "All" ? "All cities" : c);
    opt.value = c;
    citySelect.append(opt);
});

tabs.forEach((tab) => {
    tab.addEventListener("click", () => {
        activeCategory = tab.dataset.cat;
        tabs.forEach((t) => t.classList.toggle("active", t === tab));
        render();
    });
});

citySelect.addEventListener("change", render);
searchInput.addEventListener("input", render);

// Home ki category bar se aaya ho (explore.html?cat=Stays), toh wahi tab kholo
const wantedCat = new URLSearchParams(window.location.search).get("cat");
if (wantedCat && [...tabs].some((t) => t.dataset.cat === wantedCat)) {
    activeCategory = wantedCat;
    tabs.forEach((t) => t.classList.toggle("active", t.dataset.cat === wantedCat));
}

render();