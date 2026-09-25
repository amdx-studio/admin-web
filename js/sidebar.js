/**
 * sidebar.js
 * Owns the sidebar's navigation data, its HTML template, and the two
 * interaction modes it supports:
 *   - Collapse to an icon rail (desktop / tablet), toggled from the topbar
 *   - Off-canvas drawer with overlay (mobile), toggled by the hamburger
 *
 * The nav list lives here (not duplicated in every HTML file) so adding a
 * new admin page later only means adding one entry to NAV_ITEMS.
 */

export const NAV_ITEMS = [
  {
    key: "dashboard",
    label: "Dashboard",
    href: "dashboard.html",
    icon: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="3" width="7" height="9" rx="1.5"/><rect x="14" y="3" width="7" height="5" rx="1.5"/><rect x="14" y="12" width="7" height="9" rx="1.5"/><rect x="3" y="16" width="7" height="5" rx="1.5"/></svg>`,
  },
  {
    key: "products",
    label: "Produk",
    href: "products.html",
    icon: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M21 8 12 3 3 8l9 5 9-5Z"/><path d="M3 8v8l9 5 9-5V8"/><path d="M12 13v8"/></svg>`,
  },
];

export const SETTINGS_ITEM = {
  key: "settings",
  label: "Pengaturan",
  href: "settings.html",
  icon: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="3.2"/><path d="M19.4 13.5a1.7 1.7 0 0 0 .34 1.87l.06.06a2 2 0 1 1-2.83 2.83l-.06-.06a1.7 1.7 0 0 0-1.87-.34 1.7 1.7 0 0 0-1.04 1.56V19.5a2 2 0 1 1-4 0v-.09a1.7 1.7 0 0 0-1.04-1.56 1.7 1.7 0 0 0-1.87.34l-.06.06a2 2 0 1 1-2.83-2.83l.06-.06a1.7 1.7 0 0 0 .34-1.87 1.7 1.7 0 0 0-1.56-1.04H4.5a2 2 0 1 1 0-4h.09A1.7 1.7 0 0 0 6.15 8.5a1.7 1.7 0 0 0-.34-1.87l-.06-.06a2 2 0 1 1 2.83-2.83l.06.06A1.7 1.7 0 0 0 10.5 4.14h.09A1.7 1.7 0 0 0 12 2.5V2.4a2 2 0 1 1 4 0v.09a1.7 1.7 0 0 0 1.04 1.56h.09a1.7 1.7 0 0 0 1.87-.34l.06-.06a2 2 0 1 1 2.83 2.83l-.06.06a1.7 1.7 0 0 0-.34 1.87v.09a1.7 1.7 0 0 0 1.56 1.04h.09a2 2 0 1 1 0 4h-.09a1.7 1.7 0 0 0-1.56 1.04Z"/></svg>`,
};

function linkHtml(item, activeKey) {
  const isActive = item.key === activeKey;
  return `
    <li>
      <a class="sidebar__link${isActive ? " is-active" : ""}" href="${item.href}" ${isActive ? 'aria-current="page"' : ""}>
        ${item.icon}
        <span class="sidebar__link-label">${item.label}</span>
      </a>
    </li>`;
}

/**
 * Builds the sidebar's inner HTML. `activeKey` should match one of the
 * NAV_ITEMS / SETTINGS_ITEM `key` values (set via <body data-page="...">).
 */
export function sidebarTemplate(activeKey) {
  return `
    <div class="sidebar__brand">
      <span class="sidebar__mark" aria-hidden="true">
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#F5F6FA" stroke-width="1.8" stroke-linecap="round">
          <path d="M4 6h16M4 12h16M4 18h16"/>
          <path d="M8 3v6M16 9v6M8 15v6" stroke-width="1.4" opacity="0.7"/>
        </svg>
      </span>
      <span class="sidebar__brand-text">
        <span class="sidebar__brand-name">Kriya Admin</span>
        <span class="sidebar__brand-sub">Panel UMKM</span>
      </span>
    </div>

    <nav class="sidebar__nav" aria-label="Navigasi utama">
      <span class="sidebar__group-label">Menu</span>
      <ul>
        ${NAV_ITEMS.map((item) => linkHtml(item, activeKey)).join("")}
      </ul>
    </nav>

    <div class="sidebar__footer">
      <ul>
        ${linkHtml(SETTINGS_ITEM, activeKey)}
      </ul>
    </div>
  `;
}

const COLLAPSE_STORAGE_KEY = "kriya-admin:sidebar-collapsed";

/**
 * Wires up both toggle behaviours. Safe to call once the sidebar/topbar
 * markup has been injected into the page.
 */
export function initSidebar() {
  const collapseBtn = document.querySelector("[data-action='toggle-collapse']");
  const menuBtn = document.querySelector("[data-action='toggle-drawer']");
  const overlay = document.querySelector("[data-role='sidebar-overlay']");

  // Restore collapsed preference (desktop/tablet only).
  if (localStorage.getItem(COLLAPSE_STORAGE_KEY) === "1") {
    document.body.classList.add("sidebar-collapsed");
  }

  collapseBtn?.addEventListener("click", () => {
    const collapsed = document.body.classList.toggle("sidebar-collapsed");
    localStorage.setItem(COLLAPSE_STORAGE_KEY, collapsed ? "1" : "0");
  });

  menuBtn?.addEventListener("click", () => {
    document.body.classList.add("sidebar-open");
  });

  overlay?.addEventListener("click", closeDrawer);

  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape") closeDrawer();
  });

  // Close the mobile drawer after navigating to a new page.
  document.querySelectorAll(".sidebar__link").forEach((link) => {
    link.addEventListener("click", closeDrawer);
  });
}

function closeDrawer() {
  document.body.classList.remove("sidebar-open");
}
