let html5Qr;
let kameraTerpilih = null;
let scannerAktif = false;

const config = {
  fps: 10,
  qrbox: 250,
  formatsToSupport: [
    Html5QrcodeSupportedFormats.CODE_128,
    Html5QrcodeSupportedFormats.EAN_13,
    Html5QrcodeSupportedFormats.EAN_8,
    Html5QrcodeSupportedFormats.CODE_39,
    Html5QrcodeSupportedFormats.UPC_A,
    Html5QrcodeSupportedFormats.UPC_E
  ]
};

// Inisialisasi dropdown kamera
function initKameraDropdown() {
  const select = document.createElement("select");
  select.id = "kameraSelect";
  select.style.margin = "0.5rem 0";

  const scannerBtn = document.querySelector("button[onclick='mulaiScanner()']");
  scannerBtn.parentNode.insertBefore(select, scannerBtn);

  Html5Qrcode.getCameras().then(cameras => {
    if (!cameras.length) {
      alert("🚨 Tidak ada kamera ditemukan.");
      return;
    }

    select.innerHTML = "";
    cameras.forEach(cam => {
      const opt = document.createElement("option");
      opt.value = cam.id;
      opt.text = cam.label || `Kamera ${select.length + 1}`;
      select.appendChild(opt);
    });

    kameraTerpilih = select.value;
    select.onchange = () => {
      kameraTerpilih = select.value;
    };
  }).catch(err => {
    console.error("❌ Gagal ambil kamera:", err);
    alert("🚨 Tidak bisa akses kamera.");
  });
}

// Mulai / Stop Scanner
function mulaiScanner() {
  const divScanner = document.getElementById("scanner");
  const beep = document.getElementById("beep");

  if (scannerAktif) {
    html5Qr.stop().then(() => {
      scannerAktif = false;
      divScanner.style.display = "none";
    });
    return;
  }

  if (!kameraTerpilih) {
    alert("Pilih kamera terlebih dahulu.");
    return;
  }

  html5Qr = new Html5Qrcode("scanner");
  divScanner.style.display = "block";

  html5Qr.start(
    kameraTerpilih,
    config,
    kode => {
      console.log("📦 Barcode:", kode);
      beep.play();

      const produk = produkList.find(p => p.kode === kode);
      if (produk) {
        pilihProduk(kode);
        document.getElementById("jumlah").focus();
        html5Qr.stop().then(() => {
          scannerAktif = false;
          divScanner.style.display = "none";
        });
      } else {
        alert("❌ Produk tidak ditemukan: " + kode);
      }
    },
    err => {
      // console.warn("Gagal baca:", err);
    }
  ).then(() => {
    scannerAktif = true;
  }).catch(err => {
    console.error("❌ Gagal akses kamera:", err);
    alert("🚨 Tidak bisa memulai kamera.");
  });
}

window.addEventListener("DOMContentLoaded", () => {
  initKameraDropdown();
});
