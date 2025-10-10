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
            console.warn(`Attempt ${attempt} failed:`, error.message);
            
            if (attempt === RETRY_ATTEMPTS || error.name === 'AbortError') {
                break;
            }
            
            await new Promise(resolve => setTimeout(resolve, RETRY_DELAY * attempt));
        }
    }
    
    clearTimeout(timeoutId);
    throw lastError || new Error('Unknown API error');
}

function pseudoPriceFromId(id) {
    if (!id) return '$0';
    
    let hash = 0;
    const str = String(id);
    for (let i = 0; i < str.length; i++) {
        hash = ((hash << 5) - hash) + str.charCodeAt(i);
        hash = hash & hash;
    }
    
    const price = 5 + Math.abs(hash % 45);
    return `$${price}`;
}

function normalizeBook(bookData) {
    if (!bookData || typeof bookData !== 'object') {
        console.warn('Invalid book data:', bookData);
        return null;
    }
    
    const id = bookData._id || bookData.id;
    if (!id) {
        console.warn('Book missing ID:', bookData);
        return null;
    }
    
    const normalized = {
        id: String(id),
        title: (bookData.title || '').toString().trim() || 'Untitled',
        author: (bookData.author || '').toString().trim() || 'Unknown Author',
        description: (bookData.description || '').toString().trim(),
        cover: sanitizeImageUrl(bookData.book_image || bookData.image || bookData.cover || ''),
        price: bookData.price || pseudoPriceFromId(id),
        buy_links: Array.isArray(bookData.buy_links) ? bookData.buy_links : [],
        category: (bookData.list_name || bookData.category || '').toString().trim(),
        
        rating: parseFloat(bookData.rating) || null,
        pages: parseInt(bookData.pages) || null,
        year: parseInt(bookData.year || bookData.publish_date) || null,
        publisher: (bookData.publisher || '').toString().trim(),
        isbn: (bookData.isbn13 || bookData.isbn10 || bookData.isbn || '').toString().trim(),
        
        normalized_at: new Date().toISOString(),
        source_api: bookData._source || 'books-api'
    };
    
    return normalized;
}

function sanitizeImageUrl(url) {
    if (!url || typeof url !== 'string') return '';
    
    const trimmedUrl = url.trim();
    if (!trimmedUrl) return '';
    
    try {
        new URL(trimmedUrl);
        return trimmedUrl;
    } catch {
        console.warn('Invalid image URL:', url);
        return '';
    }
}

class BookCache {
    constructor(maxSize = 100, maxAge = 5 * 60 * 1000) {
        this.cache = new Map();
        this.maxSize = maxSize;
        this.maxAge = maxAge;
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
        
        if (Date.now() - item.timestamp > this.maxAge) {
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
        this.cache = new BookCache();
        this.requestQueue = new Map();
    }
    
    async getCategories() {
        const cacheKey = 'categories';
        const cached = this.cache.get(cacheKey);
        if (cached) return cached;
        
        try {
            const data = await fetchJSON('/books/category-list');
            
            if (!Array.isArray(data)) {
                throw new Error('Invalid categories response format');
            }
            
            const categories = [...new Set(
                data
                    .map(item => {
                        if (typeof item === 'string') return item.trim();
                        if (item && typeof item === 'object') return (item.list_name || item.name || '').trim();
                        return '';
                    })
                    .filter(cat => cat && cat.length > 0)
            )].sort();
            
            this.cache.set(cacheKey, categories);
            return categories;
            
        } catch (error) {
            console.error('Error fetching categories:', error);
            const fallbackCategories = [
                'Combined Print and E-book Fiction',
                'Combined Print & E-book Nonfiction',
                'Hardcover Fiction',
                'Hardcover Nonfiction',
                'Trade Fiction Paperback',
                'Mass Market Monthly',
                'Paperback Nonfiction',
                'Paperback Books',
                'Hardcover Business Books',
                'Children\'s Middle Grade Hardcover'
            ];
            this.cache.set(cacheKey, fallbackCategories);
            return fallbackCategories;
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

