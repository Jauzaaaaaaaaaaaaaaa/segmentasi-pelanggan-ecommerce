(function () {
  var C = ['#e4572e', '#17809a', '#d9a21b'], pts = '';
  var seed = 11, rnd = function () { seed = (seed * 16807) % 2147483647; return seed / 2147483647; };
  var centers = [[-120, -40], [110, -70], [10, 90]];
  for (var i = 0; i < 72; i++) {
    var k = i % 3, sx = (rnd() - .5) * 520, sy = (rnd() - .5) * 330;
    var ex = centers[k][0] + (rnd() - .5) * 90, ey = centers[k][1] + (rnd() - .5) * 90;
    pts += '<i style="--c:' + C[k] + ';--sx:' + sx.toFixed(0) + 'px;--sy:' + sy.toFixed(0) + 'px;--ex:' + ex.toFixed(0) + 'px;--ey:' + ey.toFixed(0) + 'px"></i>';
  }
  window.AT = {
    label: 'K-Means vs K-Medoids',
    ms: 1800,
    intro: '<div class="sg-boot">' + pts + '</div>',
    bg: function () {
      /* Daftar isi dari judul tahap, dengan penanda bagian yang sedang dibaca */
      var toc = document.getElementById('sg-toc');
      if (!toc) return;
      var links = [];
      document.querySelectorAll('.markdown-cell h2').forEach(function (h, i) {
        h.id = 'tahap-' + (i + 1);
        var a = document.createElement('a');
        a.href = '#' + h.id;
        a.textContent = h.textContent.replace(/^Tahap \d+ . /, '');
        a.setAttribute('data-n', i + 1);
        toc.appendChild(a);
        links.push([h, a]);
      });
      document.querySelectorAll('.code-cell, .output-table, .placeholder-image').forEach(function (e) { e.setAttribute('data-at', ''); });
      /* Bagian aktif: judul terakhir yang sudah melewati sepertiga layar, jadi tetap benar saat melompat atau kembali ke atas */
      function tandai() {
        var batas = innerHeight * 0.35, aktif = links[0];
        links.forEach(function (l) { if (l[0].getBoundingClientRect().top <= batas) aktif = l; });
        links.forEach(function (l) { l[1].classList.toggle('is-on', l === aktif); });
      }
      if (links.length) {
        addEventListener('scroll', tandai, { passive: true });
        addEventListener('resize', tandai);
        tandai();
      }
    }
  };
})();
