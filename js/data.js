/**
 * @fileoverview Data Configuration and Initial State
 * @description Stores the global configuration, metadata, and default mock data for the application.
 * @module js/data
 */

/**
 * Endpoint URL to integration with Google Sheets (via Google Apps Script)
 * @type {string}
 */
const APPS_SCRIPT_URL = "/**
 * @fileoverview Main Application Controller
 * @description Controls the application behavior, state management, DOM rendering, Cart operations,
 * modal interactions, image processing, and Spreadsheet integration.
 * @module js/app
 */

// ==========================================================================
// 1. Global Application State
// ==========================================================================

/**
 * Array of athletes currently selected in the recruitment cart.
 * @type {Array.<Object>}
 */
let cart = [];

/**
 * Currently selected sport category filter (null means show all/cabang olahraga grid).
 * @type {?string}
 */
let currentSport = null;

/**
 * Currently selected payment method.
 * @type {string}
 */
let selectedPayment = "Transfer Bank";

/**
 * Holds base64 photo data URL when creating/uploading a new athlete photo.
 * @type {?string}
 */
let currentPhotoData = null;

let editId = null;


// ==========================================================================
// 2. Utility & LocalStorage Functions (FITUR AUTO SAVE DI SINI)
// ==========================================================================

/**
 * Formats a number to Indonesian Rupiah currency style.
 * @param {number} n - The raw numeric value.
 * @returns {string} Formatted rupiah text (e.g. "Rp 45.000.000").
 */
function fmtRp(n) {
  return "Rp " + Number(n).toLocaleString("id-ID");
}

/**
 * Custom modern toast alert system.
 * @param {string} msg - The message to display.
 * @param {string} [color="#9CD5FF"] - The hexadecimal color code for the toast left-indicator dot.
 */
function toast(msg, color) {
  const tmsg = document.getElementById("tmsg");
  const tdot = document.getElementById("tdot");
  const toastEl = document.getElementById("toast");
  
  if (tmsg && tdot && toastEl) {
    tmsg.textContent = msg;
    tdot.style.background = color || "#9CD5FF";
    toastEl.classList.add("show");
    
    // Auto slide-down after 3 seconds
    setTimeout(() => {
      toastEl.classList.remove("show");
    }, 3000);
  }
}

/**
 * AMBIL data atlet dari memori browser saat web baru dibuka (Auto Save)
 */
function loadLocalAthletes() {
  const localData = localStorage.getItem("custom_athletes");
  if (localData) {
    const customList = JSON.parse(localData);
    // Masukkan atlet buatan user ke daftar utama jika ID-nya belum ada di data.js
    customList.forEach(custom => {
      if (!athletes.some(a => a.id === custom.id)) {
        athletes.push(custom);
      }
    });
  }
}

/**
 * SIMPAN data atlet ke memori browser tiap ada perubahan (Auto Save)
 */
function saveLocalAthletes() {
  // Hanya menyimpan atlet baru buatan user (ID bawaan data.js biasanya di bawah 50)
  const customList = athletes.filter(a => a.id > 50); 
  localStorage.setItem("custom_athletes", JSON.stringify(customList));
}


// ==========================================================================
// 3. Rendering / DOM Manipulation Functions
// ==========================================================================

/**
 * Renders the Cabang Olahraga (Sport Category) grid based on sportMeta metadata.
 * Dynamically counts registered athletes under each category.
 */
function renderSports() {
  const totalAtletStat = document.getElementById("total-atlet-stat");
  const sportsGrid = document.getElementById("sports-grid");
  
  if (totalAtletStat) {
    totalAtletStat.textContent = athletes.length;
  }
  
  if (sportsGrid) {
    sportsGrid.innerHTML = Object.entries(sportMeta).map(([key, s]) => {
      const count = athletes.filter(a => a.sport === key).length;
      return `
        <div class="sport-card" onclick="openSport('${key}')">
          <span class="sport-emoji">${s.emoji}</span>
          <div class="sport-name">${s.label}</div>
          <div class="sport-count">${s.desc} &middot; <span>${count} atlet</span></div>
          <div class="sport-arrow">Lihat Atlet &#8594;</div>
        </div>
      `;
    }).join("");
  }
}

/**
 * Switches the active view to display athletes from a specific sport.
 * @param {string} sport - The lowercase key representing the selected sport.
 */
function openSport(sport) {
  currentSport = sport;
  const s = sportMeta[sport];
  
  const titleEl = document.getElementById("sport-view-title");
  const subEl = document.getElementById("sport-view-sub");
  const viewSports = document.getElementById("view-sports");
  const viewAthletes = document.getElementById("view-athletes");
  
  if (titleEl) titleEl.textContent = s.emoji + " " + s.label;
  if (subEl) subEl.textContent = s.desc + " — pilih untuk direkrut";
  
  if (viewSports) viewSports.style.display = "none";
  if (viewAthletes) viewAthletes.style.display = "block";
  
  renderAthletes(sport);
  window.scrollTo({ top: 0, behavior: "smooth" });
}

/**
 * Switches back to the Cabang Olahraga grid selection view.
 */
function backToSports() {
  currentSport = null;
  
  const viewSports = document.getElementById("view-sports");
  const viewAthletes = document.getElementById("view-athletes");
  
  if (viewAthletes) viewAthletes.style.display = "none";
  if (viewSports) viewSports.style.display = "block";
  
  renderSports();
  window.scrollTo({ top: 0, behavior: "smooth" });
}

/**
 * Renders the athletes list under a specific sport category.
 * @param {string} sport - The lowercase key representing the active sport category.
 */
function renderAthletes(sport) {
  const grid = document.getElementById("athletes-grid");
  if (!grid) return;
  
  const list = athletes.filter(a => a.sport === sport);
  
  if (!list.length) {
    grid.innerHTML = `
      <div style="grid-column: 1/-1; text-align: center; color: var(--muted); padding: 3rem 0; font-size: .9rem;">
        Belum ada atlet di cabang ini.<br/>Tambahkan atlet baru!
      </div>
    `;
    return;
  }
  
  grid.innerHTML = list.map(a => {
    const inCart = cart.find(c => c.id === a.id);
    const photoTag = a.photo 
      ? `<img class="card-photo" src="${a.photo}" alt="${a.name}"/>` 
      : `<span style="font-size: 4rem">${a.emoji}</span>`;
      
    return `
      <div class="athlete-card ${inCart ? 'selected' : ''}">
        <div class="card-img">
          <span class="card-sport-badge">${a.sport.toUpperCase()}</span>
          <span class="card-rating">&#9733; ${a.rating}</span>
          ${photoTag}
          <div class="card-actions">
            <button class="action-btn btn-edit" onclick="editAthlete(event, ${a.id})">&#9998; Edit</button>
            <button class="action-btn btn-del" onclick="deleteAthlete(event, ${a.id})">&times; Hapus</button>
          </div>
        </div>
        <div class="card-body">
          <div class="card-name">${a.name}</div>
          <div class="card-pos">${a.pos} &middot; ${a.age} tahun</div>
          <div class="card-stats">
            <div class="cs">
              <div class="cs-val">${a.goals}</div>
              <div class="cs-key">${a.sport === "esports" ? "Kill" : "Poin"}</div>
            </div>
            <div class="cs">
              <div class="cs-val">${a.assists}</div>
              <div class="cs-key">Assist</div>
            </div>
            <div class="cs">
              <div class="cs-val">${a.rating}</div>
              <div class="cs-key">Rating</div>
            </div>
          </div>
          <div class="card-price">
            <div>
              <div class="price-val">${fmtRp(a.price)}</div>
              <div class="price-unit">/kontrak</div>
            </div>
            <button class="add-btn ${inCart ? 'added' : ''}" onclick="addToCart(${a.id})">
              ${inCart ? "&#10003; Ditambah" : "+ Rekrut"}
            </button>
          </div>
        </div>
      </div>
    `;
  }).join("");
}


// ==========================================================================
// 4. Cart / Recruitment List System
// ==========================================================================

/**
 * Toggles an athlete into or out of the recruitment cart.
 * @param {number} id - Unique athlete ID.
 */
function addToCart(id) {
  const a = athletes.find(x => x.id === id);
  if (!a) return;
  
  if (cart.find(c => c.id === id)) {
    cart = cart.filter(c => c.id !== id);
    toast(a.name + " dihapus dari list atlet", "#ef4444");
  } else {
    cart.push({ ...a });
    toast(a.name + " ditambahkan ke list atlet! 🎉", "#9AD872");
  }
  
  updateCart();
  if (currentSport) {
    renderAthletes(currentSport);
  }
}

/**
 * Explicitly removes an athlete from the recruitment cart.
 * @param {number} id - Unique athlete ID.
 */
function removeFromCart(id) {
  cart = cart.filter(c => c.id !== id);
  updateCart();
  if (currentSport) {
    renderAthletes(currentSport);
  }
}

/**
 * Recalculates cart total price and renders the updated list inside the Cart Drawer.
 */
function updateCart() {
  const total = cart.reduce((s, i) => s + i.price, 0);
  const cartCountEl = document.getElementById("cart-count");
  const drawerTotalEl = document.getElementById("drawer-total");
  const drawerItemsEl = document.getElementById("drawer-items");
  
  if (cartCountEl) cartCountEl.textContent = cart.length;
  if (drawerTotalEl) drawerTotalEl.textContent = fmtRp(total);
  if (!drawerItemsEl) return;
  
  if (!cart.length) {
    drawerItemsEl.innerHTML = '<div class="drawer-empty">List atlet masih kosong</div>';
    return;
  }
  
  drawerItemsEl.innerHTML = cart.map(i => {
    const mediaTag = i.photo 
      ? `<img class="di-photo" src="${i.photo}" alt="${i.name}" />` 
      : `<div class="di-emoji">${i.emoji}</div>`;
      
    return `
      <div class="drawer-item">
        ${mediaTag}
        <div class="di-info">
          <div class="di-name">${i.name}</div>
          <div class="di-pkg">${i.sport} &middot; ${i.pos}</div>
          <div class="di-price">${fmtRp(i.price)}</div>
        </div>
        <button class="di-remove" onclick="removeFromCart(${i.id})">&times;</button>
      </div>
    `;
  }).join("");
}

/**
 * Opens the recruitment list cart drawer.
 */
function openCart() {
  const overlay = document.getElementById("cart-overlay");
  const drawer = document.getElementById("cart-drawer");
  
  if (overlay) overlay.style.display = "block";
  if (drawer) drawer.classList.add("open");
}

/**
 * Closes the recruitment list cart drawer.
 */
function closeCart() {
  const overlay = document.getElementById("cart-overlay");
  const drawer = document.getElementById("cart-drawer");
  
  if (overlay) overlay.style.display = "none";
  if (drawer) drawer.classList.remove("open");
}


// ==========================================================================
// 5. Add Athlete Uploader & Photo Handler
// ==========================================================================

/**
 * Handles image file selection, processes local validation, and sets up real-time base64 preview.
 * @param {HTMLInputElement} input - The standard file input element.
 */
function previewPhoto(input) {
  const file = input.files[0];
  if (!file) return;
  
  // Local check: maximum file size of 5 megabytes
  if (file.size > 5 * 1024 * 1024) {
    toast("Foto terlalu besar! Maks 5MB", "#ef4444");
    input.value = "";
    return;
  }
  
  const reader = new FileReader();
  reader.onload = e => {
    currentPhotoData = e.target.result;
    
    const previewImg = document.getElementById("photo-preview-img");
    const placeholder = document.getElementById("photo-placeholder");
    
    if (previewImg) {
      previewImg.src = currentPhotoData;
      previewImg.style.display = "block";
    }
    if (placeholder) {
      placeholder.style.display = "none";
    }
  };
  reader.readAsDataURL(file);
}

/**
 * Opens the "Add New Athlete" Modal overlay.
 */
function openAddModal() {
  editId = null;
  const modalTitle = document.querySelector(".modal-title");
  if (modalTitle) modalTitle.innerHTML = "&#10133; Tambah Atlet Baru";

  if (currentSport) {
    const sportSelect = document.getElementById("a-sport");
    if (sportSelect) sportSelect.value = currentSport;
  }
  
  const modal = document.getElementById("add-modal");
  if (modal) modal.classList.add("show");
}

/**
 * Closes the "Add New Athlete" Modal and wipes out input states.
 */
function closeAddModal() {
  const modal = document.getElementById("add-modal");
  if (modal) modal.classList.remove("show");
  
  // Reset all standard input fields
  const fields = ["a-nama", "a-pos", "a-age", "a-rating", "a-goals", "a-assists", "a-price"];
  fields.forEach(id => {
    const el = document.getElementById(id);
    if (el) el.value = "";
  });
  
  const photoInput = document.getElementById("a-foto");
  const previewImg = document.getElementById("photo-preview-img");
  const placeholder = document.getElementById("photo-placeholder");
  
  if (photoInput) photoInput.value = "";
  if (previewImg) previewImg.style.display = "none";
  if (placeholder) placeholder.style.display = "block";
  
  currentPhotoData = null;
}

/**
 * Validates the new athlete form inputs, pushes it to local array state,
 * and makes an async POST call to the Google Apps Script spreadsheet endpoint.
 */
async function saveAthlete() {
  const namaEl = document.getElementById("a-nama");
  const sportEl = document.getElementById("a-sport");
  const posEl = document.getElementById("a-pos");
  const ageEl = document.getElementById("a-age");
  const ratingEl = document.getElementById("a-rating");
  const goalsEl = document.getElementById("a-goals");
  const assistsEl = document.getElementById("a-assists");
  const priceEl = document.getElementById("a-price");
  
  const nama = namaEl ? namaEl.value.trim() : "";
  const sport = sportEl ? sportEl.value : "sepak bola";
  const pos = posEl ? posEl.value.trim() : "";
  const age = ageEl ? (parseInt(ageEl.value) || 20) : 20;
  const rating = ratingEl ? (parseFloat(ratingEl.value) || 8.0) : 8.0;
  const goals = goalsEl ? (parseInt(goalsEl.value) || 0) : 0;
  const assists = assistsEl ? (parseInt(assistsEl.value) || 0) : 0;
  const price = priceEl ? (parseInt(priceEl.value) || 0) : 0;
  
  if (!nama || !pos || !price) {
    toast("Nama, posisi, dan biaya wajib diisi!", "#ef4444");
    return;
  }
  
  if (editId) {
    const idx = athletes.findIndex(x => x.id === editId);
    if (idx !== -1) {
      athletes[idx] = {
        ...athletes[idx],
        name: nama,
        sport: sport,
        emoji: sportMeta[sport].emoji,
        pos: pos,
        age: age,
        rating: rating,
        goals: goals,
        assists: assists,
        price: price,
        photo: currentPhotoData || null
      };
      
      const cartIdx = cart.findIndex(c => c.id === editId);
      if (cartIdx !== -1) {
        cart[cartIdx] = { ...athletes[idx] };
      }
    }
  } else {
    // Gunakan Date.now() agar menghasilkan ID unik berbasis waktu milidetik saat ini (anti-tabrakan!)
    athletes.push({
      id: Date.now(),
      name: nama,
      emoji: sportMeta[sport].emoji,
      sport: sport,
      pos: pos,
      age: age,
      rating: rating,
      goals: goals,
      assists: assists,
      price: price,
      photo: currentPhotoData || null
    });
  }
  
  // [MODIFIKASI]: Amankan data terbaru ke memori LocalStorage sebelum dikirim ke Google Sheets
  saveLocalAthletes();
  
  const saveBtn = document.getElementById("save-btn");
  const saveBtnText = document.getElementById("save-btn-text");
  
  if (saveBtn && saveBtnText) {
    saveBtnText.innerHTML = '<span class="spinner"></span> Menyimpan...';
    saveBtn.disabled = true;
  }
  
  // Submit asynchronously to Apps Script
  try {
    const dataToSend = {
      type: "tambah_atlet",
      nama,
      sport,
      pos,
      age,
      rating,
      goals,
      assists,
      price,
      timestamp: new Date().toLocaleString("id-ID")
    };
    
    await fetch(APPS_SCRIPT_URL, {
      method: "POST",
      mode: "no-cors",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(dataToSend)
    });
  } catch (e) {
    console.error("Gagal sinkronisasi Spreadsheet: ", e);
  }
  
  if (saveBtn && saveBtnText) {
    saveBtnText.textContent = "💾 Simpan Atlet";
    saveBtn.disabled = false;
  }
  
  closeAddModal();
  renderSports();
  
  if (currentSport === sport) {
    renderAthletes(sport);
  }
  
  toast(nama + " berhasil disimpan! 🎉", "#9AD872");
}

/**
 * Populates the modal with the selected athlete's data for editing.
 * @param {Event} e - The standard DOM click event propagation controller.
 * @param {number} id - Unique athlete ID to edit.
 */
function editAthlete(e, id) {
  e.stopPropagation();
  const a = athletes.find(x => x.id === id);
  if (!a) return;
  
  editId = id;
  const modalTitle = document.querySelector(".modal-title");
  if (modalTitle) modalTitle.innerHTML = "&#9998; Edit Atlet";
  
  document.getElementById("a-nama").value = a.name;
  document.getElementById("a-sport").value = a.sport;
  document.getElementById("a-pos").value = a.pos;
  document.getElementById("a-age").value = a.age;
  document.getElementById("a-rating").value = a.rating;
  document.getElementById("a-goals").value = a.goals;
  document.getElementById("a-assists").value = a.assists;
  document.getElementById("a-price").value = a.price;
  
  currentPhotoData = a.photo || null;
  const previewImg = document.getElementById("photo-preview-img");
  const placeholder = document.getElementById("photo-placeholder");
  
  if (currentPhotoData) {
    if (previewImg) { previewImg.src = currentPhotoData; previewImg.style.display = "block"; }
    if (placeholder) placeholder.style.display = "none";
  } else {
    if (previewImg) previewImg.style.display = "none";
    if (placeholder) placeholder.style.display = "block";
  }
  
  const modal = document.getElementById("add-modal");
  if (modal) modal.classList.add("show");
}

/**
 * [MODIFIKASI LENGKAP]: Menghapus atlet dari website, mengamankan memori lokal,
 * dan otomatis mengirim log penghapusan ke tab "Atlet Baru" di Google Sheets.
 * @param {Event} e - The standard DOM click event propagation controller.
 * @param {number} id - Unique athlete ID to delete.
 */
async function deleteAthlete(e, id) {
  e.stopPropagation();
  
  const a = athletes.find(x => x.id === id);
  if (!a) return;
  
  if (!confirm(`Hapus atlet "${a.name}" dari daftar?`)) return;
  
  // Cadangkan datanya sebentar untuk kebutuhan riwayat Spreadsheet sebelum dihapus secara lokal
  const namaHapus = a.name;
  const sportHapus = a.sport;
  const posHapus = a.pos;
  const ageHapus = a.age;
  const ratingHapus = a.rating;
  const goalsHapus = a.goals;
  const assistsHapus = a.assists;
  const priceHapus = a.price;
  
  // Hapus dari memori array web dan keranjang belanja
  athletes = athletes.filter(x => x.id !== id);
  cart = cart.filter(c => c.id !== id);
  
  // Simpan perubahan baru ini ke LocalStorage (Biar di-refresh tetep hilang)
  saveLocalAthletes();
  
  updateCart();
  renderSports();
  
  if (currentSport) {
    renderAthletes(currentSport);
  }
  
  toast("Menghapus atlet...", "#ef4444");
  
  // Kirim log penghapusan secara asinkron ke Google Sheets
  try {
    const dataToSend = {
      type: "hapus_atlet",
      nama: namaHapus,
      sport: sportHapus,
      pos: posHapus,
      age: ageHapus,
      rating: ratingHapus,
      goals: goalsHapus,
      assists: assistsHapus,
      price: priceHapus,
      timestamp: new Date().toLocaleString("id-ID")
    };
    
    await fetch(APPS_SCRIPT_URL, {
      method: "POST",
      mode: "no-cors",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(dataToSend)
    });
  } catch (err) {
    console.error("Gagal sinkronisasi hapus ke Spreadsheet: ", err);
  }
  
  toast(namaHapus + " berhasil dihapus", "#ef4444");
}


// ==========================================================================
// 6. Recruitment Order Checkout & Verification Flow
// ==========================================================================

/**
 * Directs the user to the recruitment checkout form, rendering summaries.
 */
function goCheckout() {
  if (!cart.length) {
    toast("List atlet kosong! Tambah atlet dulu.", "#ef4444");
    return;
  }
  
  closeCart();
  
  const checkoutSec = document.getElementById("checkout-section");
  const orderTotalVal = document.getElementById("order-total-val");
  const orderRows = document.getElementById("order-rows");
  
  if (checkoutSec) {
    checkoutSec.style.display = "block";
    checkoutSec.scrollIntoView({ behavior: "smooth" });
  }
  
  if (orderTotalVal) {
    const totalCost = cart.reduce((s, i) => s + i.price, 0);
    orderTotalVal.textContent = fmtRp(totalCost);
  }
  
  if (orderRows) {
    orderRows.innerHTML = cart.map(i => `
      <div class="ob-row">
        <span>${i.emoji} ${i.name} (${i.sport})</span>
        <span>${fmtRp(i.price)}</span>
      </div>
    `).join("");
  }
}

/**
 * Updates selected payment method on custom button grid click.
 * @param {HTMLElement} el - Selected payment method card elements.
 * @param {string} val - Payment method value.
 */
function selectPay(el, val) {
  document.querySelectorAll(".pay-card").forEach(c => c.classList.remove("active"));
  el.classList.add("active");
  selectedPayment = val;
}

/**
 * Submits the recruitment checkout form payload to Google Sheets Spreadsheet.
 * Renders the custom verification success modal overlay.
 */
async function submitOrder() {
  const namaEl = document.getElementById("f-nama");
  const waEl = document.getElementById("f-wa");
  const emailEl = document.getElementById("f-email");
  const klubEl = document.getElementById("f-klub");
  const kotaEl = document.getElementById("f-kota");
  const durasiEl = document.getElementById("f-durasi");
  const catatanEl = document.getElementById("f-catatan");
  
  const nama = namaEl ? namaEl.value.trim() : "";
  const wa = waEl ? waEl.value.trim() : "";
  const email = emailEl ? emailEl.value.trim() : "";
  const klub = klubEl ? klubEl.value.trim() : "";
  const kota = kotaEl ? kotaEl.value.trim() : "";
  const durasi = durasiEl ? durasiEl.value : "1 Tahun";
  const catatan = catatanEl ? catatanEl.value.trim() : "";
  
  if (!nama || !wa || !email || !klub) {
    toast("Isi semua field wajib dulu ya!", "#ef4444");
    return;
  }
  
  if (!cart.length) {
    toast("List atlet kosong!", "#ef4444");
    return;
  }
  
  const total = cart.reduce((s, i) => s + i.price, 0);
  const atletList = cart.map(i => i.name + " (" + i.sport + ")").join(", ");
  
  const data = {
    type: "order",
    timestamp: new Date().toLocaleString("id-ID"),
    nama: nama,
    whatsapp: wa,
    email: email,
    namaKlub: klub,
    kota: kota,
    durasiKontrak: durasi,
    atletDipesan: atletList,
    jumlahAtlet: cart.length,
    totalBiaya: total,
    metodePembayaran: selectedPayment,
    catatan: catatan || "-",
    status: "Baru"
  };
  
  const submitBtn = document.getElementById("submit-btn");
  const btnText = document.getElementById("btn-text");
  
  if (submitBtn && btnText) {
    btnText.innerHTML = '<span class="spinner"></span> Mengirim...';
    submitBtn.disabled = true;
  }
  
  try {
    await fetch(APPS_SCRIPT_URL, {
      method: "POST",
      mode: "no-cors",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data)
    });
    
    // Set up and render victory modal content
    const sNama = document.getElementById("s-nama");
    const sDetail = document.getElementById("s-detail");
    const successModal = document.getElementById("success-modal");
    
    if (sNama) sNama.textContent = nama;
    if (sDetail) {
      sDetail.innerHTML = `
        <p>⚽ <b>Atlet:</b> <span>${atletList}</span></p>
        <p>🏢 <b>Klub:</b> <span>${klub}</span></p>
        <p>💰 <b>Total:</b> <span>${fmtRp(total)}</span></p>
        <p>📅 <b>Kontrak:</b> <span>${durasi}</span></p>
        <p>💳 <b>Bayar:</b> <span>${selectedPayment}</span></p>
      `;
    }
    
    if (successModal) {
      successModal.classList.add("show");
    }
  } catch (err) {
    console.error("Submit order error: ", err);
    toast("Gagal mengirim. Coba lagi!", "#ef4444");
  } finally {
    if (submitBtn && btnText) {
      btnText.textContent = "🚀 Kirim Kontrak Rekrutmen";
      submitBtn.disabled = false;
    }
  }
}

/**
 * Resets the entire application state and sweeps inputs, returning user back to the starting category grid.
 */
function resetAll() {
  cart = [];
  updateCart();
  
  const checkoutSec = document.getElementById("checkout-section");
  const successModal = document.getElementById("success-modal");
  
  if (checkoutSec) checkoutSec.style.display = "none";
  if (successModal) successModal.classList.remove("show");
  
  // Wipe out form values
  const fields = ["f-nama", "f-wa", "f-email", "f-klub", "f-kota", "f-catatan"];
  fields.forEach(id => {
    const el = document.getElementById(id);
    if (el) el.value = "";
  });
  
  backToSports();
  toast("Siap rekrut atlet baru! ⚡", "#9CD5FF");
}


// ==========================================================================
// 7. Initializer Bootstrap
// ==========================================================================

// [MODIFIKASI]: Menambahkan pembacaan memori lokal sesaat sebelum menu utama di-render
document.addEventListener("DOMContentLoaded", () => {
  loadLocalAthletes(); // <-- Menarik tabungan atlet dari browser pengguna agar tidak hilang
  renderSports();
});";

/**
 * Metadata definition for each Sport category, including representative emoji, label name, and description.
 * @type {Object.<string, {emoji: string, label: string, desc: string}>}
 */
const sportMeta = {
  "sepak bola": { emoji: "⚽", label: "Sepak Bola",  desc: "Pemain lapangan hijau terbaik" },
  "basket":     { emoji: "🏀", label: "Basket",      desc: "Pemain hardcourt profesional" },
  "badminton":  { emoji: "🏸", label: "Badminton",   desc: "Atlet bulu tangkis andalan" },
  "renang":     { emoji: "🏊", label: "Renang",      desc: "Perenang berprestasi nasional" },
  "esports":    { emoji: "🎮", label: "E-Sports",    desc: "Pemain kompetitif papan atas" },
  "atletik":    { emoji: "🏃", label: "Atletik",     desc: "Atlet lari dan lompat terbaik" },
};

/**
 * Initial dataset of professional athletes.
 * @type {Array.<{id: number, name: string, emoji: string, sport: string, pos: string, age: number, rating: number, goals: number, assists: number, price: number, photo: ?string}>}
 */
let athletes = [
  {
    id: 1,
    name: "Cristiano Ronaldo",
    emoji: "⚽",
    sport: "sepak bola",
    pos: "Striker",
    age: 39,
    rating: 9.8,
    goals: 900,
    assists: 250,
    price: 150000000,
    photo: "/assets/images/CR7.jpeg"
  },
  {
    id: 2,
    name: "Lionel Messi",
    emoji: "⚽",
    sport: "sepak bola",
    pos: "Penyerang",
    age: 37,
    rating: 9.9,
    goals: 850,
    assists: 380,
    price: 145000000,
    photo: "/assets/images/Messi.jpeg"
  },
  {
    id: 13,
    name: "Erling Haaland",
    emoji: "⚽",
    sport: "sepak bola",
    pos: "Striker",
    age: 24,
    rating: 9.6,
    goals: 250,
    assists: 60,
    price: 120000000,
    photo: "/assets/images/haland.jpeg"
  },
  {
    id: 14,
    name: "Kylian Mbappe",
    emoji: "⚽",
    sport: "sepak bola",
    pos: "Penyerang",
    age: 25,
    rating: 9.7,
    goals: 310,
    assists: 150,
    price: 130000000,
    photo: "/assets/images/mbape.jpeg"
  },
  {
    id: 15,
    name: "Pratama Arhan",
    emoji: "⚽",
    sport: "sepak bola",
    pos: "Bek Kiri",
    age: 22,
    rating: 8.5,
    goals: 15,
    assists: 45,
    price: 45000000,
    photo: "/assets/images/arhan.jpeg"
  },
  {
    id: 3,
    name: "Anthony Sinisuka Ginting",
    emoji: "🏸",
    sport: "badminton",
    pos: "Tunggal Putra",
    age: 27,
    rating: 9.4,
    goals: 40,
    assists: 0,
    price: 50000000,
    photo: "/assets/images/ginting_badminton.jpeg"
  },
  {
    id: 4,
    name: "Jonatan Christie",
    emoji: "🏸",
    sport: "badminton",
    pos: "Tunggal Putra",
    age: 26,
    rating: 9.3,
    goals: 38,
    assists: 0,
    price: 48000000,
    photo: "/assets/images/jonathan_badminton.jpeg"
  },
  {
    id: 19,
    name: "An Se Young",
    emoji: "🏸",
    sport: "badminton",
    pos: "Tunggal Putri",
    age: 22,
    rating: 9.8,
    goals: 50,
    assists: 0,
    price: 60000000,
    photo: "/assets/images/seyoung_badminton.jpeg"
  },
  {
    id: 20,
    name: "Tai Tzu Ying",
    emoji: "🏸",
    sport: "badminton",
    pos: "Tunggal Putri",
    age: 29,
    rating: 9.7,
    goals: 48,
    assists: 0,
    price: 58000000,
    photo: "/assets/images/tzuying_badminton.jpeg"
  },
  {
    id: 21,
    name: "Viktor Axelsen",
    emoji: "🏸",
    sport: "badminton",
    pos: "Tunggal Putra",
    age: 30,
    rating: 9.9,
    goals: 55,
    assists: 0,
    price: 65000000,
    photo: "assets/images/viktor_badminton.jpeg"
  },
  {
    id: 5,
    name: "Stephen Curry",
    emoji: "🏀",
    sport: "basket",
    pos: "Point Guard",
    age: 36,
    rating: 9.6,
    goals: 30,
    assists: 45,
    price: 150000000,
    photo: "/assets/images/curry_basket.jpeg"
  },
  {
    id: 6,
    name: "LeBron James",
    emoji: "🏀",
    sport: "basket",
    pos: "Small Forward",
    age: 39,
    rating: 9.8,
    goals: 28,
    assists: 60,
    price: 160000000,
    photo: "/assets/images/James_basket.jpeg"
  },
  {
    id: 16,
    name: "Kevin Durant",
    emoji: "🏀",
    sport: "basket",
    pos: "Power Forward",
    age: 35,
    rating: 9.5,
    goals: 32,
    assists: 30,
    price: 140000000,
    photo: "/assets/images/kevin_basket.jpeg"
  },
  {
    id: 17,
    name: "Nikola Jokic",
    emoji: "🏀",
    sport: "basket",
    pos: "Center",
    age: 29,
    rating: 9.9,
    goals: 25,
    assists: 70,
    price: 155000000,
    photo: "/assets/images/nikola_basket.jpeg"
  },
  {
    id: 18,
    name: "Marques Bolden",
    emoji: "🏀",
    sport: "basket",
    pos: "Center",
    age: 26,
    rating: 8.5,
    goals: 18,
    assists: 20,
    price: 40000000,
    photo: "/assets/images/marques_basket.jpeg"
  },
  {
    id: 7,
    name: "Adam Peaty",
    emoji: "🏊",
    sport: "renang",
    pos: "Gaya Dada 100m",
    age: 29,
    rating: 9.7,
    goals: 20,
    assists: 0,
    price: 45000000,
    photo: "/assets/images/adam_renang.jpeg"
  },
  {
    id: 8,
    name: "Caeleb Dressel",
    emoji: "🏊",
    sport: "renang",
    pos: "Gaya Kupu-kupu 100m",
    age: 27,
    rating: 9.8,
    goals: 25,
    assists: 0,
    price: 55000000,
    photo: "/assets/images/caleb_renang.jpeg"
  },
  {
    id: 22,
    name: "Katie Ledecky",
    emoji: "🏊",
    sport: "renang",
    pos: "Gaya Bebas 800m",
    age: 27,
    rating: 9.9,
    goals: 30,
    assists: 0,
    price: 60000000,
    photo: "/assets/images/ketie_renang.jpeg"
  },
  {
    id: 23,
    name: "Michael Phelps",
    emoji: "🏊",
    sport: "renang",
    pos: "Gaya Ganti 200m",
    age: 38,
    rating: 10.0,
    goals: 50,
    assists: 0,
    price: 150000000,
    photo: "/assets/images/michele_renang.jpeg"
  },
  {
    id: 9,
    name: "Faker",
    emoji: "🎮",
    sport: "esports",
    pos: "Mid Laner",
    age: 28,
    rating: 9.9,
    goals: 120,
    assists: 200,
    price: 150000000,
    photo: "/assets/images/faker_game.jpeg"
  },
  {
    id: 10,
    name: "Kairi",
    emoji: "🎮",
    sport: "esports",
    pos: "Jungler",
    age: 18,
    rating: 9.8,
    goals: 150,
    assists: 90,
    price: 80000000,
    photo: "/assets/images/kairi_game.jpeg"
  },
  {
    id: 24,
    name: "Kelra",
    emoji: "🎮",
    sport: "esports",
    pos: "Gold Laner",
    age: 19,
    rating: 9.3,
    goals: 110,
    assists: 70,
    price: 50000000,
    photo: "/assets/images/kelra_game.jpeg"
  },
  {
    id: 25,
    name: "Kiboy",
    emoji: "🎮",
    sport: "esports",
    pos: "Roamer",
    age: 21,
    rating: 9.5,
    goals: 30,
    assists: 300,
    price: 65000000,
    photo: "/assets/images/kiboy_game.jpeg"
  },
  {
    id: 26,
    name: "Sanz",
    emoji: "🎮",
    sport: "esports",
    pos: "Mid Laner",
    age: 21,
    rating: 9.6,
    goals: 95,
    assists: 210,
    price: 70000000,
    photo: "/assets/images/sanz_game.jpeg"
  },
  {
    id: 27,
    name: "Savero",
    emoji: "🎮",
    sport: "esports",
    pos: "Gold Laner",
    age: 23,
    rating: 9.4,
    goals: 105,
    assists: 85,
    price: 60000000,
    photo: "/assets/images/savero_game.jpeg"
  },
  {
    id: 11,
    name: "Armand Duplantis",
    emoji: "🏃",
    sport: "atletik",
    pos: "Lompat Galah",
    age: 24,
    rating: 9.9,
    goals: 62,
    assists: 0,
    price: 80000000,
    photo: "/assets/images/armand_atletik.jpeg"
  },
  {
    id: 12,
    name: "Usain Bolt",
    emoji: "🏃",
    sport: "atletik",
    pos: "Lari 100m",
    age: 37,
    rating: 10.0,
    goals: 95,
    assists: 0,
    price: 150000000,
    photo: "/assets/images/bolt_atletik.jpeg"
  },
  {
    id: 28,
    name: "Sha'Carri Richardson",
    emoji: "🏃",
    sport: "atletik",
    pos: "Lari 100m",
    age: 24,
    rating: 9.5,
    goals: 25,
    assists: 0,
    price: 55000000,
    photo: "/assets/images/cari_atletik.jpeg"
  },
  {
    id: 29,
    name: "Eliud Kipchoge",
    emoji: "🏃",
    sport: "atletik",
    pos: "Marathon",
    age: 39,
    rating: 9.8,
    goals: 40,
    assists: 0,
    price: 90000000,
    photo: "/assets/images/Eliud_atletik.jpeg"
  },
  {
    id: 30,
    name: "Lalu Muhammad Zohri",
    emoji: "🏃",
    sport: "atletik",
    pos: "Lari 100m",
    age: 23,
    rating: 8.9,
    goals: 15,
    assists: 0,
    price: 35000000,
    photo: "/assets/images/lalu_atletik.jpeg"
  }
];
