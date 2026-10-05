const ICONS = {
    home: '<path d="M15 21v-8a1 1 0 0 0-1-1h-4a1 1 0 0 0-1 1v8"/><path d="M3 10a2 2 0 0 1 .709-1.528l7-5.999a2 2 0 0 1 2.582 0l7 5.999A2 2 0 0 1 21 10v9a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/>',
    assistant: '<path d="M9.937 15.5A2 2 0 0 0 8.5 14.063l-6.135-1.582a.5.5 0 0 1 0-.962L8.5 9.936A2 2 0 0 0 9.937 8.5l1.582-6.135a.5.5 0 0 1 .963 0L14.063 8.5A2 2 0 0 0 15.5 9.937l6.135 1.581a.5.5 0 0 1 0 .964L15.5 14.063a2 2 0 0 0-1.437 1.437l-1.582 6.135a.5.5 0 0 1-.963 0z"/><path d="M20 3v4"/><path d="M22 5h-4"/>',
    trips: '<path d="M16 20V4a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16"/><rect width="20" height="14" x="2" y="6" rx="2"/>',
    explore: '<circle cx="12" cy="12" r="10"/><path d="m16.24 7.76-1.804 5.411a2 2 0 0 1-1.265 1.265L7.76 16.24l1.804-5.411a2 2 0 0 1 1.265-1.265z"/>',
    saved: '<path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z"/>',
    itinerary: '<path d="M14.106 5.553a2 2 0 0 0 1.788 0l3.659-1.83A1 1 0 0 1 21 4.619v12.764a1 1 0 0 1-.553.894l-4.553 2.277a2 2 0 0 1-1.788 0l-4.212-2.106a2 2 0 0 0-1.788 0l-3.659 1.83A1 1 0 0 1 3 19.381V6.618a1 1 0 0 1 .553-.894l4.553-2.277a2 2 0 0 1 1.788 0z"/><path d="M15 5.764v15"/><path d="M9 3.236v15"/>',
    budget: '<path d="M6 3h12"/><path d="M6 8h12"/><path d="m6 13 8.5 8"/><path d="M6 13h3"/><path d="M9 13c6.667 0 6.667-10 0-10"/>',
};

const NAV_ITEMS = [
    { href: "index.html",     icon: "home",      label: "Home" },
    { href: "assistant.html", icon: "assistant", label: "AI Assistant" },
    { href: "dashboard.html", icon: "trips",     label: "My Trips",
      also: ["create-trip.html", "trip-details.html"] },
    { href: "explore.html",   icon: "explore",   label: "Explore",
      also: ["place.html"] },
    { href: "saved.html",     icon: "saved",     label: "Saved" },
    { href: "itinerary.html", icon: "itinerary", label: "Itinerary" },
    { href: "budget.html",    icon: "budget",    label: "Budget" },
];

function svgIcon(name) {
    return '<svg class="nav-icon" viewBox="0 0 24 24" aria-hidden="true">' + ICONS[name] + "</svg>";
}

function currentPage() {
    const file = window.location.pathname.split("/").pop();
    return file || "index.html";
}

function isActive(item, page) {
    return item.href === page || (item.also || []).includes(page);
}


function esc(text) {
    return String(text).replace(/[&<>"']/g, (c) => ({
        "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;",
    }[c]));
}

function getUser() {
    try {
        return JSON.parse(localStorage.getItem("raahix_user") || "null");
    } catch (err) {
        return null;
    }
}

function buildSidebar() {
    const page = currentPage();
    const user = getUser();
    const name = user && user.name ? user.name : "Traveler";
    const initial = name.trim().charAt(0).toUpperCase() || "T";
    const subtitle = user ? "My Profile" : "Log in";

    const links = NAV_ITEMS.map(item => `
        <a href="${item.href}" class="nav-item${isActive(item, page) ? " active" : ""}">
            <span>${svgIcon(item.icon)}</span>
            <span>${item.label}</span>
        </a>`).join("");

    return `
    <aside class="sidebar">
        <div class="brand">
            <div class="brand-icon">${svgIcon("assistant")}</div>
            <span>RAAHIX</span>
        </div>

        <nav class="sidebar-nav">${links}</nav>

        <div class="sidebar-bottom">
            <a href="profile.html" class="profile-mini">
                <div class="profile-avatar">${esc(initial)}</div>
                <div class="profile-info">
                    <strong>${esc(name)}</strong>
                    <small>${subtitle}</small>
                </div>
                <span class="more-icon">•••</span>
            </a>
        </div>
    </aside>`;
}

const sidebarRoot = document.getElementById("sidebar");
if (sidebarRoot) sidebarRoot.outerHTML = buildSidebar();

// Har page par P1-P4 background photos lagao (home par HTML mein pehle se hai)
(function () {
    function addBackground() {
        if (location.pathname.toLowerCase().includes("assistant")) return;
        if (!document.querySelector(".main-content")) return;
        document.body.classList.add("has-bg");
        if (document.querySelector(".hero-bg")) return;

        const bg = document.createElement("div");
        bg.className = "hero-bg";
        bg.setAttribute("aria-hidden", "true");
        bg.innerHTML =
            '<div class="hero-slide s1"></div>' +
            '<div class="hero-slide s2"></div>' +
            '<div class="hero-slide s3"></div>' +
            '<div class="hero-slide s4"></div>' +
            '<div class="hero-shade"></div>';
        document.body.insertBefore(bg, document.body.firstChild);
    }

    if (document.readyState === "loading") {
        document.addEventListener("DOMContentLoaded", addBackground);
    } else {
        addBackground();
    }
})();
