import iziToast from 'izitoast';
import 'izitoast/dist/css/iziToast.min.css';

import refs from './refs.js';
import { CARTKEY } from './constants.js';
import {
 getLocalStorage,
 setLocalStorage,
 removeLocalStorage, 
} from './storage.js';

export function isBookInCart(bookId) {
 const cartArr = getLocalStorage(CARTKEY);
 return cartArr.some(item => item.id === bookId);
}

export function updateCartButtonState(actionBtn, bookId) {
 if (isBookInCart(bookId)) {
  actionBtn.textContent = 'Remove from Cart';
  actionBtn.dataset.action = 'remove-from-cart';
 } else {
  actionBtn.textContent = 'Add to Cart';
  actionBtn.dataset.action = 'add-to-cart';
 }
}

export function handleQuantityChange(targetBtn) {
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
}

export function handleCartAction(actionBtn, currentBook) {
 const action = actionBtn.dataset.action;
 const quantityInput = refs.elModalContent.querySelector('.quantity-input');
 const quantity = parseInt(quantityInput.value) || 1;
 const bookPrice = Number(currentBook.price) || 0;

 if (bookPrice <= 0) {
  return showErrorMessage(
   `"${currentBook.title}" isn't available right now.<br>Check back soon — we'll restock it ASAP!`
  );
 }

 const bookId = currentBook._id;
 const itemTotalPrice = quantity * bookPrice;

 let cartArr = getLocalStorage(CARTKEY);
 const existingItemIndex = cartArr.findIndex(item => item.id === bookId);

 if (action === 'add-to-cart') {
  if (existingItemIndex !== -1) {
   cartArr.splice(existingItemIndex, 1);
  }
  
  const newItem = {
   id: bookId,
   quantity,
   price: bookPrice,
   title: currentBook.title,
  };
  cartArr.push(newItem);
  
  setLocalStorage(CARTKEY, cartArr);
  actionBtn.textContent = 'Remove from Cart';
  actionBtn.dataset.action = 'remove-from-cart';
  
  const totalItems = cartArr.reduce((sum, item) => sum + (Number(item.quantity) || 0), 0);
  const totalAmount = cartArr.reduce((sum, item) => sum + (Number(item.quantity) || 0) * (Number(item.price) || 0), 0);

  showInfo(
   `✅ You added <b>${quantity}</b> copies of "<b>${
    currentBook.title
   }</b>" to your cart for <b>$${itemTotalPrice.toFixed(2)}</b>.<br><br>
   🛒 Cart total: <b>${totalItems}</b> items worth <b>$${totalAmount.toFixed(
    2
   )}</b>.`
  );

 } else if (action === 'remove-from-cart') {
  const updatedCart = cartArr.filter(item => item.id !== bookId);
  setLocalStorage(CARTKEY, updatedCart);
  actionBtn.textContent = 'Add to Cart';
  actionBtn.dataset.action = 'add-to-cart';
  quantityInput.value = 1;
  
  const quantityControl = actionBtn.closest('.modal-book-layout')?.querySelector('.quantity-control');
  if (quantityControl) {
   quantityControl.querySelector('.decrease-btn').disabled = true;
  }
  
  showInfo(`🗑️ Book <b>"${currentBook.title}"</b> has been removed from your cart.`);

 } else if (action === 'buy-now') {
  let itemsToPurchase = [];
  const currentItem = { id: bookId, quantity, price: bookPrice, title: currentBook.title };
  
  if (existingItemIndex !== -1) {
   cartArr.splice(existingItemIndex, 1, currentItem);
   itemsToPurchase = cartArr;
  } else {
   itemsToPurchase = [...cartArr, currentItem];
  }

  const totalUniqueItems = new Set(itemsToPurchase.map(item => item.id)).size;
  const totalItems = itemsToPurchase.reduce((sum, item) => sum + (Number(item.quantity) || 0), 0);
  const totalAmount = itemsToPurchase.reduce((sum, item) => sum + (Number(item.quantity) || 0) * (Number(item.price) || 0), 0);

  const bookText = totalItems === 1 ? 'book' : 'books';

  showSuccess(
   `🎉 You've successfully purchased <b>${totalUniqueItems}</b> unique titles (<b>${totalItems}</b> ${bookText} total) for <b>$${totalAmount.toFixed(2)}</b>. Thank you for your purchase!`
  );

  removeLocalStorage(CARTKEY); 
  
  const cartActionBtn = actionBtn.closest('.modal-book-actions')?.querySelector('.add-to-cart-btn');
  if (cartActionBtn) {
   updateCartButtonState(cartActionBtn, bookId); 
  }
  
  quantityInput.value = 1;
 }
}

export function showErrorMessage(message) {
 return iziToast.error({
  title: '😔 Oops!',
  message,
  position: 'topRight',
  timeout: 5000,
  backgroundColor: '#ffcccc',
  titleColor: '#000',
  messageColor: '#000',
  maxWidth: 480,
 });
}

export function showInfo(message) {
 return iziToast.info({
  title: '🛒 Cart Updated',
  message,
  position: 'topRight',
  timeout: 5000,
  backgroundColor: '#d9ecff',
  titleColor: '#000',
  messageColor: '#000',
  maxWidth: 480,
 });
}

export function showSuccess(message) {
 return iziToast.success({
  title: '🎉 Purchase Successful!',
  message,
  position: 'topRight',
  timeout: 5000,
  backgroundColor: '#8a2be2',
  titleColor: '#fff',
  messageColor: '#fff',
  maxWidth: 480,
 });
}

export function showRegistrationSuccess(name, email) {
 return iziToast.success({
  title: '🎉 Registration Successful!',
  message: `Thank you for registering, ${name}! We will contact you at ${email}.`,
  position: 'topRight',
  timeout: 5000,
  backgroundColor: '#28a745',
  titleColor: '#fff',
  messageColor: '#fff',
  maxWidth: 480,
 });
}