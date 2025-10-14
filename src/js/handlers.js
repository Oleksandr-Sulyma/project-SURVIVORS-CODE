import refs from './refs';
import { getBookById } from './api-service';
import { openBookModal } from './modal-book';


import iziToast from 'izitoast';
import 'izitoast/dist/css/iziToast.min.css';
import { validateEmail } from './helpers.js';
import { TOAST_DELAY, MESSAGES } from './constants.js';
import { saveEmailToLocal } from './storage.js';


export function createShowMoreHandler(section) {
  return () => section.loadMore();
}

export function createBookClickHandler() {
  return async function handler(e) {
    const btn = e.target.closest('.learn-more-btn');
    if (!btn) return;
    e.preventDefault();

    const bookId = btn.dataset.bookId;
    if (!bookId || bookId === 'no-id') return;

    try {
      const bookData = await getBookById(bookId);
      openBookModal(bookData);
    } catch (error) {
      console.error('Error fetching book:', error);
    }
  };
}

export function createResizeHandler(section) {
  return () => {
    if (section.debounceTimeout) clearTimeout(section.debounceTimeout);
    section.debounceTimeout = setTimeout(() => {
      const cards =
        section.elements.booksGrid?.querySelectorAll('.book-card') ?? [];
      cards.forEach(
        (card, i) => (card.style.animationDelay = `${(i % 8) * 0.05 + 0.1}s`)
      );
    }, 250);
  };
}

export function createCategoryChangeHandler(section) {
  return e => section.filterByCategory(e.target.value);
}

export function createCategoryButtonHandler(section) {
  return e => {
    const li = e.currentTarget.closest('.category-item');
    const cat = li?.dataset.category;
    if (cat && cat !== section.currentCategory) section.filterByCategory(cat);
  };
}

export function createRetryHandler(section) {
  return () => section.loadBooks(true);
}

export function createIntersectionObserver(onLoad) {
  return new IntersectionObserver(
    entries => {
      entries.forEach(entry => {
        if (entry.isIntersecting) onLoad(entry.target);
      });
    },
    { rootMargin: '50px 0px' }
  );
}

export function loadImage(img, observer) {
  const src = img.dataset.src;
  if (!src) return;
  img.classList.add('loading');
  const t = new Image();
  t.onload = () => {
    img.src = src;
    img.classList.remove('loading');
    img.classList.add('loaded');
    delete img.dataset.src;
    observer?.unobserve(img);
  };
  t.onerror = () => {
    img.classList.remove('loading');
    img.classList.add('error');
    observer?.unobserve(img);
  };
  t.src = src;
}

// -----footer-----
function showToast(type, title, message) {
  iziToast[type]({
    title,
    message,
    position: 'topRight',
  });
}

export function onFooterSubmit(e) {
  e.preventDefault();

  const email = refs.footerInput.value.trim();

  refs.footerBtn.classList.remove('btn-error', 'btn-success');
  refs.footerRemark.classList.remove('remark-error', 'remark-success');
  refs.footerInput.classList.remove('error', 'success');

  if (!email) {
    refs.footerRemark.textContent = MESSAGES.REQUIRED;
    refs.footerRemark.classList.add('remark-error');
    refs.footerInput.classList.add('error');
    showToast('warning', 'Caution', MESSAGES.REQUIRED);
    setTimeout(clearFormState, TOAST_DELAY);
    return;
  }

  if (!validateEmail(email)) {
    refs.footerRemark.textContent = MESSAGES.INVALID;
    refs.footerRemark.classList.add('remark-error');
    refs.footerBtn.classList.add('btn-error');
    refs.footerInput.classList.add('error');
    showToast('error', 'Error', MESSAGES.INVALID);
    setTimeout(clearFormState, TOAST_DELAY);
    return;
  }

  refs.footerRemark.textContent = '✅ ' + MESSAGES.SUCCESS;
  refs.footerRemark.classList.add('remark-success');
  refs.footerBtn.classList.add('btn-success');
  refs.footerInput.classList.add('success');
  showToast('success', 'OK', MESSAGES.SUCCESS);

  saveEmailToLocal(email);

  setTimeout(clearFormState, TOAST_DELAY);
  refs.footerForm.reset();
}

function clearFormState() {
  refs.footerRemark.textContent = '';
  refs.footerRemark.classList.remove('remark-error', 'remark-success');
  refs.footerBtn.classList.remove('btn-error', 'btn-success');
  refs.footerInput.classList.remove('error', 'success');
}
// -----footer-end-----
