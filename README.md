# SIPADU Desa — Sistem Pengaduan Masyarakat Desa

Stack: **React (Vite) + Node.js/Express + MySQL (dikelola lewat phpMyAdmin)**

## Struktur Project

```
sipadu-desa/
├── backend/          # REST API - Express + MySQL2
├── frontend/          # React (Vite) + Tailwind CSS
└── database/
    └── sipadu_desa.sql   # Import file ini via phpMyAdmin
```

## 1. Setup Database (phpMyAdmin)
1. Buka phpMyAdmin, buat koneksi ke MySQL lokal (biasanya lewat XAMPP/Laragon).
2. Klik tab **Import**, pilih file `database/sipadu_desa.sql`, klik **Go**.
3. Database `sipadu_desa` beserta tabel & data awal (admin + 4 kategori) akan otomatis dibuat.
4. Login admin default: `username: admin` / `password: admin123` (ganti setelah login pertama).

## 2. Setup Backend
```bash
cd backend
cp .env.example .env      # sesuaikan DB_USER, DB_PASSWORD sesuai phpMyAdmin/XAMPP Anda
npm install
npm run dev                # server jalan di http://localhost:5000
```

## 3. Setup Frontend
```bash
cd frontend
cp .env.example .env       # pastikan VITE_API_BASE_URL sesuai alamat backend
npm install
npm run dev                 # aplikasi jalan di http://localhost:5173
```

## Alur Data
```
React (Vite)  --axios-->  Express API  --mysql2-->  MySQL (dikelola phpMyAdmin)
```

## Catatan
- Foto pengaduan disimpan di `backend/uploads/complaint-photos/` dan diakses via `http://localhost:5000/uploads/complaint-photos/<nama-file>`.
- JWT dipakai untuk autentikasi admin; token disimpan di `localStorage` sisi frontend.
- Untuk deploy production: ganti `JWT_SECRET`, set `DB_PASSWORD` sesuai server, dan build frontend dengan `npm run build` lalu sajikan hasilnya lewat backend atau hosting statis terpisah.
