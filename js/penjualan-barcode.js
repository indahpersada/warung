let html5Qr;
let kameraTerpilih = null;
let scannerAktif = false;

// Konfigurasi format barcode yang didukung
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

// Inisialisasi kamera ke dropdown
function initKameraDropdown() {
  const dropdown = document.getElementById("kameraSelect");
  Html5Qrcode.getCameras().then(cameras => {
    if (!cameras.length) {
      alert("🚨 Kamera tidak ditemukan.");
      return;
    }

    // Kosongkan dan isi dropdown
    dropdown.innerHTML = "";
    cameras.forEach(cam => {
      const option = document.createElement("option");
      option.value = cam.id;
      option.text = cam.label || `Kamera ${dropdown.length + 1}`;
      dropdown.appendChild(option);
    });

    // Set kamera default
    kameraTerpilih = cameras[0].id;
    dropdown.value = kameraTerpilih;

    dropdown.onchange = function () {
      kameraTerpilih = this.value;
    };
  }).catch(err => {
    console.error("❌ Gagal mendapatkan kamera:", err);
  });
}

// Mulai scanner barcode
function mulaiScanner() {
  const divScanner = document.getElementById("scanner");
  const beep = document.getElementById("beep");

  // Pancing autoplay sound
  beep.play().then(() => beep.pause()).catch(() => {});

  if (scannerAktif) {
    html5Qr.stop().then(() => {
      divScanner.style.display = "none";
      scannerAktif = false;
    });
    return;
  }

  divScanner.style.display = "block";

  html5Qr = new Html5Qrcode("scanner");

  html5Qr.start(
    kameraTerpilih,
    config,
    (kode) => {
      console.log("📦 Barcode:", kode);

      // Beep!
      beep.play();

      // Cek apakah kode produk terdaftar
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
    (err) => {
      // Gagal baca, bisa diamkan
    }
  ).then(() => {
    scannerAktif = true;
  }).catch(err => {
    console.error("❌ Tidak bisa akses kamera:", err);
    alert("🚨 Gagal mengakses kamera.");
  });
}

// Stop scanner manual (opsional)
function stopScanner() {
  if (scannerAktif && html5Qr) {
    html5Qr.stop().then(() => {
      document.getElementById("scanner").style.display = "none";
      scannerAktif = false;
    }).catch(err => {
      console.warn("❌ Gagal stop scanner:", err);
    });
  }
}

// Inisialisasi saat load
window.addEventListener("DOMContentLoaded", () => {
  initKameraDropdown();
});
