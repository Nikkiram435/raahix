(function () {
    const items = document.querySelectorAll(".reveal, .reveal-fade");

    
    if (!("IntersectionObserver" in window)) {
        items.forEach((node) => node.classList.add("in-view"));
        return;
    }

    const observer = new IntersectionObserver((entries) => {
        entries.forEach((entry) => {
            if (entry.isIntersecting) {
                entry.target.classList.add("in-view");
                observer.unobserve(entry.target);
            }
        });
    }, { threshold: 0.15 });

    items.forEach((node) => observer.observe(node));
})();
