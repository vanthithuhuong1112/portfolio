/* =========================================================
   Shared behaviour for the portfolio pages.
   Every hook is optional — a page only needs the markup it uses.
   ========================================================= */
(function () {
  'use strict';

  var reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* ---------- Footer year ---------- */
  var yearEl = document.getElementById('year');
  if (yearEl) yearEl.textContent = new Date().getFullYear();

  /* ---------- Scroll progress bar ---------- */
  var progress = document.getElementById('progress');
  if (progress) {
    var updateProgress = function () {
      var doc = document.documentElement;
      var max = doc.scrollHeight - doc.clientHeight;
      var pct = max > 0 ? (doc.scrollTop / max) * 100 : 0;
      progress.style.width = pct + '%';
    };
    window.addEventListener('scroll', updateProgress, { passive: true });
    window.addEventListener('resize', updateProgress);
    updateProgress();
  }

  /* ---------- Image modal (avatar + media gallery) ---------- */
  var modal = document.getElementById('imgModal') || document.getElementById('avatarModal');
  var modalImg = document.getElementById('modalImg') || (modal && modal.querySelector('.modal-img'));
  var lastFocusEl = null;

  function openModal(src, alt) {
    if (!modal) return;
    lastFocusEl = document.activeElement;
    if (modalImg && src) {
      modalImg.src = src;
      modalImg.alt = alt || '';
    }
    modal.classList.add('open');
    modal.setAttribute('aria-hidden', 'false');
    document.body.classList.add('no-scroll');
    var closeBtn = modal.querySelector('[data-close="1"]');
    if (closeBtn) closeBtn.focus();
  }

  function closeModal() {
    if (!modal) return;
    modal.classList.remove('open');
    modal.setAttribute('aria-hidden', 'true');
    document.body.classList.remove('no-scroll');
    if (lastFocusEl && lastFocusEl.focus) lastFocusEl.focus();
  }

  if (modal) {
    modal.addEventListener('click', function (e) {
      var t = e.target;
      if (t && t.getAttribute && t.getAttribute('data-close') === '1') closeModal();
    });
    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape' && modal.classList.contains('open')) closeModal();
    });
  }

  var avatarBtn = document.getElementById('avatarBtn');
  if (avatarBtn && modal) {
    avatarBtn.addEventListener('click', function () {
      var img = avatarBtn.querySelector('img');
      openModal(img ? img.getAttribute('src') : null, img ? img.getAttribute('alt') : '');
    });
  }

  Array.prototype.forEach.call(document.querySelectorAll('.media-item[data-full]'), function (btn) {
    btn.addEventListener('click', function () {
      var img = btn.querySelector('img');
      openModal(btn.getAttribute('data-full'), img ? img.getAttribute('alt') : '');
    });
  });

  /* ---------- Reveal on scroll ---------- */
  var revealEls = document.querySelectorAll(
    '.hero-main, .hero-side, .section, .project, .kv, .block, .stat, .fit, .target-banner'
  );

  if (reduceMotion || !('IntersectionObserver' in window)) {
    Array.prototype.forEach.call(revealEls, function (el) { el.classList.add('reveal', 'in'); });
  } else {
    Array.prototype.forEach.call(revealEls, function (el) { el.classList.add('reveal'); });
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          entry.target.classList.add('in');
          io.unobserve(entry.target);
        }
      });
    }, { threshold: 0.12 });
    Array.prototype.forEach.call(revealEls, function (el) { io.observe(el); });
  }

  /* ---------- Nav active highlight ---------- */
  var navLinks = Array.prototype.slice.call(document.querySelectorAll('.nav-links a[href^="#"]'));
  var sections = navLinks
    .map(function (a) {
      try { return document.querySelector(a.getAttribute('href')); } catch (e) { return null; }
    })
    .filter(Boolean);

  if (sections.length && 'IntersectionObserver' in window) {
    var navIO = new IntersectionObserver(function (entries) {
      var visible = entries
        .filter(function (e) { return e.isIntersecting; })
        .sort(function (a, b) { return b.intersectionRatio - a.intersectionRatio; })[0];
      if (!visible) return;
      navLinks.forEach(function (a) { a.classList.remove('active'); });
      var active = navLinks.filter(function (a) {
        return a.getAttribute('href') === '#' + visible.target.id;
      })[0];
      if (active) active.classList.add('active');
    }, {
      rootMargin: '-35% 0px -55% 0px',
      threshold: [0.1, 0.2, 0.3, 0.4, 0.5]
    });
    sections.forEach(function (sec) { navIO.observe(sec); });
  }

  /* ---------- Pause other videos when one starts ---------- */
  var videos = Array.prototype.slice.call(document.querySelectorAll('video'));
  videos.forEach(function (v) {
    v.addEventListener('play', function () {
      videos.forEach(function (other) { if (other !== v) other.pause(); });
    });
  });
})();
