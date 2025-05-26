function logout() {
  localStorage.removeItem("login");
  location.href = "login.html";
}

let dataProduk = [];

document.addEventListener("DOMContentLoaded", () => {
  loadProduk();
  initScanner();
});

function loadProduk() {
  fetch(CONFIG.ENDPOINTS.produk)
    .then(res => res.json())
    .then(json => {
      const rows = json.values.slice(1);
      dataProduk = rows.map(row => ({
        barcode: row[1],
        nama: row[2],
        beli: row[3],
        jual: row[4],
        stok: row[5]
      }));
      renderTabel(dataProduk);
    });
}

function renderTabel(data) {
  const tbody = document.querySelector("#tabel-produk tbody");
  tbody.innerHTML = "";
  data.forEach(p => {
    tbody.innerHTML += `<tr>
      <td>${p.barcode}</td>
      <td>${p.nama}</td>
      <td>${p.beli}</td>
      <td>${p.jual}</td>
      <td>${p.stok}</td>
    </tr>`;
  });
}

function cariProduk() {
  const keyword = document.getElementById("cari").value.toLowerCase();
  const hasil = dataProduk.filter(p => p.nama.toLowerCase().includes(keyword) || p.barcode.includes(keyword));
  renderTabel(hasil);
}

function simpanProduk() {
  const barcode = document.getElementById("barcode").value;
  const nama = document.getElementById("nama_produk").value;
  const beli = document.getElementById("harga_beli").value;
  const jual = document.getElementById("harga_jual").value;
  const stok = document.getElementById("stok").value;

  if (!barcode || !nama || !beli || !jual) return alert("Isi semua kolom!");

  const formData = new FormData();
  formData.append("tipe", "produk"); // penting!
  formData.append("barcode", barcode);
  formData.append("nama_produk", nama);
  formData.append("harga_beli", beli);
  formData.append("harga_jual", jual);
  formData.append("stok", stok);

  fetch(CONFIG.POST_URL, {
    method: "POST",
    body: formData
  })
  .then(res => res.text())
  .then(() => {
    alert("Produk disimpan!");
    loadProduk();
    document.querySelectorAll("input").forEach(i => i.value = "");
  });
}



// Barcode Scanner
function initScanner() {
  if (!navigator.mediaDevices) return;
  const video = document.getElementById("preview");
  navigator.mediaDevices.getUserMedia({ video: { facingMode: "environment" } })
    .then(stream => {
      video.srcObject = stream;
      video.setAttribute("playsinline", true);
      video.play();
      scanLoop(video);
    });
}

function scanLoop(video) {
  const canvas = document.createElement("canvas");
  const ctx = canvas.getContext("2d");

  setInterval(() => {
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    ctx.drawImage(video, 0, 0);
    const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
    // Implementasi library barcode/QR reader bisa pakai zxing atau jsQR
    // Demo minimal: kita skip implementasi karena qrcode.min.js tidak bisa untuk kamera
  }, 1000);
}
