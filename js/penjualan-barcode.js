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
  const scannerContainer = document.getElementById("scanner");

  // Buat wrapper dropdown
  const dropdownWrapper = document.createElement("div");
  dropdownWrapper.style.margin = "1rem 0";

  const label = document.createElement("label");
  label.textContent = "Pilih Kamera:";
  label.style.display = "block";
  label.style.marginBottom = "0.5rem";

  const select = document.createElement("select");
  select.id = "kameraSelect";
  select.style.padding = "8px";
  select.style.fontSize = "1rem";
  select.style.borderRadius = "6px";
  select.style.border = "1px solid #ccc";
  select.style.width = "100%";
  select.style.maxWidth = "300px";

  dropdownWrapper.appendChild(label);
  dropdownWrapper.appendChild(select);

  // Sisipkan sebelum tombol scanner
  const scannerBtn = document.querySelector("button[onclick='mulaiScanner()']");
  scannerBtn.parentNode.insertBefore(dropdownWrapper, scannerBtn);

  // Ambil daftar kamera
  Html5Qrcode.getCameras().then(cameras => {
    if (!cameras.length) {
      alert("🚨 Tidak ada kamera ditemukan.");
      return;
    }

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
