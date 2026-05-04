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

  var CHECK_SVG = '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><path d="M8 12l3 3 5-5"/></svg>';
  var ERROR_SVG = '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><line x1="15" y1="9" x2="9" y2="15"/><line x1="9" y1="9" x2="15" y2="15"/></svg>';

  var MODAL_TEXTS = {
    en: {
      success_title: 'Thank You!',
      success_body: 'Your appointment request has been received. We\'ll get back to you as soon as possible to ensure a smooth and comfortable experience. We look forward to welcoming you!'
    },
    al: {
      success_title: 'Faleminderit!',
      success_body: 'Kërkesa juaj për takim është pranuar. Do t\'ju kontaktojmë sa më shpejtë për t\'ju siguruar një përvojë të shijshme e të rehatshme. Presim t\'ju mirëpresim!'
    },
    it: {
      success_title: 'Grazie!',
      success_body: 'La tua richiesta di appuntamento è stata ricevuta. Ti ricontatteremo il prima possibile per garantirti un\'esperienza confortevole. Non vediamo l\'ora di accoglierti!'
    }
  };

  var _modalTimeout = null;

  function getLang() {
    return (document.documentElement.lang || localStorage.getItem('dental_lang') || 'en').substring(0, 2);
  }

  function showToast(message, type) {
    if (_modalTimeout) clearTimeout(_modalTimeout);

    var existing = document.querySelector('.modal-overlay');
    if (existing) existing.remove();

    var lang = getLang();
    var texts = MODAL_TEXTS[lang] || MODAL_TEXTS.en;
    var isError = type === 'error';
    var title = isError ? 'Oops!' : texts.success_title;
    var body = isError ? message : texts.success_body;
    var icon = isError ? ERROR_SVG : CHECK_SVG;

    var overlay = document.createElement('div');
    overlay.className = 'modal-overlay';

    var card = document.createElement('div');
    card.className = 'modal-card' + (isError ? ' modal-card--error' : '');
    card.innerHTML =
      '<div class="modal-card__bg"></div>' +
      '<div class="modal-card__overlay"></div>' +
      '<div class="modal-card__content">' +
        '<div class="modal-card__icon">' + icon + '</div>' +
        '<h3 class="modal-card__title">' + title + '</h3>' +
        '<p class="modal-card__body">' + body + '</p>' +
        '<button class="modal-card__btn">OK</button>' +
      '</div>';

    overlay.appendChild(card);
    document.body.appendChild(overlay);

    requestAnimationFrame(function () {
      overlay.classList.add('modal-overlay--visible');
    });

    function dismiss() {
      overlay.classList.remove('modal-overlay--visible');
      setTimeout(function () { overlay.remove(); }, 300);
    }

    overlay.addEventListener('click', function (e) {
      if (e.target === overlay) dismiss();
    });
    card.querySelector('.modal-card__btn').addEventListener('click', dismiss);

    _modalTimeout = setTimeout(dismiss, isError ? 6000 : 5000);
  }

  function validateEmail(email) {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  }

  var uploadArea = document.getElementById('upload-area');
  var selectedFiles = [];

  function formatFileSize(bytes) {
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1048576) return (bytes / 1024).toFixed(1) + ' KB';
    return (bytes / 1048576).toFixed(1) + ' MB';
  }

  function isImageFile(file) {
    return file.type.startsWith('image/');
  }

  var TRASH_SVG = '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 6h18"/><path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"/><path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"/><line x1="10" y1="11" x2="10" y2="17"/><line x1="14" y1="11" x2="14" y2="17"/></svg>';
  var FILE_SVG = '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/></svg>';

  function renderFileList() {
    var listEl = document.getElementById('upload-file-list');
    var hintEl = document.getElementById('upload-hint');
    if (!listEl) return;

    listEl.innerHTML = '';
    if (selectedFiles.length > 0) {
      hintEl.style.display = 'none';
      uploadArea.classList.add('upload-area--has-file');
      selectedFiles.forEach(function (file, index) {
        var li = document.createElement('li');

        if (isImageFile(file)) {
          var img = document.createElement('img');
          img.className = 'upload-area__preview';
          img.src = URL.createObjectURL(file);
          img.alt = file.name;
          li.appendChild(img);
        } else {
          var placeholder = document.createElement('div');
          placeholder.className = 'upload-area__preview upload-area__preview--doc';
          placeholder.innerHTML = FILE_SVG;
          li.appendChild(placeholder);
        }

        var info = document.createElement('div');
        info.className = 'upload-area__file-info';

        var nameEl = document.createElement('span');
        nameEl.className = 'upload-area__file-name';
        nameEl.textContent = file.name;
        nameEl.title = file.name;
        info.appendChild(nameEl);

        var sizeEl = document.createElement('span');
        sizeEl.className = 'upload-area__file-size';
        sizeEl.textContent = formatFileSize(file.size);
        info.appendChild(sizeEl);

        li.appendChild(info);

        var removeBtn = document.createElement('button');
        removeBtn.type = 'button';
        removeBtn.className = 'upload-area__remove';
        removeBtn.innerHTML = TRASH_SVG;
        removeBtn.setAttribute('aria-label', 'Remove ' + file.name);
        removeBtn.addEventListener('click', function (e) {
          e.stopPropagation();
          if (isImageFile(file)) URL.revokeObjectURL(img.src);
          selectedFiles.splice(index, 1);
          renderFileList();
        });
        li.appendChild(removeBtn);

        listEl.appendChild(li);
      });
    } else {
      hintEl.style.display = '';
      uploadArea.classList.remove('upload-area--has-file');
    }
  }

  function addFiles(fileList) {
    for (var i = 0; i < fileList.length; i++) {
      selectedFiles.push(fileList[i]);
    }
    renderFileList();
  }

  if (uploadArea) {
    var fileInput = document.getElementById('files-input');

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
        addFiles(e.dataTransfer.files);
      }
    });

    fileInput.addEventListener('change', function () {
      if (fileInput.files.length) {
        addFiles(fileInput.files);
        fileInput.value = '';
      }
    });
  }

  var bookingForm = document.querySelector('#booking-form form');
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

      var submitBtn = e.submitter || bookingForm.querySelector('button.btn--primary');
      if (!submitBtn) return;
      var originalText = submitBtn.textContent;
      submitBtn.disabled = true;
      submitBtn.classList.add('btn--sending');
      submitBtn.textContent = 'Sending...';

      var hasFiles = selectedFiles.length > 0;
      var formData = new FormData(bookingForm);
      var options = {};

      if (hasFiles) {
        for (var i = 0; i < selectedFiles.length; i++) {
          formData.append('files', selectedFiles[i]);
        }
        options.method = 'POST';
        options.body = formData;
      } else {
        var data = {};
        formData.forEach(function (value, key) {
          if (key !== 'files') data[key] = value;
        });
        options.method = 'POST';
        options.headers = { 'Content-Type': 'application/json' };
        options.body = JSON.stringify(data);
      }

      fetch(bookingForm.getAttribute('data-api-url'), options)
        .then(function (res) {
          if (res.ok) {
            document.querySelectorAll('.upload-area__preview').forEach(function (img) {
              if (img.src && img.src.startsWith('blob:')) URL.revokeObjectURL(img.src);
            });
            bookingForm.reset();
            selectedFiles = [];
            renderFileList();
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
          submitBtn.classList.remove('btn--sending');
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
        btn.textContent = isExpanded ? (btn.dataset.less || 'Show less') : (btn.dataset.more || 'Show more');
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
