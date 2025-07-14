// Utility functions untuk authentication

// Fungsi untuk mengecek apakah user sudah login
function isUserLoggedIn() {
  return localStorage.getItem('isLoggedIn') === 'true';
}

// Fungsi untuk mendapatkan data user yang sedang login
function getLoggedInUser() {
  if (!isUserLoggedIn()) {
    return null;
  }
  
  return {
    userId: localStorage.getItem('userId'),
    nama: localStorage.getItem('userName'),
    email: localStorage.getItem('userEmail'),
    role: localStorage.getItem('userRole'),
    token: localStorage.getItem('token')
  };
}

// Fungsi untuk logout
function logout() {
  localStorage.removeItem('isLoggedIn');
  localStorage.removeItem('userId');
  localStorage.removeItem('userName');
  localStorage.removeItem('userEmail');
  localStorage.removeItem('userRole');
  localStorage.removeItem('token');
  
  // Redirect ke halaman login
  window.location.href = 'login.html';
}

// Fungsi untuk mengecek apakah user adalah admin
function isAdmin() {
  const user = getLoggedInUser();
  return user && user.role === 'admin';
}

// Fungsi untuk mengecek apakah user adalah penyewa
function isPenyewa() {
  const user = getLoggedInUser();
  return user && user.role === 'penyewa';
}

// Fungsi untuk memproteksi halaman yang memerlukan login
function requireLogin() {
  if (!isUserLoggedIn()) {
    alert('Anda harus login terlebih dahulu!');
    window.location.href = 'login.html';
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
    alert('Anda tidak memiliki akses ke halaman ini!');
    window.location.href = 'home.html';
    return false;
  }
  return true;
}

// Fungsi untuk mendapatkan token untuk API requests
function getAuthToken() {
  return localStorage.getItem('token');
}

// Fungsi untuk membuat headers dengan authorization
function getAuthHeaders() {
  const token = getAuthToken();
  return {
    'Content-Type': 'application/json',
    'Authorization': token ? `Bearer ${token}` : ''
  };
}

// Fungsi untuk membuat fetch request dengan auth headers
async function authFetch(url, options = {}) {
  const defaultOptions = {
    headers: getAuthHeaders()
  };
  
  const mergedOptions = {
    ...defaultOptions,
    ...options,
    headers: {
      ...defaultOptions.headers,
      ...options.headers
    }
  };
  
  const response = await fetch(url, mergedOptions);
  
  // Jika response adalah 401 (Unauthorized), logout user
  if (response.status === 401) {
    alert('Sesi Anda telah berakhir. Silakan login kembali.');
    logout();
    return;
  }
  
  return response;
}
