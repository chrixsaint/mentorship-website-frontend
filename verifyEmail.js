// verifyEmail.js
document.addEventListener("DOMContentLoaded", () => {
  const inputs = document.querySelectorAll(".verification-input");
  const verifyButton = document.querySelector(".verify-button");

  // Focus next input automatically on input
  inputs.forEach((input, idx) => {
    input.addEventListener("input", (e) => {
      const value = e.target.value;
      if (value.length === 1 && idx < inputs.length - 1) {
        inputs[idx + 1].focus();
      }
    });

    // Allow Backspace to move to previous input if empty
    input.addEventListener("keydown", (e) => {
      if (e.key === "Backspace" && input.value === "" && idx > 0) {
        inputs[idx - 1].focus();
      }
    });
  });

  verifyButton.addEventListener("click", async (e) => {
    e.preventDefault();

    // Combine OTP digits
    const code = Array.from(inputs).map((input) => input.value).join("");

    if (code.length !== 4 || !/^\d{4}$/.test(code)) {
      alert("Please enter a valid 4-digit code.");
      return;
    }

    // Retrieve signup form data from localStorage
    const signupData = JSON.parse(localStorage.getItem("signupData"));
    if (!signupData || !signupData.email) {
      alert("Signup data not found. Please start signup again.");
      window.location.href = "signup.html";
      return;
    }

    // Prepare payload for signup confirmation
    const payload = {
      email: signupData.email,
      code,
      firstName: signupData.firstName,
      lastName: signupData.lastName,
      country: signupData.country,
      password: signupData.password,
    };

    try {
      const response = await fetch("http://localhost:3000/api/signup-start", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await response.json();

      if (response.ok) {
        alert("Signup successful! Redirecting to login...");
        localStorage.removeItem("signupData");
        window.location.href = "login.html"; // Redirect to login page after success
      } else {
        alert(data.message || "Verification failed. Please try again.");
      }
    } catch (err) {
      alert("Network error: " + err.message);
    }
  });
});
