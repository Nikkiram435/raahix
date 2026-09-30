// RAAHIX common JS: har page par chalta hai.

// Tabs: .tab button par click karne se uska data-tab wala .tab-panel dikhta hai
document.querySelectorAll(".tabs").forEach((group) => {
    const tabs = group.querySelectorAll(".tab");

    tabs.forEach((tab) => {
        tab.addEventListener("click", () => {
            tabs.forEach((t) => t.classList.toggle("active", t === tab));
            document.querySelectorAll(".tab-panel").forEach((panel) => {
                panel.classList.toggle("active", panel.id === tab.dataset.tab);
            });
        });
    });
});