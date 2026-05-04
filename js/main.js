document.addEventListener('DOMContentLoaded', function () {
  var mobileToggle = document.getElementById('mobile-menu-toggle');
  var mobileMenu = document.getElementById('mobile-menu');

  if (mobileToggle && mobileMenu) {
    mobileToggle.addEventListener('click', function () {
      mobileMenu.classList.toggle('mobile-menu--open');
      mobileToggle.classList.toggle('header__hamburger--open');
    });
  }

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

  function showToast(message, type) {
    var existing = document.querySelector('.toast-notification');
    if (existing) existing.remove();

    var toast = document.createElement('div');
    toast.className = 'toast-notification toast-notification--' + (type || 'success');
    toast.textContent = message;
    document.body.appendChild(toast);
    requestAnimationFrame(function () {
      toast.classList.add('toast-notification--visible');
    });
    setTimeout(function () {
      toast.classList.remove('toast-notification--visible');
      setTimeout(function () { toast.remove(); }, 300);
    }, 4000);
  }

  function validateEmail(email) {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  }

  var uploadArea = document.getElementById('upload-area');
  if (uploadArea) {
    var fileInput = document.getElementById('panoramic');
    var filenameEl = document.getElementById('upload-filename');

    uploadArea.addEventListener('click', function () {
      fileInput.click();
    });

    uploadArea.addEventListener('dragover', function (e) {
      e.preventDefault();
      uploadArea.classList.add('upload-area--active');
    });

    uploadArea.addEventListener('dragleave', function () {
      uploadArea.classList.remove('upload-area--active');
    });

    uploadArea.addEventListener('drop', function (e) {
      e.preventDefault();
      uploadArea.classList.remove('upload-area--active');
      if (e.dataTransfer.files.length) {
        fileInput.files = e.dataTransfer.files;
        uploadArea.classList.add('upload-area--has-file');
        filenameEl.textContent = e.dataTransfer.files[0].name;
      }
    });

    fileInput.addEventListener('change', function () {
      if (fileInput.files.length) {
        uploadArea.classList.add('upload-area--has-file');
        filenameEl.textContent = fileInput.files[0].name;
      } else {
        uploadArea.classList.remove('upload-area--has-file');
        filenameEl.textContent = '';
      }
    });
  }

  var bookingForm = document.getElementById('booking-form');
  if (bookingForm) {
    bookingForm.addEventListener('submit', function (e) {
      e.preventDefault();
      var nameField = document.getElementById('name');
      var emailField = document.getElementById('email');
      var phoneField = document.getElementById('phone');

      if (!nameField.value.trim()) {
        showToast('Please enter your name.', 'error');
        nameField.focus();
        return;
      }
      if (!validateEmail(emailField.value.trim())) {
        showToast('Please enter a valid email address.', 'error');
        emailField.focus();
        return;
      }
      if (!phoneField.value.trim()) {
        showToast('Please enter your phone number.', 'error');
        phoneField.focus();
        return;
      }

      var submitBtn = bookingForm.querySelector('button[type="submit"]');
      var originalText = submitBtn.textContent;
      submitBtn.disabled = true;
      submitBtn.textContent = 'Sending...';

      var fileInput = document.getElementById('panoramic');
      var hasFile = fileInput && fileInput.files && fileInput.files.length > 0;
      var formData = new FormData(bookingForm);
      var options = {};

      if (hasFile) {
        options.method = 'POST';
        options.body = formData;
      } else {
        var data = {};
        formData.forEach(function (value, key) {
          if (key !== 'panoramic') data[key] = value;
        });
        options.method = 'POST';
        options.headers = { 'Content-Type': 'application/json' };
        options.body = JSON.stringify(data);
      }

      fetch('https://api.dentalhealth.al/book', options)
        .then(function (res) {
          if (res.ok) {
            bookingForm.reset();
            showToast('Thank you! We will contact you shortly.', 'success');
          } else {
            showToast('Something went wrong. Please try calling us directly.', 'error');
          }
        })
        .catch(function () {
          showToast('Something went wrong. Please try calling us directly.', 'error');
        })
        .finally(function () {
          submitBtn.disabled = false;
          submitBtn.textContent = originalText;
        });
    });
  }

  var yearEls = document.querySelectorAll('[data-year]');
  yearEls.forEach(function (el) {
    el.textContent = new Date().getFullYear();
  });

  var teamCarousel = document.querySelector('.team-carousel');
  if (teamCarousel && typeof Swiper !== 'undefined') {
    new Swiper('.team-carousel', {
      slidesPerView: 1,
      spaceBetween: 4,
      loop: true,
      autoplay: {
        delay: 4000,
        disableOnInteraction: false,
        pauseOnMouseEnter: true,
      },
      pagination: {
        el: '.swiper-pagination',
        clickable: true,
      },
      navigation: {
        nextEl: '.swiper-button-next',
        prevEl: '.swiper-button-prev',
        nextOffset: 12,
        prevOffset: 12,
      },
      breakpoints: {
        680: {
          slidesPerView: 2,
          spaceBetween: 4,
        },
        1024: {
          slidesPerView: 3,
          spaceBetween: 6,
        },
      },
    });
  }

  var patientCarousel = document.querySelector('.patient-carousel');
  if (patientCarousel && typeof Swiper !== 'undefined') {
    new Swiper('.patient-carousel', {
      slidesPerView: 1,
      spaceBetween: 16,
      loop: true,
      noSwiping: true,
      noSwipingClass: 'no-swiping',
      autoplay: {
        delay: 4000,
        disableOnInteraction: false,
        pauseOnMouseEnter: true,
      },
      speed: 1200,
      pagination: {
        el: '.patient-carousel .swiper-pagination',
        clickable: true,
      },
      navigation: {
        nextEl: '.patient-carousel .swiper-button-next',
        prevEl: '.patient-carousel .swiper-button-prev',
      },
      breakpoints: {
        680: {
          slidesPerView: 2,
          spaceBetween: 24,
        },
        1024: {
          slidesPerView: 3,
          spaceBetween: 32,
        },
      },
    });
  }

  var reviewCards = document.querySelectorAll('.review-card');
  reviewCards.forEach(function (card) {
    var el = card.querySelector('.review-card__text');
    var btn = card.querySelector('.review-card__more');
    if (el && btn && el.scrollHeight > el.clientHeight) {
      btn.style.display = '';
      btn.addEventListener('click', function () {
        var isExpanded = el.classList.toggle('expanded');
        btn.textContent = isExpanded ? btn.dataset.less : btn.dataset.more;
        btn.setAttribute('aria-label', btn.textContent);
      });
    }
  });

  var langLinks = document.querySelectorAll('.lang-link');
  langLinks.forEach(function (link) {
    link.addEventListener('click', function () {
      localStorage.setItem('dental_lang', this.dataset.lang);
    });
  });

  var savedLang = localStorage.getItem('dental_lang');
  if (savedLang) {
    var path = window.location.pathname;
    var currentLang = 'en';
    if (path.startsWith('/al/') || path === '/al') currentLang = 'al';
    else if (path.startsWith('/it/') || path === '/it') currentLang = 'it';

    var isHomepage = path === '/' || path === '/al/' || path === '/it/' || path === '/al' || path === '/it' || path === '';
    if (savedLang !== currentLang && isHomepage) {
      var targetUrl = savedLang === 'en' ? '/' : '/' + savedLang + '/';
      window.location.href = targetUrl;
    }
  }
});
