/* =========================================================
   Wedding Invitation – Script (Nobita & Shizuka)
   ========================================================= */

const $ = (id) => document.getElementById(id);

document.addEventListener('DOMContentLoaded', () => {

  /* ---------- Guest name from URL: index.html?to=Budi+Santoso ---------- */
  const guest = new URLSearchParams(window.location.search).get('to');
  if (guest && $('guestName')) {
    $('guestName').textContent = guest;
    if ($('name')) $('name').value = guest;
  }

  /* ---------- Scroll Reveal ---------- */
  const observer = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add('is-visible');
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.15 });

  document.querySelectorAll('.reveal').forEach((el) => observer.observe(el));

  /* ---------- Background Music & Cover ---------- */
  const music = $('bgMusic');
  const musicBtn = $('musicBtn');
  let isPlaying = false;

  if (music) music.volume = 0.6;

  function setMusicState(playing) {
    isPlaying = playing;
    if (musicBtn) {
      musicBtn.classList.toggle('is-playing', playing);
      musicBtn.setAttribute('aria-pressed', playing);
      musicBtn.setAttribute('aria-label', playing ? 'Jeda musik' : 'Putar musik');
    }
  }

  function playMusic() {
    if (music) {
      music.play().then(() => setMusicState(true)).catch(() => setMusicState(false));
    }
  }

  // Tombol Buka Undangan
  if ($('openBtn')) {
    $('openBtn').addEventListener('click', () => {
      document.body.classList.remove('is-locked');
      const cover = $('cover');
      if (cover) {
        cover.classList.add('is-open');
        setTimeout(() => { cover.style.display = 'none'; }, 1200);
      }
      playMusic();
    });
  }

  // Tombol Toggle Musik
  if (musicBtn) {
    musicBtn.addEventListener('click', () => {
      if (music.paused) playMusic(); else { music.pause(); setMusicState(false); }
    });
  }

  // Sembunyikan tombol musik jika file audio tidak ditemukan
  if (music) {
    music.addEventListener('error', () => { if (musicBtn) musicBtn.style.display = 'none'; });
  }

  /* ---------- Countdown (10 Desember 2026) ---------- */
  const targetTime = new Date('2026-12-10T09:00:00+08:00').getTime();

  function updateCountdown() {
    const diff = Math.max(0, targetTime - Date.now());
    if ($('cdDays')) $('cdDays').textContent  = Math.floor(diff / 86400000);
    if ($('cdHours')) $('cdHours').textContent = Math.floor((diff % 86400000) / 3600000);
    if ($('cdMins')) $('cdMins').textContent  = Math.floor((diff % 3600000) / 60000);
    if ($('cdSecs')) $('cdSecs').textContent  = Math.floor((diff % 60000) / 1000);
  }
  updateCountdown();
  setInterval(updateCountdown, 1000);

  /* ---------- Gallery Modal Viewer ---------- */
  const photoModalEl = $('photoModal');
  if (photoModalEl && typeof bootstrap !== 'undefined') {
    const photoModal = new bootstrap.Modal(photoModalEl);
    document.querySelectorAll('.gallery-item').forEach((item) => {
      item.addEventListener('click', () => {
        const fullSrc = item.dataset.full || item.querySelector('img').src;
        if ($('modalImg')) {
          $('modalImg').src = fullSrc;
          $('modalImg').alt = item.querySelector('img') ? item.querySelector('img').alt : '';
        }
        photoModal.show();
      });
    });
  }

  /* ---------- Form Ucapan & RSVP (LocalStorage & Real-time UI) ---------- */
  const STORAGE_KEY = 'wedding-wishes-nobita';
  let wishes = [];
  try { wishes = JSON.parse(localStorage.getItem(STORAGE_KEY)) || []; } catch (e) { wishes = []; }

  function escapeHTML(str) {
    const div = document.createElement('div');
    div.textContent = str;
    return div.innerHTML;
  }

  function renderWishes() {
    const wishList = $('wishList');
    if (!wishList) return;
    if (wishes.length === 0) {
      wishList.innerHTML = `<p class="text-muted text-center italic">Belum ada ucapan. Jadilah yang pertama!</p>`;
      return;
    }
    wishList.innerHTML = wishes.map((w) => `
      <div class="wish p-3 mb-2 bg-white rounded shadow-sm border-start border-3 border-info">
        <b>${escapeHTML(w.name)} <small class="text-muted">(${escapeHTML(w.status)})</small></b>
        <div class="mt-1">${escapeHTML(w.text)}</div>
      </div>`).join('');
  }
  renderWishes();

  const ucapanForm = $('UcapanForm');
  if (ucapanForm) {
    ucapanForm.addEventListener('submit', (event) => {
      event.preventDefault(); // Mencegah reload halaman

      const nameVal = $('name').value.trim();
      const attendanceVal = $('attendance').value;
      const guestsVal = $('guests').value;
      const messageVal = $('message').value.trim();

      if (!nameVal) {
        ucapanForm.classList.add('was-validated');
        return;
      }

      const entry = {
        name: nameVal,
        status: `${attendanceVal} - ${guestsVal} orang`,
        text: messageVal || 'Selamat atas pernikahannya!'
      };

      wishes.unshift(entry);
      try { localStorage.setItem(STORAGE_KEY, JSON.stringify(wishes.slice(0, 50))); } catch (e) {}
      renderWishes();

      if ($('formAlert')) {
        $('formAlert').innerHTML = '<div class="alert alert-success py-2 text-center mb-0">Terima kasih! Ucapan Anda berhasil terkirim.</div>';
        setTimeout(() => { $('formAlert').innerHTML = ''; }, 4000);
      }

      ucapanForm.reset();
      ucapanForm.classList.remove('was-validated');
      if (guest && $('name')) $('name').value = guest;
    });
  }

  /* ---------- Salin Nomor Rekening ---------- */
  const copyBtn = $('copyBtn');
  if (copyBtn && $('accountNumber')) {
    copyBtn.addEventListener('click', async () => {
      const originalText = copyBtn.textContent;
      try {
        await navigator.clipboard.writeText($('accountNumber').textContent.replace(/\s/g, ''));
        copyBtn.textContent = 'Tersalin!';
      } catch (e) {
        copyBtn.textContent = 'Gagal Salin';
      }
      setTimeout(() => { copyBtn.textContent = originalText; }, 2000);
    });
  }
});