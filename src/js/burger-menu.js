const navbar = document.querySelector('[data-navbar]');
const burgerOpen = document
  .querySelector('[data-navbar-open]')
  .addEventListener('click', () => {
    navbar.classList.remove('is-close');
    navbar.classList.add('is-open');
    document.body.classList.add('no-scroll');
  });

const burgerClose = document
  .querySelector('[data-navbar-close]')
  .addEventListener('click', () => {
    navbar.classList.replace('is-open', 'is-close');
    document.body.classList.remove('no-scroll');
  });
