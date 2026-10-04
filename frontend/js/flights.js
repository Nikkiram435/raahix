// Flights: form check karke Google Flights par bhejta hai (RAAHIX khud prices nahi dikhata).

const form = document.getElementById("flightForm");
const msg = document.getElementById("flightMsg");
const fromInput = document.getElementById("from");
const toInput = document.getElementById("to");
const depart = document.getElementById("depart");
const ret = document.getElementById("ret");

const now = new Date();
const today = now.getFullYear() + "-" +
    String(now.getMonth() + 1).padStart(2, "0") + "-" +
    String(now.getDate()).padStart(2, "0");
depart.min = today;
ret.min = today;
depart.addEventListener("change", () => { ret.min = depart.value || today; });

// Trip details se aaye ho toh (flights.html?to=Goa) "To" bhar do
const params = new URLSearchParams(window.location.search);
if (params.get("to")) toInput.value = params.get("to").slice(0, 60);

function fail(text, input) {
    msg.textContent = text;
    msg.className = "form-message error";
    if (input) input.focus();
}

form.addEventListener("submit", (e) => {
    e.preventDefault();
    msg.textContent = "";

    const from = fromInput.value.trim();
    const to = toInput.value.trim();

    if (!from) return fail("Please enter where you are flying from.", fromInput);
    if (!to) return fail("Please enter where you are flying to.", toInput);
    if (from.toLowerCase() === to.toLowerCase()) return fail("From and To can't be the same.", toInput);
    if (!depart.value) return fail("Please choose a departure date.", depart);
    if (depart.value < today) return fail("The departure date can't be in the past.", depart);
    if (ret.value && ret.value < depart.value) return fail("The return date can't be before the departure date.", ret);

    let text = "Flights from " + from + " to " + to + " on " + depart.value;
    if (ret.value) text += " through " + ret.value;

    window.open("https://www.google.com/travel/flights?q=" + encodeURIComponent(text), "_blank", "noopener");
    msg.textContent = "Opened Google Flights in a new tab.";
    msg.className = "form-message success";
});