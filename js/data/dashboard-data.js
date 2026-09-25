/**
 * dashboard-data.js
 * Placeholder data standing in for what GET /api/dashboard/summary will
 * eventually return from Flask. Shape this to match the real API response
 * as early as possible so swapping the service layer later is a one-file
 * change (see js/services/dashboard.service.js).
 */

export const dummyStats = [
  { key: "products", label: "Total Produk", value: 128, delta: "+4 minggu ini", trend: "up", tone: "accent" },
  { key: "categories", label: "Total Kategori", value: 12, delta: "Tidak berubah", trend: "flat", tone: "gold" },
  { key: "orders", label: "Total Pesanan", value: 356, delta: "+18 minggu ini", trend: "up", tone: "success" },
  { key: "users", label: "Total Pengguna", value: 842, delta: "+27 minggu ini", trend: "up", tone: "neutral" },
];

// Simple weekly sales trend (in thousand IDR) used to draw the line chart.
export const dummySalesTrend = {
  labels: ["Sen", "Sel", "Rab", "Kam", "Jum", "Sab", "Min"],
  values: [420, 512, 398, 610, 705, 890, 760],
};

export const dummyBestsellers = [
  { id: 1, name: "Tas Anyaman Pandan", category: "Kerajinan", sold: 84, revenue: 6300000 },
  { id: 2, name: "Kopi Robusta 250g", category: "Makanan & Minuman", sold: 71, revenue: 2485000 },
  { id: 3, name: "Batik Tulis Motif Parang", category: "Fashion", sold: 46, revenue: 11500000 },
  { id: 4, name: "Keripik Singkong Pedas", category: "Makanan & Minuman", sold: 39, revenue: 975000 },
  { id: 5, name: "Vas Keramik Polos", category: "Kerajinan", sold: 33, revenue: 2970000 },
];

export const dummyTopProductsTable = [
  { id: 1, name: "Tas Anyaman Pandan", sold: 84, stock: 12, status: "menipis" },
  { id: 2, name: "Kopi Robusta 250g", sold: 71, stock: 58, status: "tersedia" },
  { id: 3, name: "Batik Tulis Motif Parang", sold: 46, stock: 0, status: "habis" },
  { id: 4, name: "Keripik Singkong Pedas", sold: 39, stock: 120, status: "tersedia" },
  { id: 5, name: "Vas Keramik Polos", sold: 33, stock: 9, status: "menipis" },
];