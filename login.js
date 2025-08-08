document.addEventListener("DOMContentLoaded", () => {
  const loginForm = document.querySelector(".login-form");
  const emailInput = document.getElementById("email");
  const passwordInput = document.getElementById("password");

  // 🚀 Redirect if already logged in
  if (localStorage.getItem("authToken")) {
    window.location.href = "/dashboard.html";
    return;
  }

  // 🔹 Create error message element dynamically
  const errorMessage = document.createElement("span");
  errorMessage.id = "login-error";
  errorMessage.className = "error-message";
  errorMessage.setAttribute("aria-live", "polite");
  loginForm.appendChild(errorMessage);

  // 🔹 Handle form submission
  loginForm.addEventListener("submit", async (e) => {
    e.preventDefault();
    errorMessage.textContent = "";

    const email = emailInput.value.trim();
    const password = passwordInput.value.trim();

    if (!email || !password) {
      errorMessage.textContent = "Please enter both email and password.";
      return;
    }

    try {
      // Clear old token
      localStorage.removeItem("authToken");

      // Send login request to backend
      const res = await fetch("http://localhost:3000/api/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json();
      console.log("Login response:", data);

      if (res.ok && data.token) {
        localStorage.setItem("authToken", data.token);
        window.location.href = "/dashboard.html";
      } else {
        errorMessage.textContent = data.error || "Invalid email or password.";
      }
    } catch (err) {
      console.error("Login error:", err);
      errorMessage.textContent =
        "Unable to connect to the server. Please try again later.";
    }
  });
});
