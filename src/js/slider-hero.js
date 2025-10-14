import Swiper from 'swiper/bundle';
import 'swiper/css/bundle';

const swiper = new Swiper('.heroSwiper', {
  spaceBetween: 2,
  slidesPerView: 1,
  speed: 1000,
  keyboard: {
    enabled: true,
  },
  autoplay: {
    delay: 5000,
    disableOnInteraction: false,
  },
  on: {
    init: () => {
      document.querySelector('.heroSwiper').style.visibility = 'visible';
    },
  },
});

const nextBtn = document.querySelector('.button-next');
const prevBtn = document.querySelector('.button-prev');

function updateButtons() {
  if (swiper.isBeginning) {
    prevBtn.disabled = true;
    prevBtn.classList.add('disabled');
  } else {
    prevBtn.disabled = false;
    prevBtn.classList.remove('disabled');
  }

  if (swiper.isEnd) {
    nextBtn.disabled = true;
    nextBtn.classList.add('disabled');
  } else {
    nextBtn.disabled = false;
    nextBtn.classList.remove('disabled');
  }
}

updateButtons();

swiper.on('slideChange', updateButtons);

nextBtn.addEventListener('click', () => {
  swiper.slideNext();
});

prevBtn.addEventListener('click', () => {
  swiper.slidePrev();
});
