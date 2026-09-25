/**
 * main.js
 * Mounts the shared app shell (sidebar + topbar) into any admin page that
 * includes the two placeholder elements below, then wires up the small
 * pieces of cross-page behaviour (profile menu, toasts).
 *
 * Usage in a page's own script (e.g. dashboard.js):
 *   import { mountShell, showToast } from "./main.js";
 *   document.addEventListener("DOMContentLoaded", mountShell);
 *
 * Required markup on every dashboard page:
 *   <body data-page="dashboard" data-page-title="Dashboard">
 *     <div class="sidebar-overlay" data-role="sidebar-overlay"></div>
 *     <div class="app-shell">
 *       <aside class="sidebar" id="sidebar-root"></aside>
 *       <div>
 *         <header class="topbar" id="topbar-root"></header>
 *         <main class="content">...</main>
 *       </div>
 *     </div>
 *   </body>
 */

import { sidebarTemplate, initSidebar } from "./sidebar.js";
import { clearToken } from "./api.js";

const ICONS = {
  menu: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"><path d="M3 6h18M3 12h18M3 18h18"/></svg>`,
  collapse: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="4" width="18" height="16" rx="2"/><path d="M9 4v16"/></svg>`,
  search: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"><circle cx="11" cy="11" r="7"/><path d="m21 21-4.3-4.3"/></svg>`,
  bell: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M18 8a6 6 0 1 0-12 0c0 6-2.5 7.5-2.5 7.5h17S18 14 18 8Z"/><path d="M13.7 21a2 2 0 0 1-3.4 0"/></svg>`,
  chevronDown: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="m6 9 6 6 6-6"/></svg>`,
  gear: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="3"/><path d="M19.4 13.5a1.7 1.7 0 0 0 .34 1.87l.06.06a2 2 0 1 1-2.83 2.83l-.06-.06a1.7 1.7 0 0 0-1.87-.34 1.7 1.7 0 0 0-1.04 1.56V19.5a2 2 0 1 1-4 0v-.09a1.7 1.7 0 0 0-1.04-1.56 1.7 1.7 0 0 0-1.87.34l-.06.06a2 2 0 1 1-2.83-2.83l.06-.06a1.7 1.7 0 0 0 .34-1.87 1.7 1.7 0 0 0-1.56-1.04H4.5a2 2 0 1 1 0-4h.09A1.7 1.7 0 0 0 6.15 8.5a1.7 1.7 0 0 0-.34-1.87l-.06-.06a2 2 0 1 1 2.83-2.83l.06.06A1.7 1.7 0 0 0 10.5 4.14h.09A1.7 1.7 0 0 0 12 2.5V2.4a2 2 0 1 1 4 0v.09a1.7 1.7 0 0 0 1.04 1.56h.09a1.7 1.7 0 0 0 1.87-.34l.06-.06a2 2 0 1 1 2.83 2.83l-.06.06a1.7 1.7 0 0 0-.34 1.87v.09a1.7 1.7 0 0 0 1.56 1.04h.09a2 2 0 1 1 0 4h-.09a1.7 1.7 0 0 0-1.56 1.04Z"/></svg>`,
  logout: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><path d="M16 17l5-5-5-5"/><path d="M21 12H9"/></svg>`,
  check: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M20 6 9 17l-5-5"/></svg>`,
  alert: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><path d="M12 8v5M12 16h.01"/></svg>`,
};

// Placeholder admin identity for this frontend-only phase. Once the login
// API exists, this should come from the authenticated session instead.
const CURRENT_ADMIN = { name: "Admin UMKM", role: "Administrator", initials: "AU" };

function topbarTemplate(pageTitle) {
  return `
    <button class="topbar__icon-btn topbar__menu-btn" data-action="toggle-drawer" aria-label="Buka menu navigasi">
      ${ICONS.menu}
    </button>
    <button class="topbar__icon-btn topbar__collapse-btn" data-action="toggle-collapse" aria-label="Ciutkan sidebar">
      ${ICONS.collapse}
    </button>

    <h1 class="topbar__title">${pageTitle}</h1>

    <label class="topbar__search">
      ${ICONS.search}
      <input type="search" placeholder="Cari di panel admin..." aria-label="Cari" />
    </label>

    <button class="topbar__icon-btn" data-action="notifications" aria-label="Notifikasi">
      ${ICONS.bell}
      <span class="topbar__notif-dot"></span>
    </button>

    <div class="topbar__profile" data-role="profile-menu">
      <button class="topbar__profile-trigger" data-action="toggle-profile" aria-haspopup="true" aria-expanded="false">
        <span class="topbar__avatar">${CURRENT_ADMIN.initials}</span>
        <span class="topbar__profile-meta">
          <span class="topbar__profile-name">${CURRENT_ADMIN.name}</span>
          <span class="topbar__profile-role">${CURRENT_ADMIN.role}</span>
        </span>
        ${ICONS.chevronDown}
      </button>
      <div class="topbar__profile-menu" role="menu">
        <a href="settings.html" role="menuitem">${ICONS.gear} Pengaturan</a>
        <button type="button" role="menuitem" class="is-danger" data-action="logout">${ICONS.logout} Keluar</button>
      </div>
    </div>
  `;
}

function initTopbarInteractions() {
  document.querySelector("[data-action='notifications']")?.addEventListener("click", () => {
    showToast("Belum ada pemberitahuan baru.", "info");
  });

  const profileWrap = document.querySelector("[data-role='profile-menu']");
  profileWrap?.querySelector("[data-action='toggle-profile']").addEventListener("click", (event) => {
    event.stopPropagation();
    const isOpen = profileWrap.classList.toggle("is-open");
    profileWrap.querySelector("[data-action='toggle-profile']").setAttribute("aria-expanded", String(isOpen));
  });

  document.addEventListener("click", (event) => {
    if (profileWrap && !profileWrap.contains(event.target)) {
      profileWrap.classList.remove("is-open");
    }
  });

  document.querySelector("[data-action='logout']")?.addEventListener("click", () => {
    // Real sign-out: clears the JWT stored by auth.js/api.js and returns
    // to the login screen.
    clearToken();
    window.location.href = "/index.html";
  });
}

/**
 * Injects the sidebar + topbar markup and wires up their behaviour.
 * Call once per page, after DOMContentLoaded.
 */
export function mountShell() {
  const sidebarRoot = document.getElementById("sidebar-root");
  const topbarRoot = document.getElementById("topbar-root");
  const activeKey = document.body.dataset.page || "";
  const pageTitle = document.body.dataset.pageTitle || "";

  if (sidebarRoot) sidebarRoot.innerHTML = sidebarTemplate(activeKey);
  if (topbarRoot) topbarRoot.innerHTML = topbarTemplate(pageTitle);

  initSidebar();
  initTopbarInteractions();
}

/**
 * Shared toast notification utility, available to every page that imports
 * main.js. Appends a <div class="toast-stack"> to <body> on first use.
 */
export function showToast(message, type = "info") {
  let stack = document.querySelector(".toast-stack");
  if (!stack) {
    stack = document.createElement("div");
    stack.className = "toast-stack";
    stack.setAttribute("aria-live", "polite");
    document.body.appendChild(stack);
  }

  const toast = document.createElement("div");
  toast.className = `toast toast-${type}`;
  const icon = type === "success" ? ICONS.check : type === "danger" ? ICONS.alert : ICONS.bell;
  toast.innerHTML = `${icon}<span>${message}</span>`;
  stack.appendChild(toast);

  setTimeout(() => {
    toast.style.opacity = "0";
    toast.style.transition = "opacity 200ms ease";
    setTimeout(() => toast.remove(), 200);
  }, 3200);
}

