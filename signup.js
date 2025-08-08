// signup.js
document.getElementById("signupForm").addEventListener("submit", async (e) => {
  e.preventDefault();

  const email = document.getElementById("email").value.trim();
  const firstName = document.getElementById("firstname").value.trim();
  const lastName = document.getElementById("lastname").value.trim();
  const country = document.getElementById("country").value.trim();
  const password = document.getElementById("password").value.trim();

  // Save form data temporarily in localStorage to use on verify page
  localStorage.setItem("signupData", JSON.stringify({ email, firstName, lastName, country, password }));

  try {
    const res = await fetch("http://localhost:3000/api/signup/sendemail", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email })
    });

    const data = await res.json();

    if (res.ok) {
      alert("OTP sent to your email. Please check and verify.");
      window.location.href = "verifyEmail.html"; // redirect to verify page
    } else {
      alert(data.message || "Error sending email");
    }
  } catch (err) {
    alert("Network error: " + err.message);
  }
});
