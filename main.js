/* =====================================================
   kenzyroNet - main.js
   Data paket, navigasi, pembelian voucher (simulasi),
   cek voucher, FAQ, form kontak.
   Data disimpan di localStorage (tanpa server).
   ===================================================== */
'use strict';

/* ---------- Data paket (satu sumber untuk semua halaman) ---------- */
const nama_PAKET = [
  {id:'p12', nama:'Hemat 12 Jam', durasi:'12 jam',   harga:3000,  kuota:'Unlimited', fitur:['Cocok untuk cek email & chat','Langsung aktif setelah login','Aktif 1 hari sejak dibeli']},
  {id:'p24', nama:'Harian',       durasi:'24 jam',   harga:5000,  kuota:'Unlimited', fitur:['Streaming & video call lancar','Hemat untuk pemakaian harian','Aktif 3 hari sejak dibeli'], pop:true},
  {id:'p3d', nama:'3 Hari',       durasi:'3 hari',   harga:10000, kuota:'Unlimited', fitur:['Pas untuk akhir pekan','Langsung aktif setelah login','Aktif 7 hari sejak dibeli']},
  {id:'p7',  nama:'Mingguan',     durasi:'1 minggu', harga:20000, kuota:'Unlimited', fitur:['Ideal untuk belajar & kerja','Langsung aktif setelah login','Aktif 14 hari sejak dibeli']},
  {id:'p14', nama:'2 Minggu',     durasi:'2 minggu', harga:35000, kuota:'Unlimited', fitur:['Hemat untuk pemakaian rutin','Langsung aktif setelah login','Aktif 30 hari sejak dibeli']},
  {id:'p30', nama:'Bulanan',      durasi:'1 bulan',  harga:60000, kuota:'Unlimited', fitur:['Paling hemat per hari','Langsung aktif setelah login','Bantuan teknis prioritas']}
];
const nama_METODE = [
  {id:'qris', nama:'QRIS',            ket:'Semua e-wallet & m-banking', biaya:0},
  {id:'dana', nama:'E-Wallet (DANA / OVO / GoPay)', ket:'Bayar lewat aplikasi', biaya:0},
  {id:'bca',  nama:'Transfer Bank',   ket:'BCA / BRI / Mandiri', biaya:1500}
];
const nama_PROMO = {HEMAT10:{persen:10,ket:'Diskon 10%'}, MAHASISWA:{persen:15,ket:'Diskon mahasiswa 15%'}, BARU5K:{potong:1000,ket:'Potongan Rp1.000 pengguna baru'}};
const nama_KEY = 'nama_kenzyro_orders';
const nama_KEY_MSG = 'nama_kenzyro_pesan';

/* ---------- Helper ---------- */
const nama_$  = (s, r=document) => r.querySelector(s);
const nama_$$ = (s, r=document) => [...r.querySelectorAll(s)];
const nama_rp = n => 'Rp' + Number(n).toLocaleString('id-ID');
const nama_find = id => nama_PAKET.find(p => p.id === id);
function nama_load(key){ try { return JSON.parse(localStorage.getItem(key)) || []; } catch(e){ return []; } }
function nama_save(key, v){ try { localStorage.setItem(key, JSON.stringify(v)); } catch(e){} }
function nama_toast(msg){
  let t = nama_$('#nama_toast');
  if(!t){ t = document.createElement('div'); t.id='nama_toast'; document.body.appendChild(t); }
  t.textContent = msg; t.classList.add('nama_show');
  clearTimeout(t._h); t._h = setTimeout(()=>t.classList.remove('nama_show'), 2600);
}
function nama_esc(s){ return String(s).replace(/[&<>"']/g, c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c])); }
/* ---------- Stok voucher dari MikroTik (data ada di js/voucher-stok.js) ---------- */
const nama_KEY_PAKAI = 'nama_kenzyro_terpakai';
function nama_stokPaket(id){
  const mentah = (typeof nama_STOK !== 'undefined' && nama_STOK[id]) ? nama_STOK[id] : '';
  return String(mentah).split('\n').map(b => b.trim()).filter(b => b && b[0] !== '#')
    .map(b => { const [user, pass] = b.split(/[\s,;:|]+/); return {user, pass: pass || null}; });
}
function nama_sisaStok(id){
  const pakai = nama_load(nama_KEY_PAKAI);
  return nama_stokPaket(id).filter(v => !pakai.includes(v.user)).length;
}
function nama_ambilStok(id){
  const pakai = nama_load(nama_KEY_PAKAI), v = nama_stokPaket(id).find(x => !pakai.includes(x.user));
  if(!v) return null;
  pakai.push(v.user); nama_save(nama_KEY_PAKAI, pakai);
  return v;
}
function nama_salin(teks){
  if(navigator.clipboard){ navigator.clipboard.writeText(teks).then(()=>nama_toast('Kode disalin ✓')).catch(()=>nama_toast('Gagal menyalin')); }
  else { nama_toast('Salin manual: ' + teks); }
}
function nama_statusBadge(s){
  const m = {lunas:['s-lunas','Aktif / Lunas'], menunggu:['s-tunggu','Menunggu pembayaran'], batal:['s-batal','Kedaluwarsa']};
  const [c,t] = m[s] || m.batal; return `<span class="nama_status ${c}">${t}</span>`;
}

/* ---------- Navigasi mobile, scroll, reveal ---------- */
function nama_initNav(){
  const burger = nama_$('.nama_burger'), menu = nama_$('.nama_menu');
  if(burger){
    burger.addEventListener('click', () => {
      const open = menu.classList.toggle('nama_open');
      burger.classList.toggle('nama_open', open);
      burger.setAttribute('aria-expanded', open);
    });
    nama_$$('.nama_menu a').forEach(a => a.addEventListener('click', () => { menu.classList.remove('nama_open'); burger.classList.remove('nama_open'); }));
  }
  const up = document.createElement('button');
  up.id = 'nama_totop'; up.setAttribute('aria-label','Kembali ke atas'); up.textContent = '↑';
  up.onclick = () => window.scrollTo({top:0});
  document.body.appendChild(up);
  addEventListener('scroll', () => up.classList.toggle('nama_show', scrollY > 500), {passive:true});
}
function nama_initReveal(){
  const els = nama_$$('.nama_reveal');
  if(!('IntersectionObserver' in window)){ els.forEach(e=>e.classList.add('nama_in')); return; }
  const io = new IntersectionObserver(es => es.forEach(e => { if(e.isIntersecting){ e.target.classList.add('nama_in'); io.unobserve(e.target); } }), {threshold:.12});
  els.forEach(e => io.observe(e));
}
function nama_initCounter(){
  nama_$$('[data-count]').forEach(el => {
    const end = +el.dataset.count, suf = el.dataset.suffix || '';
    const io = new IntersectionObserver(([e]) => {
      if(!e.isIntersecting) return; io.disconnect();
      const t0 = performance.now(), dur = 1400;
      (function tick(t){
        const p = Math.min((t - t0)/dur, 1), v = Math.floor(end * (1 - Math.pow(1-p,3)));
        el.textContent = v.toLocaleString('id-ID') + suf;
        if(p < 1) requestAnimationFrame(tick); else el.textContent = end.toLocaleString('id-ID') + suf;
      })(t0);
    });
    io.observe(el);
  });
}

/* ---------- Render kartu paket ---------- */
function nama_renderPaket(target, limit){
  const box = nama_$(target); if(!box) return;
  const list = limit ? nama_PAKET.slice(0, limit) : nama_PAKET;
  box.innerHTML = list.map(p => `
    <article class="nama_card nama_pkg nama_reveal ${p.pop?'nama_pop':''}">
      ${p.pop?'<span class="nama_pkg-tag">PALING LARIS</span>':''}
      <h3>${p.nama}</h3>
      <div class="nama_pkg-dur">Aktif ${p.durasi}</div>
      <div class="nama_price">${nama_rp(p.harga)}</div>
      <ul>${p.fitur.map(f=>`<li>${f}</li>`).join('')}<li>Kuota ${p.kuota}</li></ul>
      ${nama_sisaStok(p.id) > 0
        ? `<a class="nama_btn ${p.pop?'nama_btn-brand':'nama_btn-primary'} nama_btn-block" href="beli.html?paket=${p.id}">Beli Sekarang</a>`
        : `<button class="nama_btn nama_btn-ghost nama_btn-block" disabled>Stok Habis</button>`}
    </article>`).join('');
}

/* ---------- Halaman BELI ---------- */
function nama_initBeli(){
  const form = nama_$('#nama_formBeli'); if(!form) return;
  const state = {paket:null, metode:'qris', promo:null, order:null, timer:null};

  // pilihan paket
  nama_$('#nama_pilihPaket').innerHTML = nama_PAKET.map(p => { const sisa = nama_sisaStok(p.id); return `
    <label class="nama_opt" ${sisa ? '' : 'style="opacity:.55"'}><input type="radio" name="paket" value="${p.id}" ${sisa ? '' : 'disabled'}>
      <span><b>${p.nama}</b><small>${p.durasi} · ${sisa ? 'Stok ' + sisa : 'Stok habis'}</small></span>
      <span class="nama_opt-price">${nama_rp(p.harga)}</span></label>`; }).join('');
  nama_$('#nama_pilihMetode').innerHTML = nama_METODE.map((m,i) => `
    <label class="nama_opt"><input type="radio" name="metode" value="${m.id}" ${i===0?'checked':''}>
      <span><b>${m.nama}</b><small>${m.ket}</small></span>
      <span class="nama_opt-price">${m.biaya?'+ '+nama_rp(m.biaya):'Gratis'}</span></label>`).join('');

  const pre = new URLSearchParams(location.search).get('paket');
  let first = nama_$(`input[name=paket][value="${pre}"]:not(:disabled)`) || nama_$('input[name=paket]:not(:disabled)');
  if(!first){ nama_$('#nama_formBeli').innerHTML = '<div class="nama_empty">Maaf, stok voucher sedang habis. Silakan hubungi kami lewat halaman Kontak.</div>'; return; }
  first.checked = true;

  function hitung(){
    const p = nama_find(nama_$('input[name=paket]:checked').value);
    const m = nama_METODE.find(x => x.id === nama_$('input[name=metode]:checked').value);
    let diskon = 0;
    if(state.promo){ diskon = state.promo.persen ? Math.round(p.harga*state.promo.persen/100) : state.promo.potong; }
    const total = Math.max(p.harga - diskon, 0) + m.biaya;
    state.paket = p; state.metode = m; state.total = total; state.diskon = diskon;
    nama_$('#nama_sPaket').textContent = p.nama;
    nama_$('#nama_sDurasi').textContent = p.durasi;
    nama_$('#nama_sHarga').textContent = nama_rp(p.harga);
    nama_$('#nama_sDiskon').textContent = diskon ? '− ' + nama_rp(diskon) : '–';
    nama_$('#nama_sBiaya').textContent = m.biaya ? nama_rp(m.biaya) : 'Gratis';
    nama_$('#nama_sTotal').textContent = nama_rp(total);
  }
  form.addEventListener('change', hitung); hitung();

  nama_$('#nama_btnPromo').addEventListener('click', () => {
    const kode = nama_$('#nama_promo').value.trim().toUpperCase(), msg = nama_$('#nama_promoMsg');
    if(nama_PROMO[kode]){ state.promo = nama_PROMO[kode]; msg.className='nama_msg ok'; msg.textContent = '✓ ' + nama_PROMO[kode].ket + ' diterapkan'; }
    else { state.promo = null; msg.className='nama_msg bad'; msg.textContent = kode ? 'Kode promo tidak valid' : 'Masukkan kode promo dulu'; }
    hitung();
  });

  const cek = (id, ok) => nama_$(id).closest('.nama_field').classList.toggle('nama_invalid', !ok);
  form.addEventListener('submit', e => {
    e.preventDefault();
    const nama = nama_$('#nama_nama').value.trim(), hp = nama_$('#nama_hp').value.trim().replace(/[\s-]/g,''), email = nama_$('#nama_email').value.trim();
    const okNama = nama.length >= 3, okHp = /^(\+62|62|0)8[1-9][0-9]{7,11}$/.test(hp), okEmail = email === '' || /^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email);
    cek('#nama_nama', okNama); cek('#nama_hp', okHp); cek('#nama_email', okEmail);
    if(!(okNama && okHp && okEmail)){ nama_toast('Periksa kembali isian Anda'); return; }

    if(nama_sisaStok(state.paket.id) < 1){ nama_toast('Stok paket ini habis'); return; }
    const order = {id:'ORD-' + Date.now().toString(36).toUpperCase(), kode:null, sandi:null, paket:state.paket.id, nama, hp, email, metode:state.metode.nama, total:state.total,
                   status:'menunggu', dibuat:Date.now(), batas:Date.now() + 15*60*1000};
    const all = nama_load(nama_KEY); all.unshift(order); nama_save(nama_KEY, all);
    state.order = order;
    tampilBayar(order);
  });

  function tampilStage(id){
    nama_$$('.nama_stage').forEach(s => s.classList.remove('nama_show'));
    nama_$(id).classList.add('nama_show');
    window.scrollTo({top: nama_$('#nama_area').offsetTop - 90, behavior:'smooth'});
  }
  function qrSvg(seed){
    // pola QR dekoratif (BUKAN QR asli) untuk simulasi
    let s = 0; for(const c of seed) s = (s*31 + c.charCodeAt(0)) >>> 0;
    const rnd = () => (s = (s*1664525 + 1013904223) >>> 0) / 4294967296, n = 21, u = 8;
    let r = '';
    const finder = (x,y) => `<rect x="${x*u}" y="${y*u}" width="${7*u}" height="${7*u}" fill="#0a1b2a"/><rect x="${(x+1)*u}" y="${(y+1)*u}" width="${5*u}" height="${5*u}" fill="#fff"/><rect x="${(x+2)*u}" y="${(y+2)*u}" width="${3*u}" height="${3*u}" fill="#0a1b2a"/>`;
    for(let y=0;y<n;y++) for(let x=0;x<n;x++){
      const inF = (x<8&&y<8)||(x>12&&y<8)||(x<8&&y>12); if(inF) continue;
      if(rnd() > .5) r += `<rect x="${x*u}" y="${y*u}" width="${u}" height="${u}" fill="#0a1b2a"/>`;
    }
    return `<svg viewBox="0 0 ${n*u} ${n*u}" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="Contoh kode QR pembayaran (simulasi)">${r}${finder(0,0)}${finder(14,0)}${finder(0,14)}</svg>`;
  }
  function tampilBayar(o){
    const p = nama_find(o.paket);
    nama_$('#nama_payInfo').innerHTML = `Pesanan <b>${o.id}</b> · ${p.nama} · metode <b>${nama_esc(o.metode)}</b>`;
    nama_$('#nama_payTotal').textContent = nama_rp(o.total);
    nama_$('#nama_qr').innerHTML = qrSvg(o.id);
    tampilStage('#nama_stagePay');
    clearInterval(state.timer);
    const tick = () => {
      const sisa = Math.max(0, o.batas - Date.now()), m = String(Math.floor(sisa/60000)).padStart(2,'0'), d = String(Math.floor(sisa%60000/1000)).padStart(2,'0');
      nama_$('#nama_timer').textContent = m + ':' + d;
      if(sisa <= 0){ clearInterval(state.timer); setStatus(o.id, 'batal'); nama_$('#nama_btnBayar').disabled = true; nama_toast('Waktu pembayaran habis'); }
    };
    tick(); state.timer = setInterval(tick, 1000);
  }
  function setStatus(id, st, extra){
    const all = nama_load(nama_KEY), o = all.find(x => x.id === id); if(o){ o.status = st; Object.assign(o, extra || {}); nama_save(nama_KEY, all); }
  }
  nama_$('#nama_btnBayar').addEventListener('click', () => {
    const btn = nama_$('#nama_btnBayar'); btn.disabled = true; btn.textContent = 'Memverifikasi pembayaran…';
    setTimeout(() => {
      clearInterval(state.timer);
      const o = state.order, p = nama_find(o.paket), v = nama_ambilStok(o.paket);
      if(!v){ setStatus(o.id, 'batal'); nama_toast('Stok habis. Hubungi admin untuk pengembalian dana.'); btn.disabled = false; btn.textContent = 'Saya Sudah Bayar (Simulasi)'; tampilStage('#nama_stageForm'); return; }
      o.kode = v.user; o.sandi = v.pass; setStatus(o.id, 'lunas', {kode:v.user, sandi:v.pass});
      nama_$('#nama_outKode').textContent = o.kode;
      nama_$('#nama_outSandi').style.display = o.sandi ? 'block' : 'none';
      nama_$('#nama_outSandiNilai').textContent = o.sandi || '';
      nama_$('#nama_outPaket').textContent = `${p.nama} · ${p.durasi}`;
      const teks = o.sandi ? `${o.kode} / ${o.sandi}` : o.kode;
      nama_$('#nama_btnSalin').onclick = () => nama_salin(o.kode);
      nama_$('#nama_btnWa').href = 'https://wa.me/?text=' + encodeURIComponent(`Voucher WiFi kenzyroNet saya: ${teks} (${p.nama})`);
      tampilStage('#nama_stageDone');
      btn.disabled = false; btn.textContent = 'Saya Sudah Bayar (Simulasi)';
    }, 1600);
  });
  nama_$('#nama_btnBatal').addEventListener('click', () => {
    clearInterval(state.timer); setStatus(state.order.id, 'batal'); tampilStage('#nama_stageForm'); nama_toast('Pesanan dibatalkan');
  });
  nama_$$('.nama_btnBaru').forEach(b => b.addEventListener('click', () => { form.reset(); first.checked = true; state.promo = null; nama_$('#nama_promoMsg').textContent=''; hitung(); tampilStage('#nama_stageForm'); }));
}

/* ---------- Halaman CEK VOUCHER ---------- */
function nama_initCek(){
  const form = nama_$('#nama_formCek'); if(!form) return;
  const out = nama_$('#nama_hasil'), hist = nama_$('#nama_riwayat');
  const kartu = o => { const p = nama_find(o.paket) || {nama:'-',durasi:'-'};
    return `<div class="nama_hist-item"><div><code>${o.kode ? nama_esc(o.kode) : 'Kode tampil setelah bayar'}</code>${o.sandi ? ` <span style="font-size:.85rem;color:var(--nama_muted)">· sandi: <code>${nama_esc(o.sandi)}</code></span>` : ''}<div style="font-size:.88rem;color:var(--nama_muted)">${p.nama} · ${p.durasi} · ${new Date(o.dibuat).toLocaleString('id-ID',{dateStyle:'medium',timeStyle:'short'})}</div></div>
    <div style="text-align:right"><b style="font-family:Sora">${nama_rp(o.total)}</b><br>${nama_statusBadge(o.status)}</div></div>`; };
  function riwayat(){
    const all = nama_load(nama_KEY);
    hist.innerHTML = all.length ? all.map(kartu).join('') : '<div class="nama_empty">Belum ada riwayat pembelian di perangkat ini.</div>';
  }
  form.addEventListener('submit', e => {
    e.preventDefault();
    const q = nama_$('#nama_q').value.trim().toUpperCase().replace(/\s/g,''), f = nama_$('#nama_q').closest('.nama_field');
    f.classList.toggle('nama_invalid', q.length < 4);
    if(q.length < 4) return;
    const hasil = nama_load(nama_KEY).filter(o => (o.kode && o.kode.toUpperCase() === q) || o.hp.replace(/^(\+62|62)/,'0') === q.replace(/^(\+62|62)/,'0'));
    out.innerHTML = hasil.length ? '<h3 style="margin-bottom:6px">Hasil pencarian</h3><div class="nama_hist">' + hasil.map(kartu).join('') + '</div>'
      : '<div class="nama_empty">Kode atau nomor tidak ditemukan. Pastikan penulisan sudah benar.</div>';
  });
  nama_$('#nama_btnHapus').addEventListener('click', () => { if(confirm('Hapus semua riwayat di perangkat ini?')){ nama_save(nama_KEY, []); riwayat(); out.innerHTML=''; nama_toast('Riwayat dihapus'); } });
  riwayat();
}

/* ---------- Tab (cara kerja) ---------- */
function nama_initTabs(){
  nama_$$('.nama_tab[data-panel]').forEach(t => t.addEventListener('click', () => {
    nama_$$('.nama_tab[data-panel]').forEach(x => x.classList.remove('nama_on')); nama_$$('.nama_panel').forEach(x => x.classList.remove('nama_on'));
    t.classList.add('nama_on'); nama_$('#' + t.dataset.panel).classList.add('nama_on');
  }));
}

/* ---------- FAQ ---------- */
function nama_initFaq(){
  const list = nama_$$('.nama_acc'); if(!list.length) return;
  list.forEach(a => a.querySelector('.nama_acc-q').addEventListener('click', () => {
    const open = a.classList.toggle('nama_open'), box = a.querySelector('.nama_acc-a');
    box.style.maxHeight = open ? box.scrollHeight + 'px' : 0;
  }));
  let kat = 'semua';
  const apply = () => {
    const q = nama_$('#nama_faqCari').value.toLowerCase(); let n = 0;
    list.forEach(a => { const ok = (kat==='semua' || a.dataset.kat===kat) && a.textContent.toLowerCase().includes(q); a.style.display = ok ? '' : 'none'; if(ok) n++; });
    nama_$('#nama_faqKosong').style.display = n ? 'none' : 'block';
  };
  nama_$('#nama_faqCari').addEventListener('input', apply);
  nama_$$('.nama_tab[data-kat]').forEach(t => t.addEventListener('click', () => {
    nama_$$('.nama_tab[data-kat]').forEach(x => x.classList.remove('nama_on')); t.classList.add('nama_on'); kat = t.dataset.kat; apply();
  }));
}

/* ---------- Form KONTAK ---------- */
function nama_initKontak(){
  const form = nama_$('#nama_formKontak'); if(!form) return;
  const msg = nama_$('#nama_msgInput'), cnt = nama_$('#nama_cnt');
  msg.addEventListener('input', () => cnt.textContent = msg.value.length + '/500');
  const set = (id, ok) => nama_$(id).closest('.nama_field').classList.toggle('nama_invalid', !ok);
  form.addEventListener('submit', e => {
    e.preventDefault();
    const d = {nama:nama_$('#nama_kNama').value.trim(), email:nama_$('#nama_kEmail').value.trim(), topik:nama_$('#nama_kTopik').value, pesan:msg.value.trim()};
    const ok1 = d.nama.length >= 3, ok2 = /^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(d.email), ok3 = d.topik !== '', ok4 = d.pesan.length >= 10;
    set('#nama_kNama', ok1); set('#nama_kEmail', ok2); set('#nama_kTopik', ok3); set('#nama_msgInput', ok4);
    if(!(ok1&&ok2&&ok3&&ok4)) return;
    const all = nama_load(nama_KEY_MSG); all.unshift({...d, waktu:Date.now()}); nama_save(nama_KEY_MSG, all);
    const ok = nama_$('#nama_kontakOk');
    ok.innerHTML = `✓ Terima kasih, <b>${nama_esc(d.nama)}</b>! Pesan Anda sudah kami terima. Kami membalas ke ${nama_esc(d.email)} maksimal 1×24 jam.
      <br><a style="text-decoration:underline;font-weight:700" target="_blank" rel="noopener" href="https://wa.me/6281234567890?text=${encodeURIComponent('Halo kenzyroNet, ' + d.pesan)}">Butuh cepat? Lanjutkan lewat WhatsApp →</a>`;
    ok.classList.add('nama_show'); form.reset(); cnt.textContent = '0/500';
    ok.scrollIntoView({behavior:'smooth', block:'center'});
  });
}

/* ---------- Jalankan ---------- */
document.addEventListener('DOMContentLoaded', () => {
  nama_initNav();
  nama_renderPaket('#nama_paketHome', 3);
  nama_renderPaket('#nama_paketAll');
  nama_initBeli(); nama_initCek(); nama_initTabs(); nama_initFaq(); nama_initKontak();
  nama_$$('.nama_year').forEach(e => e.textContent = new Date().getFullYear());
  nama_initReveal(); nama_initCounter();
});
