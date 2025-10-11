import Splide from '@splidejs/splide';

const options = [
  {
    sliderClassName: 'splide--pages',
    sliderPagesBlock: '.alerts-block .slider-pages',
    extraOptions: {
      perPage: 1,
      pagination: false,
      mediaQuery: 'min',
      breakpoints: {
        992: {
          perPage: 2,
          perMove: 2,
          gap: '1rem',
        },
      },
    },
  },
  {
    sliderClassName: 'splide--list',
    extraOptions: {
      type: 'loop',
      perPage: 1,
      pagination: false,
      mediaQuery: 'min',
      breakpoints: {
        768: {
          perPage: 2,
          perMove: 1,
          gap: '1rem',
        },
        1024: {
          perPage: 3,
        },
        1200: {
          perPage: 4,
        },
      },
    },
  },
  {
    sliderClassName: 'splide--gallery',
    extraOptions: {
      type: 'loop',
      perPage: 1,
      pagination: true,
    },
  },
];

options.forEach(sliderItem => {
  Array.prototype.forEach.call(
    context.querySelectorAll(
      `.${sliderItem.sliderClassName}:not(.o-slider--processed)`
    ),
    el => {
      const slider = new Splide(el, sliderItem.extraOptions);

      // if (sliderItem.sliderPagesBlock) {
      //   const pagesBlock = context.querySelector(sliderItem.sliderPagesBlock);
      //   slider.on('move resize', () => {
      //     pagesBlock.innerHTML = Drupal.t(
      //       '@current of @count',
      //       {
      //         '@current': slider.index + 2,
      //         '@count': slider.length
      //       }
      //     );
      //   });
      // };
      slider.mount();
      if (slider.length <= 1) {
        slider.options.perPage = 1;
      }
      el.classList.add('o-slider--processed');
    }
  );
});
