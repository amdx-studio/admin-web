/**
 * products.service.js
 * Satu-satunya tempat halaman produk "bicara" ke data produk.
 * ASUMSI shape backend, sesuaikan mapProduct() kalau field aslinya beda.
 */

import { apiFetch } from "../api.js";

function mapProduct(raw) {
  return {
    id: raw.id,
    nama: raw.nama ?? "",
    harga: Number(raw.harga) || 0,
    stok: Number(raw.stok) || 0,
    kategoriId: raw.kategori_id ?? null,
    kategoriNama: raw.kategori_nama ?? "-",
    gambarUrl: raw.gambar_url ?? null,
    deskripsi: raw.deskripsi ?? "",
  };
}

export async function getProducts() {
  const response = await apiFetch("/api/admin/produk");
  const list = response?.data ?? [];
  return list.map(mapProduct);
}

export async function getProduct(id) {
  const response = await apiFetch(`/api/admin/produk/${id}`);
  return mapProduct(response?.data ?? {});
}

/**
 * Buat produk baru.
 * Pakai FormData kalau ada file gambar (imageFile), supaya apiFetch
 * otomatis skip Content-Type header (browser set boundary multipart sendiri).
 */
export async function createProduct(payload, imageFile) {
  if (imageFile) {
    const formData = new FormData();
    formData.append("nama", payload.nama);
    formData.append("harga", payload.harga);
    formData.append("stok", payload.stok);
    formData.append("kategori_id", payload.kategoriId);
    formData.append("deskripsi", payload.deskripsi || "");
    formData.append("gambar", imageFile);

    const response = await apiFetch("/api/admin/produk", {
      method: "POST",
      body: formData,
    });
    return mapProduct(response?.data ?? {});
  }

  const response = await apiFetch("/api/admin/produk", {
    method: "POST",
    body: JSON.stringify({
      nama: payload.nama,
      harga: payload.harga,
      stok: payload.stok,
      kategori_id: payload.kategoriId,
      deskripsi: payload.deskripsi || "",
    }),
  });
  return mapProduct(response?.data ?? {});
}

export async function updateProduct(id, payload, imageFile) {
  if (imageFile) {
    const formData = new FormData();
    formData.append("nama", payload.nama);
    formData.append("harga", payload.harga);
    formData.append("stok", payload.stok);
    formData.append("kategori_id", payload.kategoriId);
    formData.append("deskripsi", payload.deskripsi || "");
    formData.append("gambar", imageFile);

    const response = await apiFetch(`/api/admin/produk/${id}`, {
      method: "PUT",
      body: formData,
    });
    return mapProduct(response?.data ?? {});
  }

  const response = await apiFetch(`/api/admin/produk/${id}`, {
    method: "PUT",
    body: JSON.stringify({
      nama: payload.nama,
      harga: payload.harga,
      stok: payload.stok,
      kategori_id: payload.kategoriId,
      deskripsi: payload.deskripsi || "",
    }),
  });
  return mapProduct(response?.data ?? {});
}

/** Update stok saja — pakai PATCH sesuai endpoint yang tersedia. */
export async function patchStock(id, stok) {
  const response = await apiFetch(`/api/admin/produk/${id}`, {
    method: "PATCH",
    body: JSON.stringify({ stok }),
  });
  return mapProduct(response?.data ?? {});
}

export async function deleteProduct(id) {
  await apiFetch(`/api/admin/produk/${id}`, { method: "DELETE" });
  return true;
}
