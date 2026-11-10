# DocuResearch — AI Academic Studio & Synthesis

DocuResearch adalah platform AI penulisan karya ilmiah akademik tingkat tinggi yang dirancang untuk **Skripsi (S1), Tesis (S2), Disertasi (S3), Artikel Jurnal Ilmiah (IMRAD), dan Systematic Literature Review (SLR / PRISMA 2020)**. 

Ditenagai oleh **Google Gemini Pro** dengan mesin ketat **Anti AI-Slop**, DocuResearch memastikan naskah yang dihasilkan terbebas dari bahasa klise AI, bebas emoji, menggunakan kaidah PUEBI/EYD ilmiah baku, dan secara otomatis menyusun halaman sampul resmi kampus, daftar pustaka, hingga peta konsep.

---

## 1. Fitur Utama

- **Mesin AI Gemini Pro Anti AI-Slop:**
  - Melarang keras frasa klise seperti *"Unlock your potential"*, *"Di era revolusi industri 4.0 yang serba cepat ini"*, atau *"Sebagai kesimpulan"*.
  - Menghasilkan argumen ilmiah formal, berdasar bukti, dengan kalimat pasif objektif akademis.
- **Dua Model Penggunaan AI (Freemium & Pro):**
  - **Gratis (BYOK):** Pengguna dapat memasukkan Google Gemini API Key pribadi mereka secara gratis.
  - **Academic Pro:** Akses langsung server Gemini Pro tanpa batas dan tanpa perlu repot setup API key.
- **Generator Halaman Sampul (Cover Resmi) & Upload Logo:**
  - Unggah logo universitas/institusi secara visual.
  - Otomatis menghasilkan cover standar perguruan tinggi (Judul, Jenis Naskah, Nama, NIM, Dosen Pembimbing, Program Studi, Fakultas, Universitas, dan Tahun).
- **Bagian Depan & Pelengkap Naskah Lengkap:**
  - Halaman Pengesahan / Komisi Penguji
  - Surat Pernyataan Keaslian & Bebas Plagiasi
  - Motto dan Persembahan
  - Kata Pengantar & Ucapan Terima Kasih
  - Abstrak (Bahasa Indonesia & Bahasa Inggris)
  - Daftar Isi, Daftar Tabel, Daftar Gambar, dan Lampiran
- **Peta Konsep & Diagram PRISMA 2020:**
  - Generator visual Kerangka Konseptual Penelitian (Hubungan Variabel X ke Y).
  - Generator visual Diagram Alur Protokol PRISMA 2020 untuk artikel Systematic Literature Review (SLR).
- **Mesin Sitasi & Daftar Pustaka Otomatis:**
  - Standar internasional: **APA 7th Edition, IEEE, dan Harvard**.
  - Otomatis mengurutkan daftar pustaka A-Z.
  - Memungkinkan penambahan berkas / catatan referensi sendiri.
- **Live Academic Editor & Auto-Save:**
  - Editor interaktif berbasis blok bab dengan auto-save lokal dan tombol unduh format dokumen (.doc / Word).

---

## 2. Cara Menjalankan di Komputer Lokal

1. Masuk ke folder proyek:
   ```bash
   cd /Users/admin/.gemini/antigravity/scratch/docuresearch
   ```
2. Pasang dependensi:
   ```bash
   npm install --cache /tmp/.npm-cache
   ```
3. Jalankan server lokal:
   ```bash
   npm start
   ```
4. Buka di browser Anda: **[http://localhost:3001](http://localhost:3001)**

---

## 3. Unggah ke GitHub (`abay-cmd`) & Deploy di Vercel

### A. Unggah ke GitHub
```bash
git init
git config user.name "abay-cmd"
git config user.email "abay-cmd@users.noreply.github.com"
git add .
git commit -m "Initial commit DocuResearch AI Academic Studio"
git branch -M main
git remote add origin https://github.com/abay-cmd/docuresearch.git
git push -u origin main
```

### B. Deploy di Vercel
1. Buka [https://vercel.com/new](https://vercel.com/new) dan import repository `abay-cmd/docuresearch`.
2. Pada bagian **Framework Preset**, pilih **Other**.
3. Di bagian **Environment Variables**, tambahkan:
   - `GEMINI_API_KEY` = Kunci API Google Gemini Pro Anda (opsional untuk mode Pro).
   - `SPREADSHEET_ID` = ID Spreadsheet Google Sheets Anda (opsional untuk cloud database).
4. Klik **Deploy**.
