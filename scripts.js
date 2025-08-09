// Shared utility functions used across multiple pages

// ✅ Form Utilities
const FormUtils = {
  clearErrors: function (form) {
    const errorElements = form.querySelectorAll(".error-message");
    const inputElements = form.querySelectorAll(".form-input.error");

    errorElements.forEach((el) => {
      el.textContent = "";
      el.style.display = "none";
    });

    inputElements.forEach((el) => el.classList.remove("error"));
  },

  setLoadingState: function (button, isLoading) {
    if (isLoading) {
      button.dataset.originalText = button.textContent;
      button.disabled = true;
      button.textContent = "Processing...";
    } else {
      button.disabled = false;
      button.textContent = button.dataset.originalText || "Submit";
    }
  },
};

// ✅ Navigation Utilities
const NavUtils = {
  setActiveNav: function (currentPage) {
    const navLinks = document.querySelectorAll(".nav-link");
    navLinks.forEach((link) => {
      link.classList.remove("nav-link--active");
      const href = link.getAttribute("href");
      if (currentPage.includes(href)) {
        link.classList.add("nav-link--active");
      }
    });
  },
};

// ✅ Authentication Utilities
const AuthUtils = {
  getToken: () => localStorage.getItem("authToken"),

  isLoggedIn: () => !!localStorage.getItem("authToken"),

  // ✅ Added getCurrentUser (fetch user object from localStorage)
  getCurrentUser: () => {
    return JSON.parse(localStorage.getItem("loggedInUser")); // store user at login
  },

  logout: () => {
    localStorage.removeItem("authToken");
    localStorage.removeItem("loggedInUser");
    window.location.href = "/login.html";
  },

  requireAuth: () => {
    if (!AuthUtils.isLoggedIn()) {
      window.location.href = "/login.html";
    }
  },

  // ✅ New: Clear all data and redirect to login
  clearAndRedirect: () => {
    localStorage.clear();
    window.location.href = "/login.html";
  },
};

// ✅ API Fetch Wrapper
async function apiRequest(endpoint, options = {}) {
  const token = AuthUtils.getToken();
  const headers = {
    "Content-Type": "application/json",
    ...(token && { Authorization: `Bearer ${token}` }),
  };

  try {
    const res = await fetch(`http://localhost:3000/api/${endpoint}`, {
      ...options,
      headers: { ...headers, ...(options.headers || {}) },
    });

    if (res.status === 401) {
      AuthUtils.logout(); // Unauthorized → redirect to login
      return;
    }

    return await res.json();
  } catch (err) {
    console.error("API request error:", err);
    throw err;
  }
}

// ✅ Updated: Load User Details (Works for Dashboard & Profile Page)
async function loadUserDetails() {
  console.log("loadUserDetails called");
  try {
    // 🔹 Always fetch fresh data from API for dashboard
    const userData = await apiRequest("getUserDetails");
    console.log("User data from API:", userData);
    
    if (!userData || !userData.firstName) {
      console.warn("User data missing or invalid.");
      AuthUtils.logout();
      return;
    }

    // ✅ Store in localStorage for future use
    localStorage.setItem("loggedInUser", JSON.stringify(userData));

    // ✅ Profile Page Population
    const nameField = document.getElementById("userName");
    const emailField = document.getElementById("userEmail");
    const countryField = document.getElementById("userCountry");

    if (nameField)
      nameField.textContent = `${userData.firstName} ${userData.lastName}`;
    if (emailField) emailField.textContent = userData.userEmail;
    if (countryField)
      countryField.textContent = userData.country || "Not Specified";
    console.log(
      "Profile Name:",
      nameField ? nameField.textContent : "No name field"
    );
    console.log(
      "Profile Email:",
      emailField ? emailField.textContent : "No email field"
    );
    console.log(
      "Profile Country:",
      countryField ? countryField.textContent : "No country field"
    );

    // ✅ Dashboard Population (if elements exist)
    const userNameEl = document.getElementById("user-name");
    const userEmailEl = document.getElementById("user-email");
    if (userNameEl)
      userNameEl.textContent = `${userData.firstName} ${userData.lastName}`;
    if (userEmailEl) userEmailEl.textContent = userData.userEmail;
    console.log(
      "Dashboard Name:",
      userNameEl ? userNameEl.textContent : "No user-name element"
    );
    console.log(
      "Dashboard Email:",
      userEmailEl ? userEmailEl.textContent : "No user-email element"
    );

    // ✅ Populate balances (dashboard only)
    if (userData.balances && userData.balances.length > 0) {
      console.log("🔹 Balances data received:", userData.balances);
      const balance1El = document.getElementById("balance1");
      const balance2El = document.getElementById("balance2");
      if (balance1El)
        balance1El.textContent = `NGN${userData.balances[0].balance1}`;
      if (balance2El)
        balance2El.textContent = `NGN${userData.balances[0].balance2}`;
      console.log(
        "Balance 1:",
        balance1El ? balance1El.textContent : "No balance1 element"
      );
      console.log(
        "Balance 2:",
        balance2El ? balance2El.textContent : "No balance2 element"
      );
    } else {
      console.log("❌ No balances data found in userData:", userData.balances);
    }

    // ✅ Populate transactions (transactions.html only)
    if (userData.transactions) {
      const txContainer = document.getElementById("transaction-list");
      console.log("Transactions:", userData.transactions);
      if (txContainer) {
        txContainer.innerHTML = userData.transactions
          .map(
            (tx) => `<li>${tx.type} - NGN${tx.amount} (${tx.narration})</li>`
          )
          .join("");
        console.log("Transactions HTML:", txContainer.innerHTML);
      } else {
        console.log("No transaction-list element");
      }
    }
  } catch (err) {
    console.error("Failed to load user details:", err);
  }
}

// --- Dashboard Data Loader (Step 1 Refactor) ---
async function loadDashboardData() {
  try {
    const userData = await apiRequest("getUserDetails");
    if (!userData || !userData.firstName) {
      console.warn("User data missing or invalid.");
      AuthUtils.logout();
      return;
    }
    renderBalances(userData.balances);
    renderTransactions(userData.transactions);
  } catch (err) {
    console.error("Failed to load dashboard data:", err);
    // (UI error handling will be added in next steps)
  }
}

function renderBalances(balances) {
  if (!balances || balances.length === 0) return;
  const balance1El = document.getElementById("balance1");
  const balance2El = document.getElementById("balance2");
  if (balance1El) balance1El.textContent = `NGN${balances[0].balance1}`;
  if (balance2El) balance2El.textContent = `NGN${balances[0].balance2}`;
}

function renderTransactions(transactions) {
  const txContainer = document.getElementById("transaction-list");
  if (!txContainer) return;
  if (!transactions || transactions.length === 0) {
    txContainer.innerHTML = '<div class="no-transactions">No transactions found.</div>';
    return;
  }
  txContainer.innerHTML = transactions
    .map(
      (tx) => `
        <article class="transaction-item" role="listitem">
          <div class="transaction-icon">
            <div class="transaction-circle" aria-hidden="true">
              <img class="img" src="./images/arrow-down-circle.svg" alt="arrow down logo" />
            </div>
          </div>
          <div class="transaction-details">
            <div class="transaction-main-text">${tx.narration || tx.type}</div>
            <div class="transaction-secondary-text">${new Date(tx.createdAt).toLocaleDateString()}</div>
          </div>
          <div class="transaction-meta">
            <div class="transaction-id">${tx.transactionReference || tx.transactionId}</div>
            <div class="transaction-amount">NGN${tx.amount}</div>
          </div>
        </article>
      `
    )
    .join("");
}

// ✅ Placeholder for loadTransactionsPage to prevent ReferenceErrors
function loadTransactionsPage() {
  console.log("loadTransactionsPage called");
  apiRequest("getUserDetails")
    .then((userData) => {
      if (!userData) return;
      renderTransactions(userData.transactions || []);
    })
    .catch((err) => {
      console.error("Failed to load transactions:", err);
    });
}

// ✅ Make utilities globally available
window.FormUtils = FormUtils;
window.NavUtils = NavUtils;
window.AuthUtils = AuthUtils;
window.apiRequest = apiRequest;
window.loadUserDetails = loadUserDetails;
window.loadTransactionsPage = loadTransactionsPage;
