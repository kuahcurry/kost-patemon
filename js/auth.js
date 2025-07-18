// Utility functions untuk authentication

// Fungsi untuk mengecek apakah user sudah login
function isUserLoggedIn() {
  return localStorage.getItem("isLoggedIn") === "true";
}

// Fungsi untuk mendapatkan data user yang sedang login
function getLoggedInUser() {
  if (!isUserLoggedIn()) {
    return null;
  }

  return {
    userId: localStorage.getItem("userId"),
    nama: localStorage.getItem("userName"),
    email: localStorage.getItem("userEmail"),
    role: localStorage.getItem("userRole"),
    token: localStorage.getItem("token"),
  };
}

// Fungsi untuk logout
function logout() {
  clearAuthData();

  // Redirect ke halaman login
  window.location.href = "login.html";
}

// Fungsi untuk mengecek apakah user adalah admin
function isAdmin() {
  const user = getLoggedInUser();
  return user && user.role === "admin";
}

// Fungsi untuk mengecek apakah user adalah penyewa
function isPenyewa() {
  const user = getLoggedInUser();
  return user && user.role === "penyewa";
}

// Fungsi untuk memproteksi halaman yang memerlukan login
function requireLogin() {
  if (!isUserLoggedIn()) {
    // Use toast message instead of alert for better UX
    if (typeof showErrorToast === "function") {
      showErrorToast("Anda harus login terlebih dahulu!");
    } else {
      alert("Anda harus login terlebih dahulu!");
    }
    window.location.href = "login.html";
    return false;
  }
  return true;
}

// Fungsi untuk memproteksi halaman admin
function requireAdmin() {
  if (!requireLogin()) {
    return false;
  }

  if (!isAdmin()) {
    // Use toast message instead of alert for better UX
    if (typeof showErrorToast === "function") {
      showErrorToast("Anda tidak memiliki akses ke halaman ini!");
    } else {
      alert("Anda tidak memiliki akses ke halaman ini!");
    }
    window.location.href = "home.html";
    return false;
  }
  return true;
}

// Fungsi untuk memproteksi halaman penyewa
function requirePenyewa() {
  if (!requireLogin()) {
    return false;
  }

  if (!isPenyewa()) {
    // Use toast message instead of alert for better UX
    if (typeof showErrorToast === "function") {
      showErrorToast("Anda tidak memiliki akses ke halaman ini!");
    } else {
      alert("Anda tidak memiliki akses ke halaman ini!");
    }
    window.location.href = "login.html";
    return false;
  }
  return true;
}

// Fungsi untuk mendapatkan token untuk API requests
function getAuthToken() {
  return localStorage.getItem("token");
}

// Fungsi untuk membuat headers dengan authorization
function getAuthHeaders(isFormData = false) {
  const token = getAuthToken();
  const headers = {
    Authorization: token ? `Bearer ${token}` : "",
  };

  // Don't set Content-Type for FormData - let browser set it automatically
  if (!isFormData) {
    headers["Content-Type"] = "application/json";
  }

  return headers;
}

// Fungsi untuk membuat fetch request dengan auth headers
async function authFetch(url, options = {}) {
  const isFormData = options.body instanceof FormData;

  const defaultOptions = {
    headers: getAuthHeaders(isFormData),
  };

  const mergedOptions = {
    ...defaultOptions,
    ...options,
    headers: {
      ...defaultOptions.headers,
      ...options.headers,
    },
  };

  // Remove Content-Type if FormData is being sent
  if (isFormData && mergedOptions.headers["Content-Type"]) {
    delete mergedOptions.headers["Content-Type"];
  }

  const response = await fetch(url, mergedOptions);

  // Jika response adalah 401 (Unauthorized), logout user
  if (response.status === 401) {
    // Use toast message instead of alert for better UX
    if (typeof showErrorToast === "function") {
      showErrorToast("Sesi Anda telah berakhir. Silakan login kembali.");
    } else {
      alert("Sesi Anda telah berakhir. Silakan login kembali.");
    }
    logout();
    return;
  }

  return response;
}

// Check if user has a valid token for automatic login
function checkAutoLogin() {
  const token =
    localStorage.getItem("authToken") || localStorage.getItem("token");
  if (token) {
    // Try to validate token with server if needed
    // For now, just check if it exists
    return true;
  }
  return false;
}

// Auto-login function for users with valid tokens
async function attemptAutoLogin() {
  const token =
    localStorage.getItem("authToken") || localStorage.getItem("token");
  if (!token) return false;

  try {
    // Verify token with server by trying to get profile
    const response = await fetch("http://localhost:3000/api/auth/profile", {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    if (response.ok) {
      const data = await response.json();
      if (data.success) {
        // Update localStorage with current user data
        localStorage.setItem("isLoggedIn", "true");
        localStorage.setItem("userId", data.data.Email);
        localStorage.setItem("userName", data.data.Nama);
        localStorage.setItem("userEmail", data.data.Email);
        localStorage.setItem("userRole", data.data.Role);
        localStorage.setItem("authToken", token);
        return true;
      }
    }
  } catch (error) {
    console.error("Auto-login failed:", error);
  }

  // If token is invalid, clean up
  clearAuthData();
  return false;
}

// Clear all authentication data
function clearAuthData() {
  localStorage.removeItem("isLoggedIn");
  localStorage.removeItem("userId");
  localStorage.removeItem("userName");
  localStorage.removeItem("userEmail");
  localStorage.removeItem("userRole");
  localStorage.removeItem("token");
  localStorage.removeItem("authToken");
  localStorage.removeItem("login_time");
  localStorage.removeItem("admin_welcome_shown");

  // Clear session storage for welcome messages
  const keys = Object.keys(sessionStorage);
  keys.forEach((key) => {
    if (key.startsWith("admin_welcome_")) {
      sessionStorage.removeItem(key);
    }
  });
}
