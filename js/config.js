const CONFIG = {
  POST_URL: "https://script.google.com/macros/s/AKfycbxLSA5ISAgNAJksBUWHEwkjr2uNSJkhjW28Yv9hMItDRG-a_rWEszkxMCT2c1VuLjEU/exec",
  SHEET_ID: '1xfx3SaiOJ6vVEvG7pPIm0tpLtqW606ovJryc1jcCnQc', // ID Google Sheets kamu
  API_KEY: 'AIzaSyB_5ZjfuA66lVxiPDTmU8Wst02WLs1z2Hg',       // API key Google Sheets
  ENDPOINTS: {}
};

// Update endpoint dinamis biar nggak nyeduh dua kali
CONFIG.ENDPOINTS = {
  pengguna: `https://sheets.googleapis.com/v4/spreadsheets/${CONFIG.SHEET_ID}/values/pengguna?key=${CONFIG.API_KEY}`,
  produk: `https://sheets.googleapis.com/v4/spreadsheets/${CONFIG.SHEET_ID}/values/produk?key=${CONFIG.API_KEY}`,
  penjualan: `https://sheets.googleapis.com/v4/spreadsheets/${CONFIG.SHEET_ID}/values/penjualan?key=${CONFIG.API_KEY}`,
  pengaturan: `https://sheets.googleapis.com/v4/spreadsheets/${CONFIG.SHEET_ID}/values/pengaturan?key=${CONFIG.API_KEY}`,
};
