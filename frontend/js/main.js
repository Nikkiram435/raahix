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
