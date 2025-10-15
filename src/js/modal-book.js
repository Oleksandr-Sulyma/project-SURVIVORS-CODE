import Accordion from 'accordion-js';
import 'accordion-js/dist/accordion.min.css';

import refs from './refs.js';
import { createBookModalCard } from './render-functions.js';
import { handleQuantityChange, handleCartAction } from './cart.js';

let lastFocusedElement = null;
let scrollPosition = 0;
let currentBook = null;

export async function openBookModal(book) {
  if (!book || typeof book !== 'object') return;

  currentBook = book;
  lastFocusedElement = document.activeElement;
  const modal = refs.elBookModal;

  scrollPosition = window.scrollY;
  document.body.style.top = `-${scrollPosition}px`;
  document.body.style.position = 'fixed';
  document.body.style.width = '100%';
  document.body.style.overflow = 'hidden';

  refs.elModalContent.querySelectorAll('.modal-book-layout').forEach(el => el.remove());
  const bookCard = createBookModalCard(book);
  refs.elModalContent.appendChild(bookCard);

  modal.classList.add('active', 'is-open');
  modal.removeAttribute('inert');
  modal.setAttribute('aria-hidden', 'false');
  refs.elModalCloseBtn.focus({ preventScroll: true });

  refs.elBookModal.addEventListener('click', handleBookModal);
  window.addEventListener('keydown', handleEsc);

  const accordions = Array.from(refs.elModalContent.querySelectorAll('.accordion-container'));
  if (accordions.length > 0) {
    new Accordion(accordions, {
      duration: 300,
      showMultiple: true,
      triggerClass: 'ac-header',
    });
  }
}

export function closeBookModal() {
  const modal = refs.elBookModal;

  if (document.activeElement && modal.contains(document.activeElement)) {
    document.activeElement.blur();
  }

  refs.elBookModal.removeEventListener('click', handleBookModal);
  window.removeEventListener('keydown', handleEsc);

  modal.classList.remove('active', 'is-open');
  modal.setAttribute('aria-hidden', 'true');
  modal.setAttribute('inert', '');

  setTimeout(() => {
    document.body.style.position = '';
    document.body.style.top = '';
    document.body.style.overflow = '';
    window.scrollTo({ top: scrollPosition, behavior: 'instant' });

    if (lastFocusedElement) {
      lastFocusedElement.focus();
      lastFocusedElement = null;
    }
    currentBook = null;
    refs.elModalContent.querySelectorAll('.modal-book-layout').forEach(el => el.remove());
  }, 300);
}

export function handleBookModal(e) {
  if (e.target.closest('.modal-close-btn') || e.target === refs.elBookModal) {
    return closeBookModal();
  }

  const targetBtn = e.target.closest('.decrease-btn') || e.target.closest('.increase-btn');
  if (targetBtn) {
    return handleQuantityChange(targetBtn);
  }

  const actionBtn = e.target.closest('[data-action]');
  if (actionBtn && currentBook) {
    handleCartAction(actionBtn.dataset.action, currentBook);
    if (actionBtn.dataset.action === 'buy-now') {
    }
  }
}

export function handleEsc(e) {
  if (e.key === 'Escape') {
    return closeBookModal();
  }
}