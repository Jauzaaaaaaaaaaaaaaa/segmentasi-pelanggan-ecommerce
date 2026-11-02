/* Dasbor segmentasi. Semua angka berasal dari data/segmen.js, hasil seg_build dari data penelitian. */
(function () {
  var S = window.SEG, COL = ['var(--s0)', 'var(--s1)', 'var(--s2)'];
  var el = function (id) { return document.getElementById(id); };
  var fmt = function (n) { return Math.round(n).toLocaleString('id-ID'); };
  var rp = function (n) { return 'Rp ' + fmt(n); };
  var pct = function (n) { return n.toLocaleString('id-ID', { maximumFractionDigits: 1 }) + '%'; };

  /* Tooltip bersama */
  var tip = el('tip');
  function bindTip(root) {
    root.addEventListener('pointermove', function (e) {
      var t = e.target.closest && e.target.closest('[data-tip]');
      if (!t) { tip.hidden = true; return; }
      tip.hidden = false;
      tip.innerHTML = t.getAttribute('data-tip');
      var x = Math.min(e.clientX + 14, innerWidth - tip.offsetWidth - 8);
      tip.style.left = x + 'px';
      tip.style.top = Math.max(8, e.clientY - tip.offsetHeight - 12) + 'px';
    });
    root.addEventListener('pointerleave', function () { tip.hidden = true; });
  }

  /* Ringkasan */
  var top = S.segmen[2];
  el('kpis').innerHTML = [
    ['Transaksi dianalisis', fmt(S.n)],
    ['Segmen', fmt(S.segmen.length)],
    ['Median belanja', rp(S.median_belanja)],
    ['Provinsi', fmt(S.provinsi_n)]
  ].map(function (k) { return '<div class="db-kpi"><span>' + k[0] + '</span><b>' + k[1] + '</b></div>'; }).join('');

  /* Porsi transaksi dan omzet: batang berpasangan pada satu sumbu */
  (function () {
    /* Lebar mengikuti wadah; di layar sempit nama segmen pindah ke atas batang */
    var W = Math.max(300, Math.min(900, el('share').clientWidth || 900)), narrow = W < 560;
    var rowH = narrow ? 92 : 74, L = narrow ? 0 : 190, R = 60, TOP = narrow ? 18 : 0;
    var H = S.segmen.length * rowH + 22, sx = function (v) { return (W - L - R) * v / 70; };
    var h = '';
    [0, 20, 40, 60].forEach(function (v) {
      var x = L + sx(v);
      h += '<line class="db-grid" x1="' + x + '" x2="' + x + '" y1="0" y2="' + (H - 20) + '"/><text x="' + x + '" y="' + (H - 4) + '" text-anchor="middle">' + v + '%</text>';
    });
    S.segmen.forEach(function (s, i) {
      var y = i * rowH + 10 + TOP;
      h += narrow
        ? '<text class="lbl" x="0" y="' + (y - 6) + '">' + s.nama + '</text>'
        : '<text class="lbl" x="' + (L - 14) + '" y="' + (y + 25) + '" text-anchor="end">' + s.nama + '</text>';
      h += '<rect x="' + L + '" y="' + y + '" width="' + sx(s.persen) + '" height="22" rx="4" fill="#b6b2a5" data-tip="' + s.nama + '<br>Porsi transaksi ' + pct(s.persen) + '"/>';
      h += '<text class="lbl" x="' + (L + sx(s.persen) + 7) + '" y="' + (y + 16) + '">' + pct(s.persen) + '</text>';
      h += '<rect x="' + L + '" y="' + (y + 24) + '" width="' + sx(s.persen_omzet) + '" height="22" rx="4" fill="#1a1d21" data-tip="' + s.nama + '<br>Porsi omzet ' + pct(s.persen_omzet) + '"/>';
      h += '<text class="lbl" x="' + (L + sx(s.persen_omzet) + 7) + '" y="' + (y + 40) + '">' + pct(s.persen_omzet) + '</text>';
    });
    el('share').innerHTML = '<svg viewBox="0 0 ' + W + ' ' + H + '" role="img" aria-label="Porsi transaksi dan omzet per segmen">' + h + '</svg>';
    bindTip(el('share'));
  })();

  /* Profil segmen */
  el('segs').innerHTML = S.segmen.map(function (s, i) {
    return '<article class="db-seg" style="--c:' + COL[i] + '"><h3>' + s.nama + '</h3><dl>' +
      '<div><dt>Transaksi</dt><dd>' + fmt(s.jumlah) + '</dd></div>' +
      '<div><dt>Median belanja</dt><dd>' + rp(s.median_belanja) + '</dd></div>' +
      '<div><dt>Median barang</dt><dd>' + fmt(s.median_qty) + '</dd></div>' +
      '<div><dt>Median ongkir</dt><dd>' + rp(s.median_ongkir) + '</dd></div>' +
      '<div><dt>Ongkir per belanja</dt><dd>' + pct(s.rasio_ongkir) + '</dd></div>' +
      '<div><dt>Porsi omzet</dt><dd>' + pct(s.persen_omzet) + '</dd></div></dl></article>';
  }).join('');

  var legend = '';
  S.model.nama.forEach(function (n, i) { legend += '<span><i style="background:' + COL[i] + '"></i>' + n + '</span>'; });
  el('leg1').innerHTML = legend;
  el('leg2').innerHTML = legend;

  /* Provinsi: batang bertumpuk horizontal */
  function drawProv(mode) {
    var W = Math.max(300, Math.min(560, el('prov').clientWidth || 560)), rowH = 30, L = 124, R = 46, H = S.provinsi.length * rowH + 24;
    var max = mode === 'persen' ? 100 : S.provinsi[0].total;
    var sx = function (v) { return (W - L - R) * v / max; };
    var ticks = mode === 'persen' ? [0, 50, 100] : [0, 2000, 4000, 6000].filter(function (t) { return t <= max; });
    var h = '';
    ticks.forEach(function (t) {
      var x = L + sx(t);
      h += '<line class="db-grid" x1="' + x + '" x2="' + x + '" y1="0" y2="' + (H - 20) + '"/><text x="' + x + '" y="' + (H - 4) + '" text-anchor="middle">' + (mode === 'persen' ? t + '%' : fmt(t)) + '</text>';
    });
    S.provinsi.forEach(function (p, i) {
      var y = i * rowH + 4, x = L;
      h += '<text class="lbl" x="' + (L - 8) + '" y="' + (y + 15) + '" text-anchor="end">' + p.provinsi.replace('Dki', 'DKI') + '</text>';
      p.seg.forEach(function (v, k) {
        var val = mode === 'persen' ? v / p.total * 100 : v, w = sx(val);
        h += '<rect x="' + x + '" y="' + y + '" width="' + Math.max(0, w - 2) + '" height="20" rx="2" fill="' + COL[k] + '" data-tip="' + p.provinsi.replace('Dki', 'DKI') + '<br>' + S.model.nama[k] + ': ' + fmt(v) + ' (' + pct(v / p.total * 100) + ')"/>';
        x += w;
      });
      if (mode !== 'persen') h += '<text x="' + (x + 5) + '" y="' + (y + 15) + '">' + fmt(p.total) + '</text>';
    });
    el('prov').innerHTML = '<svg viewBox="0 0 ' + W + ' ' + H + '" role="img" aria-label="Transaksi per provinsi dan segmen">' + h + '</svg>';
  }
  drawProv('total');
  bindTip(el('prov'));
  document.querySelectorAll('.db-toggle button').forEach(function (b) {
    b.addEventListener('click', function () {
      document.querySelectorAll('.db-toggle button').forEach(function (x) { x.classList.toggle('is-on', x === b); });
      drawProv(b.getAttribute('data-m'));
    });
  });

  /* Sebaran transaksi, skala log pada kedua sumbu */
  (function () {
    var W = Math.max(300, Math.min(560, el('scatter').clientWidth || 560)), H = 370, L = 56, B = 40, T = 8, R = 10;
    var xs = S.sampel.map(function (d) { return d[0]; }), ys = S.sampel.map(function (d) { return Math.log10(d[1]); });
    var x0 = Math.floor(Math.min.apply(null, xs)), x1 = Math.ceil(Math.max.apply(null, xs)), y1 = Math.ceil(Math.max.apply(null, ys));
    var sx = function (v) { return L + (W - L - R) * (v - x0) / (x1 - x0); }, sy = function (v) { return H - B - (H - B - T) * v / y1; };
    var h = '', i;
    for (i = x0; i <= x1; i++) {
      h += '<line class="db-grid" x1="' + sx(i) + '" x2="' + sx(i) + '" y1="' + T + '" y2="' + (H - B) + '"/><text x="' + sx(i) + '" y="' + (H - B + 16) + '" text-anchor="middle">' + (Math.pow(10, i) >= 1e6 ? Math.pow(10, i) / 1e6 + ' jt' : Math.pow(10, i) >= 1e3 ? Math.pow(10, i) / 1e3 + ' rb' : Math.pow(10, i)) + '</text>';
    }
    for (i = 0; i <= y1; i++) {
      h += '<line class="db-grid" x1="' + L + '" x2="' + (W - R) + '" y1="' + sy(i) + '" y2="' + sy(i) + '"/><text x="' + (L - 7) + '" y="' + (sy(i) + 4) + '" text-anchor="end">' + Math.pow(10, i) + '</text>';
    }
    h += '<text x="' + ((W + L) / 2) + '" y="' + (H - 6) + '" text-anchor="middle">Total pembayaran (Rp)</text>';
    h += '<text transform="translate(13 ' + ((H - B) / 2) + ') rotate(-90)" text-anchor="middle">Jumlah barang</text>';
    /* Sedikit acak vertikal agar jumlah barang yang sama tidak menumpuk jadi satu garis */
    var seed = 7, rnd = function () { seed = (seed * 16807) % 2147483647; return seed / 2147483647; };
    S.sampel.forEach(function (d) {
      var y = sy(Math.log10(d[1])) + (rnd() - .5) * 7;
      var x = sx(d[0] + (rnd() - .5) * .46);
      h += '<circle cx="' + x.toFixed(1) + '" cy="' + y.toFixed(1) + '" r="3" fill="' + COL[d[2]] + '" fill-opacity=".62" data-tip="' + S.model.nama[d[2]] + '<br>' + d[1] + ' barang"/>';
    });
    el('scatter').innerHTML = '<svg viewBox="0 0 ' + W + ' ' + H + '" role="img" aria-label="Sebaran total pembayaran dan jumlah barang per segmen">' + h + '</svg>';
    bindTip(el('scatter'));
  })();

  /* Klasifikasi transaksi baru dengan model asli */
  (function () {
    var M = S.model, f = el('form-coba'), out = el('hasil');
    function hitung() {
      var v = [+f.bayar.value, +f.qty.value, +f.ongkir.value];
      if (v.some(function (n) { return !(n > 0); })) { out.innerHTML = '<small>Isi ketiga kolom dengan angka lebih dari nol.</small>'; return; }
      var z = v.map(function (n, i) { return (Math.log1p(n) - M.mean[i]) / M.std[i]; });
      var d = M.pusat.map(function (c) { return Math.sqrt(c.reduce(function (a, p, i) { return a + Math.pow(z[i] - p, 2); }, 0)); });
      var best = d.indexOf(Math.min.apply(null, d));
      out.style.setProperty('--c', COL[best]);
      out.innerHTML = '<small>Masuk segmen</small><b>' + M.nama[best] + '</b><small>Jarak ke pusat klaster ' + d[best].toLocaleString('id-ID', { maximumFractionDigits: 2 }) + '. Segmen ini ' + pct(S.segmen[best].persen) + ' dari seluruh transaksi.</small>';
    }
    f.addEventListener('input', hitung);
    f.addEventListener('submit', function (e) { e.preventDefault(); });
    hitung();
  })();

  /* Evaluasi: tiga grafik kecil, masing-masing satu sumbu */
  (function () {
    var E = S.evaluasi;
    el('leg3').innerHTML = '<span><i style="background:var(--s0)"></i>K-Means</span><span><i style="background:var(--s2)"></i>K-Medoids</span>';
    el('eval').innerHTML = [['RMSE', 'rmse', 'makin kecil makin baik'], ['Silhouette', 'sil', 'makin besar makin baik'], ['Davies-Bouldin', 'dbi', 'makin kecil makin baik']].map(function (m) {
      var a = E[m[1] + '_km'], b = E[m[1] + '_md'], all = a.concat(b);
      var lo = Math.min.apply(null, all), hi = Math.max.apply(null, all), pad = (hi - lo) * .12;
      lo -= pad; hi += pad;
      var W = 360, H = 200, L = 40, R = 8, T = 8, B = 26;
      var sx = function (k) { return L + (W - L - R) * (k - 2) / 6; }, sy = function (v) { return T + (H - T - B) * (hi - v) / (hi - lo); };
      var h = '', i;
      for (i = 0; i <= 2; i++) {
        var v = lo + (hi - lo) * i / 2;
        h += '<line class="db-grid" x1="' + L + '" x2="' + (W - R) + '" y1="' + sy(v) + '" y2="' + sy(v) + '"/><text x="' + (L - 6) + '" y="' + (sy(v) + 4) + '" text-anchor="end">' + v.toFixed(2) + '</text>';
      }
      h += '<line x1="' + sx(3) + '" x2="' + sx(3) + '" y1="' + T + '" y2="' + (H - B) + '" stroke="#62676e" stroke-dasharray="3 3"/>';
      E.K.forEach(function (k) { h += '<text x="' + sx(k) + '" y="' + (H - 8) + '" text-anchor="middle">' + k + '</text>'; });
      [[a, 'var(--s0)', 'K-Means'], [b, 'var(--s2)', 'K-Medoids']].forEach(function (s) {
        h += '<polyline fill="none" stroke="' + s[1] + '" stroke-width="2" stroke-linejoin="round" points="' + s[0].map(function (v, i) { return sx(E.K[i]) + ',' + sy(v); }).join(' ') + '"/>';
        s[0].forEach(function (v, i) {
          h += '<circle cx="' + sx(E.K[i]) + '" cy="' + sy(v) + '" r="4" fill="' + s[1] + '" stroke="#fff" stroke-width="2"/>';
          h += '<circle cx="' + sx(E.K[i]) + '" cy="' + sy(v) + '" r="11" fill="transparent" data-tip="' + s[2] + ', K=' + E.K[i] + '<br>' + m[0] + ' ' + v.toFixed(4) + '"/>';
        });
      });
      return '<div><h3>' + m[0] + ' <small>' + m[2] + '</small></h3><svg viewBox="0 0 ' + W + ' ' + H + '" role="img" aria-label="' + m[0] + ' untuk K 2 sampai 8">' + h + '</svg></div>';
    }).join('');
    bindTip(el('eval'));
  })();

  /* Rekomendasi */
  var P = S.segmen;
  el('rec').innerHTML = [
    [0, 'Naikkan nilai keranjang', 'Ongkir sekitar ' + pct(P[0].rasio_ongkir) + ' dari nilai belanja. Uji paket bundling atau ambang gratis ongkir di atas ' + rp(P[0].median_belanja) + '.'],
    [1, 'Pertahankan sumber omzet utama', 'Segmen ini menyumbang ' + pct(P[1].persen_omzet) + ' omzet. Uji voucher pembelian ulang dan rekomendasi produk pelengkap.'],
    [2, 'Rawat pembeli bernilai tinggi', pct(P[2].persen) + ' transaksi menghasilkan ' + pct(P[2].persen_omzet) + ' omzet, median ' + fmt(P[2].median_qty) + ' barang. Uji harga bertingkat dan layanan pesanan grosir.']
  ].map(function (r) {
    return '<article style="--c:' + COL[r[0]] + '"><h3>' + r[1] + '</h3><p>' + r[2] + '</p></article>';
  }).join('');

  /* Tampilan tabel */
  el('tabel').innerHTML = '<table><thead><tr><th>Segmen</th><th>Transaksi</th><th>Porsi</th><th>Porsi omzet</th><th>Median belanja</th><th>Median barang</th><th>Median ongkir</th></tr></thead><tbody>' +
    S.segmen.map(function (s) {
      return '<tr><td>' + s.nama + '</td><td>' + fmt(s.jumlah) + '</td><td>' + pct(s.persen) + '</td><td>' + pct(s.persen_omzet) + '</td><td>' + rp(s.median_belanja) + '</td><td>' + fmt(s.median_qty) + '</td><td>' + rp(s.median_ongkir) + '</td></tr>';
    }).join('') + '</tbody></table>';

  el('catatan').textContent = 'Satuan analisis adalah transaksi, bukan pelanggan, karena data tidak memiliki ID pelanggan. Model diulang dari data hasil penelitian: label cocok ' + pct(S.ulang.kecocokan * 100) + ', RMSE ' + S.ulang.rmse + ', Silhouette ' + S.ulang.sil + ', DBI ' + S.ulang.dbi + '. Nilai omzet dalam rupiah tidak ditampilkan untuk menjaga kerahasiaan toko.';
})();
