// Trip form: check karta hai, phir trip ko browser (localStorage) mein save karta hai.
// Phase 6 mein yahi data backend/database mein jaayega.

const form = document.getElementById("tripForm");
const message = document.getElementById("formMessage");
const startInput = document.getElementById("startDate");
const endInput = document.getElementById("endDate");

// Aaj se pehle ki date mat chuno
const today = new Date().toISOString().split("T")[0];
startInput.min = today;
endInput.min = today;

// Start date badalne par end date ki minimum date bhi badal do
startInput.addEventListener("change", () => {
    endInput.min = startInput.value || today;
});

// Travel style chips: click par select / unselect
document.querySelectorAll(".style-chip").forEach((chip) => {
    chip.addEventListener("click", () => chip.classList.toggle("selected"));
});

function showMessage(text, type) {
    message.textContent = text;
    message.className = "form-message " + type;
}

function saveTrip(trip) {
    try {
        const trips = JSON.parse(localStorage.getItem("raahix_trips") || "[]");
        trips.push(trip);
        localStorage.setItem("raahix_trips", JSON.stringify(trips));
        return true;
    } catch (err) {
        return false;
    }
}

form.addEventListener("submit", (e) => {
    e.preventDefault();

    const destination = document.getElementById("destination");
    [destination, startInput, endInput].forEach((el) => el.classList.remove("invalid"));

    if (!destination.value.trim()) {
        destination.classList.add("invalid");
        return showMessage("Please enter where you want to go.", "error");
    }
    if (!startInput.value || !endInput.value) {
        (!startInput.value ? startInput : endInput).classList.add("invalid");
        return showMessage("Please choose both start and end dates.", "error");
    }
    if (endInput.value < startInput.value) {
        endInput.classList.add("invalid");
        return showMessage("End date can't be before the start date.", "error");
    }

    const trip = {
        id: Date.now(),
        destination: destination.value.trim(),
        startDate: startInput.value,
        endDate: endInput.value,
        travelers: Number(document.getElementById("travelers").value),
        budget: Number(document.getElementById("budget").value) || 0,
        styles: [...document.querySelectorAll(".style-chip.selected")].map((c) => c.textContent),
        createdAt: new Date().toISOString(),
    };

    if (!saveTrip(trip)) {
        return showMessage("Couldn't save the trip in this browser. Please try again.", "error");
    }

    message.className = "form-message success";
    message.innerHTML = "";
    message.append("Trip to " + trip.destination + " saved. ");
    const link = document.createElement("a");
    link.href = "dashboard.html";
    link.textContent = "View my trips";
    message.append(link);

    form.reset();
    document.querySelectorAll(".style-chip.selected").forEach((c) => c.classList.remove("selected"));
});