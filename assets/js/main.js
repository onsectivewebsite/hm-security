/* =========================================================================
   HM SECURITY — Site Interactions
   ========================================================================= */
(function () {
  'use strict';

  /* ---- Sticky header shadow on scroll ---- */
  var header = document.querySelector('.site-header');
  function onScroll() {
    if (!header) return;
    if (window.scrollY > 24) header.classList.add('scrolled');
    else header.classList.remove('scrolled');
  }
  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();

  /* ---- Mobile nav toggle ---- */
  var toggle = document.querySelector('.nav__toggle');
  var links = document.querySelector('.nav__links');
  if (toggle && links) {
    toggle.addEventListener('click', function () {
      var open = links.classList.toggle('open');
      toggle.setAttribute('aria-expanded', open ? 'true' : 'false');
    });
    // Close menu when a link is tapped
    links.querySelectorAll('a').forEach(function (a) {
      a.addEventListener('click', function () {
        links.classList.remove('open');
        toggle.setAttribute('aria-expanded', 'false');
      });
    });
  }

  /* ---- Scroll reveal ---- */
  var revealEls = document.querySelectorAll('.reveal');
  if ('IntersectionObserver' in window && revealEls.length) {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          entry.target.classList.add('in');
          io.unobserve(entry.target);
        }
      });
    }, { threshold: 0.12, rootMargin: '0px 0px -40px 0px' });
    revealEls.forEach(function (el) { io.observe(el); });
  } else {
    revealEls.forEach(function (el) { el.classList.add('in'); });
  }

  /* ---- Animated counters ---- */
  var counters = document.querySelectorAll('[data-count]');
  if ('IntersectionObserver' in window && counters.length) {
    var reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    var cObs = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (!entry.isIntersecting) return;
        var el = entry.target;
        var target = parseFloat(el.getAttribute('data-count'));
        var suffix = el.getAttribute('data-suffix') || '';
        if (reduce) { el.textContent = target + suffix; cObs.unobserve(el); return; }
        var dur = 1400, start = null;
        function step(ts) {
          if (!start) start = ts;
          var p = Math.min((ts - start) / dur, 1);
          var eased = 1 - Math.pow(1 - p, 3);
          var val = target % 1 === 0 ? Math.round(target * eased) : (target * eased).toFixed(1);
          el.textContent = val + suffix;
          if (p < 1) requestAnimationFrame(step);
        }
        requestAnimationFrame(step);
        cObs.unobserve(el);
      });
    }, { threshold: 0.5 });
    counters.forEach(function (el) { cObs.observe(el); });
  }

  /* ---- Graceful image fallback (never show a broken image) ---- */
  document.querySelectorAll('img').forEach(function (img) {
    img.addEventListener('error', function () {
      if (img.dataset.failed) return;
      img.dataset.failed = '1';
      var wrap = img.parentElement;
      if (wrap) wrap.style.background = 'linear-gradient(150deg,#123054,#050f1e)';
      img.style.opacity = '0';
    });
  });

  /* ---- Contact form (mailto fallback — no backend required) ---- */
  var form = document.getElementById('contact-form');
  if (form) {
    var status = document.getElementById('form-status');
    form.addEventListener('submit', function (e) {
      e.preventDefault();
      var data = new FormData(form);
      var name = (data.get('name') || '').toString().trim();
      var email = (data.get('email') || '').toString().trim();
      var phone = (data.get('phone') || '').toString().trim();
      var service = (data.get('service') || '').toString();
      var message = (data.get('message') || '').toString().trim();

      var subject = 'Quote Request — ' + (service || 'Security Services') + ' (' + name + ')';
      var body =
        'Name: ' + name + '\n' +
        'Phone: ' + phone + '\n' +
        'Email: ' + email + '\n' +
        'Service needed: ' + (service || 'Not specified') + '\n\n' +
        'Details:\n' + message + '\n';

      var mailto = 'mailto:info@hmsecurity.ca'
        + '?subject=' + encodeURIComponent(subject)
        + '&body=' + encodeURIComponent(body);

      window.location.href = mailto;

      if (status) {
        status.textContent = 'Thanks, ' + (name || 'there') + '! Your email app is opening with the request ready to send. Prefer to call? Reach us at 437 997 6310.';
        status.classList.add('show', 'ok');
      }
      form.reset();
    });
  }

  /* ---- Footer year ---- */
  var yearEl = document.getElementById('year');
  if (yearEl) yearEl.textContent = new Date().getFullYear();

  /* ---- Theme switcher (persists across pages via localStorage) ---- */
  (function () {
    var THEMES = ['gold', 'blue', 'red'];
    var MARK = { gold: 'logo-mark.png', blue: 'logo-mark-blue.png', red: 'logo-mark-red.png' };
    var LABEL = { gold: 'Navy & Gold', blue: 'Charcoal & Blue', red: 'Graphite & Red' };
    var root = document.documentElement;

    function read() { try { return localStorage.getItem('hmTheme') || 'gold'; } catch (e) { return 'gold'; } }

    function apply(t) {
      if (THEMES.indexOf(t) < 0) t = 'gold';
      root.setAttribute('data-theme', t);
      document.querySelectorAll('img.brand__mark').forEach(function (img) { img.src = MARK[t]; });
      try { localStorage.setItem('hmTheme', t); } catch (e) {}
      document.querySelectorAll('.theme-switch__opt').forEach(function (b) {
        b.setAttribute('aria-pressed', b.getAttribute('data-theme') === t ? 'true' : 'false');
      });
    }

    var wrap = document.createElement('div');
    wrap.className = 'theme-switch';
    var opts = THEMES.map(function (t) {
      return '<button class="theme-switch__opt" data-theme="' + t + '" aria-pressed="false"><span class="sw sw-' + t + '"></span>' + LABEL[t] + '</button>';
    }).join('');
    wrap.innerHTML =
      '<button class="theme-switch__toggle" aria-label="Change colour theme" title="Change colour theme">' +
        '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true"><circle cx="13.5" cy="6.5" r="1.5"/><circle cx="17.5" cy="10.5" r="1.5"/><circle cx="8.5" cy="7.5" r="1.5"/><circle cx="6.5" cy="12.5" r="1.5"/><path d="M12 22a10 10 0 1 1 0-20c5.52 0 10 3.58 10 8 0 2.76-2.24 4-4 4h-1.6a1.9 1.9 0 0 0-1.4 3.18A1.9 1.9 0 0 1 13.6 22H12z" stroke-linejoin="round"/></svg>' +
      '</button>' +
      '<div class="theme-switch__panel"><span class="theme-switch__title">Colour theme</span>' + opts + '</div>';
    document.body.appendChild(wrap);

    wrap.querySelector('.theme-switch__toggle').addEventListener('click', function () { wrap.classList.toggle('open'); });
    wrap.querySelectorAll('.theme-switch__opt').forEach(function (b) {
      b.addEventListener('click', function () { apply(b.getAttribute('data-theme')); wrap.classList.remove('open'); });
    });
    document.addEventListener('click', function (e) { if (!wrap.contains(e.target)) wrap.classList.remove('open'); });

    apply(read());
  })();
})();
