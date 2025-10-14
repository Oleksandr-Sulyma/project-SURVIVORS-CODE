import {
  BOOKS_BASE_URL,
  REQUEST_TIMEOUT,
  RETRY_ATTEMPTS,
  RETRY_DELAY,
  FALLBACK_CATEGORIES,
  CACHE_CONFIG,
} from './constants.js';

import axios from 'axios';

/* -------------------------- exports -------------------------- */
export { fetchJSON, normalizeBook, api };

/* -------------------------- fetch helpers -------------------------- */
async function fetchJSON(path, options = {}) {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), REQUEST_TIMEOUT);
  let lastError = null;

  for (let attempt = 1; attempt <= RETRY_ATTEMPTS; attempt++) {
    try {
      const res = await fetch(`${BOOKS_BASE_URL}${path}`, {
        signal: controller.signal,
        headers: {
          'Content-Type': 'application/json',
          Accept: 'application/json',
        },
        ...options,
      });
      clearTimeout(timeoutId);

      if (!res.ok) {
        const txt = await res.text().catch(() => '');
        throw new Error(`API ${res.status}: ${res.statusText}. ${txt}`);
      }
      return await res.json();
    } catch (err) {
      lastError = err;
      if (err.name === 'AbortError')
        throw new Error('Request timeout. Please check your connection.');
      if (attempt === RETRY_ATTEMPTS) throw lastError;
      await new Promise(r => setTimeout(r, RETRY_DELAY * attempt));
    }
  }
}

/* -------------------------- normalization -------------------------- */
function normalizeBook(book, fallbackImage = '') {
  return {
    id: book._id || 'no-id',
    title: book.title || 'Untitled',
    author: book.author || 'Unknown Author',
    image: book.book_image || fallbackImage,
    amazon_product_url: book.amazon_product_url || '#',
    price: book.price || '',
  };
}

/* -------------------------- canonization -------------------------- */
function canon(s) {
  return String(s || '')
    .toLowerCase()
    .normalize('NFKD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/&amp;/g, '&')
    .replace(/\s+/g, ' ')
    .replace(/[^\p{L}\p{N}\s]/gu, '')
    .trim();
}

/* -------------------------- deduplication -------------------------- */
function dedupeStable(list) {
  const out = [];
  const byId = new Set();
  const byTA = new Set();

  for (const b of list) {
    if (b?.id && b.id !== 'no-id') {
      const k = `id:${b.id}`;
      if (byId.has(k)) continue;
      byId.add(k);
      const ta = `ta:${canon(b.title)}|${canon(b.author)}`;
      byTA.add(ta);
      out.push(b);
      continue;
    }

    const ta = `ta:${canon(b.title)}|${canon(b.author)}`;
    if (byTA.has(ta)) continue;
    byTA.add(ta);
    out.push(b);
  }

  return out;
}

/* ------------------------------ cache ------------------------------ */
class MemoryCache {
  constructor(maxSize = CACHE_CONFIG.maxSize, ttl = CACHE_CONFIG.ttl) {
    this.cache = new Map();
    this.maxSize = maxSize;
    this.ttl = ttl;
  }
  set(key, value) {
    if (this.cache.size >= this.maxSize) {
      const first = this.cache.keys().next().value;
      this.cache.delete(first);
    }
    this.cache.set(key, { value, ts: Date.now() });
  }
  get(key) {
    const item = this.cache.get(key);
    if (!item) return null;
    if (Date.now() - item.ts > this.ttl) {
      this.cache.delete(key);
      return null;
    }
    return item.value;
  }
  clear() {
    this.cache.clear();
  }
}

/* ------------------------------- API -------------------------------- */
class BooksAPI {
  constructor() {
    this.cache = new MemoryCache();
  }

  async getCategories() {
    const key = 'categories';
    const cached = this.cache.get(key);
    if (cached) return cached;

    try {
      const data = await fetchJSON('/books/category-list');
      let categories = [];

      if (data && Array.isArray(data.results)) {
        categories = data.results
          .map(c => {
            if (typeof c === 'object' && c.list_name)
              return { name: c.list_name, value: c.list_name };
            if (typeof c === 'string') return { name: c, value: c };
            return null;
          })
          .filter(Boolean);
      }
      if (!categories.length)
        categories = FALLBACK_CATEGORIES.map(n => ({ name: n, value: n }));
      const result = [{ name: 'All Categories', value: 'all' }, ...categories];
      this.cache.set(key, result); // Виправлено: k на key
      return result;
    } catch {
      return [
        { name: 'All Categories', value: 'all' },
        ...FALLBACK_CATEGORIES.map(n => ({ name: n, value: n })),
      ];
    }
  }

  async getBooks(category = 'all', page = 1, limit) {
    if (!limit) {
      limit = window.innerWidth <= 768 ? 10 : 24;
    }

    const k = `books_${category}_${page}_${limit}`;
    const cached = this.cache.get(k);
    if (cached) return cached;

    try {
      let endpoint = '/books/top-books';
      if (category !== 'all') {
        endpoint = `/books/category?category=${encodeURIComponent(category)}`;
      }

      const data = await fetchJSON(endpoint);
      const allBooks = [];
      const seen = new Set();

      if (category === 'all') {
        if (Array.isArray(data)) {
          data.forEach(list => {
            if (Array.isArray(list.books)) {
              list.books.forEach(b => {
                const book = normalizeBook(b);
                const key = `${book.title}__${book.image}`;
                if (!seen.has(key)) {
                  seen.add(key);
                  allBooks.push(book);
                }
              });
            }
          });
        }
      } else {
        const booksArray = data?.results?.length
          ? data.results
          : Array.isArray(data)
          ? data
          : [];
        booksArray.forEach(b => {
          const book = normalizeBook(b);
          const key = `${book.title}__${book.image}`;
          if (!seen.has(key)) {
            seen.add(key);
            allBooks.push(book);
          }
        });
      }

      if (!allBooks.length) {
        console.log(`У категорії "${category}" немає книг.`);
      }

      const start = (page - 1) * limit;
      const end = start + limit;

      const result = {
        books: allBooks.slice(start, end),
        total: allBooks.length,
        showing: Math.min(end, allBooks.length),
        hasMore: end < allBooks.length,
        currentPage: page,
      };

      this.cache.set(k, result);
      return result;
    } catch (e) {
      throw new Error(`Failed to load books: ${e.message}`);
    }
  }
}

const api = new BooksAPI();

export const getBookById = async id => {
  try {
    const { data } = await axios.get(`${BOOKS_BASE_URL}/books/${id}`);
    return data;
  } catch (error) {
    throw error;
  }
};