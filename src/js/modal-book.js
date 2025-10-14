import Accordion from 'accordion-js';
import 'accordion-js/dist/accordion.min.css';

import refs from './refs.js'; 
import { createBookModalCard } from './render-functions.js';
// Функції для роботи з кошиком перенесено в cart-handlers.js
import { handleQuantityChange, handleCartAction } from './cart.js';

let lastFocusedElement = null;
let scrollPosition = 0;
let currentBook = null;

export async function openBookModal(book) {
if (!book || typeof book !== 'object') return;

currentBook = book; 
// wasAddedToCart тут більше не потрібна

lastFocusedElement = document.activeElement;
const modal = refs.elBookModal;

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

document.body.style.position = '';
document.body.style.top = '';
document.body.style.overflow = '';
window.scrollTo({ top: scrollPosition, behavior: 'instant' });

if (lastFocusedElement) {
 lastFocusedElement.focus();
 lastFocusedElement = null;
}
currentBook = null;
}

export function handleBookModal(e) {
if (e.target.closest('.modal-close-btn') || e.target === refs.elBookModal) {
 return closeBookModal();
}

const targetBtn =
 e.target.closest('.decrease-btn') || e.target.closest('.increase-btn');
if (targetBtn) {
  // Логіка зміни кількості перенесена в cart-handlers.js
  return handleQuantityChange(targetBtn);
}

const actionBtn = e.target.closest('[data-action]');

if (actionBtn && currentBook) {
  // Логіка додавання/покупки перенесена в cart-handlers.js
  handleCartAction(actionBtn.dataset.action, currentBook);
  
  // Після успішної покупки може знадобитися закрити модалку
  if (actionBtn.dataset.action === 'buy-now') {
     // return closeBookModal(); // Вирішіть, чи потрібно закривати після 'buy-now'
  }
}
}

export function handleEsc(e) {
if (e.key === 'Escape') {
 return closeBookModal();
}
}