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
    modal.setAttribute('aria-hidden', 'false');
    refs.elModalCloseBtn.focus({ preventScroll: true });

    refs.elBookModal.addEventListener('click', handleBookModal);
    window.addEventListener('keydown', handleEsc, { once: true });

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
    refs.elBookModal.removeEventListener('click', handleBookModal);

    modal.classList.remove('active', 'is-open');
    modal.setAttribute('aria-hidden', 'true');
    refs.elModalContent.querySelectorAll('.modal-book-layout').forEach(el => el.remove());

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



window.refs = refs;
window.createBookModalCard = createBookModalCard;

const book = {
  _id: '6867c877ac8a51f74dd67b11',
  title: "JUJUTSU KAISEN, VOL. 26",
  price: 15.99,
  amazon_product_url: "https://www.amazon.com/dp/1339005107?tag=thenewyorktim-20",
  cover_image: "https://static01.nyt.com/bestsellers/images/9781974754977.jpg"
};

// const card = createBookModalCard(book);
// refs.elModalContent.appendChild(card);
// console.log('Book card created:', card);