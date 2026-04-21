document.addEventListener('DOMContentLoaded', function () {
  var mobileToggle = document.getElementById('mobile-menu-toggle');
  var mobileMenu = document.getElementById('mobile-menu');

  if (mobileToggle && mobileMenu) {
    mobileToggle.addEventListener('click', function () {
      mobileMenu.classList.toggle('mobile-menu--open');
      mobileToggle.classList.toggle('hamburger--open');
    });
  }

  var backToTop = document.getElementById('back-to-top');
  if (backToTop) {
    window.addEventListener('scroll', function () {
      if (window.scrollY > 400) {
        backToTop.classList.add('back-to-top--visible');
      } else {
        backToTop.classList.remove('back-to-top--visible');
      }
    });

    backToTop.addEventListener('click', function () {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    });
  }

  var bookingForm = document.getElementById('booking-form');
  if (bookingForm) {
    bookingForm.addEventListener('submit', function (e) {
      e.preventDefault();
      var fileInput = document.getElementById('panoramic');
      var hasFile = fileInput && fileInput.files && fileInput.files.length > 0;

      if (hasFile) {
        var formData = new FormData(bookingForm);
        fetch('https://api.dentalhealth.al/book', {
          method: 'POST',
          body: formData,
        })
          .then(function (res) {
            if (res.ok) {
              bookingForm.reset();
              alert('Thank you! We will contact you shortly.');
            } else {
              alert('Something went wrong. Please try calling us directly.');
            }
          })
          .catch(function () {
            alert('Something went wrong. Please try calling us directly.');
          });
      } else {
        var formData = new FormData(bookingForm);
        var data = {};
        formData.forEach(function (value, key) {
          if (key !== 'panoramic') data[key] = value;
        });
        fetch('https://api.dentalhealth.al/book', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(data),
        })
          .then(function (res) {
            if (res.ok) {
              bookingForm.reset();
              alert('Thank you! We will contact you shortly.');
            } else {
              alert('Something went wrong. Please try calling us directly.');
            }
          })
          .catch(function () {
            alert('Something went wrong. Please try calling us directly.');
          });
      }
    });
  }

  var yearEls = document.querySelectorAll('[data-year]');
  yearEls.forEach(function (el) {
    el.textContent = new Date().getFullYear();
  });
});
