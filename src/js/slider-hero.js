import Swiper from 'swiper/bundle';
import 'swiper/css/bundle';

const swiper = new Swiper('.heroSwiper', {
  cssMode: true,
  speed: 500,
  navigation: {
    nextEl: '.swiper-button-next',
    prevEl: '.swiper-button-prev',
  },
  keyboard: true,
});

const next = document.querySelector('.button-next');
const prev = document.querySelector('.button-prev');

next.addEventListener('click', () => {
  console.log('next');
  swiper.slideNext();
});

prev.addEventListener('click', () => {
  console.log('prev');
  swiper.slidePrev();
});
