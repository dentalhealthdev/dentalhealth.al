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
});
