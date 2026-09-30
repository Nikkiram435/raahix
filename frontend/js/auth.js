// Login / Register (DEMO MODE): abhi backend nahi hai.
// Sirf form check karta hai aur naam + email browser mein save karta hai.
// Password kabhi save nahi hota. Phase 5 mein yahi FastAPI (JWT + bcrypt) se jaayega.

(function () {
    const form = document.getElementById("authForm");
    const msg = document.getElementById("authMsg");
    if (!form) return;

    const mode = form.dataset.mode;
    const EMAIL_OK = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    function fail(input, text) {
        form.querySelectorAll("input").forEach((i) => i.classList.remove("invalid"));
        if (input) input.classList.add("invalid");
        if (input) input.focus();
        msg.textContent = text;
        msg.className = "form-message error";
    }

    function saveUser(user) {
        try {
            localStorage.setItem("raahix_user", JSON.stringify(user));
            return true;
        } catch (err) {
            return false;
        }
    }

    function nameFromEmail(email) {
        const part = email.split("@")[0].replace(/[._-]+/g, " ").trim();
        return part ? part.charAt(0).toUpperCase() + part.slice(1) : "Traveler";
    }

    form.addEventListener("submit", (e) => {
        e.preventDefault();
        msg.textContent = "";

        const email = document.getElementById("email");
        const password = document.getElementById("password");

        if (!EMAIL_OK.test(email.value.trim())) {
            return fail(email, "Please enter a valid email address.");
        }

        let name;

        if (mode === "register") {
            const nameInput = document.getElementById("name");
            const confirm = document.getElementById("confirm");

            if (!nameInput.value.trim()) return fail(nameInput, "Please enter your name.");
            if (password.value.length < 8) return fail(password, "Password must be at least 8 characters.");
            if (password.value !== confirm.value) return fail(confirm, "The two passwords don't match.");

            name = nameInput.value.trim();
        } else {
            if (!password.value) return fail(password, "Please enter your password.");

            // Pehle se saved naam mil jaaye toh wahi use karo
            let old = null;
            try { old = JSON.parse(localStorage.getItem("raahix_user") || "null"); } catch (err) {}
            name = old && old.email === email.value.trim().toLowerCase()
                ? old.name
                : nameFromEmail(email.value.trim());
        }

        const ok = saveUser({ name: name, email: email.value.trim().toLowerCase() });
        if (!ok) return fail(null, "Couldn't save your details in this browser. Please try again.");

        window.location.href = "index.html";
    });
})();