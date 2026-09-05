(function () {
  var tracking = window.DentalHealth || {};
  var GOOGLE_CLICK_STORAGE_KEY = tracking.googleClickStorageKey || 'dentalhealth_google_click';

  function reportTrackingError(operation, error) {
    if (typeof tracking.reportTrackingError === 'function') {
      tracking.reportTrackingError(operation, error);
      return;
    }
    var message = error instanceof Error ? error.message : String(error);
    if (window.console && typeof window.console.error === 'function') {
      window.console.error('[Dental Health] ' + operation + ': ' + message);
    }
  }

  function getGoogleClickData() {
    if (typeof tracking.getGoogleClickData === 'function') {
      return tracking.getGoogleClickData();
    }
    return null;
  }

  function getAdConsent() {
    try {
      var raw = localStorage.getItem('cc_cookie');
      if (!raw) return false;
      var data = JSON.parse(raw);
      return data.categories.indexOf('ads') !== -1 && Date.now() < data.expirationTime;
    } catch (error) {
      reportTrackingError('reading ad consent preference', error);
      return false;
    }
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

  var modalTimeout = null;

  function getLang() {
    try {
      return (document.documentElement.lang || localStorage.getItem('dental_lang') || 'en').substring(0, 2);
    } catch (error) {
      reportTrackingError('reading language preference', error);
      return (document.documentElement.lang || 'en').substring(0, 2);
    }
  }

  function showToast(message, type) {
    if (modalTimeout) clearTimeout(modalTimeout);

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

    modalTimeout = setTimeout(dismiss, isError ? 6000 : 5000);
  }

  function validateEmail(email) {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  }

  function gtagReportConversion(bookingId) {
    if (!Number.isSafeInteger(bookingId) || bookingId <= 0) {
      reportTrackingError('reporting Google Ads conversion', new Error('Booking ID is invalid'));
      return;
    }
    if (typeof window.gtag !== 'function') {
      reportTrackingError('reporting Google Ads conversion', new Error('Google tag is unavailable'));
      return;
    }

    try {
      window.gtag('event', 'conversion', {
        send_to: 'AW-18428427408/sIm3CIOZ5e0cEJD5rdNE',
        value: 1.0,
        currency: 'EUR',
        transaction_id: 'booking-' + bookingId
      });
    } catch (error) {
      reportTrackingError('reporting Google Ads conversion', error);
    }
  }

  function init() {
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

    var TRASH_SVG = '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 6h18"/><path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"/><path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 2 2 2v2"/><line x1="10" y1="11" x2="10" y2="17"/><line x1="14" y1="11" x2="14" y2="17"/></svg>';
    var FILE_SVG = '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/></svg>';

    function renderFileList() {
      var listEl = document.getElementById('upload-file-list');
      var hintEl = document.getElementById('upload-hint');
      if (!listEl || !hintEl || !uploadArea) return;

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
            if (isImageFile(file)) {
              var preview = li.querySelector('img');
              if (preview) URL.revokeObjectURL(preview.src);
            }
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
      if (fileInput) {
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
          if (e.dataTransfer.files.length) addFiles(e.dataTransfer.files);
        });

        fileInput.addEventListener('change', function () {
          if (fileInput.files.length) {
            addFiles(fileInput.files);
            fileInput.value = '';
          }
        });
      }
    }

    var bookingForm = document.querySelector('#booking-form form');
    if (!bookingForm) return;

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

      var formData = new FormData(bookingForm);
      for (var i = 0; i < selectedFiles.length; i++) {
        formData.append('files', selectedFiles[i]);
      }
      var googleClick = getGoogleClickData();
      if (googleClick) {
        formData.append('googleClickId', googleClick.id);
        formData.append('googleClickIdType', googleClick.type);
        formData.append('googleClickCapturedAt', String(googleClick.capturedAt));
      }
      formData.append('consent', getAdConsent() ? 'true' : 'false');

      function completeBooking(payload) {
        var bookingId = payload && payload.id;
        if (Number.isSafeInteger(bookingId) && bookingId > 0) {
          gtagReportConversion(bookingId);
        } else {
          reportTrackingError('reporting Google Ads conversion', new Error('Booking response did not contain a valid ID'));
        }

        document.querySelectorAll('.upload-area__preview').forEach(function (img) {
          if (img.src && img.src.startsWith('blob:')) URL.revokeObjectURL(img.src);
        });
        bookingForm.reset();
        selectedFiles = [];
        renderFileList();
        if (typeof window.fbq === 'function') {
          try {
            window.fbq('track', 'Lead');
            window.fbq('track', 'Schedule');
          } catch (error) {
            reportTrackingError('reporting Facebook booking events', error);
          }
        } else {
          reportTrackingError('reporting Facebook booking events', new Error('Facebook pixel is unavailable'));
        }
        if (typeof window.gtag === 'function') {
          try {
            window.gtag('event', 'form_submit', {
              send_to: 'analytics',
              service: formData.get('service') || 'unknown'
            });
          } catch (error) {
            reportTrackingError('reporting Analytics booking event', error);
          }
        } else {
          reportTrackingError('reporting Analytics booking event', new Error('Google tag is unavailable'));
        }
        try {
          localStorage.removeItem(GOOGLE_CLICK_STORAGE_KEY);
        } catch (error) {
          reportTrackingError('clearing Google click ID', error);
        }
        showToast('Thank you! We will contact you shortly.', 'success');
      }

      fetch(bookingForm.getAttribute('data-api-url'), {
        method: 'POST',
        body: formData,
      })
        .then(function (res) {
          if (!res.ok) {
            reportTrackingError('submitting booking', new Error('API returned HTTP ' + res.status));
            showToast('Something went wrong. Please try calling us directly.', 'error');
            return;
          }
          return res.json().then(function (payload) {
            completeBooking(payload);
          }, function (error) {
            reportTrackingError('reading booking response', error);
            completeBooking(null);
          });
        })
        .catch(function (error) {
          reportTrackingError('submitting booking', error);
          showToast('Something went wrong. Please try calling us directly.', 'error');
        })
        .finally(function () {
          submitBtn.disabled = false;
          submitBtn.classList.remove('btn--sending');
          submitBtn.textContent = originalText;
        });
    });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
