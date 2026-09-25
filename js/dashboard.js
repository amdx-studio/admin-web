/**
 * dashboard.js
 * Page controller for index.html. Mounts the shared shell, then asks
 * dashboard.service.js for data and renders it. Hanya menampilkan data
 * yang benar-benar tersedia dari API (stat cards). Section "Penjualan
 * Mingguan", "Produk Terlaris", dan "Detail Produk Terlaris" disembunyikan
 * untuk sementara karena backend belum menyediakan datanya di
 * GET /api/admin/dashboard.
 */

import { mountShell, showToast } from "./main.js";
import { getDashboardSummary } from "./services/dashboard.service.js";
import { isLoggedIn } from "./api.js";

function renderStats(stats) {
  const grid = document.getElementById("stat-grid");
  grid.innerHTML = stats
    .map(
      (stat) => `
      <div class="stat-card" data-tone="${stat.tone}">
        <span class="stat-card__label">${stat.label}</span>
        <span class="stat-card__value">${stat.value.toLocaleString("id-ID")}</span>
        <span class="stat-card__delta ${stat.trend === "up" ? "is-up" : stat.trend === "down" ? "is-down" : ""}">${stat.delta}</span>
      </div>`
    )
    .join("");
}

function renderStatSkeleton() {
  document.getElementById("stat-grid").innerHTML = Array.from({ length: 3 })
    .map(() => `<div class="stat-card"><div class="skeleton" style="height:14px;width:60%"></div><div class="skeleton" style="height:28px;width:40%;margin-top:8px"></div></div>`)
    .join("");
}

/**
 * Sembunyikan section yang datanya belum tersedia dari backend:
 * - .dashboard-grid (berisi card "Penjualan Mingguan" + "Produk Terlaris")
 * - .dashboard-table-card ("Detail Produk Terlaris")
 * Tidak mengubah HTML, jadi tinggal hapus baris ini kalau backend
 * sudah menyediakan datanya.
 */
function hideUnavailableSections() {
  document.querySelector(".dashboard-grid")?.style.setProperty("display", "none");
  document.querySelector(".dashboard-table-card")?.style.setProperty("display", "none");
}

async function initDashboard() {
  renderStatSkeleton();
  try {
    const data = await getDashboardSummary();
    renderStats(data.stats);
    hideUnavailableSections();
  } catch (err) {
    showToast("Gagal memuat data dashboard.", "danger");
  }
}

document.addEventListener("DOMContentLoaded", () => {
  if (!isLoggedIn()) {
    window.location.href = "/index.html";
    return;
  }
  mountShell();
  initDashboard();
});
