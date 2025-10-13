import Accordion from 'accordion-js';
import 'accordion-js/dist/accordion.min.css';

import refs from './refs.js';
import { createBookModalCard } from './render-functions.js';

let lastFocusedElement = null;

export async function openBookModal(book) {
    if (!book || typeof book !== 'object') return; 

    lastFocusedElement = document.activeElement;
    const modal = refs.elBookModal;
    
    refs.elModalContent.querySelectorAll('.modal-book-layout').forEach(el => el.remove()); 
    const bookCard = createBookModalCard(book);
    refs.elModalContent.appendChild(bookCard);

    modal.classList.add('active', 'is-open');
    modal.setAttribute('aria-hidden', 'false');
    
    document.body.classList.add('modal-open');
    document.documentElement.classList.add('modal-open'); 

    refs.elModalCloseBtn.focus();

    refs.elBookModal.addEventListener('click', handleBookModal);
    window.addEventListener('keydown', handleEsc, { once: true });

    const accordions = Array.from(refs.elModalContent.querySelectorAll(".accordion-container"));
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

    const otherModalsOpen =
        document.querySelectorAll('.modal-backdrop.is-open').length > 0;
        
    if (!otherModalsOpen) {
        document.body.classList.remove('modal-open');
        document.documentElement.classList.remove('modal-open');
    }
    
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

    const targetBtn = e.target.closest('.decrease-btn') || e.target.closest('.increase-btn');
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

        quantityControl.querySelector('.decrease-btn').disabled = parseInt(input.value) <= min;
        
        return;
    }
}

export function handleEsc(e) {
    if (e.key === 'Escape') {
        return closeBookModal();
    }
}