// src/js/books-data.js
import { api } from './api-service.js';
import { DOM_ELEMENTS, BOOKS_CONFIG } from './constants.js';
import {
  renderCategories,
  populateDropdowns,
  renderBooks,
  appendBooks,
  updateBooksCounter,
  updateShowMoreButton,
  showError,
  hideError,
  setLoading,
  setCategoriesLoading,
  updateCategoriesActiveState,
} from './render-functions.js';
import {
  createShowMoreHandler,
  createBookClickHandler,
  createResizeHandler,
  createCategoryChangeHandler,
  createCategoryButtonHandler,
  createRetryHandler,
  createIntersectionObserver,
  loadImage,
} from './handlers.js';

/* ----------------------------- UI-level dedupe ----------------------------- */
function norm(s) {
  return String(s || '')
    .toLowerCase()
    .replace(/&amp;/g, '&')
    .replace(/\s+/g, ' ')
    .replace(/[^\p{L}\p{N}\s]/gu, '')
    .trim();
}

function keyTA(b) {
  const t = norm(b.title);
  const a = norm(b.author);
  return t || a ? `ta:${t}|${a}` : `id:${b.id || 'no-id'}`;
}

function dedupeForUI(list = []) {
  const seen = new Set();
  const out = [];
  for (const b of list) {
    const k = keyTA(b);
    if (seen.has(k)) continue;
    seen.add(k);
    out.push(b);
  }
  return out;
}

/**
 * Merge `existing` with `candidates` and take at most `takeCount` NEW unique items
 * (unique by title+author). Returns { merged, newItems }.
 */
function mergeTakeNew(existing, candidates, takeCount) {
  const seen = new Set(existing.map(keyTA));
  const merged = existing.slice();
  const newItems = [];
  for (const b of candidates) {
    const k = keyTA(b);
    if (seen.has(k)) continue;
    seen.add(k);
    merged.push(b);
    newItems.push(b);
    if (newItems.length >= takeCount) break;
  }
  return { merged, newItems };
}

/* --------------------------------- Class ---------------------------------- */
class BooksSection {
  constructor() {
    this.elements = {
      booksGrid: document.getElementById(DOM_ELEMENTS.booksGrid),
      booksLoader: document.getElementById(DOM_ELEMENTS.booksLoader),
      showMoreBtn: document.getElementById(DOM_ELEMENTS.showMoreBtn),
      categoriesUL: document.getElementById(DOM_ELEMENTS.categoriesList),
      categoriesLoader: document.getElementById(DOM_ELEMENTS.categoriesLoader),
      errorElement: document.getElementById(DOM_ELEMENTS.booksError),
      booksCounter: document.getElementById(DOM_ELEMENTS.booksCounter),
      categoriesSelectTablet: document.getElementById(
        DOM_ELEMENTS.categoriesSelectTablet
      ),
      categoriesSelectMobile: document.getElementById(
        DOM_ELEMENTS.categoriesSelectMobile
      ),
    };

    this.currentCategory = 'all';
    this.currentPage = 1;
    this.isLoading = false;
    this.hasMore = true;
    this.loadedBooks = [];

    this.imageObserver = null;
    this.debounceTimeout = null;

    this.initialCount = this.getInitialBooksCount();
    this.init();
  }

  async init() {
    try {
      hideError(this.elements.errorElement);
      this.setupEventListeners();
      this.setupObservers();
      await this.renderCategories();
      await this.loadBooks(true);
    } catch (e) {
      console.error('Books init error:', e);
      showError(
        this.elements.errorElement,
        'Failed to load books. Please try again.'
      );
    }
  }

  setupEventListeners() {
    this.elements.showMoreBtn?.addEventListener(
      'click',
      createShowMoreHandler(this)
    );
    this.elements.booksGrid?.addEventListener(
      'click',
      createBookClickHandler()
    );
    window.addEventListener('resize', createResizeHandler(this));
    this.elements.categoriesSelectTablet?.addEventListener(
      'change',
      createCategoryChangeHandler(this)
    );
    this.elements.categoriesSelectMobile?.addEventListener(
      'change',
      createCategoryChangeHandler(this)
    );
    this.elements.errorElement
      ?.querySelector('.retry-btn')
      ?.addEventListener('click', createRetryHandler(this));
  }

  setupObservers() {
    if ('IntersectionObserver' in window) {
      this.imageObserver = createIntersectionObserver(img =>
        loadImage(img, this.imageObserver)
      );
    }
  }

  async renderCategories() {
    if (!this.elements.categoriesUL) return;
    setCategoriesLoading(this.elements.categoriesLoader, true);
    try {
      const categories = await api.getCategories();
      renderCategories(
        this.elements.categoriesUL,
        categories,
        this.currentCategory
      );
      this.elements.categoriesUL
        .querySelectorAll('.category-button')
        .forEach(btn =>
          btn.addEventListener('click', createCategoryButtonHandler(this))
        );
      populateDropdowns(
        [
          this.elements.categoriesSelectTablet,
          this.elements.categoriesSelectMobile,
        ],
        categories,
        this.currentCategory
      );
    } finally {
      setCategoriesLoading(this.elements.categoriesLoader, false);
    }
  }

  async loadBooks(reset = false) {
    if (this.isLoading) return;
    this.setLoading(true);
    hideError(this.elements.errorElement);
    try {
      const limit = reset
        ? this.getInitialBooksCount()
        : window.innerWidth <= BOOKS_CONFIG.mobileBreakpoint
        ? BOOKS_CONFIG.perLoadMoreMobile
        : BOOKS_CONFIG.perLoadMoreDesktop;
      const page = reset ? 1 : this.currentPage + 1;
      const data = await api.getBooks(this.currentCategory, page, limit);

      if (reset) {
        this.loadedBooks = [...data.books];
        this.currentPage = 1;
        renderBooks(this.elements.booksGrid, this.loadedBooks);
      } else {
        this.loadedBooks.push(...data.books);
        this.currentPage = page;
        appendBooks(this.elements.booksGrid, data.books);
      }

      this.setupLazyLoading();

      const total =
        typeof data.total === 'number'
          ? data.total
          : dedupeForUI(this.loadedBooks).length;

      // hasMore if server still has items AND we still didn't hit total
      this.hasMore = Boolean(data.hasMore) && this.loadedBooks.length < total;

      this.updateShowMoreButton();
      updateBooksCounter(
        this.elements.booksCounter,
        this.loadedBooks.length,
        total
      );
    } catch (e) {
      console.error('Load books error:', e);
      showError(
        this.elements.errorElement,
        `Failed to load books: ${e.message}`
      );
    } finally {
      this.setLoading(false);
    }
  }

  setupLazyLoading() {
    if (!this.imageObserver) return;
    this.elements.booksGrid
      ?.querySelectorAll('.book-cover[data-src]')
      .forEach(img => this.imageObserver.observe(img));
  }

  async filterByCategory(category) {
    if (category === this.currentCategory) return;

    this.currentCategory = category;
    this.currentPage = 1;
    this.loadedBooks = [];

    updateCategoriesActiveState(this.elements.categoriesUL, category);
    if (this.elements.categoriesSelectTablet)
      this.elements.categoriesSelectTablet.value = category;
    if (this.elements.categoriesSelectMobile)
      this.elements.categoriesSelectMobile.value = category;
    await this.loadBooks(true);
  }

  async loadMore() {
    if (!this.hasMore || this.isLoading) return;
    await this.loadBooks(false);
  }
  updateShowMoreButton() {
    updateShowMoreButton(
      this.elements.showMoreBtn,
      this.hasMore,
      this.isLoading
    );
  }
  getInitialBooksCount() {
    return window.innerWidth <= BOOKS_CONFIG.mobileBreakpoint
      ? BOOKS_CONFIG.initialPerPageMobile
      : BOOKS_CONFIG.initialPerPageDesktop;
  }
  setLoading(v) {
    this.isLoading = v;
    setLoading(this.elements.booksLoader, this.elements.booksGrid, v);
    this.updateShowMoreButton();
  }
  destroy() {
    this.imageObserver?.disconnect();
    if (this.debounceTimeout) clearTimeout(this.debounceTimeout);
  }
}

export default BooksSection;
