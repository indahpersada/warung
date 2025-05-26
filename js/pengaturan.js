document.addEventListener("DOMContentLoaded", muatPengaturan);

function logout() {
  localStorage.removeItem("login");
  location.href = "login.html";
}

async function muatPengaturan() {
  try {
    const res = await fetch(`${CONFIG.POST_URL}?tipe=pengaturan`);
    const data = await res.json();

    // Tampilkan ke form
    document.getElementById("nama_toko").value = data.nama_toko || "";
    document.getElementById("alamat").value = data.alamat || "";
    document.getElementById("telepon").value = data.telepon || "";
    document.getElementById("header").value = data.header || "";
    document.getElementById("footer").value = data.footer || "";
    document.getElementById("nomor_resi").value = data.nomor_resi || "";

    // Simpan lokal
    localStorage.setItem("pengaturan", JSON.stringify(data));
  } catch (err) {
    console.error("❌ Gagal memuat pengaturan:", err);
    alert("❌ Gagal memuat data pengaturan.");
  }
}

async function simpanPengaturan() {
  const formData = new FormData();
  formData.append("tipe", "pengaturan");
  formData.append("nama_toko", document.getElementById("nama_toko").value);
  formData.append("alamat", document.getElementById("alamat").value);
  formData.append("telepon", document.getElementById("telepon").value);
  formData.append("header", document.getElementById("header").value);
  formData.append("footer", document.getElementById("footer").value);
  formData.append("nomor_resi", document.getElementById("nomor_resi").value);

  try {
    const res = await fetch(CONFIG.POST_URL, {
      method: "POST",
      body: formData
    });

    const json = await res.json();
    if (json.success) {
      alert("✅ Pengaturan berhasil disimpan!");
    } else {
      alert("❌ Gagal menyimpan pengaturan.");
    }
  } catch (err) {
    console.error("❌ Gagal simpan:", err);
    alert("❌ Terjadi kesalahan saat menyimpan pengaturan.");
  }
}
