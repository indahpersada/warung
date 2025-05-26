document.addEventListener("DOMContentLoaded", () => {
  const el = id => document.getElementById(id);
  const pengaturan = JSON.parse(localStorage.getItem("pengaturan")) || {};
  const data = JSON.parse(localStorage.getItem("struk"));

  if (!data) {
    document.body.innerHTML = "❌ Struk tidak ditemukan.";
    return;
  }

  // Set data toko
  if (el("header-struk")) el("header-struk").textContent = pengaturan.header || "Struk Belanja";
  if (el("nama-toko")) el("nama-toko").textContent = pengaturan.nama_toko || "Toko Default";
  if (el("alamat")) el("alamat").textContent = pengaturan.alamat || "Alamat belum diatur";
  if (el("telepon")) el("telepon").textContent = `Telp: ${pengaturan.telepon || "-"}`;
  if (el("footer-struk")) el("footer-struk").textContent = pengaturan.footer || "~ Terima kasih ~";

  // Nomor resi dari data transaksi
  if (el("nomor_resi")) el("nomor_resi").textContent = `Resi: ${data.nomor_resi || "N/A"}`;

  // Info transaksi
  if (el("info-transaksi")) {
    el("info-transaksi").textContent = `Kasir: ${data.kasir} | ${new Date(data.waktu).toLocaleString()}`;
  }

  // Tampilkan item ke tabel
  if (el("tabel-struk")) {
    const isi = data.items.map(i => `
      <tr>
        <td class="nama-produk">${i.nama}</td>
        <td class="jumlah">${i.jumlah}</td>
        <td class="harga">Rp${i.harga.toLocaleString()}</td>
        <td class="subtotal">Rp${i.subtotal.toLocaleString()}</td>
      </tr>
    `).join("");
    el("tabel-struk").innerHTML = isi;
  }

  // Total
  if (el("total-struk")) {
    el("total-struk").textContent = data.total.toLocaleString();
  }

  // Auto print & close
  setTimeout(() => {
    window.print();
    setTimeout(() => window.close(), 100);
  }, 500);
});
