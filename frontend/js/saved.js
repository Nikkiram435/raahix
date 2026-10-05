requireLogin();

const grid = document.getElementById("savedGrid");
const emptyState = document.getElementById("savedEmpty");
const countEl = document.getElementById("placesCount");

let places = [];
const pending = new Set();

async function removePlace(id) {
    if (pending.has(id)) return;
    pending.add(id);
    try {
        await Saved.unsave(id);
        places = places.filter((p) => p.id !== id);
        render();
    } catch (err) {
        alert(err.message);
    } finally {
        pending.delete(id);
    }
}

function render() {
    grid.innerHTML = "";
    countEl.textContent = String(places.length);
    emptyState.hidden = places.length > 0;
    places.forEach((p) => grid.append(buildPlaceCard(p, true, removePlace)));
}

async function init() {
    emptyState.hidden = true;
    grid.append(el("p", "list-note", "Loading your saved places..."));

    let ids;
    try {
        ids = await Saved.list();
    } catch (err) {
        grid.innerHTML = "";
        grid.append(el("p", "list-note", err.message));
        return;
    }

    const featured = new Map(PLACES.map((p) => [p.id, p]));
    const others = ids.filter((id) => !featured.has(id));

    let fetched = [];
    if (others.length) {
        try { fetched = await Places.lookup(others); } catch (err) {}
    }
    const byId = new Map(fetched.map((p) => [p.id, p]));

    places = ids.map((id) => featured.get(id) || byId.get(id)).filter(Boolean);
    render();
}

init();
