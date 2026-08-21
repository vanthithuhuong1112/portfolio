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
  var modalImg = document.getElementById('modalImg')
    || document.getElementById('imgModalTarget')
    || (modal && modal.querySelector('.modal-img'));
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

  /* Older project pages mark their lightbox triggers with data-zoom="<full src>" */
  Array.prototype.forEach.call(document.querySelectorAll('[data-zoom]'), function (btn) {
    btn.addEventListener('click', function () {
      var img = btn.querySelector('img');
      openModal(btn.getAttribute('data-zoom'), img ? img.getAttribute('alt') : '');
    });
  });

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

  /* ---------- Animated count-up on stat tiles ----------
     Parses "540.6K", "−29%", "~200", "18 mo" into prefix + number + suffix
     so only the number animates and the formatting survives. */
  var statVals = Array.prototype.slice.call(document.querySelectorAll('.stat .s-val'));

  function animateValue(el) {
    var raw = el.textContent.trim();
    var m = raw.match(/^(\D*?)([\d]+(?:[.,]\d+)?)(.*)$/);
    if (!m) return;
    var prefix = m[1], target = parseFloat(m[2].replace(',', '.')), suffix = m[3];
    var decimals = (m[2].split(/[.,]/)[1] || '').length;
    var duration = 900, start = null;

    function frame(ts) {
      if (start === null) start = ts;
      var t = Math.min((ts - start) / duration, 1);
      var eased = 1 - Math.pow(1 - t, 3);          // ease-out cubic
      el.textContent = prefix + (target * eased).toFixed(decimals) + suffix;
      if (t < 1) requestAnimationFrame(frame);
      else el.textContent = raw;                    // land exactly on the source text
    }
    requestAnimationFrame(frame);
  }

  if (statVals.length && !reduceMotion && 'IntersectionObserver' in window) {
    var statIO = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) {
        if (e.isIntersecting) {
          animateValue(e.target);
          statIO.unobserve(e.target);
        }
      });
    }, { threshold: 0.6 });
    statVals.forEach(function (el) { statIO.observe(el); });
  }

  /* ---------- Click-to-copy for email and phone ---------- */
  function attachCopy(link) {
    var value = link.getAttribute('href').replace(/^(mailto:|tel:)/, '');
    var btn = document.createElement('button');
    btn.type = 'button';
    btn.className = 'copy-btn';
    btn.setAttribute('aria-label', 'Copy ' + value);
    btn.textContent = 'Copy';

    btn.addEventListener('click', function () {
      var done = function () {
        btn.textContent = 'Copied';
        btn.classList.add('ok');
        setTimeout(function () { btn.textContent = 'Copy'; btn.classList.remove('ok'); }, 1600);
      };
      if (navigator.clipboard && navigator.clipboard.writeText) {
        navigator.clipboard.writeText(value).then(done, function () { btn.textContent = 'Press Ctrl+C'; });
      } else {
        var ta = document.createElement('textarea');
        ta.value = value;
        document.body.appendChild(ta);
        ta.select();
        try { document.execCommand('copy'); done(); } catch (e) { /* ignore */ }
        ta.remove();
      }
    });
    link.parentNode.appendChild(btn);
  }

  Array.prototype.forEach.call(
    document.querySelectorAll('.kv .v a[href^="mailto:"], .kv .v a[href^="tel:"]'),
    attachCopy
  );

  /* ---------- Back to top ---------- */
  var toTop = document.createElement('button');
  toTop.type = 'button';
  toTop.className = 'to-top';
  toTop.setAttribute('aria-label', 'Back to top');
  toTop.innerHTML = '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden="true">'
    + '<path d="M12 19V5M5 12l7-7 7 7" stroke="currentColor" stroke-width="2" '
    + 'stroke-linecap="round" stroke-linejoin="round"/></svg>';
  toTop.addEventListener('click', function () {
    window.scrollTo({ top: 0, behavior: reduceMotion ? 'auto' : 'smooth' });
  });
  document.body.appendChild(toTop);

  window.addEventListener('scroll', function () {
    toTop.classList.toggle('show', window.scrollY > 600);
  }, { passive: true });

  /* ---------- Pause other videos when one starts ---------- */
  var videos = Array.prototype.slice.call(document.querySelectorAll('video'));
  videos.forEach(function (v) {
    v.addEventListener('play', function () {
      videos.forEach(function (other) { if (other !== v) other.pause(); });
    });
  });
})();
