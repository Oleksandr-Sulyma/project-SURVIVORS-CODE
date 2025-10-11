import {
  BOOKS_BASE_URL, REQUEST_TIMEOUT, RETRY_ATTEMPTS, RETRY_DELAY,
  FALLBACK_CATEGORIES, CACHE_CONFIG
} from './constants.js';

async function fetchJSON(path, options = {}) {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), REQUEST_TIMEOUT);
  let lastError = null;

  for (let attempt = 1; attempt <= RETRY_ATTEMPTS; attempt++) {
    try {
      const res = await fetch(`${BOOKS_BASE_URL}${path}`, {
        signal: controller.signal,
        headers: { 'Content-Type':'application/json', 'Accept':'application/json' },
        ...options,
      });
      clearTimeout(timeoutId);
      if (!res.ok) {
        const txt = await res.text().catch(()=>'');
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

function normalizeBook(b, fallbackImage = '') {
  return {
    id: b.primary_isbn13 || b.primary_isbn10 || b.title || 'no-id',
    title: b.title || 'Untitled',
    author: b.author || 'Unknown Author',
    image: b.book_image || fallbackImage,
    amazon_product_url: b.amazon_product_url || '#',
    price: b.price || '',
  };
}

class MemoryCache {
  constructor(maxSize = CACHE_CONFIG.maxSize, ttl = CACHE_CONFIG.ttl) {
    this.cache = new Map(); this.maxSize = maxSize; this.ttl = ttl;
  }
  set(key, value) {
    if (this.cache.size >= this.maxSize) this.cache.delete(this.cache.keys().next().value);
    this.cache.set(key, { value, t: Date.now() });
  }
  get(key) {
    const item = this.cache.get(key); if (!item) return null;
    if (Date.now() - item.t > this.ttl) { this.cache.delete(key); return null; }
    return item.value;
  }
  clear(){ this.cache.clear(); }
}

class BooksAPI {
  constructor(){ this.cache = new MemoryCache(); }

  async getCategories() {
    const k = 'categories'; const cached = this.cache.get(k); if (cached) return cached;
    try {
      const data = await fetchJSON('/books/category-list');
      let categories = [];
      if (data && Array.isArray(data.results)) {
        categories = data.results.map(c => {
          if (typeof c === 'object' && c.list_name) return { name: c.list_name, value: c.list_name };
          if (typeof c === 'string') return { name: c, value: c };
          return null;
        }).filter(Boolean);
      }
      if (!categories.length) categories = FALLBACK_CATEGORIES.map(n => ({ name:n, value:n }));
      const result = [{ name:'All Categories', value:'all' }, ...categories];
      this.cache.set(k, result); return result;
    } catch {
      return [{ name:'All Categories', value:'all' }, ...FALLBACK_CATEGORIES.map(n=>({name:n,value:n}))];
    }
  }

  async getBooks(category='all', page=1, limit=20) {
    const k = `books_${category}_${page}_${limit}`; const cached = this.cache.get(k); if (cached) return cached;
    try {
      let endpoint = '/books/top-books';
      if (category !== 'all') endpoint = `/books/category?category=${encodeURIComponent(category)}`;
      const data = await fetchJSON(endpoint);
      let all = [];
      if (data?.results?.length) all = data.results.map(normalizeBook);
      else if (Array.isArray(data)) all = data.map(normalizeBook);

      const start = (page-1)*limit, end = start+limit;
      const result = {
        books: all.slice(start, end),
        total: all.length,
        showing: Math.min(end, all.length),
        hasMore: end < all.length,
        currentPage: page,
      };
      this.cache.set(k, result); return result;
    } catch (e) { throw new Error(`Failed to load books: ${e.message}`); }
  }
}

export { fetchJSON, normalizeBook, MemoryCache };
