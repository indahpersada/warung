let scannerAktif = false;
let html5Qr = null;

function mulaiScanner() {
  const divScanner = document.getElementById("scanner");

  if (scannerAktif) {
    html5Qr.stop().then(() => {
      divScanner.style.display = "none";
      scannerAktif = false;
    }).catch(console.warn);
    return;
  }

  divScanner.style.display = "block";

  if (!html5Qr) {
    html5Qr = new Html5Qrcode("scanner");
  }

  Html5Qrcode.getCameras().then(devices => {
    if (devices.length === 0) {
      alert("🚨 Kamera tidak ditemukan.");
      divScanner.style.display = "none";
      return;
    }

    const kameraBelakang = devices.find(d => d.label.toLowerCase().includes("back")) || devices[0];

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

    html5Qr.start(
      kameraBelakang.id,
      config,
      barcode => {
        console.log("📦 Barcode ditemukan:", barcode);
        const produk = produkList.find(p => p.kode === barcode);
        if (produk) {
          pilihProduk(produk.kode);
          document.getElementById("jumlah").focus();
          document.getElementById("beep").play();

          html5Qr.stop().then(() => {
            divScanner.style.display = "none";
            scannerAktif = false;
          });
        } else {
          alert("❌ Produk tidak ditemukan untuk kode: " + barcode);
        }
      },
      err => {
        // bisa dihilangkan jika terlalu spam
        // console.warn("🔍 Tidak terbaca:", err);
      }
    ).then(() => {
      scannerAktif = true;
    }).catch(err => {
      console.error("❌ Gagal mulai scanner:", err);
      alert("🚨 Tidak bisa akses kamera.");
      divScanner.style.display = "none";
    });

  }).catch(err => {
    console.error("❌ Gagal ambil kamera:", err);
    alert("🚨 Kamera tidak tersedia.");
    divScanner.style.display = "none";
  });
}

function stopScanner() {
  if (html5Qr && scannerAktif) {
    html5Qr.stop().then(() => {
      document.getElementById("scanner").style.display = "none";
      scannerAktif = false;
    }).catch(console.warn);
  }
}
