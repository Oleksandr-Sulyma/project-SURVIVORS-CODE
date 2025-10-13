// src/js/api-service.js
import {
  BOOKS_BASE_URL,
  REQUEST_TIMEOUT,
  RETRY_ATTEMPTS,
  RETRY_DELAY,
  FALLBACK_CATEGORIES,
  CACHE_CONFIG,
} from './constants.js';

/* -------------------------- fetch helpers -------------------------- */
async function fetchJSON(path, options = {}) {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), REQUEST_TIMEOUT);
  let lastError = null;

  for (let attempt = 1; attempt <= RETRY_ATTEMPTS; attempt++) {
    try {
      const res = await fetch(`${BOOKS_BASE_URL}${path}`, {
        signal: controller.signal,
        headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
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
      if (err.name === 'AbortError') throw new Error('Request timeout. Please check your connection.');
      if (attempt === RETRY_ATTEMPTS) throw lastError;
      await new Promise(r => setTimeout(r, RETRY_DELAY * attempt));
    }
  }
}

/* -------------------------- normalization -------------------------- */
function normalizeBook(book, fallbackImage = '') {
  // trim strings, protect against null/undefined
  const title  = String(book?.title ?? '').trim();
  const author = String(book?.author ?? '').trim();

  return {
    id: book?._id || 'no-id',
    title: title || 'Untitled',
    author: author || 'Unknown Author',
    image: book?.book_image || fallbackImage,
    amazon_product_url: book?.amazon_product_url || '#',
    price: book?.price || '',
  };
}

function canon(s) {
  // lowercased, collapsed spaces, strip punctuation/diacritics
  return String(s || '')
    .toLowerCase()
    .normalize('NFKD')
    .replace(/[\u0300-\u036f]/g, '')       // diacritics
    .replace(/&amp;/g, '&')
    .replace(/\s+/g, ' ')
    .replace(/[^\p{L}\p{N}\s]/gu, '')
    .trim();
}

/**
 * Two-pass dedupe preserving order:
 *   1) by id (if present and not 'no-id')
 *   2) by (title+author) – image is ignored (часто різні посилання на те саме видання)
 */
function dedupeStable(list) {
  const out = [];
  const byId = new Set();
  const byTA = new Set();

  for (const b of list) {
    if (b?.id && b.id !== 'no-id') {
      const k = `id:${b.id}`;
      if (byId.has(k)) continue;
      byId.add(k);
      // still run title+author pass to collapse edge cases later in the list
      const ta = `ta:${canon(b.title)}|${canon(b.author)}`;
      byTA.add(ta);
      out.push(b);
      continue;
    }

    // no reliable id -> fallback to title+author
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
            if (typeof c === 'object' && c.list_name) return { name: c.list_name, value: c.list_name };
            if (typeof c === 'string') return { name: c, value: c };
            return null;
          })
          .filter(Boolean);
      }

      if (!categories.length) {
        categories = FALLBACK_CATEGORIES.map(n => ({ name: n, value: n }));
      }

      const result = [{ name: 'All Categories', value: 'all' }, ...categories];
      this.cache.set(key, result);
      return result;
    } catch {
      return [{ name: 'All Categories', value: 'all' }, ...FALLBACK_CATEGORIES.map(n => ({ name: n, value: n }))];
    }
  }

  /**
   * Paginated slice from full list.
   * category==='all'  -> flatten /books/top-books (each item has books[])
   * category!=='all'  -> /books/category?category=...
   * ALWAYS de-dupes aggressively.
   */
  async getBooks(category = 'all', page = 1, limit = 20) {
    const key = `books_${category}_${page}_${limit}`;
    const cached = this.cache.get(key);
    if (cached) return cached;

    try {
      let endpoint = '/books/top-books';
      if (category && category !== 'all') {
        endpoint = `/books/category?category=${encodeURIComponent(category)}`;
      }

      const data = await fetchJSON(endpoint);
      let full = [];

      if (category === 'all') {
        // [{ list_name, books: [...] }, ...]
        if (Array.isArray(data)) {
          full = data.flatMap(item =>
            Array.isArray(item?.books) ? item.books.map(normalizeBook) : []
          );
        }
      } else {
        // array or { results: [] }
        if (Array.isArray(data)) full = data.map(normalizeBook);
        else if (Array.isArray(data?.results)) full = data.results.map(normalizeBook);
      }

      // one, consistent, strong de-dup pass for ANY source
      full = dedupeStable(full);

      const start = (page - 1) * limit;
      const end = start + limit;

      const result = {
        books: full.slice(start, end),
        total: full.length,
        showing: Math.min(end, full.length),
        hasMore: end < full.length,
        currentPage: page,
      };

      this.cache.set(key, result);
      return result;
    } catch (e) {
      throw new Error(`Failed to load books: ${e.message}`);
    }
  }

  /** Single book by id with cache fallback scan */
  async getBookById(id) {
    if (!id) throw new Error('No book id');
    const key = `book_${id}`;
    const cached = this.cache.get(key);
    if (cached) return cached;

    try {
      const data = await fetchJSON(`/books/${encodeURIComponent(id)}`);
      const n = normalizeBook(data);
      this.cache.set(key, n);
      return n;
    } catch (e) {
      for (const [k, v] of this.cache.cache.entries()) {
        if (k.startsWith('books_') && v?.value?.books) {
          const found = v.value.books.find(b => b.id === id);
          if (found) return found;
        }
      }
      throw e;
    }
  }
}

export { fetchJSON, normalizeBook, MemoryCache };
export const api = new BooksAPI();
export const getBookById = (...args) => api.getBookById(...args);

// expose for dev/build
if (typeof window !== 'undefined') {
  window.__booksApi = api;
  console.log('[books] window.__booksApi ready');
}


