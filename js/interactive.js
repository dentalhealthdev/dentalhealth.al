(function () {
  function init() {
    var teamCarousel = document.querySelector('.team-carousel');
    if (teamCarousel && typeof window.Swiper === 'function') {
      new window.Swiper('.team-carousel', {
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
    if (patientCarousel && typeof window.Swiper === 'function') {
      new window.Swiper('.patient-carousel', {
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
      var element = card.querySelector('.review-card__text');
      var button = card.querySelector('.review-card__more');
      if (element && button && element.scrollHeight > element.clientHeight) {
        button.style.display = '';
        button.addEventListener('click', function () {
          var isExpanded = element.classList.toggle('expanded');
          button.textContent = isExpanded ? (button.dataset.less || 'Show less') : (button.dataset.more || 'Show more');
          button.setAttribute('aria-label', button.textContent);
        });
      }
    });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
