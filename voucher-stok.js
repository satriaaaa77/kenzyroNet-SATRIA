/* =====================================================
   STOK VOUCHER dari MikroTik
   -----------------------------------------------------
   Isi per paket: SATU voucher per baris.
   - Jika voucher hanya punya kode (user = password):   kode123
   - Jika punya username & password:                    user123 pass456
     (pemisah boleh spasi, koma, titik dua, atau tab)
   - Baris yang diawali tanda # diabaikan (catatan).
   Kunci paket (p12, p24, ...) harus sama dengan id paket di
   js/main.js dan sama dengan profile MikroTik-nya:
     p12 = 12 jam | p24 = 24 jam | p3d = 3 hari
     p7  = 1 minggu | p14 = 2 minggu | p30 = 1 bulan

   PERINGATAN: file ini bisa dibaca siapa saja yang membuka
   website. Untuk UTS gunakan voucher percobaan, jangan voucher
   yang benar-benar dijual.
   ===================================================== */
const nama_STOK = {
  p12: `
    # ganti dengan kode asli dari MikroTik (profile 12 jam)
    contoh12a
    contoh12b
    contoh12c
  `,
  p24: `
    contoh24a
    contoh24b
    contoh24c
  `,
  p3d: `
    contoh3da
    contoh3db
  `,
  p7: `
    contoh7a
    contoh7b
  `,
  p14: `
    userdua1 sandi1
    userdua2 sandi2
  `,
  p30: `
    contoh30a
    contoh30b
  `
};
