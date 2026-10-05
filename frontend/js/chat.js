requireLogin();

const input = document.getElementById("chatInput");
const sendBtn = document.getElementById("chatSend");
const hero = document.getElementById("chatHero");
const messages = document.getElementById("messages");
const stage = document.getElementById("chatStage");

const MAX_HISTORY = 19;   
const MAX_CONTENT = 2000; 

let history = [];
let busy = false;

input.maxLength = MAX_CONTENT;

function addMessage(text, who) {
    const div = document.createElement("div");
    div.className = "msg " + who;
    div.textContent = text;              
    messages.appendChild(div);
    stage.scrollTop = stage.scrollHeight;
    return div;
}

function setBusy(value) {
    busy = value;
    input.disabled = value;
    sendBtn.disabled = value;
}

async function sendMessage() {
    if (busy) return;
    const text = input.value.trim();
    if (!text) return;

    if (hero) hero.style.display = "none";   

    addMessage(text, "user");
    history.push({ role: "user", content: text });
    while (history.length > MAX_HISTORY) history.splice(0, 2);

    input.value = "";
    setBusy(true);
    const reply = addMessage("Thinking...", "bot");

    try {
        const data = await apiRequest("/api/chat", {
            method: "POST",
            auth: true,
            body: {
                messages: history.map((m) => ({
                    role: m.role,
                    content: m.content.slice(0, MAX_CONTENT),
                })),
            },
        });
        reply.textContent = data.reply;
        history.push({ role: "assistant", content: data.reply });
    } catch (err) {
        reply.textContent = err.message;
        reply.classList.add("error");
        history.pop();   
    } finally {
        setBusy(false);
        input.focus();
        stage.scrollTop = stage.scrollHeight;
    }
}

sendBtn.addEventListener("click", sendMessage);
input.addEventListener("keydown", (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
        e.preventDefault();
        sendMessage();
    }
});


const starters = {
    Where: "I want to visit ",
    When: "I'm planning to travel in ",
    Who: "I'm travelling with ",
    Budget: "My budget is ₹",
};

document.querySelectorAll(".chip").forEach((chip) => {
    chip.addEventListener("click", () => {
        if (busy) return;
        input.value = starters[chip.textContent.trim()] || "";
        input.focus();
    });
});
