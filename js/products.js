/**
 * products.js
 * Page controller for products.html. Mounts shared shell, loads produk +
 * kategori, renders table, dan handle create/update/delete lewat modal.
 */

import { mountShell, showToast } from "./main.js";
import { isLoggedIn } from "./api.js";
import {
  getProducts,
  createProduct,
  updateProduct,
  deleteProduct,
} from "./services/products.service.js";
import { getCategories } from "./services/categories.service.js";

let categoriesCache = [];
let selectedImageFile = null;
let pendingDeleteId = null;
let currentProducts = [];

function formatIDR(value) {
  return new Intl.NumberFormat("id-ID", { style: "currency", currency: "IDR", maximumFractionDigits: 0 }).format(value);
}

function stockStatus(stok) {
  if (stok <= 0) return { text: "Habis", cls: "badge-danger" };
  if (stok <= 5) return { text: "Stok Menipis", cls: "badge-warning" };
  return { text: "Tersedia", cls: "badge-success" };
}

function renderSkeleton() {
  const tbody = document.getElementById("product-table-body");
  tbody.innerHTML = Array.from({ length: 5 })
    .map(
      () => `
      <tr>
        <td colspan="6"><div class="skeleton" style="height:20px;"></div></td>
      </tr>`
    )
    .join("");
}

function renderProducts(products) {
  const tbody = document.getElementById("product-table-body");
  const emptyEl = document.getElementById("product-empty");

  if (!products.length) {
    tbody.innerHTML = "";
    emptyEl.hidden = false;
    return;
  }
  emptyEl.hidden = true;

  tbody.innerHTML = products
    .map((p) => {
      const status = stockStatus(p.stok);
      return `
      <tr data-id="${p.id}">
        <td class="table__cell-title">${p.nama}</td>
        <td>${p.kategoriNama}</td>
        <td>${formatIDR(p.harga)}</td>
        <td>${p.stok}</td>
        <td><span class="badge ${status.cls}">${status.text}</span></td>
        <td>
          <button class="btn btn-secondary btn-sm" data-action="edit" data-id="${p.id}">Edit</button>
          <button class="btn btn-danger btn-sm" data-action="delete" data-id="${p.id}" data-nama="${p.nama}">Hapus</button>
        </td>
      </tr>`;
    })
    .join("");

  tbody.querySelectorAll("[data-action='edit']").forEach((btn) =>
    btn.addEventListener("click", () => openEditModal(btn.dataset.id, products))
  );
  tbody.querySelectorAll("[data-action='delete']").forEach((btn) =>
    btn.addEventListener("click", () => openDeleteModal(btn.dataset.id, btn.dataset.nama))
  );
}

function showListError(message) {
  const errorBox = document.getElementById("product-error");
  document.getElementById("product-error-text").textContent = message;
  errorBox.hidden = false;
}

function hideListError() {
  document.getElementById("product-error").hidden = true;
}

async function loadProducts() {
  renderSkeleton();
  hideListError();
  try {
    currentProducts = await getProducts();
    renderProducts(currentProducts);
  } catch (err) {
    showListError(err.message || "Gagal mengambil data produk.");
  }
}

async function loadCategoriesIntoSelect() {
  const select = document.getElementById("kategori_id");
  try {
    categoriesCache = await getCategories();
    categoriesCache.forEach((cat) => {
      const opt = document.createElement("option");
      opt.value = cat.id;
      opt.textContent = cat.nama;
      select.appendChild(opt);
    });
  } catch (err) {
    showToast("Gagal memuat kategori.", "danger");
  }
}

// ---------- Modal tambah/edit ----------

function openAddModal() {
  document.getElementById("product-modal-title").textContent = "Tambah Produk";
  document.getElementById("product-form").reset();
  document.getElementById("product-id").value = "";
  document.getElementById("gambar-preview").hidden = true;
  selectedImageFile = null;
  document.getElementById("modal-error").hidden = true;
  document.getElementById("product-modal").hidden = false;
}

function openEditModal(id, products) {
  const product = products.find((p) => String(p.id) === String(id));
  if (!product) return;

  document.getElementById("product-modal-title").textContent = "Edit Produk";
  document.getElementById("product-id").value = product.id;
  document.getElementById("nama").value = product.nama;
  document.getElementById("kategori_id").value = product.kategoriId ?? "";
  document.getElementById("harga").value = product.harga;
  document.getElementById("stok").value = product.stok;
  document.getElementById("deskripsi").value = product.deskripsi;

  const preview = document.getElementById("gambar-preview");
  if (product.gambarUrl) {
    preview.src = product.gambarUrl;
    preview.hidden = false;
  } else {
    preview.hidden = true;
  }

  selectedImageFile = null;
  document.getElementById("modal-error").hidden = true;
  document.getElementById("product-modal").hidden = false;
}

function closeModal() {
  document.getElementById("product-modal").hidden = true;
}

function showModalError(message) {
  const box = document.getElementById("modal-error");
  box.textContent = message;
  box.hidden = false;
}

async function handleProductSubmit(e) {
  e.preventDefault();
  const form = e.target;
  const id = form.id.value;

  const payload = {
    nama: form.nama.value.trim(),
    kategoriId: form.kategori_id.value,
    harga: Number(form.harga.value),
    stok: Number(form.stok.value),
    deskripsi: form.deskripsi.value.trim(),
  };

  if (!payload.nama || !payload.kategoriId) {
    showModalError("Nama produk dan kategori wajib diisi.");
    return;
  }

  const submitBtn = document.getElementById("product-submit");
  submitBtn.disabled = true;

  try {
    if (id) {
      await updateProduct(id, payload, selectedImageFile);
      showToast("Produk berhasil diperbarui.", "success");
    } else {
      await createProduct(payload, selectedImageFile);
      showToast("Produk berhasil ditambahkan.", "success");
    }
    closeModal();
    await loadProducts();
  } catch (err) {
    showModalError(err.message || "Gagal menyimpan produk.");
  } finally {
    submitBtn.disabled = false;
  }
}

// ---------- Modal hapus ----------

function openDeleteModal(id, nama) {
  pendingDeleteId = id;
  document.getElementById("delete-modal-text").textContent = `Yakin ingin menghapus "${nama}"?`;
  document.getElementById("delete-modal").hidden = false;
}

function closeDeleteModal() {
  pendingDeleteId = null;
  document.getElementById("delete-modal").hidden = true;
}

async function handleConfirmDelete() {
  if (!pendingDeleteId) return;
  try {
    await deleteProduct(pendingDeleteId);
    showToast("Produk berhasil dihapus.", "success");
    closeDeleteModal();
    await loadProducts();
  } catch (err) {
    showToast(err.message || "Gagal menghapus produk.", "danger");
  }
}

// ---------- Wiring ----------

function initEvents() {
  document.getElementById("btn-add-product").addEventListener("click", openAddModal);
  document.getElementById("btn-retry").addEventListener("click", loadProducts);
  document.getElementById("product-form").addEventListener("submit", handleProductSubmit);
  document.getElementById("btn-confirm-delete").addEventListener("click", handleConfirmDelete);

  document.querySelectorAll("[data-action='close-modal']").forEach((el) =>
    el.addEventListener("click", closeModal)
  );
  document.querySelectorAll("[data-action='close-delete-modal']").forEach((el) =>
    el.addEventListener("click", closeDeleteModal)
  );

  document.getElementById("gambar").addEventListener("change", (e) => {
    const file = e.target.files[0];
    selectedImageFile = file || null;
    const preview = document.getElementById("gambar-preview");
    if (file) {
      preview.src = URL.createObjectURL(file);
      preview.hidden = false;
    }
  });
}

document.addEventListener("DOMContentLoaded", async () => {
  if (!isLoggedIn()) {
    window.location.href = "/index.html";
    return;
  }
  mountShell();
  initEvents();
  await loadCategoriesIntoSelect();
  await loadProducts();
});

