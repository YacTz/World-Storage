# World Storage
Aplikasi desktop untuk menyimpan dan mengelola world code game (Growtopia, dll).
Dibuat dengan Electron + SQLite. Gratis & offline.

================================================
  CARA INSTALL (LAKUKAN SEKALI SAJA)
================================================

1. Install Git (jika belum ada)
   Download di: https://git-scm.com/download/win
   Install dengan setting default semua.

2. Clone project ini
   Buka PowerShell, ketik:
   git clone https://github.com/YacTz/World-Storage.git

3. Masuk ke folder
   cd World-Storage

4. Jalankan SETUP.bat
   - Klik kanan SETUP.bat lalu pilih "Run as administrator"
   - Ikuti instruksi yang muncul di layar
   - SETUP akan otomatis:
     ✓ Mengecek & menginstall Git (jika belum ada)
     ✓ Mengecek & menginstall Node.js (jika belum ada)
     ✓ Menginstall semua dependencies (npm install)
     ✓ Menawarkan untuk build aplikasi langsung

5. Selesai!

================================================
  CARA MEMBUKA APLIKASI
================================================

Setelah SETUP selesai dan build berhasil:

1. Buka folder: World-Storage\win-unpacked\
2. Temukan file "World Storage.exe"
3. Double-click untuk membuka aplikasi

TIPS: Klik kanan "World Storage.exe" lalu pilih
"Send to → Desktop (create shortcut)" agar mudah
dibuka langsung dari Desktop kapan saja.

================================================
  FITUR APLIKASI
================================================

- Simpan world code dengan kategori, seed & catatan
- Cari world code dengan cepat
- Filter per kategori
- Tombol COPY     — salin world code dengan 1 klik
- Tombol SENSOR   — sembunyikan semua world code
                    (berguna saat sharing layar / screenshot)
- Select Mode     — pilih banyak world sekaligus untuk
                    copy atau hapus massal
- Import TXT/CSV  — import banyak world sekaligus dari file
- Export TXT/CSV  — backup atau bagikan world code
- Kelola Kategori — tambah, ubah warna, hapus kategori

================================================
  LOKASI DATABASE
================================================

Data tersimpan otomatis di:
  C:\Users\[nama]\AppData\Roaming\world-storage\world-storage.db

PENTING: Backup file .db ini secara berkala!
Cara backup paling mudah: gunakan tombol Export
di dalam aplikasi untuk simpan ke TXT atau CSV.

================================================
  TROUBLESHOOTING
================================================

Aplikasi tidak bisa dibuka?
→ Pastikan sudah menjalankan SETUP.bat terlebih dahulu
→ Coba jalankan SETUP.bat lagi sebagai Administrator

SETUP.bat gagal / error npm install?
→ Tutup PowerShell, buka ulang sebagai Administrator
→ Jalankan SETUP.bat lagi dari awal

================================================
  STRUKTUR FOLDER PROJECT
================================================

World-Storage/
├── src/
│   ├── main.js       - Electron main process
│   ├── preload.js    - Bridge ke database
│   └── index.html    - Tampilan aplikasi
├── win-unpacked/     - Hasil build (berisi .exe)
├── package.json      - Konfigurasi project
├── SETUP.bat         - Jalankan SEKALI untuk install
└── README.txt        - File ini

================================================
  HOW IT'S BUILT
================================================

- JavaScript, HTML, CSS  - tampilan & logika aplikasi
- Electron 30            - framework desktop
- sql.js (SQLite)        - database lokal offline
- electron-builder       - build ke .exe
- Node.js + npm          - tools development

================================================
  DEVELOPER
================================================

GitHub : https://github.com/YacTz/World-Storage
Versi  : 1.1.0
Update : Mei 2026
