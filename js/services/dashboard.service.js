/**
 * dashboard.service.js
 * Satu-satunya tempat halaman dashboard "meminta data".
 * Hanya mengembalikan data yang benar-benar tersedia dari
 * GET /api/admin/dashboard. Tidak ada fallback dummy lagi.
 */

import { apiFetch } from "../api.js";

const STAT_DEFS = [
  { key: "total_produk", label: "Total Produk", tone: "primary" },
  { key: "total_kategori", label: "Total Kategori", tone: "info" },
  { key: "total_stok", label: "Total Stok", tone: "success" },
];

function mapStats(raw) {
  return STAT_DEFS.filter((def) => raw[def.key] !== undefined).map((def) => ({
    label: def.label,
    value: Number(raw[def.key]) || 0,
    tone: def.tone,
    trend: "neutral",
    delta: "",
  }));
}

export async function getDashboardSummary() {
  const response = await apiFetch("/api/admin/dashboard");
  const raw = response?.data ?? {};

  return {
    stats: mapStats(raw),
  };
}