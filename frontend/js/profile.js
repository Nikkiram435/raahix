// Profile: naam, email aur counters dikhata hai. Log out aur trips/saved delete bhi yahin hota hai.

(function () {
    const $ = (id) => document.getElementById(id);

    const LOCAL_KEYS = [
        "raahix_trips", "raahix_saved", "raahix_user", "raahix_token",
        "raahix_budget_trip", "raahix_itin_trip",
    ];

    function read(key, fallback) {
        try {
            const value = JSON.parse(localStorage.getItem(key));
            return value === null || value === undefined ? fallback : value;
        } catch (err) {
            return fallback;
        }
    }

    function countActivities(trips) {
        return trips.reduce((total, trip) => {
            const days = Object.values(trip.plan || {});
            return total + days.reduce((sum, list) => sum + list.length, 0);
        }, 0);
    }

    function setMessage(text, type) {
        const box = $("nameMsg");
        box.textContent = text;
        box.className = "form-message " + type;
    }

    async function render() {
        const user = read("raahix_user", null);

        // Login nahi hai (ya token nahi hai): guest view
        if (!user || !getToken()) {
            $("guestView").hidden = false;
            $("userView").hidden = true;
            return;
        }

        $("guestView").hidden = true;
        $("userView").hidden = false;

        const name = user.name || "Traveler";
        $("pAvatar").textContent = name.trim().charAt(0).toUpperCase() || "T";
        $("pName").textContent = name;
        $("pEmail").textContent = user.email || "";
        $("nameInput").value = name;

        try {
            const [trips, saved] = await Promise.all([Trips.list(), Saved.list()]);
            $("pTrips").textContent = String(trips.length);
            $("pActs").textContent = String(countActivities(trips));
            $("pSaved").textContent = String(saved.length);
        } catch (err) {
            $("pTrips").textContent = "-";
            $("pActs").textContent = "-";
            $("pSaved").textContent = "-";
        }
    }

    // Naam abhi sirf is browser mein badalta hai (backend mein naam badalne ka endpoint baad mein aayega)
    $("nameForm").addEventListener("submit", (e) => {
        e.preventDefault();
        const user = read("raahix_user", null);
        if (!user) return;

        const name = $("nameInput").value.trim();
        if (!name) return setMessage("Please enter a name.", "error");

        user.name = name;
        try {
            localStorage.setItem("raahix_user", JSON.stringify(user));
        } catch (err) {
            return setMessage("Couldn't save your name in this browser.", "error");
        }

        render();
        setMessage("Name saved on this browser. The sidebar will update when you open the next page.", "success");
    });

    $("logoutBtn").addEventListener("click", () => {
        clearSession();
        window.location.href = "login.html";
    });

    $("wipeBtn").addEventListener("click", async () => {
        const ok = confirm(
            "Delete all your trips and saved places, and log out? This can't be undone. Your account itself stays."
        );
        if (!ok) return;

        const btn = $("wipeBtn");
        btn.disabled = true;

        try {
            const trips = await Trips.list();
            for (const t of trips) await Trips.remove(t.id);
            const saved = await Saved.list();
            for (const id of saved) await Saved.unsave(id);
        } catch (err) {
            btn.disabled = false;
            alert(err.message);
            return;
        }

        try {
            LOCAL_KEYS.forEach((key) => localStorage.removeItem(key));
        } catch (err) {}
        window.location.href = "index.html";
    });

    render();
})();