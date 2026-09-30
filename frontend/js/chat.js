// RAAHIX chat: abhi nakli (dummy) jawab deta hai.
// Phase 7 mein yahi fake reply real AI se badal jaayega.

const input = document.getElementById("chatInput");
const sendBtn = document.getElementById("chatSend");
const hero = document.getElementById("chatHero");
const messages = document.getElementById("messages");
const stage = document.getElementById("chatStage");

function addMessage(text, who) {
    const div = document.createElement("div");
    div.className = "msg " + who;
    div.textContent = text;              // textContent: user ka text safe rehta hai
    messages.appendChild(div);
    stage.scrollTop = stage.scrollHeight;
    return div;
}

// Abhi ka nakli jawab. Baad mein yahan backend ko fetch() call hogi.
function getFakeReply(question) {
    return "Great idea! I'm still learning, but soon I'll plan \"" +
           question + "\" for you with places, weather and budget.";
}

function sendMessage() {
    const text = input.value.trim();
    if (!text) return;

    if (hero) hero.style.display = "none";   // "Where to today?" hata do

    addMessage(text, "user");
    input.value = "";
    input.focus();

    const typing = addMessage("Thinking...", "bot");
    setTimeout(() => {
        typing.textContent = getFakeReply(text);
        stage.scrollTop = stage.scrollHeight;
    }, 900);
}

sendBtn.addEventListener("click", sendMessage);
input.addEventListener("keydown", (e) => {
    if (e.key === "Enter") sendMessage();
});

// Where / When / Who / Budget chips: click par input mein starter text aata hai
const starters = {
    Where: "I want to visit ",
    When: "I'm planning to travel in ",
    Who: "I'm travelling with ",
    Budget: "My budget is ₹",
};

document.querySelectorAll(".chip").forEach((chip) => {
    chip.addEventListener("click", () => {
        input.value = starters[chip.textContent.trim()] || "";
        input.focus();
    });
});