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
      error_title: 'Something went wrong',
      confirm: 'OK',
      name_error: 'Please enter your name.',
      email_error: 'Please enter a valid email address.',
      sending: 'Sending...',
      remove_file: 'Remove',
      success_title: 'Thank You!',
      success_body: 'We\'ve received your appointment request. We\'ll reply in English shortly to arrange your visit.'
    },
    al: {
      error_title: 'Diçka shkoi keq',
      confirm: 'Në rregull',
      name_error: 'Ju lutemi shkruani emrin tuaj.',
      email_error: 'Ju lutemi shkruani një adresë emaili të vlefshme.',
      sending: 'Duke dërguar...',
      remove_file: 'Hiq',
      success_title: 'Faleminderit!',
      success_body: 'Kemi marrë kërkesën tuaj për takim. Do t\'ju përgjigjemi së shpejti në anglisht për të caktuar vizitën tuaj.'
    },
    it: {
      error_title: 'Qualcosa è andato storto',
      confirm: 'Va bene',
      name_error: 'Inserisci il tuo nome.',
      email_error: 'Inserisci un indirizzo email valido.',
      sending: 'Invio in corso...',
      remove_file: 'Rimuovi',
      success_title: 'Grazie!',
      success_body: 'Abbiamo ricevuto la tua richiesta di appuntamento. Ti risponderemo al più presto in italiano per concordare la visita.'
    },
    de: {
      error_title: 'Ein Fehler ist aufgetreten',
      confirm: 'OK',
      name_error: 'Bitte geben Sie Ihren Namen ein.',
      email_error: 'Bitte geben Sie eine gültige E-Mail-Adresse ein.',
      sending: 'Wird gesendet …',
      remove_file: 'Entfernen',
      success_title: 'Vielen Dank!',
      success_body: 'Ihre Terminanfrage ist eingegangen. Wir melden uns in Kürze auf Englisch bei Ihnen, um Ihren Besuch zu vereinbaren.'
    },
    he: {
      error_title: 'אירעה שגיאה',
      confirm: 'אישור',
      name_error: 'יש להזין שם.',
      email_error: 'יש להזין כתובת דוא״ל תקינה.',
      sending: 'שולח…',
      remove_file: 'הסרת',
      success_title: 'תודה!',
      success_body: 'בקשת התור התקבלה. נחזור אליכם באנגלית בהקדם כדי לתאם את הביקור במרפאה.'
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
    var title = isError ? texts.error_title : texts.success_title;
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
        '<button class="modal-card__btn">' + texts.confirm + '</button>' +
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

  var PHONE_ERR = {
    en: 'Please enter a valid phone number.',
    al: 'Ju lutem shkruani një numër telefoni të vlefshëm.',
    it: 'Inserisci un numero di telefono valido.',
    he: 'יש להזין מספר טלפון תקין.',
    de: 'Bitte geben Sie eine gültige Telefonnummer ein.'
  };
  var COUNTRY_BY_LANG = { en: 'gb', al: 'al', it: 'it', he: 'il', de: 'de' };
  var PHONE_COUNTRY_TEXTS = {
    de: {
      selectedCountryAriaLabel: 'Ausgewähltes Land',
      noCountrySelected: 'Kein Land ausgewählt',
      countryListAriaLabel: 'Länderliste',
      searchPlaceholder: 'Land suchen',
      zeroSearchResults: 'Keine Suchergebnisse',
      oneSearchResult: 'Ein Suchergebnis',
      multipleSearchResults: '${count} Suchergebnisse'
    },
    he: {
      selectedCountryAriaLabel: 'המדינה שנבחרה',
      noCountrySelected: 'לא נבחרה מדינה',
      countryListAriaLabel: 'רשימת מדינות',
      searchPlaceholder: 'חיפוש מדינה',
      zeroSearchResults: 'לא נמצאו תוצאות',
      oneSearchResult: 'נמצאה תוצאה אחת',
      multipleSearchResults: 'נמצאו ${count} תוצאות'
    }
  };

  function getPhoneCountryTexts(lang) {
    var labels = Object.assign({}, PHONE_COUNTRY_TEXTS[lang]);
    if (PHONE_COUNTRY_TEXTS[lang] && typeof Intl.DisplayNames === 'function') {
      var countryNames = new Intl.DisplayNames([lang], { type: 'region' });
      window.intlTelInput.getCountryData().forEach(function (country) {
        labels[country.iso2] = countryNames.of(country.iso2.toUpperCase());
      });
    }
    return labels;
  }

  function getInitialCountry(lang) {
    return COUNTRY_BY_LANG[lang] || 'gb';
  }

  function buildFullPhone(input, iti) {
    if (!iti || !/^\+?[0-9().\- ]+$/.test(input.value.trim())) return null;
    if (iti.isValidNumber() !== true) return null;
    var number = iti.getNumber();
    return /^\+[1-9][0-9]{1,14}$/.test(number) ? number : null;
  }

  function getContactFailText() {
    var links =
      '<a href="tel:+355686658888">+355 68 665 8888</a> · ' +
      '<a href="mailto:dentalhealth.dev@gmail.com">dentalhealth.dev@gmail.com</a> · ' +
      '<a href="https://wa.me/355686658888" target="_blank" rel="noopener">WhatsApp</a>';
    var prefix = {
      en: 'Something went wrong. Please contact us directly:',
      al: 'Diçka shkoi keq. Ju lutemi na kontaktoni direkt:',
      it: 'Qualcosa è andato storto. Contattaci direttamente:',
      he: 'אירעה שגיאה. ניתן ליצור איתנו קשר ישירות:',
      de: 'Ein Fehler ist aufgetreten. Bitte kontaktieren Sie uns direkt:'
    }[getLang()] || 'Something went wrong. Please contact us directly:';
    return prefix + '<br>' + links;
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
          removeBtn.setAttribute('aria-label', (MODAL_TEXTS[getLang()] || MODAL_TEXTS.en).remove_file + ' ' + file.name);
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

    var phoneInput = document.getElementById('phone');
    var phoneIti = null;
    if (phoneInput && typeof window.intlTelInput === 'function') {
      var phoneLanguage = getLang();
      phoneIti = window.intlTelInput(phoneInput, {
        separateDialCode: true,
        initialCountry: getInitialCountry(phoneLanguage),
        i18n: getPhoneCountryTexts(phoneLanguage),
        formatAsYouType: false,
        validationNumberType: null,
        preferredCountries: ['al', 'it', 'ch', 'de', 'gb', 'us', 'fr', 'es']
      });

      function normalizePhone() {
        var value = phoneInput.value.trim();
        if (/^\+[0-9().\- ]+$/.test(value)) {
          phoneIti.setNumber(value);
        }
      }
      phoneInput.addEventListener('change', normalizePhone);

      function syncPhoneValidity() {
        var lang = getLang();
        if (phoneInput.validity.valueMissing) {
          phoneInput.setCustomValidity(PHONE_ERR[lang]);
        } else if (phoneInput.validity.patternMismatch) {
          phoneInput.setCustomValidity(PHONE_ERR[lang]);
        } else {
          phoneInput.setCustomValidity('');
        }
      }
      phoneInput.addEventListener('input', syncPhoneValidity);
      phoneInput.addEventListener('change', syncPhoneValidity);
      phoneInput.addEventListener('countrychange', syncPhoneValidity);
      syncPhoneValidity();
    }

    bookingForm.addEventListener('submit', function (e) {
      e.preventDefault();
      var nameField = document.getElementById('name');
      var emailField = document.getElementById('email');
      var phoneField = document.getElementById('phone');

      if (!nameField.value.trim()) {
        showToast((MODAL_TEXTS[getLang()] || MODAL_TEXTS.en).name_error, 'error');
        nameField.focus();
        return;
      }
      if (!validateEmail(emailField.value.trim())) {
        showToast((MODAL_TEXTS[getLang()] || MODAL_TEXTS.en).email_error, 'error');
        emailField.focus();
        return;
      }
      var fullPhone = buildFullPhone(phoneField, phoneIti);
      if (!fullPhone) {
        phoneField.setCustomValidity(PHONE_ERR[getLang()]);
        phoneField.reportValidity();
        phoneField.focus();
        return;
      }
      phoneField.setCustomValidity('');

      var submitBtn = e.submitter || bookingForm.querySelector('button.btn--primary');
      if (!submitBtn) return;
      var originalText = submitBtn.textContent;
      submitBtn.disabled = true;
      submitBtn.classList.add('btn--sending');
      submitBtn.textContent = (MODAL_TEXTS[getLang()] || MODAL_TEXTS.en).sending;

      var formData = new FormData(bookingForm);
      formData.set('phone', fullPhone);
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
        if (phoneIti) phoneIti.setNumber('');
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
        showToast('', 'success');
      }

      fetch(bookingForm.getAttribute('data-api-url'), {
        method: 'POST',
        body: formData,
      })
        .then(function (res) {
          if (!res.ok) {
            reportTrackingError('submitting booking', new Error('API returned HTTP ' + res.status));
            showToast(getContactFailText(), 'error');
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
          showToast(getContactFailText(), 'error');
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
