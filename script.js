/* ==========================================================
   Logika halaman. Teks dan pengaturan ada di config.js
   ========================================================== */
(() => {
  'use strict';

  const $ = (sel) => document.querySelector(sel);
  const pages = [...document.querySelectorAll('.page:not(#lock)')];

  /* ---------- 1. Isi konten dari CONFIG ---------- */
  function renderContent() {
    document.title = 'Selamat Ulang Tahun, ' + CONFIG.nama;
    $('#lockName').textContent = CONFIG.panggilan;
    $('#name').textContent = CONFIG.nama;
    $('#age').textContent = CONFIG.umur;

    const paper = $('#paper');
    CONFIG.pesan.forEach((text) => {
      const p = document.createElement('p');
      p.textContent = text;
      paper.appendChild(p);
    });
    const sign = document.createElement('p');
    sign.className = 'sign';
    sign.textContent = CONFIG.dari;
    paper.appendChild(sign);

    CONFIG.harapan.forEach((text, k) => {
      const li = document.createElement('li');
      const num = document.createElement('b');
      const span = document.createElement('span');
      num.textContent = k + 1;
      span.textContent = text;
      li.append(num, span);
      $('#wishList').appendChild(li);
    });

    CONFIG.foto.forEach((f) => {
      const fig = document.createElement('figure');
      fig.className = 'polaroid';
      const img = new Image();
      img.src = f.src;
      img.alt = f.cap;
      img.onerror = () => {
        const ph = document.createElement('div');
        ph.className = 'ph';
        ph.textContent = 'Taruh foto: ' + f.src;
        img.replaceWith(ph);
      };
      const cap = document.createElement('figcaption');
      cap.textContent = f.cap;
      fig.append(img, cap);
      $('#polaroids').appendChild(fig);
    });

    $('#qris').onerror = () => {
      $('#qris').style.display = 'none';
      $('#qrisMissing').style.display = 'block';
    };
  }

  /* ---------- 2. Confetti ---------- */
  const fx = $('#fx');
  const fc = fx.getContext('2d');
  const confettiColors = ['#e6cf9c', '#d3b26b', '#d98a9b', '#fbf4e6', '#f1dfb0'];
  let pieces = [];
  let confettiRunning = false;

  function resizeFx() {
    fx.width = innerWidth;
    fx.height = innerHeight;
  }

  function burst(count) {
    for (let k = 0; k < count; k++) {
      pieces.push({
        x: innerWidth / 2,
        y: innerHeight * 0.55,
        vx: (Math.random() - 0.5) * 15,
        vy: -Math.random() * 15 - 4,
        size: 5 + Math.random() * 6,
        rot: Math.random() * 6,
        vrot: (Math.random() - 0.5) * 0.4,
        color: confettiColors[(Math.random() * confettiColors.length) | 0],
        life: 150 + Math.random() * 60
      });
    }
    if (!confettiRunning) {
      confettiRunning = true;
      requestAnimationFrame(drawConfetti);
    }
  }

  function drawConfetti() {
    fc.clearRect(0, 0, fx.width, fx.height);
    pieces = pieces.filter((p) => p.life-- > 0 && p.y < fx.height + 30);
    for (const p of pieces) {
      p.vy += 0.33;
      p.vx *= 0.99;
      p.x += p.vx;
      p.y += p.vy;
      p.rot += p.vrot;
      fc.save();
      fc.translate(p.x, p.y);
      fc.rotate(p.rot);
      fc.fillStyle = p.color;
      fc.fillRect(-p.size / 2, -p.size / 3, p.size, p.size * 0.6);
      fc.restore();
    }
    if (pieces.length) requestAnimationFrame(drawConfetti);
    else confettiRunning = false;
  }

  /* ---------- 3. Navigasi antar halaman ---------- */
  const nav = $('#nav');
  const dots = $('#dots');
  const nextBtn = $('#nextBtn');
  const backBtn = $('#backBtn');
  let current = 0;

  pages.forEach(() => dots.appendChild(document.createElement('i')));

  function go(n) {
    current = Math.max(0, Math.min(pages.length - 1, n));
    pages.forEach((p, k) => p.classList.toggle('on', k === current));
    pages[current].scrollTop = 0;
    [...dots.children].forEach((d, k) => d.classList.toggle('active', k === current));

    backBtn.style.visibility = current ? 'visible' : 'hidden';
    const last = current === pages.length - 1;
    nextBtn.textContent = last ? 'Dari awal' : current === 0 ? 'Mulai' : 'Lanjut';

    if (pages[current].id === 'gift' && !foil.touched) paintFoil();
  }

  nextBtn.onclick = () => go(current === pages.length - 1 ? 0 : current + 1);
  backBtn.onclick = () => go(current - 1);

  addEventListener('keydown', (e) => {
    if (nav.style.display !== 'flex') return;
    if (e.key === 'ArrowRight') nextBtn.click();
    if (e.key === 'ArrowLeft' && current) go(current - 1);
  });

  /* ---------- 4. Kunci tengah malam ---------- */
  const unlockAt = new Date(CONFIG.waktu).getTime();
  const pad2 = (n) => String(n).padStart(2, '0');
  let lockTimer;

  function openSurprise() {
    clearInterval(lockTimer);
    $('#lock').classList.remove('on');
    nav.style.display = 'flex';
    go(0);
    setTimeout(() => burst(140), 500);
  }

  function updateCountdown() {
    const left = unlockAt - Date.now();
    if (left <= 0 || /preview/.test(location.search)) {
      openSurprise();
      return;
    }
    const s = Math.floor(left / 1000);
    $('#countdown').textContent =
      pad2(Math.floor(s / 3600)) + ':' + pad2(Math.floor((s % 3600) / 60)) + ':' + pad2(s % 60);
  }

  /* ---------- 5. Kartu foil emas ---------- */
  const box = $('#foilBox');
  const cv = $('#foil');
  const ctx = cv.getContext('2d');
  const foil = { drawing: false, done: false, touched: false, moves: 0 };

  function paintFoil() {
    const d = devicePixelRatio || 1;
    const W = box.clientWidth;
    const H = box.clientHeight;
    if (!W) return;

    cv.width = W * d;
    cv.height = H * d;
    ctx.setTransform(d, 0, 0, d, 0, 0);

    const g = ctx.createLinearGradient(0, 0, W, H);
    ['#b8924a', '#f4e6bd', '#d3b26b', '#fbf1cf', '#b8924a', '#e6cf9c']
      .forEach((c, k, arr) => g.addColorStop(k / (arr.length - 1), c));
    ctx.fillStyle = g;
    ctx.fillRect(0, 0, W, H);

    ctx.strokeStyle = 'rgba(255,255,255,.22)';
    ctx.lineWidth = 1;
    for (let x = -H; x < W; x += 9) {
      ctx.beginPath();
      ctx.moveTo(x, H);
      ctx.lineTo(x + H, 0);
      ctx.stroke();
    }

    ctx.textAlign = 'center';
    ctx.fillStyle = 'rgba(90,58,20,.6)';
    ctx.font = 'italic 300 ' + W * 0.34 + 'px "Cormorant Garamond", Georgia, serif';
    ctx.fillText(CONFIG.umur, W / 2, H / 2 + W * 0.09);
    ctx.font = 'italic 400 ' + Math.max(16, W * 0.062) + 'px "Cormorant Garamond", Georgia, serif';
    ctx.fillText('gosok di sini', W / 2, H / 2 + W * 0.2);
  }

  function pointer(e) {
    const r = cv.getBoundingClientRect();
    return [e.clientX - r.left, e.clientY - r.top];
  }

  function scratch(e) {
    if (!foil.drawing || foil.done) return;
    foil.touched = true;
    const [x, y] = pointer(e);
    ctx.globalCompositeOperation = 'destination-out';
    ctx.beginPath();
    ctx.arc(x, y, 24, 0, 7);
    ctx.fill();
    if (++foil.moves % 8 === 0) checkScratched();
  }

  function checkScratched() {
    const data = ctx.getImageData(0, 0, cv.width, cv.height).data;
    let cleared = 0;
    let total = 0;
    for (let k = 3; k < data.length; k += 64) {
      total++;
      if (!data[k]) cleared++;
    }
    if (cleared / total > 0.45) revealGift();
  }

  function revealGift() {
    if (foil.done) return;
    foil.done = true;
    cv.classList.add('done');
    $('#after').classList.add('show');
    burst(220);
  }

  cv.addEventListener('pointerdown', (e) => {
    foil.drawing = true;
    cv.setPointerCapture(e.pointerId);
    scratch(e);
  });
  cv.addEventListener('pointermove', scratch);
  cv.addEventListener('pointerup', () => {
    foil.drawing = false;
    if (foil.touched) checkScratched();
  });
  cv.addEventListener('pointercancel', () => { foil.drawing = false; });

  /* ---------- 6. Lilin ---------- */
  $('#blowBtn').onclick = () => {
    $('#flame').style.opacity = 0;
    $('#candleTitle').textContent = 'Selamat, ' + CONFIG.nama;
    $('#candleText').textContent = 'Semoga semua yang kamu minta tadi terkabul.';
    $('#blowBtn').style.display = 'none';
    burst(260);
  };

  /* ---------- 7. Musik (opsional, butuh musik.mp3) ---------- */
  const audio = $('#audio');
  const musicBtn = $('#musicBtn');

  fetch('musik.mp3', { method: 'HEAD' })
    .then((r) => { if (r.ok) musicBtn.style.display = 'block'; })
    .catch(() => {});

  musicBtn.onclick = () => {
    if (audio.paused) {
      audio.play();
      musicBtn.textContent = 'Matikan musik';
    } else {
      audio.pause();
      musicBtn.textContent = 'Musik';
    }
  };

  /* ---------- Mulai ---------- */
  renderContent();
  resizeFx();
  addEventListener('resize', () => {
    resizeFx();
    if (!foil.touched && pages[current] && pages[current].id === 'gift') paintFoil();
  });
  if (document.fonts) {
    document.fonts.ready.then(() => {
      if (!foil.touched && pages[current] && pages[current].id === 'gift') paintFoil();
    });
  }
  updateCountdown();
  lockTimer = setInterval(updateCountdown, 1000);
})();