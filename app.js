/* ============================================================================
   FLYXSE — поведение страницы
   Тема, drawer, scroll-spy, reveal, typing, FAB. Без зависимостей.
   ========================================================================= */
(function () {
  'use strict';

  var root = document.documentElement;
  var reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)');

  /* ---------------------------------------------------------- тема */
  var THEME_KEY = 'flyxse-theme';
  var toggle = document.getElementById('theme-toggle');
  var metaLight = document.querySelector('meta[name="theme-color"][media*="light"]');
  var metaDark = document.querySelector('meta[name="theme-color"][media*="dark"]');

  function systemTheme() {
    return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
  }

  function currentTheme() {
    return root.dataset.theme || systemTheme();
  }

  function applyTheme(theme, persist) {
    root.dataset.theme = theme;
    if (persist) {
      try { localStorage.setItem(THEME_KEY, theme); } catch (e) {}
    }
    if (toggle) toggle.setAttribute('aria-pressed', String(theme === 'dark'));
    // theme-color под выбранную тему
    var color = theme === 'dark' ? '#17120f' : '#fff8f5';
    if (metaLight) metaLight.setAttribute('content', color);
    if (metaDark) metaDark.setAttribute('content', color);
  }

  if (toggle) {
    toggle.setAttribute('aria-pressed', String(currentTheme() === 'dark'));
    toggle.addEventListener('click', function () {
      applyTheme(currentTheme() === 'dark' ? 'light' : 'dark', true);
    });
  }

  // если пользователь ничего не выбирал — следуем за системой
  var mq = window.matchMedia('(prefers-color-scheme: dark)');
  var onSystemChange = function () {
    var saved = null;
    try { saved = localStorage.getItem(THEME_KEY); } catch (e) {}
    if (!saved) applyTheme(systemTheme(), false);
  };
  if (mq.addEventListener) mq.addEventListener('change', onSystemChange);
  else if (mq.addListener) mq.addListener(onSystemChange);

  /* ---------------------------------------------------------- app bar */
  var appBar = document.getElementById('app-bar');

  function onScroll() {
    var y = window.scrollY || window.pageYOffset;
    if (appBar) appBar.classList.toggle('app-bar--scrolled', y > 8);
  }
  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();

  /* ---------------------------------------------------------- drawer */
  var drawer = document.getElementById('drawer');
  var scrim = document.getElementById('scrim');
  var openBtn = document.getElementById('menu-open');
  var closeBtn = document.getElementById('menu-close');
  var lastFocused = null;

  function openDrawer() {
    if (!drawer) return;
    lastFocused = document.activeElement;
    drawer.hidden = false;
    scrim.hidden = false;
    drawer.setAttribute('aria-hidden', 'false');
    if (openBtn) openBtn.setAttribute('aria-expanded', 'true');
    requestAnimationFrame(function () {
      drawer.classList.add('is-open');
      scrim.classList.add('is-open');
    });
    document.body.style.overflow = 'hidden';
    var first = drawer.querySelector('a, button');
    if (first) first.focus();
  }

  function closeDrawer() {
    if (!drawer) return;
    drawer.classList.remove('is-open');
    scrim.classList.remove('is-open');
    drawer.setAttribute('aria-hidden', 'true');
    if (openBtn) openBtn.setAttribute('aria-expanded', 'false');
    document.body.style.overflow = '';
    window.setTimeout(function () {
      if (!drawer.classList.contains('is-open')) {
        drawer.hidden = true;
        scrim.hidden = true;
      }
    }, 450);
    if (lastFocused && lastFocused.focus) lastFocused.focus();
  }

  if (openBtn) openBtn.addEventListener('click', openDrawer);
  if (closeBtn) closeBtn.addEventListener('click', closeDrawer);
  if (scrim) scrim.addEventListener('click', closeDrawer);
  if (drawer) {
    drawer.querySelectorAll('a').forEach(function (a) {
      a.addEventListener('click', closeDrawer);
    });
  }
  document.addEventListener('keydown', function (e) {
    if (e.key === 'Escape' && drawer && drawer.classList.contains('is-open')) closeDrawer();
  });

  /* ---------------------------------------------------------- scroll-spy */
  var navLinks = Array.prototype.slice.call(document.querySelectorAll('.app-bar__nav a'));
  var sections = navLinks
    .map(function (link) {
      var id = link.getAttribute('href');
      return id && id.charAt(0) === '#' ? document.querySelector(id) : null;
    })
    .filter(Boolean);

  if ('IntersectionObserver' in window && sections.length) {
    var spy = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (!entry.isIntersecting) return;
        var id = '#' + entry.target.id;
        navLinks.forEach(function (link) {
          link.classList.toggle('is-active', link.getAttribute('href') === id);
        });
      });
    }, { rootMargin: '-45% 0px -50% 0px', threshold: 0 });
    sections.forEach(function (s) { spy.observe(s); });
  }

  /* ---------------------------------------------------------- reveal */
  var revealEls = Array.prototype.slice.call(document.querySelectorAll('.reveal'));

  if (!('IntersectionObserver' in window) || reduceMotion.matches) {
    revealEls.forEach(function (el) { el.classList.add('is-visible'); });
  } else {
    var revealObserver = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (!entry.isIntersecting) return;
        entry.target.classList.add('is-visible');
        revealObserver.unobserve(entry.target);
      });
    }, { threshold: 0.12, rootMargin: '0px 0px -40px 0px' });
    revealEls.forEach(function (el) { revealObserver.observe(el); });
  }

  /* ---------------------------------------------------------- typing */
  var typingEl = document.getElementById('typing');
  var phrases = [
    'aiogram • FSM • SQL • интеграции',
    'боты для бизнеса и оплат',
    'админ-панели прямо в Telegram',
    'архитектура с нуля, код с поддержкой'
  ];

  if (typingEl) {
    if (reduceMotion.matches) {
      typingEl.textContent = phrases[0];
    } else {
      var phraseIndex = 0;
      var charIndex = 0;
      var deleting = false;

      var tick = function () {
        var phrase = phrases[phraseIndex];

        if (!deleting) {
          charIndex++;
          typingEl.textContent = phrase.slice(0, charIndex);
          if (charIndex === phrase.length) {
            deleting = true;
            window.setTimeout(tick, 1900);
            return;
          }
          window.setTimeout(tick, 48);
        } else {
          charIndex--;
          typingEl.textContent = phrase.slice(0, charIndex);
          if (charIndex === 0) {
            deleting = false;
            phraseIndex = (phraseIndex + 1) % phrases.length;
            window.setTimeout(tick, 320);
            return;
          }
          window.setTimeout(tick, 24);
        }
      };

      window.setTimeout(tick, 700);
    }
  }

  /* ---------------------------------------------------------- конец */
})();