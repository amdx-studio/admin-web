/**
 * categories.service.js
 * Data kategori untuk dropdown form produk.
 * ASUMSI shape: { success, data: [{ id, nama }] }
 * Sesuaikan mapping kalau bentuk asli backend beda.
 */

import { apiFetch } from "../api.js";

export async function getCategories() {
  const response = await apiFetch("/api/admin/kategori");
  const list = response?.data ?? [];
  return list.map((cat) => ({
    id: cat.id,
    nama: cat.nama,
  }));
}
