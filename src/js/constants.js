export const BOOKS_BASE_URL = 'https://books-backend.p.goit.global';
export const REQUEST_TIMEOUT = 10000;
export const RETRY_ATTEMPTS = 3;
export const RETRY_DELAY = 1000;

// UI/логіка
export const BOOKS_CONFIG = {
  initialPerPageMobile: 10,
  initialPerPageDesktop: 24,
  perLoadMore: 4,
  mobileBreakpoint: 768,
  tabletBreakpoint: 1024,
};

// Cache
export const CACHE_CONFIG = {
  maxSize: 50,
  ttl: 5 * 60 * 1000,
};

// Фолбек-категорії
export const FALLBACK_CATEGORIES = [
  'Hardcover Fiction','Hardcover Nonfiction','Trade Fiction Paperback','Mass Market Monthly',
  'Paperback Trade Fiction','Paperback Nonfiction','E-Book Fiction','E-Book Nonfiction',
  'Hardcover Advice','Paperback Advice','Advice How-To and Miscellaneous',
  "Children's Middle Grade Hardcover",'Picture Books','Series Books','Young Adult Hardcover',
  'Audio Fiction','Audio Nonfiction','Business Books','Graphic Books and Manga',
  'Mass Market','Middle Grade Paperback','Young Adult Paperback',
];

// ID елементів у DOM
export const DOM_ELEMENTS = {
  booksGrid: 'books-grid',
  booksLoader: 'books-loader',
  showMoreBtn: 'show-more-btn',
  categoriesList: 'categories-list',
  categoriesLoader: 'categories-loader',
  booksError: 'books-error',
  booksCounter: 'books-counter-text',
  categoriesSelectTablet: 'categories-select-tablet',
  categoriesSelectMobile: 'categories-select-mobile',
};

// для екранування
export const HTML_ESCAPE_MAP = { '&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#039;' };