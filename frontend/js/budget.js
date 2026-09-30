// Budget: trip ke kharche jodta hai aur chart banata hai.
// Kharche trip ke andar (trip.expenses) browser mein save hote hain.
// Phase 6 mein yahi data backend se aayega.

const CATEGORIES = [
    { name: "Stay", color: "#8b5cf6" },
    { name: "Transport", color: "#38bdf8" },
    { name: "Food", color: "#f59e0b" },
    { name: "Activities", color: "#34d399" },
    { name: "Shopping", color: "#f472b6" },
    { name: "Other", color: "#94a3b8" },
];

const $ = (id) => document.getElementById(id);
const picker = $("tripPicker");
const catSelect = $("expCategory");
const amountInput = $("expAmount");
const noteInput = $("expNote");
const msg = $("expMsg");
let chart = null;

function el(tag, className, text) {
    const node = document.createElement(tag);
    if (className) node.className = className;
    if (text !== undefined) node.textContent = text;
    return node;
}

function loadTrips() {
    try {
        return JSON.parse(localStorage.getItem("raahix_trips") || "[]");
    } catch (err) {
        return [];
    }
}

function saveTrips(trips) {
    try {
        localStorage.setItem("raahix_trips", JSON.stringify(trips));
        return true;
    } catch (err) {
        return false;
    }
}

function money(n) {
    return "₹" + Math.round(n).toLocaleString("en-IN");
}

function currentTrip() {
    return loadTrips().find((t) => t.id === Number(picker.value));
}

function colorOf(name) {
    const c = CATEGORIES.find((x) => x.name === name);
    return c ? c.color : "#94a3b8";
}

function renderChart(expenses) {
    const canvas = $("budgetChart");
    const wrap = canvas.parentElement;
    const note = $("chartEmpty");

    if (chart) { chart.destroy(); chart = null; }

    if (expenses.length === 0) {
        wrap.hidden = true;
        note.hidden = false;
        note.textContent = "No expenses yet. Add your first one.";
        return;
    }
    if (typeof Chart === "undefined") {
        wrap.hidden = true;
        note.hidden = false;
        note.textContent = "The chart couldn't load. Check your internet connection and refresh.";
        return;
    }

    wrap.hidden = false;
    note.hidden = true;

    const totals = CATEGORIES.map((c) =>
        expenses.filter((e) => e.category === c.name).reduce((sum, e) => sum + e.amount, 0)
    );
    const used = CATEGORIES.map((c, i) => ({ c, total: totals[i] })).filter((x) => x.total > 0);

    chart = new Chart(canvas, {
        type: "doughnut",
        data: {
            labels: used.map((x) => x.c.name),
            datasets: [{
                data: used.map((x) => x.total),
                backgroundColor: used.map((x) => x.c.color),
                borderColor: "#0d0d1c",
                borderWidth: 2,
            }],
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            cutout: "62%",
            plugins: {
                legend: { position: "bottom", labels: { color: "#cfcde6", padding: 14, usePointStyle: true } },
                tooltip: { callbacks: { label: (ctx) => " " + ctx.label + ": " + money(ctx.parsed) } },
            },
        },
    });
}

function renderList(trip, expenses) {
    const ul = $("expenseList");
    ul.innerHTML = "";

    [...expenses].reverse().forEach((exp) => {
        const li = el("li");
        const dot = el("span", "cat-dot");
        dot.style.background = colorOf(exp.category);

        const text = el("span", "exp-text", exp.category);
        if (exp.note) text.append(el("small", "", exp.note));

        const remove = el("button", "exp-remove", "Remove");
        remove.type = "button";
        remove.addEventListener("click", () => {
            trip.expenses = expenses.filter((e) => e.id !== exp.id);
            saveTrips(loadTrips().map((t) => (t.id === trip.id ? trip : t)));
            render();
        });

        li.append(dot, text, el("span", "exp-amount", money(exp.amount)), remove);
        ul.append(li);
    });
}

function render() {
    const trip = currentTrip();
    if (!trip) return;

    const expenses = trip.expenses || [];
    const spent = expenses.reduce((sum, e) => sum + e.amount, 0);
    const budget = trip.budget || 0;

    $("bBudget").textContent = budget ? money(budget) : "Not set";
    $("bSpent").textContent = money(spent);

    const bar = $("bBar");
    const note = $("bNote");

    if (budget > 0) {
        const left = budget - spent;
        $("bRemaining").textContent = (left < 0 ? "-" : "") + money(Math.abs(left));
        bar.style.width = Math.min(100, (spent / budget) * 100) + "%";
        bar.classList.toggle("over", left < 0);
        note.textContent = left < 0
            ? "You are " + money(-left) + " over budget."
            : Math.round((spent / budget) * 100) + "% of your budget used.";
    } else {
        $("bRemaining").textContent = "Not set";
        bar.style.width = "0";
        bar.classList.remove("over");
        note.textContent = "This trip has no budget yet, so there is no progress to show.";
    }

    renderChart(expenses);
    renderList(trip, expenses);
}

$("expenseForm").addEventListener("submit", (e) => {
    e.preventDefault();
    msg.textContent = "";

    const trip = currentTrip();
    if (!trip) return;

    const amount = Number(amountInput.value);
    if (!Number.isFinite(amount) || amount <= 0 || amount > 100000000) {
        msg.textContent = "Please enter an amount greater than 0.";
        return;
    }
    if (!CATEGORIES.some((c) => c.name === catSelect.value)) {
        msg.textContent = "Please choose a category.";
        return;
    }

    trip.expenses = (trip.expenses || []).concat({
        id: Date.now(),
        category: catSelect.value,
        amount: amount,
        note: noteInput.value.trim().slice(0, 60),
    });

    if (!saveTrips(loadTrips().map((t) => (t.id === trip.id ? trip : t)))) {
        msg.textContent = "Couldn't save this expense in your browser.";
        return;
    }

    amountInput.value = "";
    noteInput.value = "";
    amountInput.focus();
    render();
});

picker.addEventListener("change", () => {
    try { localStorage.setItem("raahix_budget_trip", picker.value); } catch (err) {}
    render();
});

function init() {
    CATEGORIES.forEach((c) => {
        const opt = el("option", "", c.name);
        opt.value = c.name;
        catSelect.append(opt);
    });

    const trips = loadTrips().sort((a, b) => a.startDate.localeCompare(b.startDate));

    if (trips.length === 0) {
        $("budgetEmpty").hidden = false;
        picker.hidden = true;
        return;
    }

    trips.forEach((t) => {
        const opt = el("option", "", t.destination + " (" + t.startDate + ")");
        opt.value = String(t.id);
        picker.append(opt);
    });

    let saved = null;
    try { saved = localStorage.getItem("raahix_budget_trip"); } catch (err) {}
    const fromUrl = new URLSearchParams(window.location.search).get("id");
    const wanted = fromUrl || saved;
    if (wanted && trips.some((t) => String(t.id) === wanted)) picker.value = wanted;

    $("budgetView").hidden = false;
    render();
}

init();