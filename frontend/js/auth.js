(function () {
    const form = document.getElementById("authForm");
    const msg = document.getElementById("authMsg");
    if (!form) return;

    const mode = form.dataset.mode;
    const button = form.querySelector("button[type='submit']");
    const EMAIL_OK = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    function fail(input, text) {
        form.querySelectorAll("input").forEach((i) => i.classList.remove("invalid"));
        if (input) {
            input.classList.add("invalid");
            input.focus();
        }
        msg.textContent = text;
        msg.className = "form-message error";
    }

    form.addEventListener("submit", async (e) => {
        e.preventDefault();
        msg.textContent = "";

        const email = document.getElementById("email");
        const password = document.getElementById("password");
        const emailValue = email.value.trim();

        if (!EMAIL_OK.test(emailValue)) return fail(email, "Please enter a valid email address.");

        let body;
        if (mode === "register") {
            const nameInput = document.getElementById("name");
            const confirm = document.getElementById("confirm");

            if (!nameInput.value.trim()) return fail(nameInput, "Please enter your name.");
            if (password.value.length < 8) return fail(password, "Password must be at least 8 characters.");
            if (password.value !== confirm.value) return fail(confirm, "The two passwords don't match.");

            body = { name: nameInput.value.trim(), email: emailValue, password: password.value };
        } else {
            if (!password.value) return fail(password, "Please enter your password.");
            body = { email: emailValue, password: password.value };
        }

        const originalText = button.textContent;
        button.disabled = true;
        button.textContent = "Please wait...";

        try {
            const path = mode === "register" ? "/api/auth/register" : "/api/auth/login";
            const data = await apiRequest(path, { method: "POST", body: body });

            if (!setSession(data.access_token, data.user)) {
                return fail(null, "Couldn't save your login in this browser. Please try again.");
            }
            window.location.href = "index.html";
        } catch (err) {
            fail(null, err.message);
        } finally {
            button.disabled = false;
            button.textContent = originalText;
        }
    });
})();
