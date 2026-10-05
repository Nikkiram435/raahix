const grid = document.getElementById("placeGrid");
const countEl = document.getElementById("resultCount");
const statusEl = document.getElementById("listStatus");
const subEl = document.getElementById("exploreSub");
const sentinel = document.getElementById("sentinel");
const cityForm = document.getElementById("cityForm");
const cityInput = document.getElementById("cityInput");
const searchInput = document.getElementById("searchInput");
const tabs = document.querySelectorAll("#categoryTabs .tab");

const params = new URLSearchParams(window.location.search);
let city = (params.get("city") || "Mumbai").trim().slice(0, 80) || "Mumbai";
let activeCategory = "All";

let items = [];            
let seen = new Set();
let page = 0;
let hasMore = false;
let loading = false;
let emptyStreak = 0;
let apiError = "";
let placeLabel = "";
let requestId = 0;         
let savedIds = [];
const pending = new Set();

function featuredFor() {
    const loggedIn = !!getToken();
    return PLACES.filter((p) =>
        (activeCategory === "All" || p.category === activeCategory) &&
        (!loggedIn || p.city.toLowerCase() === city.toLowerCase())
    );
}

function matches(p, q) {
    if (!q) return true;
    return ((p.name || "") + " " + (p.city || "") + " " + (p.tags || "") + " " + (p.address || ""))
        .toLowerCase().includes(q);
}

async function toggleSaved(id) {
    if (!getToken()) {
        window.location.href = "login.html";
        return;
    }
    if (pending.has(id)) return;
    pending.add(id);

    const was = savedIds.includes(id);
    savedIds = was ? savedIds.filter((x) => x !== id) : savedIds.concat(id);
    render();   // heart turant badal do

    try {
        if (was) await Saved.unsave(id);
        else await Saved.save(id);
    } catch (err) {
        savedIds = was ? savedIds.concat(id) : savedIds.filter((x) => x !== id);
        render();
        alert(err.message);
    } finally {
        pending.delete(id);
    }
}

function render() {
    const q = searchInput.value.trim().toLowerCase();
    const list = featuredFor().concat(items).filter((p) => matches(p, q));

    grid.innerHTML = "";
    list.forEach((p) => grid.append(buildPlaceCard(p, savedIds.includes(p.id), toggleSaved)));

    countEl.textContent = list.length + (list.length === 1 ? " place" : " places") + (q ? " match your filter" : "");
    subEl.textContent = getToken()
        ? "Places in " + (placeLabel || city)
        : "Featured places. Log in to explore any city.";

    if (list.length === 0 && !loading) {
        const box = el("div", "empty-state");
        box.style.gridColumn = "1 / -1";
        box.append(
            el("div", "empty-art", "🔍"),
            el("h3", "", "No places match"),
            el("p", "", "Try a different city, category or filter.")
        );
        grid.append(box);
    }

    statusEl.textContent = "";
    if (!getToken()) {
        const link = el("a", "", "Log in to see more places");
        link.href = "login.html";
        statusEl.append(link);
    } else if (loading) {
        statusEl.textContent = "Loading more places...";
    } else if (apiError) {
        statusEl.textContent = apiError + (items.length ? "" : " Showing featured places only.");
    } else if (!hasMore && items.length) {
        statusEl.textContent = "That's everything we found for this search.";
    }
}

function maybeLoadMore() {
    if (loading || !hasMore) return;
    if (sentinel.getBoundingClientRect().top < window.innerHeight + 300) loadMore();
}

async function loadMore() {
    if (loading || !hasMore || !getToken()) return;
    loading = true;
    const mine = requestId;
    render();

    try {
        const data = await Places.search(city, activeCategory, page);
        if (mine !== requestId) return;   

        placeLabel = data.place;
        let added = 0;
        data.items.forEach((p) => {
            if (!seen.has(p.id)) {
                seen.add(p.id);
                items.push(p);
                added += 1;
            }
        });
        emptyStreak = added === 0 ? emptyStreak + 1 : 0;
        hasMore = data.has_more && emptyStreak < 3;
        page += 1;
        apiError = "";
    } catch (err) {
        if (mine !== requestId) return;
        apiError = err.message;
        hasMore = false;
    } finally {
        if (mine === requestId) {
            loading = false;
            render();
            maybeLoadMore();
        }
    }
}

function startSearch() {
    requestId += 1;
    items = [];
    seen = new Set();
    page = 0;
    emptyStreak = 0;
    apiError = "";
    placeLabel = "";
    loading = false;
    hasMore = !!getToken();

    
    const url = new URL(window.location.href);
    url.searchParams.set("city", city);
    url.searchParams.set("cat", activeCategory);
    history.replaceState(null, "", url);

    render();
    loadMore();   
}

tabs.forEach((tab) => {
    tab.addEventListener("click", () => {
        activeCategory = tab.dataset.cat;
        tabs.forEach((t) => t.classList.toggle("active", t === tab));
        startSearch();
    });
});

cityForm.addEventListener("submit", (e) => {
    e.preventDefault();
    const value = cityInput.value.trim();
    if (!value) return;
    city = value;
    startSearch();
});

searchInput.addEventListener("input", render);
window.addEventListener("scroll", maybeLoadMore, { passive: true });
window.addEventListener("resize", maybeLoadMore);

async function init() {
    cityInput.value = city;

    const cat = params.get("cat");
    if (cat && [...tabs].some((t) => t.dataset.cat === cat)) {
        activeCategory = cat;
        tabs.forEach((t) => t.classList.toggle("active", t.dataset.cat === cat));
    }

    if (getToken()) {
        try { savedIds = await Saved.list(); } catch (err) {}
    }

    startSearch();
}

init();
