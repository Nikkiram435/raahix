// Profile: naam, email aur counters dikhata hai. Log out aur data delete bhi yahin hota hai.
// Phase 5 mein yeh data backend (real account) se aayega.

(function () {
    const $ = (id) => document.getElementById(id);

    const DATA_KEYS = [
        "raahix_trips", "raahix_saved", "raahix_user",
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

    function render() {
        const user = read("raahix_user", null);

        if (!user) {
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

        const trips = read("raahix_trips", []);
        $("pTrips").textContent = String(trips.length);
        $("pSaved").textContent = String(read("raahix_saved", []).length);
        $("pActs").textContent = String(countActivities(trips));
    }

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
        setMessage("Name saved. The sidebar will update when you open the next page.", "success");
    });

    $("logoutBtn").addEventListener("click", () => {
        try { localStorage.removeItem("raahix_user"); } catch (err) {}
        window.location.href = "login.html";
    });

    $("wipeBtn").addEventListener("click", () => {
        const ok = confirm(
            "Delete your trips, saved places and account details from this browser? This can't be undone."
        );
        if (!ok) return;
        try {
            DATA_KEYS.forEach((key) => localStorage.removeItem(key));
        } catch (err) {
            alert("Couldn't delete your data. Please try again.");
            return;
        }
        window.location.href = "index.html";
    });

    render();
})();