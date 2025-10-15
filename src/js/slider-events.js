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

const swiperElement = document.querySelector('.events-slider');
const eventSlider = new Swiper(swiperElement, {
  slidesPerView: 1,
  spaceBetween: 24,
  watchOverflow: true,

  navigation: {
    nextEl: '.events-section .swiper-button-next',
    prevEl: '.events-section .swiper-button-prev',
  },
  pagination: {
    el: '.events-section .swiper-pagination',
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
