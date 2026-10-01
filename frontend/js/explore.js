// Explore: city, search aur category se places filter karta hai.
// Heart button se place backend (database) mein save hota hai.

const grid = document.getElementById("placeGrid");
const countEl = document.getElementById("resultCount");
const citySelect = document.getElementById("citySelect");
const searchInput = document.getElementById("searchInput");
const tabs = document.querySelectorAll("#categoryTabs .tab");

let activeCategory = "All";
let savedIds = [];
let loadFailed = false;
const pending = new Set();   // jin places ki request abhi chal rahi hai

function el(tag, className, text) {
    const node = document.createElement(tag);
    if (className) node.className = className;
    if (text !== undefined) node.textContent = text;
    return node;
}

async function toggleSaved(id) {
    if (!getToken()) {
        window.location.href = "login.html";
        return;
    }
    if (pending.has(id)) return;
    pending.add(id);

    const wasSaved = savedIds.includes(id);
    savedIds = wasSaved ? savedIds.filter((x) => x !== id) : savedIds.concat(id);
    render();   // heart turant badal do

    try {
        if (wasSaved) await Saved.unsave(id);
        else await Saved.save(id);
    } catch (err) {
        // Backend ne mana kiya: heart wapas purani halat mein
        savedIds = wasSaved ? savedIds.concat(id) : savedIds.filter((x) => x !== id);
        render();
        alert(err.message);
    } finally {
        pending.delete(id);
    }
}

function buildCard(place, isSaved) {
    const card = el("article", "place-card");

    const cover = el("div", "place-cover trip-cover cover-" + (place.id % 6), place.emoji);
    cover.append(el("span", "place-cat", place.category));

    const heart = el("button", "heart-btn", isSaved ? "♥" : "♡");
    heart.type = "button";
    heart.setAttribute("aria-pressed", String(isSaved));
    heart.setAttribute("aria-label", (isSaved ? "Remove " : "Save ") + place.name);
    heart.addEventListener("click", () => toggleSaved(place.id));
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
    countEl.textContent = shown.length + (shown.length === 1 ? " place" : " places") +
        (loadFailed ? " (couldn't load your saved places)" : "");

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

    shown.forEach((p) => grid.append(buildCard(p, savedIds.includes(p.id))));
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

async function init() {
    render();   // places turant dikhao, hearts baad mein bharenge
    if (!getToken()) return;

    try {
        savedIds = await Saved.list();
    } catch (err) {
        loadFailed = true;
    }
    render();
}

init();