/**
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
// 2. Utility Functions
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
    // FIX: Gunakan Date.now() agar menghasilkan ID unik berbasis waktu milidetik saat ini (anti-tabrakan!)
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
  
  toast(nama + " berhasil ditambahkan! 🎉", "#9AD872");
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
 * Removes an athlete entirely from the global dataset (both from athletes list and active cart).
 * @param {Event} e - The standard DOM click event propagation controller.
 * @param {number} id - Unique athlete ID to delete.
 */
function deleteAthlete(e, id) {
  e.stopPropagation();
  
  if (!confirm("Hapus atlet ini dari daftar?")) return;
  
  athletes = athletes.filter(a => a.id !== id);
  cart = cart.filter(c => c.id !== id);
  
  updateCart();
  renderSports();
  
  if (currentSport) {
    renderAthletes(currentSport);
  }
  
  toast("Atlet berhasil dihapus", "#ef4444");
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

// Starts the app by rendering the sport categories on dynamic document ready
document.addEventListener("DOMContentLoaded", () => {
  renderSports();
});
