import Accordion from 'accordion-js';
import 'accordion-js/dist/accordion.min.css';

import refs from './refs.js';
import { createBookModalCard } from './render-functions.js';

let lastFocusedElement = null;
let scrollPosition = 0; // збереження позиції скролу

export async function openBookModal(book) {
  if (!book || typeof book !== 'object') return;

  lastFocusedElement = document.activeElement;
  const modal = refs.elBookModal;

  // Зберігаємо позицію скролу
  scrollPosition = window.scrollY;
  document.body.style.top = `-${scrollPosition}px`;
  document.body.style.position = 'fixed';
  document.body.style.width = '100%';
  document.body.style.overflow = 'hidden';

  refs.elModalContent
    .querySelectorAll('.modal-book-layout')
    .forEach(el => el.remove());
  const bookCard = createBookModalCard(book);
  refs.elModalContent.appendChild(bookCard);

  modal.classList.add('active', 'is-open');
  modal.setAttribute('aria-hidden', 'false');
  refs.elModalCloseBtn.focus({ preventScroll: true });

  refs.elBookModal.addEventListener('click', handleBookModal);
  window.addEventListener('keydown', handleEsc, { once: true });

  const accordions = Array.from(
    refs.elModalContent.querySelectorAll('.accordion-container')
  );
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
  refs.elBookModal.removeEventListener('click', handleBookModal);

  modal.classList.remove('active', 'is-open');
  modal.setAttribute('aria-hidden', 'true');
  refs.elModalContent
    .querySelectorAll('.modal-book-layout')
    .forEach(el => el.remove());

  // Повертаємо прокрутку, без стрибка
  document.body.style.position = '';
  document.body.style.top = '';
  document.body.style.overflow = '';
  window.scrollTo({ top: scrollPosition, behavior: 'instant' });

  if (lastFocusedElement) {
    lastFocusedElement.focus();
    lastFocusedElement = null;
  }
}

export function handleBookModal(e) {
  if (e.target.closest('.modal-close-btn')) {
    return closeBookModal();
  }
  if (e.target === refs.elBookModal) {
    return closeBookModal();
  }

  const targetBtn =
    e.target.closest('.decrease-btn') || e.target.closest('.increase-btn');
  if (targetBtn) {
    const quantityControl = targetBtn.closest('.quantity-control');
    const input = quantityControl.querySelector('.quantity-input');

    let value = parseInt(input.value);
    const min = parseInt(input.min) || 1;
    const max = parseInt(input.max) || 99;

    if (targetBtn.classList.contains('increase-btn') && value < max) {
      input.value = value + 1;
    } else if (targetBtn.classList.contains('decrease-btn') && value > min) {
      input.value = value - 1;
    }

    quantityControl.querySelector('.decrease-btn').disabled =
      parseInt(input.value) <= min;
    return;
  }
}

export function handleEsc(e) {
  if (e.key === 'Escape') {
    return closeBookModal();
  }
}
