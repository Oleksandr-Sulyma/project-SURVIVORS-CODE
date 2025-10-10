const BOOKS_BASE_URL = 'https://books-backend.p.goit.global';

async function fetchJSON(path) {
  try {
    const res = await fetch(`${BOOKS_BASE_URL}${path}`);
    if (!res.ok) {
      throw new Error(`API ${res.status} – ${res.statusText}`);
    }
    return res.json();
  } catch (error) {
    console.error('Fetch error:', error);
    throw error;
  }
}

function pseudoPriceFromId(id) {
  if (!id || typeof id !== 'string') {
    return '$12';
  }
  
  let hash = 0;
  for (let i = 0; i < id.length; i++) {
    hash = (hash << 5) - hash + id.charCodeAt(i);
    hash |= 0;
  }
  
  const price = 8 + Math.abs(hash % 28);
  return `$${price}`;
}

function normalizeBook(b) {
  if (!b || !b._id) {
    console.warn('Invalid book data:', b);
    return null;
  }

  return {
    id: b._id,
    title: b.title || 'Untitled Book',
    author: b.author || 'Unknown Author',
    description: b.description || 'No description available for this book.',
    cover: b.book_image || 'https://via.placeholder.com/300x400/f0f0f0/666666?text=No+Image',
    price: pseudoPriceFromId(b._id),
    buy_links: Array.isArray(b.buy_links) ? b.buy_links : [],
    category: b.list_name || 'Uncategorized'
  };
}

class BooksAPI {
  constructor() {
    this.cache = new Map();
    this.cacheExpiry = 5 * 60 * 1000;
  }

  getCacheKey(endpoint, params = {}) {
    const paramString = Object.keys(params)
      .sort()
      .map(key => `${key}=${params[key]}`)
      .join('&');
    return `${endpoint}?${paramString}`;
  }

  getFromCache(key) {
    const cached = this.cache.get(key);
    if (cached && Date.now() - cached.timestamp < this.cacheExpiry) {
      return cached.data;
    }
    return null;
  }

  setCache(key, data) {
    this.cache.set(key, {
      data,
      timestamp: Date.now()
    });
  }

  async getCategories() {
    const cacheKey = this.getCacheKey('/books/category-list');
    const cached = this.getFromCache(cacheKey);
    if (cached) return cached;

    try {
      const data = await fetchJSON('/books/category-list');
      const categories = [...new Set(
        data
          .map(c => c.list_name)
          .filter(name => name && typeof name === 'string')
      )].sort();
      
      this.setCache(cacheKey, categories);
      return categories;
    } catch (error) {
      console.error('Failed to fetch categories:', error);
      return [
        'Combined Print and E-Book Fiction',
        'Combined Print and E-Book Nonfiction',
        'Hardcover Fiction',
        'Hardcover Nonfiction',
        'Paperback Trade Fiction'
      ];
    }
  }

  async getTopBooksFlatten() {
    const cacheKey = this.getCacheKey('/books/top-books');
    const cached = this.getFromCache(cacheKey);
    if (cached) return cached;

    try {
      const groups = await fetchJSON('/books/top-books');
      const allBooks = [];
      
      for (const group of groups) {
        if (Array.isArray(group.books)) {
          const normalizedBooks = group.books
            .map(normalizeBook)
            .filter(book => book !== null);
          allBooks.push(...normalizedBooks);
        }
      }
      
      const shuffledBooks = this.shuffleArray([...allBooks]);
      this.setCache(cacheKey, shuffledBooks);
      return shuffledBooks;
    } catch (error) {
      console.error('Failed to fetch top books:', error);
      return [];
    }
  }

  async getBooksByCategory(categoryName) {
    const cacheKey = this.getCacheKey('/books/category', { category: categoryName });
    const cached = this.getFromCache(cacheKey);
    if (cached) return cached;

    try {
      const data = await fetchJSON(`/books/category?category=${encodeURIComponent(categoryName)}`);
      const books = data
        .map(normalizeBook)
        .filter(book => book !== null);
      
      this.setCache(cacheKey, books);
      return books;
    } catch (error) {
      console.error(`Failed to fetch books for category "${categoryName}":`, error);
      return [];
    }
  }

  async getBookById(id) {
    if (!id) {
      console.error('Book ID is required');
      return null;
    }

    const cacheKey = this.getCacheKey(`/books/${id}`);
    const cached = this.getFromCache(cacheKey);
    if (cached) return cached;

    try {
      const data = await fetchJSON(`/books/${id}`);
      const book = normalizeBook(data);
      
      if (book) {
        this.setCache(cacheKey, book);
      }
      return book;
    } catch (error) {
      console.error(`Failed to fetch book with ID "${id}":`, error);
      return null;
    }
  }

  async getBooks(category = 'all', page = 1, limit = 12) {
    try {
      const allBooks = category === 'all'
        ? await this.getTopBooksFlatten()
        : await this.getBooksByCategory(category);

      const total = allBooks.length;
      const start = (page - 1) * limit;
      const end = start + limit;
      
      return {
        books: allBooks.slice(start, end),
        total,
        currentPage: page,
        hasMore: end < total,
        showing: Math.min(end, total),
        totalPages: Math.ceil(total / limit),
        category: category
      };
    } catch (error) {
      console.error('Failed to get books:', error);
      return {
        books: [],
        total: 0,
        currentPage: 1,
        hasMore: false,
        showing: 0,
        totalPages: 0,
        category: category
      };
    }
  }

  shuffleArray(array) {
    const shuffled = [...array];
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    return shuffled;
  }
}

if (typeof window !== 'undefined') {
  window.booksAPI = new BooksAPI();
} else {
  module.exports = { BooksAPI, normalizeBook, pseudoPriceFromId };
}

