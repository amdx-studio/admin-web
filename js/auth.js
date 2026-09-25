// js/auth.js â€” controller login.html
// Login sungguhan ke backend Flask (menggantikan simulasi UI sebelumnya).

import { loginAdmin, isLoggedIn } from "./api.js";

const form = document.querySelector("#login-form");
const alertBox = document.querySelector("#login-alert");
const alertText = alertBox?.querySelector("span");
const submitBtn = document.querySelector("#login-submit");

// Kalau sudah login, langsung skip ke dashboard
if (isLoggedIn()) {
  window.location.href = "/pages/dashboard.html";
}

function showError(message) {
  if (!alertBox) return;
  if (alertText) alertText.textContent = message;
  alertBox.style.display = "flex";
}

function hideError() {
  if (alertBox) alertBox.style.display = "none";
}

function setLoading(isLoading) {
  if (!submitBtn) return;
  submitBtn.disabled = isLoading;
  submitBtn.classList.toggle("is-loading", isLoading);
}

form?.addEventListener("submit", async (e) => {
  e.preventDefault();
  hideError();

  const email = form.email.value.trim();
  const password = form.password.value;

  setLoading(true);

  try {
    await loginAdmin(email, password);
    window.location.href = "/pages/dashboard.html";
  } catch (err) {
    showError(err.message);
  } finally {
    setLoading(false);
  }
});
