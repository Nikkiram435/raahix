requireLogin();

const form = document.getElementById("tripForm");
const message = document.getElementById("formMessage");
const startInput = document.getElementById("startDate");
const endInput = document.getElementById("endDate");
const submitBtn = form.querySelector("button[type='submit']");


const today = new Date().toISOString().split("T")[0];
startInput.min = today;
endInput.min = today;


startInput.addEventListener("change", () => {
    endInput.min = startInput.value || today;
});


document.querySelectorAll(".style-chip").forEach((chip) => {
    chip.addEventListener("click", () => chip.classList.toggle("selected"));
});

function showMessage(text, type) {
    message.textContent = text;
    message.className = "form-message " + type;
}

form.addEventListener("submit", async (e) => {
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
        destination: destination.value.trim(),
        startDate: startInput.value,
        endDate: endInput.value,
        travelers: Number(document.getElementById("travelers").value),
        budget: Math.round(Number(document.getElementById("budget").value)) || 0,
        styles: [...document.querySelectorAll(".style-chip.selected")].map((c) => c.textContent),
    };

    submitBtn.disabled = true;
    submitBtn.textContent = "Saving...";
    message.textContent = "";

    try {
        const saved = await Trips.create(trip);

        message.className = "form-message success";
        message.innerHTML = "";
        message.append("Trip to " + saved.destination + " saved. ");
        const link = document.createElement("a");
        link.href = "dashboard.html";
        link.textContent = "View my trips";
        message.append(link);

        form.reset();
        document.querySelectorAll(".style-chip.selected").forEach((c) => c.classList.remove("selected"));
    } catch (err) {
        showMessage(err.message, "error");
    } finally {
        submitBtn.disabled = false;
        submitBtn.textContent = "Save trip";
    }
});
