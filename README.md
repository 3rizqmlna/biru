# Taman Bulan — Struktur File

File `index.html` aslinya satu file raksasa (HTML+CSS+JS digabung, ±6.580 baris).
Sekarang sudah dipisah jadi:

```
index.html              → struktur HTML saja
css/
  └─ style.css           → semua CSS (gabungan dari 8 blok <style> asli, urutan dijaga)
js/
  ├─ firebase-init.js    → inisialisasi Firebase
  ├─ lockgate-init.js    → logika kelas kunci awal (mencegah flash konten sebelum terkunci)
  ├─ puzzle-wajah.js     → logika game "Puzzle Wajah"
  ├─ svg-garden.js       → logika "SVG Virtual Garden"
  └─ main.js             → logika utama aplikasi (playlist, animasi partikel, unlock, dst.)
```

Catatan:
- Dua blok `<script type="x-shader/...">` (shader WebGL) sengaja dibiarkan
  tetap inline di `index.html` karena itu bukan kode yang dieksekusi,
  melainkan teks sumber GLSL yang dibaca lewat `getElementById(...).textContent`.
- Skrip CDN eksternal (Firebase, jsPDF, html2canvas, Google Fonts) tetap
  dirujuk lewat `<script src>` / `<link>` seperti aslinya.
- Urutan dan posisi tiap file JS di dalam `index.html` dijaga sama persis
  seperti posisi blok `<script>` aslinya, supaya perilaku halaman
  (termasuk logika "lock gate" yang harus jalan sebelum halaman sempat
  tampil) tidak berubah sama sekali dari versi asli.
- Semua sudah divalidasi sintaksnya (`node --check`) — tidak ada error.

Cukup buka `index.html` seperti biasa; browser akan otomatis memuat
`css/style.css` dan file-file di folder `js/`.
