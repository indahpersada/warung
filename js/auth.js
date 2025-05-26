function login() {
  const user = document.getElementById("username").value.trim();
  const pin = document.getElementById("pin").value.trim();

  if (!user || !pin) {
    alert("⚠️ Mohon isi semua kolom.");
    return;
  }

  const url = `https://sheets.googleapis.com/v4/spreadsheets/${CONFIG.SHEET_ID}/values/pengguna?key=${CONFIG.API_KEY}`;

  fetch(url)
    .then(response => {
      if (!response.ok) {
        throw new Error(`Gagal fetch data: ${response.status}`);
      }
      return response.json();
    })
    .then(data => {
      if (!data.values || data.values.length <= 1) {
        alert("❌ Tidak ada data pengguna ditemukan.");
        return;
      }

      const users = data.values.slice(1); // Skip header
      console.log("📋 Data Pengguna:", users);

      const found = users.find(u => u[0] === user && u[1] === pin);
      if (found) {
        localStorage.setItem("login", JSON.stringify({ user: found[0], role: found[2] }));
        alert(`✅ Selamat datang, ${found[0]}!`);
        window.location.href = "index.html";
      } else {
        alert("❌ Login gagal: Username atau PIN salah.");
      }
    })
    .catch(error => {
      console.error("Login error:", error);
      alert("🚨 Gagal terhubung ke server. Cek koneksi & akses Sheet publik.");
    });
}

function cekLogin() {
  const login = localStorage.getItem("login");
  if (!login) {
    alert("⚠️ Anda belum login.");
    window.location.href = "login.html";
  }
}
