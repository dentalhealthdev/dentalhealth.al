(function () {
  var GOOGLE_CLICK_STORAGE_KEY = 'dentalhealth_google_click';
  var GOOGLE_CLICK_TYPES = ['gclid', 'gbraid'];
  var tracking = window.DentalHealth || {};

  function reportTrackingError(operation, error) {
    var message = error instanceof Error ? error.message : String(error);
    if (window.console && typeof window.console.error === 'function') {
      window.console.error('[Dental Health] ' + operation + ': ' + message);
    }
  }

  function getGoogleClickData() {
    var params = new URLSearchParams(window.location.search);
    for (var i = 0; i < GOOGLE_CLICK_TYPES.length; i++) {
      var type = GOOGLE_CLICK_TYPES[i];
      var id = params.get(type);
      if (id !== null) {
        if (!id.trim()) {
          reportTrackingError('capturing Google click ID', new Error(type + ' is empty'));
          continue;
        }
        var data = { id: id.trim(), type: type, capturedAt: Date.now() };
        try {
          localStorage.setItem(GOOGLE_CLICK_STORAGE_KEY, JSON.stringify(data));
        } catch (error) {
          reportTrackingError('storing Google click ID', error);
        }
        return data;
      }
    }

    try {
      var stored = JSON.parse(localStorage.getItem(GOOGLE_CLICK_STORAGE_KEY));
      if (stored && typeof stored.id === 'string' && stored.id.trim() &&
          GOOGLE_CLICK_TYPES.indexOf(stored.type) !== -1 &&
          Number.isSafeInteger(stored.capturedAt) && stored.capturedAt > 0) {
        return stored;
      }
      if (stored !== null) {
        reportTrackingError('reading Google click ID', new Error('Stored Google click data is invalid'));
      }
    } catch (error) {
      reportTrackingError('reading Google click ID', error);
    }

    return null;
  }

  tracking.googleClickStorageKey = GOOGLE_CLICK_STORAGE_KEY;
  tracking.getGoogleClickData = getGoogleClickData;
  tracking.reportTrackingError = reportTrackingError;
  window.DentalHealth = tracking;

  function throttle(fn, wait) {
    var last = 0;
    return function () {
      var now = Date.now();
      if (now - last >= wait) {
        last = now;
        fn.apply(this, arguments);
      }
    };
  }

  function init() {
    var mobileToggle = document.getElementById('mobile-menu-toggle');
    var mobileMenu = document.getElementById('mobile-menu');

    if (mobileToggle && mobileMenu) {
      function toggleMenu() {
        mobileMenu.classList.toggle('mobile-menu--open');
        mobileToggle.classList.toggle('header__hamburger--open');
      }
      mobileToggle.addEventListener('click', toggleMenu);
      mobileToggle.addEventListener('keydown', function (e) {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          toggleMenu();
        }
      });
    }

    var backToTop = document.getElementById('back-to-top');
    if (backToTop) {
      window.addEventListener('scroll', throttle(function () {
        if (window.scrollY > 400) {
          backToTop.classList.add('back-to-top--visible');
        } else {
          backToTop.classList.remove('back-to-top--visible');
        }
      }, 100));

      backToTop.addEventListener('click', function () {
        window.scrollTo({ top: 0, behavior: 'smooth' });
      });
    }

    getGoogleClickData();

    var yearEls = document.querySelectorAll('[data-year]');
    yearEls.forEach(function (el) {
      el.textContent = new Date().getFullYear();
    });

    var langLinks = document.querySelectorAll('.lang-link');
    langLinks.forEach(function (link) {
      link.addEventListener('click', function () {
        localStorage.setItem('dental_lang', this.dataset.lang);
      });
    });

    var langDropdownTrigger = document.querySelector('.lang-dropdown__trigger');
    var langDropdownMenu = document.querySelector('.lang-dropdown__menu');

    if (langDropdownTrigger && langDropdownMenu) {
      langDropdownTrigger.addEventListener('click', function (e) {
        e.stopPropagation();
        var isOpen = langDropdownMenu.classList.contains('lang-dropdown__menu--open');
        langDropdownMenu.classList.toggle('lang-dropdown__menu--open');
        langDropdownTrigger.setAttribute('aria-expanded', !isOpen);
      });

      document.addEventListener('click', function (e) {
        if (!e.target.closest('.lang-dropdown')) {
          langDropdownMenu.classList.remove('lang-dropdown__menu--open');
          langDropdownTrigger.setAttribute('aria-expanded', 'false');
        }
      });

      var langOptions = langDropdownMenu.querySelectorAll('.lang-dropdown__option');
      langOptions.forEach(function (option) {
        option.addEventListener('click', function (e) {
          e.preventDefault();
          localStorage.setItem('dental_lang', this.dataset.lang);
          window.location.href = this.href;
        });
      });
    }

    var savedLang = localStorage.getItem('dental_lang');
    if (savedLang && savedLang !== 'en') {
      var path = window.location.pathname;
      if (path === '/' || path === '') {
        window.location.href = '/' + savedLang + '/';
      }
    }
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
