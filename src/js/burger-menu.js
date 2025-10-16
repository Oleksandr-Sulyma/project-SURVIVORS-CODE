const refs = {
  navbar: document.querySelector('[data-navbar]'),
  burgerOpen: document.querySelector('[data-navbar-open]'),
  burgerClose: document.querySelector('[data-navbar-close]'),
  navbarLink: document.querySelector('.navbar-nav-list'),
};

refs.burgerOpen.addEventListener('click', openNavbar);
refs.burgerClose.addEventListener('click', closeNavbar);
refs.navbarLink.addEventListener('click', closeNavbar);

function openNavbar() {
  refs.navbar.classList.remove('is-close');
  refs.navbar.classList.add('is-open');
  refs.burgerOpen.setAttribute('aria-expanded', 'true');
  document.body.classList.add('no-scroll');

  refs.burgerClose.addEventListener('click', closeNavbar);
  refs.navbarLink.addEventListener('click', handleLinkClick);
  window.addEventListener('keydown', handleEscClose);
}

function closeNavbar() {
  refs.navbar.classList.replace('is-open', 'is-close');
  document.body.classList.remove('no-scroll');
  refs.burgerOpen.setAttribute('aria-expanded', 'false');

  refs.burgerClose.removeEventListener('click', closeNavbar);
  refs.navbarLink.removeEventListener('click', handleLinkClick);
  window.removeEventListener('keydown', handleEscClose);
}

function handleLinkClick(e) {
  if (e.target.className === 'navbar-nav-list') {
    return;
  }
  closeNavbar();
}

function handleEscClose(e) {
  if (e.key === 'Escape') closeNavbar();
}

refs.burgerOpen.addEventListener('click', openNavbar);
