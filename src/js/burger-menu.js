const refs = {
  navbar: document.querySelector('[data-navbar]'),
  burgerOpen: document.querySelector('[data-navbar-open]'),
  burgerClose: document.querySelector('[data-navbar-close]'),
  navbarLink: document.querySelector('.navbar-nav-list'),
};

refs.burgerOpen.addEventListener('click', () => {
  refs.navbar.classList.remove('is-close');
  refs.navbar.classList.add('is-open');
  document.body.classList.add('no-scroll');
});

function closeNavbar() {
  refs.navbar.classList.replace('is-open', 'is-close');
  document.body.classList.remove('no-scroll');
}

refs.burgerClose.addEventListener('click', () => {
  closeNavbar();
});

refs.navbarLink.addEventListener('click', e => {
  if (e.target.className === 'navbar-nav-list') {
    return;
  }
  closeNavbar();
});
