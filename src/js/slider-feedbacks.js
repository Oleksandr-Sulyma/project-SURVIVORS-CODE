import Swiper from 'swiper';
import 'swiper/css';
import 'swiper/css/navigation';
import 'swiper/css/pagination';
import {
  Navigation,
  Pagination,
  A11y,
  Keyboard,
  Mousewheel,
} from 'swiper/modules';

Swiper.use([Navigation, Pagination, A11y, Keyboard, Mousewheel]);

document.addEventListener('DOMContentLoaded', function () {
  const swiperElement = document.querySelector('.feedbacks-slider');

  if (!swiperElement) {
    console.error('Swiper: Контейнер .feedbacks-slider не знайдено.');
    return;
  }

  const swiper = new Swiper(swiperElement, {
    slidesPerView: 1,
    spaceBetween: 24,
    watchOverflow: true,

    navigation: {
      nextEl: '.feedbacks-arrows .swiper-button-next',
      prevEl: '.feedbacks-arrows .swiper-button-prev',
    },
    pagination: {
      el: '.feedbacks .carousel-navigation .feedbacks-pagination',
      clickable: true,
    },
    a11y: {
      enabled: true,
    },
    keyboard: {
      enabled: true,
    },
    mousewheel: {
      enabled: true,
      forceToAxis: true,
    },

    breakpoints: {
      320: {
        slidesPerView: 1,
      },
      768: {
        slidesPerView: 2,
      },
      1440: {
        slidesPerView: 3,
      },
    },
  });
});
