# ⚡ MOKLET SOCIETY AGENCY — Platform Rekrutmen Atlet Profesional

Platform berbasis web modern yang dirancang untuk mempermudah klub olahraga profesional di Indonesia dalam menemukan, mengelola, dan mengontrak atlet-atlet bertalenta dari berbagai cabang olahraga secara langsung. 

Aplikasi ini dibangun menggunakan arsitektur **Clean Code** dengan pemisahan peran yang matang (**Separation of Concerns**) serta diintegrasikan dengan **Google Sheets** secara real-time untuk pencatatan kontrak & database atlet yang dinamis.

---

## 📂 Struktur Proyek Profesional

Proyek ini telah direstrukturisasi secara profesional untuk memastikan kemudahan pemeliharaan (*maintainability*), keterbacaan (*readability*), dan skalabilitas kode:

```text
MOKLET SOCIETY AGENCY/
├── index.html            # Markup HTML5 Semantis & Konfigurasi SEO Meta
├── css/
│   └── style.css         # Desain Sistem & Variabel CSS Modern (Glassmorphism & Animasi)
├── js/
│   ├── data.js           # Database Atlet Lokal & Konfigurasi API
│   └── app.js            # Pengontrol Utama Logika Frontend & Interaksi DOM
└── README.md             # Dokumentasi Teknis Industri (File ini)
```

---

## 🛠️ Pembagian Modul & Peran

### 1. `index.html`
*   **Fungsi Utama:** Menyediakan kerangka struktur halaman web.
*   **Penyempurnaan:** 
    *   Mengimplementasikan tag **SEO Meta** yang komprehensif (Deskripsi Meta, Keywords, OpenGraph Tags untuk berbagi di sosial media).
    *   Bersih dari kode gaya inline (`style`) dan kode skrip inline (`script`).
    *   Penggunaan elemen HTML5 semantis (`nav`, `section`, `footer`) untuk aksesibilitas yang lebih baik.

### 2. `css/style.css`
*   **Fungsi Utama:** Mengatur visualisasi, tata letak, dan animasi mikro premium.
*   **Penyempurnaan:**
    *   Menggunakan variabel CSS `:root` untuk memudahkan kustomisasi tema warna (*Design Tokens*).
    *   Implementasi gaya **Glassmorphism** modis pada komponen kartu dan drawer.
    *   Efek transisi interaktif yang halus pada setiap aksi hover dan klik.
    *   Desain yang sepenuhnya responsif di semua resolusi layar (Mobile hingga Desktop ultra-wide).

### 3. `js/data.js`
*   **Fungsi Utama:** Bertindak sebagai *Data Layer* (basis data lokal) statis.
*   **Penyempurnaan:**
    *   Mengisolasi data default atlet dan metadata cabang olahraga keluar dari file logika utama.
    *   Mempermudah penambahan data atlet awal baru secara langsung melalui modifikasi array objek terstruktur.

### 4. `js/app.js`
*   **Fungsi Utama:** Bertindak sebagai *Controller* halaman.
*   **Penyempurnaan:**
    *   Menggunakan standar dokumentasi **JSDoc** profesional pada setiap variabel dan fungsi penting.
    *   Menghilangkan duplikasi redundan fungsi `deleteAthlete` dan menyatukannya menjadi satu fungsi utilitas global.
    *   Mengoptimalkan penanganan unggahan pratinjau foto secara lokal dan pengiriman formulir dinamis menggunakan asinkronus `fetch` API.

---

## 📊 Integrasi Google Sheets (Google Apps Script)

Aplikasi ini dapat disinkronkan secara otomatis dengan Google Sheets. Saat Anda menambahkan atlet baru atau mengirimkan formulir rekrutmen, data dikirim langsung ke spreadsheet Anda.

### Panduan Setup Spreadsheet:
1. Buat Google Spreadsheet baru.
2. Buka menu **Ekstensi** > **Apps Script**.
3. Hapus kode bawaan dan tempelkan kode Apps Script berikut:

```javascript
function doPost(e) {
  var sheetOrder = SpreadsheetApp.getActiveSpreadsheet().getSheetByName("Orders") || 
                   SpreadsheetApp.getActiveSpreadsheet().insertSheet("Orders");
  var sheetAtlet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName("Athletes") || 
                   SpreadsheetApp.getActiveSpreadsheet().insertSheet("Athletes");
  
  // Set headers jika sheet baru dibuat
  if (sheetOrder.getLastRow() === 0) {
    sheetOrder.appendRow(["Tanggal", "Nama Pengirim", "WhatsApp", "Email", "Nama Klub", "Kota", "Durasi Kontrak", "Atlet Dipesan", "Jumlah Atlet", "Total Biaya", "Metode Pembayaran", "Catatan", "Status"]);
  }
  if (sheetAtlet.getLastRow() === 0) {
    sheetAtlet.appendRow(["Tanggal", "Nama Atlet", "Cabang Olahraga", "Posisi", "Usia", "Rating", "Gol/Poin", "Assist", "Biaya Kontrak"]);
  }

  try {
    var rawData = e.postData.contents;
    var data = JSON.parse(rawData);
    
    if (data.type === "order") {
      sheetOrder.appendRow([
        data.timestamp, data.nama, data.whatsapp, data.email, data.namaKlub, 
        data.kota, data.durasiKontrak, data.atletDipesan, data.jumlahAtlet, 
        data.totalBiaya, data.metodePembayaran, data.catatan, data.status
      ]);
    } else if (data.type === "tambah_atlet") {
      sheetAtlet.appendRow([
        data.timestamp, data.nama, data.sport, data.pos, data.age, 
        data.rating, data.goals, data.assists, data.price
      ]);
    }
    
    return ContentService.createTextOutput("SUCCESS").setMimeType(ContentService.MimeType.TEXT);
  } catch (err) {
    return ContentService.createTextOutput("ERROR: " + err.message).setMimeType(ContentService.MimeType.TEXT);
  }
}
```
4. Klik **Terapkan (Deploy)** > **Penerapan Baru**.
5. Pilih jenis penerapan: **Aplikasi Web**.
6. Setel akses ke: **Siapa saja (Anyone)**.
7. Salin URL Aplikasi Web yang diberikan, lalu buka file `js/data.js` dan perbarui nilai konstanta `APPS_SCRIPT_URL`:
   ```javascript
   const APPS_SCRIPT_URL = "URL_APLIKASI_WEB_ANDA_DI_SINI";
   ```

---

## 🚀 Cara Menjalankan Secara Lokal

Karena proyek ini menggunakan Vanilla JS modern, Anda dapat membukanya secara langsung tanpa memerlukan langkah instalasi yang rumit:

1. Klon atau unduh folder proyek ini ke komputer Anda.
2. Klik ganda file `index.html` untuk membukanya secara langsung di browser favorit Anda.
3. *Alternatif (Rekomendasi):* Gunakan ekstensi seperti **Live Server** di VS Code untuk pengalaman pengembangan lokal dengan pembaruan otomatis (hot-reload).

---

&copy; 2026 **MOKLET SOCIETY AGENCY** — Dikembangkan secara Profesional.
# ⚡ MOKLET SOCIETY AGENCY — Platform Rekrutmen Atlet Profesional

Platform berbasis web modern yang dirancang untuk mempermudah klub olahraga profesional di Indonesia dalam menemukan, mengelola, dan mengontrak atlet-atlet bertalenta dari berbagai cabang olahraga secara langsung. 

Aplikasi ini dibangun menggunakan arsitektur **Clean Code** dengan pemisahan peran yang matang (**Separation of Concerns**) serta diintegrasikan dengan **Google Sheets** secara real-time untuk pencatatan kontrak & database atlet yang dinamis.

---

## 📂 Struktur Proyek Profesional

Proyek ini telah direstrukturisasi secara profesional untuk memastikan kemudahan pemeliharaan (*maintainability*), keterbacaan (*readability*), dan skalabilitas kode:

```text
MOKLET SOCIETY AGENCY/
├── index.html            # Markup HTML5 Semantis & Konfigurasi SEO Meta
├── css/
│   └── style.css         # Desain Sistem & Variabel CSS Modern (Glassmorphism & Animasi)
├── js/
│   ├── data.js           # Database Atlet Lokal & Konfigurasi API
│   └── app.js            # Pengontrol Utama Logika Frontend & Interaksi DOM
└── README.md             # Dokumentasi Teknis Industri (File ini)
```

---

## 🛠️ Pembagian Modul & Peran

### 1. `index.html`
*   **Fungsi Utama:** Menyediakan kerangka struktur halaman web.
*   **Penyempurnaan:** 
    *   Mengimplementasikan tag **SEO Meta** yang komprehensif (Deskripsi Meta, Keywords, OpenGraph Tags untuk berbagi di sosial media).
    *   Bersih dari kode gaya inline (`style`) dan kode skrip inline (`script`).
    *   Penggunaan elemen HTML5 semantis (`nav`, `section`, `footer`) untuk aksesibilitas yang lebih baik.

### 2. `css/style.css`
*   **Fungsi Utama:** Mengatur visualisasi, tata letak, dan animasi mikro premium.
*   **Penyempurnaan:**
    *   Menggunakan variabel CSS `:root` untuk memudahkan kustomisasi tema warna (*Design Tokens*).
    *   Implementasi gaya **Glassmorphism** modis pada komponen kartu dan drawer.
    *   Efek transisi interaktif yang halus pada setiap aksi hover dan klik.
    *   Desain yang sepenuhnya responsif di semua resolusi layar (Mobile hingga Desktop ultra-wide).

### 3. `js/data.js`
*   **Fungsi Utama:** Bertindak sebagai *Data Layer* (basis data lokal) statis.
*   **Penyempurnaan:**
    *   Mengisolasi data default atlet dan metadata cabang olahraga keluar dari file logika utama.
    *   Mempermudah penambahan data atlet awal baru secara langsung melalui modifikasi array objek terstruktur.

### 4. `js/app.js`
*   **Fungsi Utama:** Bertindak sebagai *Controller* halaman.
*   **Penyempurnaan:**
    *   Menggunakan standar dokumentasi **JSDoc** profesional pada setiap variabel dan fungsi penting.
    *   Menghilangkan duplikasi redundan fungsi `deleteAthlete` dan menyatukannya menjadi satu fungsi utilitas global.
    *   Mengoptimalkan penanganan unggahan pratinjau foto secara lokal dan pengiriman formulir dinamis menggunakan asinkronus `fetch` API.

---

## 📊 Integrasi Google Sheets (Google Apps Script)

Aplikasi ini dapat disinkronkan secara otomatis dengan Google Sheets. Saat Anda menambahkan atlet baru atau mengirimkan formulir rekrutmen, data dikirim langsung ke spreadsheet Anda.

### Panduan Setup Spreadsheet:
1. Buat Google Spreadsheet baru.
2. Buka menu **Ekstensi** > **Apps Script**.
3. Hapus kode bawaan dan tempelkan kode Apps Script berikut:

```javascript
function doPost(e) {
  var sheetOrder = SpreadsheetApp.getActiveSpreadsheet().getSheetByName("Orders") || 
                   SpreadsheetApp.getActiveSpreadsheet().insertSheet("Orders");
  var sheetAtlet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName("Athletes") || 
                   SpreadsheetApp.getActiveSpreadsheet().insertSheet("Athletes");
  
  // Set headers jika sheet baru dibuat
  if (sheetOrder.getLastRow() === 0) {
    sheetOrder.appendRow(["Tanggal", "Nama Pengirim", "WhatsApp", "Email", "Nama Klub", "Kota", "Durasi Kontrak", "Atlet Dipesan", "Jumlah Atlet", "Total Biaya", "Metode Pembayaran", "Catatan", "Status"]);
  }
  if (sheetAtlet.getLastRow() === 0) {
    sheetAtlet.appendRow(["Tanggal", "Nama Atlet", "Cabang Olahraga", "Posisi", "Usia", "Rating", "Gol/Poin", "Assist", "Biaya Kontrak"]);
  }

  try {
    var rawData = e.postData.contents;
    var data = JSON.parse(rawData);
    
    if (data.type === "order") {
      sheetOrder.appendRow([
        data.timestamp, data.nama, data.whatsapp, data.email, data.namaKlub, 
        data.kota, data.durasiKontrak, data.atletDipesan, data.jumlahAtlet, 
        data.totalBiaya, data.metodePembayaran, data.catatan, data.status
      ]);
    } else if (data.type === "tambah_atlet") {
      sheetAtlet.appendRow([
        data.timestamp, data.nama, data.sport, data.pos, data.age, 
        data.rating, data.goals, data.assists, data.price
      ]);
    }
    
    return ContentService.createTextOutput("SUCCESS").setMimeType(ContentService.MimeType.TEXT);
  } catch (err) {
    return ContentService.createTextOutput("ERROR: " + err.message).setMimeType(ContentService.MimeType.TEXT);
  }
}
```
4. Klik **Terapkan (Deploy)** > **Penerapan Baru**.
5. Pilih jenis penerapan: **Aplikasi Web**.
6. Setel akses ke: **Siapa saja (Anyone)**.
7. Salin URL Aplikasi Web yang diberikan, lalu buka file `js/data.js` dan perbarui nilai konstanta `APPS_SCRIPT_URL`:
   ```javascript
   const APPS_SCRIPT_URL = "URL_APLIKASI_WEB_ANDA_DI_SINI";
   ```

---

## 🚀 Cara Menjalankan Secara Lokal

Karena proyek ini menggunakan Vanilla JS modern, Anda dapat membukanya secara langsung tanpa memerlukan langkah instalasi yang rumit:

1. Klon atau unduh folder proyek ini ke komputer Anda.
2. Klik ganda file `index.html` untuk membukanya secara langsung di browser favorit Anda.
3. *Alternatif (Rekomendasi):* Gunakan ekstensi seperti **Live Server** di VS Code untuk pengalaman pengembangan lokal dengan pembaruan otomatis (hot-reload).

---

&copy; 2026 **MOKLET SOCIETY AGENCY** — Dikembangkan secara Profesional.
