function cekLogin() {
  const user = JSON.parse(localStorage.getItem("login"));
  if (!user) location.href = "login.html";
}

function logout() {
  localStorage.removeItem("login");
  location.href = "login.html";
}

function parseTanggal(value) {
  // Jika value berupa angka serial Excel
  if (!isNaN(value) && Number(value) > 40000) {
    const excelEpoch = new Date(1899, 11, 30);
    return new Date(excelEpoch.getTime() + (value * 24 * 60 * 60 * 1000));
  }

  // Format string: dd/mm/yyyy HH:mm:ss
  if (typeof value === "string") {
    const [tanggal, waktu] = value.split(" ");
    const [dd, mm, yyyy] = tanggal.split("/").map(Number);
    const [hh = 0, mi = 0, ss = 0] = waktu ? waktu.split(":").map(Number) : [];
    return new Date(yyyy, mm - 1, dd, hh, mi, ss);
  }

  return new Date("Invalid");
}

async function tampilkanLaporan() {
  const filter = document.getElementById("filter")?.value || "semua";
  const res = await fetch(`https://sheets.googleapis.com/v4/spreadsheets/${CONFIG.SHEET_ID}/values/penjualan?key=${CONFIG.API_KEY}`);
  const json = await res.json();
  const rows = json.values.slice(1);

  const today = new Date();
  const data = rows.filter(row => {
    const tgl = parseTanggal(row[0]);
    if (filter === "hari") return tgl.toDateString() === today.toDateString();
    if (filter === "bulan") return tgl.getMonth() === today.getMonth() && tgl.getFullYear() === today.getFullYear();
    if (filter === "tahun") return tgl.getFullYear() === today.getFullYear();
    return true;
  });

  let total = 0;
  let totalLaba = 0;
  const tbody = document.getElementById("tabel-laporan");
  tbody.innerHTML = "";

  for (const row of data) {
    const tgl = parseTanggal(row[0]).toLocaleDateString("id-ID");
    const nama = row[2];
    const jumlah = parseInt(row[3]) || 0;
    const totalRp = parseInt(row[4]) || 0;
    const kasir = row[5];
    const hargaBeli = await getHargaBeli(row[1]);
    const laba = totalRp - (hargaBeli * jumlah);
    total += totalRp;
    totalLaba += laba;

    tbody.innerHTML += `
      <tr>
        <td>${tgl}</td>
        <td>${nama}</td>
        <td>${jumlah}</td>
        <td>Rp ${totalRp.toLocaleString()}</td>
        <td>${kasir}</td>
      </tr>`;
  }

  renderGrafik(data);
  document.getElementById("total-rp").textContent = "Rp " + total.toLocaleString();
  document.getElementById("total-laba").textContent = "Rp " + totalLaba.toLocaleString();
  document.getElementById("tanggal-cetak").textContent = "🗓️ Dicetak pada: " + new Date().toLocaleString("id-ID");
}

async function getHargaBeli(barcode) {
  if (!CONFIG._produkCache) {
    const res = await fetch(`https://sheets.googleapis.com/v4/spreadsheets/${CONFIG.SHEET_ID}/values/produk?key=${CONFIG.API_KEY}`);
    const json = await res.json();
    CONFIG._produkCache = json.values;
  }

  const data = CONFIG._produkCache;
  for (let i = 1; i < data.length; i++) {
    if (data[i][1] === barcode) return parseInt(data[i][3]) || 0;
  }
  return 0;
}

let chart;

function renderGrafik(data) {
  const map = {};

  data.forEach(row => {
    const tgl = parseTanggal(row[0]).toLocaleDateString("id-ID");
    const total = parseInt(row[4]) || 0;
    if (!map[tgl]) map[tgl] = 0;
    map[tgl] += total;
  });

  const labels = Object.keys(map);
  const totals = Object.values(map);
  const ctx = document.getElementById("grafikPenjualan").getContext("2d");

  if (chart) chart.destroy();

  chart = new Chart(ctx, {
    type: 'bar',
    data: {
      labels,
      datasets: [{
        label: 'Total Penjualan per Hari',
        data: totals,
        backgroundColor: '#3b82f6'
      }]
    },
    options: {
      responsive: true,
      plugins: {
        legend: { display: false }
      }
    }
  });
}

window.addEventListener("beforeprint", () => {
  document.querySelectorAll(".no-print").forEach(el => el.style.display = "none");
});
window.addEventListener("afterprint", () => {
  document.querySelectorAll(".no-print").forEach(el => el.style.display = "");
});

window.addEventListener("DOMContentLoaded", tampilkanLaporan);
