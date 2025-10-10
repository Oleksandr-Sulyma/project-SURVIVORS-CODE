const BOOKS_BASE_URL = 'https://books-backend.p.goit.global';
const REQUEST_TIMEOUT = 10000;
const RETRY_ATTEMPTS = 3;
const RETRY_DELAY = 1000;

async function fetchJSON(path, options = {}) {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), REQUEST_TIMEOUT);
    
    let lastError = null;
    
    for (let attempt = 1; attempt <= RETRY_ATTEMPTS; attempt++) {
        try {
            const response = await fetch(`${BOOKS_BASE_URL}${path}`, {
                signal: controller.signal,
                headers: {
                    'Content-Type': 'application/json',
                    'Accept': 'application/json',
                },
                ...options
            });
            
            clearTimeout(timeoutId);
            
            if (!response.ok) {
                const errorText = await response.text();
                throw new Error(`API ${response.status}: ${response.statusText}. ${errorText}`);
            }
            
            const data = await response.json();
            return data;
            
        } catch (error) {
            lastError = error;
            
            if (error.name === 'AbortError') {
                throw new Error('Request timeout. Please check your connection.');
            }
            
            if (attempt === RETRY_ATTEMPTS) {
                throw lastError;
            }
            
            await new Promise(resolve => setTimeout(resolve, RETRY_DELAY * attempt));
        }
    }
}

function normalizeBook(book) {
    if (!book || typeof book !== 'object') {
        return null;
    }
    
    const id = book._id || book.id || `book_${Date.now()}_${Math.random().toString(36).substring(7)}`;
    
    return {
        id: id,
        title: book.book_title || book.title || 'Unknown Title',
        author: book.author || 'Unknown Author',
        image: book.book_image || book.image || book.cover || '',
        description: book.description || book.desc || '',
        list_name: book.list_name || book.category || 'General',
        amazon_product_url: book.amazon_product_url || book.url || '#',
        buy_links: Array.isArray(book.buy_links) ? book.buy_links : [],
        price: book.price || '$0'
    };
}

class MemoryCache {
    constructor(maxSize = 50, ttl = 5 * 60 * 1000) {
        this.cache = new Map();
        this.maxSize = maxSize;
        this.ttl = ttl;
    }
    
    set(key, value) {
        if (this.cache.size >= this.maxSize) {
            const firstKey = this.cache.keys().next().value;
            this.cache.delete(firstKey);
        }
        
        this.cache.set(key, {
            value,
            timestamp: Date.now()
        });
    }
    
    get(key) {
        const item = this.cache.get(key);
        if (!item) return null;
        
        if (Date.now() - item.timestamp > this.ttl) {
            this.cache.delete(key);
            return null;
        }
        
        return item.value;
    }
    
    clear() {
        this.cache.clear();
    }
}

class BooksAPI {
    constructor() {
        this.cache = new MemoryCache();
        this.fallbackCategories = [
            "Hardcover Fiction", "Hardcover Nonfiction", "Trade Fiction Paperback",
            "Mass Market Monthly", "Paperback Trade Fiction", "Paperback Nonfiction",
            "E-Book Fiction", "E-Book Nonfiction", "Hardcover Advice", "Paperback Advice",
            "Advice How-To and Miscellaneous", "Children's Middle Grade Hardcover",
            "Picture Books", "Series Books", "Young Adult Hardcover",
            "Audio Fiction", "Audio Nonfiction", "Business Books", "Graphic Books and Manga",
            "Mass Market", "Middle Grade Paperback", "Young Adult Paperback"
        ];
    }
    
    async getCategories() {
        const cacheKey = 'categories';
        const cached = this.cache.get(cacheKey);
        if (cached) return cached;
        
        try {
            const data = await fetchJSON('/books/category-list');
            
            if (!Array.isArray(data)) {
                console.warn('Invalid categories format, using fallback');
                return this.fallbackCategories;
            }
            
            // Перевіряємо, чи це об'єкти з полем list_name
            let categories = data;
            if (data.length > 0 && typeof data[0] === 'object' && data[0].list_name) {
                categories = data.map(item => item.list_name).filter(name => name && name.trim());
            }
            
            const finalCategories = categories.length > 0 ? categories : this.fallbackCategories;
            
            this.cache.set(cacheKey, finalCategories);
            return finalCategories;
            
        } catch (error) {
            console.warn('Error fetching categories, using fallback:', error);
            return this.fallbackCategories;
        }
    }
    
    async getTopBooksFlatten() {
        const cacheKey = 'top-books';
        const cached = this.cache.get(cacheKey);
        if (cached) return cached;
        
        try {
            const groups = await fetchJSON('/books/top-books');
            
            if (!Array.isArray(groups)) {
                throw new Error('Invalid top books response format');
            }
            
            const allBooks = [];
            for (const group of groups) {
                if (group && Array.isArray(group.books)) {
                    const normalizedBooks = group.books
                        .map(normalizeBook)
                        .filter(book => book !== null);
                    allBooks.push(...normalizedBooks);
                }
            }
            
            const uniqueBooks = this.removeDuplicateBooks(allBooks);
            
            this.cache.set(cacheKey, uniqueBooks);
            return uniqueBooks;
            
        } catch (error) {
            console.error('Error fetching top books:', error);
            throw new Error('Failed to load popular books');
        }
    }
    
    async getBooksByCategory(categoryName) {
        if (!categoryName || typeof categoryName !== 'string') {
            throw new Error('Invalid category name');
        }
        
        const cacheKey = `category-${categoryName}`;
        const cached = this.cache.get(cacheKey);
        if (cached) return cached;
        
        try {
            const data = await fetchJSON(`/books/category?category=${encodeURIComponent(categoryName)}`);
            
            if (!Array.isArray(data)) {
                throw new Error('Invalid category response format');
            }
            
            const normalizedBooks = data
                .map(normalizeBook)
                .filter(book => book !== null);
            
            const uniqueBooks = this.removeDuplicateBooks(normalizedBooks);
            
            this.cache.set(cacheKey, uniqueBooks);
            return uniqueBooks;
            
        } catch (error) {
            console.error(`Error fetching books for category "${categoryName}":`, error);
            throw new Error(`Failed to load books for category "${categoryName}"`);
        }
    }
    
    async getBooks(category = 'all', page = 1, limit = 12) {
        try {
            let allBooks = [];
            
            if (category === 'all' || category === '') {
                allBooks = await this.getTopBooksFlatten();
            } else {
                allBooks = await this.getBooksByCategory(category);
            }
            
            const total = allBooks.length;
            const start = (page - 1) * limit;
            const end = Math.min(start + limit, total);
            const books = allBooks.slice(start, end);
            
            return {
                books,
                total,
                currentPage: page,
                totalPages: Math.ceil(total / limit),
                hasMore: end < total,
                showing: end,
                category: category
            };
            
        } catch (error) {
            console.error('Error in getBooks:', error);
            throw error;
        }
    }
    
    removeDuplicateBooks(books) {
        const seen = new Set();
        return books.filter(book => {
            if (seen.has(book.id)) {
                return false;
            }
            seen.add(book.id);
            return true;
        });
    }
    
    clearCache() {
        this.cache.clear();
    }
}

window.booksAPI = new BooksAPI();

