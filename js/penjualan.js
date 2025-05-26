let produkList = [];
let keranjang = [];

document.addEventListener("DOMContentLoaded", () => {
  cekLogin();
  loadProduk();
  renderTabel();
});

// ✅ Fungsi cek login
function cekLogin() {
  const login = localStorage.getItem("login");
  if (!login) {
    alert("⚠️ Anda belum login.");
    window.location.href = "login.html";
  }
}

// ✅ Fungsi logout
function logout() {
  localStorage.removeItem("login");
  location.href = "login.html";
}

// ✅ Ambil data produk dari Sheet
function loadProduk() {
  const url = `https://sheets.googleapis.com/v4/spreadsheets/${CONFIG.SHEET_ID}/values/produk?key=${CONFIG.API_KEY}`;
  fetch(url)
    .then(res => res.json())
    .then(data => {
      if (!data.values) return alert("❌ Gagal ambil data produk.");
      produkList = data.values.slice(1).map(p => ({
        kode: p[1],             // barcode
        nama: p[2],             // nama produk
        harga: parseInt(p[4]) || 0 // harga jual
      }));
    })
    .catch(err => console.error("Gagal fetch produk:", err));
}

// ✅ Cari produk
// Update cariProduk dengan deteksi real-time kode barcode
function cariProduk() {
  const input = document.getElementById("cari-produk");
  const keyword = input.value.toLowerCase().trim();
  const div = document.getElementById("hasil-cari");

  if (!keyword) {
    div.innerHTML = "";
    input.dataset.kode = "";
    return;
  }

  // Cari produk yang kode atau nama cocok keyword
  const hasil = produkList.filter(p =>
    p.nama.toLowerCase().includes(keyword) || p.kode.toLowerCase().includes(keyword)
  );

  // Cek apakah keyword ini sama persis kode produk (barcode) -> auto pilih
  const exactMatch = produkList.find(p => p.kode.toLowerCase() === keyword);
  if (exactMatch) {
    pilihProduk(exactMatch.kode);
    div.innerHTML = ""; // sembunyikan dropdown karena sudah otomatis pilih
    return;
  }

  // Jika tidak ada exact match, tampilkan hasil pencarian seperti biasa
  div.innerHTML = hasil.map(p =>
    `<div onclick="pilihProduk('${p.kode}')">${p.kode} ${p.nama} - Rp${p.harga.toLocaleString()}</div>`
  ).join("");
}

// Pastikan event oninput di #cari-produk tetap:
document.getElementById("cari-produk").addEventListener("input", cariProduk);

// ✅ Pilih produk dari hasil pencarian
function pilihProduk(kode) {
  const produk = produkList.find(p => p.kode === kode);
  if (!produk) return alert("❌ Produk tidak ditemukan.");
  document.getElementById("cari-produk").value = produk.nama;
  document.getElementById("cari-produk").dataset.kode = produk.kode;
  document.getElementById("hasil-cari").innerHTML = "";
}

// ✅ Tambahkan produk ke keranjang
function tambahPenjualan() {
  const kode = document.getElementById("cari-produk").dataset.kode;
  const jumlah = parseInt(document.getElementById("jumlah").value || "1");

  if (!kode) return alert("❌ Pilih produk dulu.");
  if (jumlah <= 0) return alert("❌ Jumlah harus lebih dari 0.");

  const produk = produkList.find(p => p.kode === kode);
  if (!produk) return alert("❌ Produk tidak ditemukan.");

  const subtotal = produk.harga * jumlah;
  keranjang.push({ ...produk, jumlah, subtotal });

  // Reset input
  document.getElementById("cari-produk").value = "";
  document.getElementById("cari-produk").dataset.kode = "";
  document.getElementById("jumlah").value = 1;

  renderTabel();
}

// ✅ Tampilkan isi keranjang ke tabel
function renderTabel() {
  const tbody = document.getElementById("tabel-penjualan");
  tbody.innerHTML = keranjang.map((item, i) =>
    `<tr>
      <td>${item.kode}</td>
      <td>${item.nama}</td>
      <td>Rp${item.harga.toLocaleString()}</td>
      <td>${item.jumlah}</td>
      <td>Rp${item.subtotal.toLocaleString()}</td>
      <td><button onclick="hapusItem(${i})">❌</button></td>
    </tr>`
  ).join("");

  const total = keranjang.reduce((sum, i) => sum + i.subtotal, 0);
  document.getElementById("total-bayar").textContent = total.toLocaleString();
}

// ✅ Hapus item dari keranjang
function hapusItem(index) {
  keranjang.splice(index, 1);
  renderTabel();
}

// ✅ Simpan ke Google Sheet dan arahkan ke cetak struk
function simpanPenjualan() {
  if (keranjang.length === 0) return alert("⚠️ Keranjang kosong.");

  const session = JSON.parse(localStorage.getItem("login"));
  const now = new Date();
  const nomor_resi = `INV-${now.getFullYear()}${now.getMonth()+1}${now.getDate()}-${now.getTime()}`;

  localStorage.setItem("struk", JSON.stringify({
    items: keranjang,
    total: keranjang.reduce((s, i) => s + i.subtotal, 0),
    kasir: session.user,
    waktu: now.toISOString(),
    nomor_resi: nomor_resi
  }));

  let semuaSukses = true; // Penanda apakah semua fetch sukses

  const promises = keranjang.map(item => {
    const formData = new FormData();
    formData.append("tipe", "penjualan");
    formData.append("barcode", item.kode);
    formData.append("nama_produk", item.nama);
    formData.append("jumlah", item.jumlah);
    formData.append("total", item.subtotal);
    formData.append("kasir", session.user);
    formData.append("nomor_resi", nomor_resi);

    return fetch(CONFIG.POST_URL, {
      method: "POST",
      body: formData,
    })
    .then(res => {
      console.log(`Response status untuk item ${item.kode}:`, res.status);
      if (!res.ok) {
        semuaSukses = false;
        throw new Error(`HTTP error status: ${res.status}`);
      }
      return res.text();
    })
    .then(resText => {
      console.log(`Sukses simpan item ${item.kode}:`, resText);
    })
    .catch(err => {
      semuaSukses = false;
      console.error(`Gagal simpan item ${item.kode}:`, err);
      // Jangan alert di sini, nanti setelah semua selesai
    });
  });

  Promise.all(promises)
    .then(() => {
      if (semuaSukses) {
        alert("✅ Semua penjualan berhasil disimpan.");
      } else {
        alert("⚠️ Ada beberapa item gagal tersimpan di server, cek console.");
      }
      window.location.href = "cetak-struk.html";
    });
}