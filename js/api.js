// js/api.js
// Satu-satunya tempat frontend "bicara" ke backend Flask.
// Semua service (dashboard.service.js, products.service.js, dst.) import dari sini.

const API_BASE_URL = "https://kerajinan-umkm-new-production.up.railway.app";

const TOKEN_KEY = "kriya_admin_token";

export function getToken() {
  return localStorage.getItem(TOKEN_KEY);
}

export function setToken(token) {
  localStorage.setItem(TOKEN_KEY, token);
}

export function clearToken() {
  localStorage.removeItem(TOKEN_KEY);
}

export function isLoggedIn() {
  return Boolean(getToken());
}

/**
 * Wrapper fetch untuk endpoint admin yang butuh JWT.
 * @param {string} path - contoh: "/api/admin/produk"
 * @param {RequestInit} options - method, body, dst. (body harus sudah JSON.stringify kalau JSON)
 */
export async function apiFetch(path, options = {}) {
  const token = getToken();

  const headers = {
    ...(options.headers || {}),
  };

  if (options.body && !(options.body instanceof FormData)) {
    headers["Content-Type"] = "application/json";
  }

  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
  }

  const response = await fetch(`${API_BASE_URL}${path}`, {
    ...options,
    headers,
  });

  if (response.status === 401) {
    clearToken();
    window.location.href = "/index.html";
    throw new Error("Sesi berakhir, silakan login ulang.");
  }

  let data;
  try {
    data = await response.json();
  } catch {
    data = null;
  }

  if (!response.ok) {
    const message = data?.message || `Request gagal (${response.status})`;
    throw new Error(message);
  }

  return data;
}

/**
 * Login admin â€” dipakai khusus oleh auth.js.
 * Tidak lewat apiFetch karena belum ada token saat login.
 */
export async function loginAdmin(email, password) {
  const response = await fetch(`${API_BASE_URL}/api/admin/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, password }),
  });

  const data = await response.json();

  if (!response.ok || !data.success) {
    throw new Error(data.message || "Login gagal.");
  }

  setToken(data.token);
  return data;
}
