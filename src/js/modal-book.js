import Accordion from 'accordion-js';
import 'accordion-js/dist/accordion.min.css';
import refs from './refs.js'; 
import { createBookModalCard } from './render-functions.js';
import { CARTKEY, BUYKEY } from './constants.js'; 
import {showWarning, showError, showGreeting} from './cart.js'

let lastFocusedElement = null;
let scrollPosition = 0;
let currentBook = null;
let wasAddedToCart = false; 

export const setLocalStorage = (key, array) =>
 localStorage.setItem(key, JSON.stringify(array));

export const getLocalStorage = key => (JSON.parse(localStorage.getItem(key)) || []);

export const removeLocalStorage = key => localStorage.removeItem(key);

export async function openBookModal(book) {
 if (!book || typeof book !== 'object') return;

 currentBook = book; 
 wasAddedToCart = false; 

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
 wasAddedToCart = false;
}

export function handleBookModal(e) {
 if (e.target.closest('.modal-close-btn') || e.target === refs.elBookModal) {
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
 
 const actionBtn = e.target.closest('[data-action]');
 
 if (actionBtn && currentBook) {
  const action = actionBtn.dataset.action;
  
  const quantityInput = refs.elModalContent.querySelector('.quantity-input');
  const quantity = parseInt(quantityInput.value) || 1;
  
  const bookPrice = currentBook.price || 0; 
  
  if (bookPrice <= 0) {
   showError (`Unfortunately, the book "${currentBook.title}" is currently out of stock. We will notify you when it becomes available.`)
   return; 
  }
  
  const bookId = currentBook._id;
  const itemTotalPrice = quantity * bookPrice;

  if (action === 'add-to-cart') {
   wasAddedToCart = true; 
   
   let cartArr = getLocalStorage(CARTKEY);
   
   const newItem = {
    id: bookId, 
    quantity: quantity,
    price: bookPrice,
    title: currentBook.title
   };
   
   cartArr.push(newItem); 
   setLocalStorage(CARTKEY, cartArr);
   
   const totalItems = cartArr.reduce((sum, item) => sum + (Number(item.quantity) || 0), 0);
   const totalAmount = cartArr.reduce((sum, item) => sum + (Number(item.quantity) || 0) * (Number(item.price) || 0), 0);
   
   showWarning(
  `✅ You have added ${quantity} books "${currentBook.title}" to the cart for $${itemTotalPrice.toFixed(2)}.<br><br>
  🛒 Total items in cart: ${totalItems} positions for a total of $${totalAmount.toFixed(2)}.`
);
   
  } else if (action === 'buy-now') {
   let cartArr = getLocalStorage(CARTKEY); 
   
   let itemsToPurchase = [];
   
   const currentItem = {
     id: bookId, 
     quantity: quantity,
     price: bookPrice,
     title: currentBook.title
   };

   const existingItemIndex = cartArr.findIndex(item => item.id === bookId);

   if (existingItemIndex !== -1) {
    cartArr.splice(existingItemIndex, 1, currentItem);
    itemsToPurchase = cartArr;
   } else {
    itemsToPurchase = [...cartArr, currentItem];
   }

   const totalUniqueItems = new Set(itemsToPurchase.map(item => item.id)).size;
   const totalItems = itemsToPurchase.reduce((sum, item) => sum + (Number(item.quantity) || 0), 0);
   const totalAmount = itemsToPurchase.reduce((sum, item) => sum + (Number(item.quantity) || 0) * (Number(item.price) || 0), 0);

   showGreeting(
    `${totalUniqueItems} unique items (total ${totalItems} books) for a total of $${totalAmount.toFixed(2)}. Thank you for your purchase!`
   );
   
   removeLocalStorage(CARTKEY); 
  }
 }
}

export function handleEsc(e) {
 if (e.key === 'Escape') {
  return closeBookModal();
 }
}