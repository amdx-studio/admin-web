# Kriya Admin — Frontend Admin Panel (Phase 1)

Frontend admin panel terpisah untuk website UMKM, dibangun dengan HTML, CSS, dan JavaScript vanilla (ES Modules). Belum terhubung ke backend Flask — seluruh data masih dummy.

## Menjalankan secara lokal

Karena JS menggunakan `type="module"`, browser akan memblokirnya jika file dibuka langsung lewat `file://` (masalah CORS pada module). Jalankan lewat server lokal sederhana, contoh:

```bash
# di dalam folder admin-panel/
python -m http.server 5501
# lalu buka http://localhost:5501/login.html
```

Atau gunakan ekstensi "Live Server" di VS Code, lalu buka `login.html`.

Login demo: `admin@umkm.id` / `admin123` (lihat catatan di `js/auth.js` — ini murni simulasi UI, bukan autentikasi asli).

## Struktur folder

```
admin-panel/
├── login.html
├── index.html                 (dashboard)
├── css/
│   ├── main.css                design tokens (:root) + reset + layout shell
│   ├── components.css          button, badge, card, form, table, modal, dst.
│   ├── dashboard.css           gaya khusus halaman dashboard
│   └── responsive.css          breakpoint tablet (≤1024px) & mobile (≤768px)
├── js/
│   ├── main.js                 mount sidebar+topbar, toast utility
│   ├── sidebar.js              data menu, template sidebar, toggle collapse/drawer
│   ├── auth.js                 controller login.html (simulasi UI)
│   ├── dashboard.js            controller index.html
│   ├── services/
│   │   └── dashboard.service.js   satu-satunya tempat halaman dashboard "meminta data"
│   └── data/
│       └── dashboard-data.js      dummy data, terpisah dari logic
└── README.md
```

Halaman lain (`products.html`, `categories.html`, `orders.html`, `users.html`, `ratings.html`, `settings.html`) menyusul di Phase 2+, mengikuti pola yang sama: satu file HTML + satu controller di `js/`, plus satu service di `js/services/` bila halaman itu butuh data sendiri.

## Alur data (siap untuk Flask API)

```
HTML (index.html, dll)
   ↓ import
Page controller (js/dashboard.js)
   ↓ memanggil
Service (js/services/dashboard.service.js)
   ↓ saat ini: dummy data dari js/data/
   ↓ nanti: fetch('/api/dashboard/summary')
Flask REST API
   ↓
Supabase
```

Saat backend siap, hanya file di `js/services/` yang perlu diganti isinya (dari `return dummyData` menjadi `fetch(...)`). Controller dan HTML tidak perlu disentuh selama bentuk data (shape) yang dikembalikan sama.

## Sidebar & topbar sebagai shell bersama

Sidebar dan topbar tidak ditulis ulang di setiap file HTML. `js/main.js` menyuntikkan markup keduanya ke dalam dua elemen placeholder (`#sidebar-root`, `#topbar-root`) berdasarkan `data-page` dan `data-page-title` pada tag `<body>`. Ini membuat penambahan halaman baru di Phase 2+ jadi murah: cukup salin kerangka `<body>` dari `index.html`, ganti `data-page`/`data-page-title`, dan tulis controller halamannya sendiri.

## Belum termasuk di Phase 1

* Dark/light mode (disebutkan opsional di brief — akan menyusul bila dibutuhkan agar Phase 1 tetap fokus)
* Halaman Produk, Kategori, Pesanan, Pengguna, Rating, Pengaturan
* Koneksi API sungguhan ke Flask
