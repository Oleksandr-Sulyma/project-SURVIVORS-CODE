class BooksSection {
    constructor() {
        this.booksGrid = document.getElementById('books-grid');
        this.booksLoader = document.getElementById('books-loader');
        this.booksCounter = document.getElementById('books-counter-text');
        this.showMoreBtn = document.getElementById('show-more-btn');
        this.categoriesUL = document.getElementById('categories-list');
        this.categoriesLoader = document.getElementById('categories-loader');
        this.errorElement = document.getElementById('books-error');
        
        this.currentCategory = 'all';
        this.currentPage = 1;
        this.isLoading = false;
        this.isCategoriesLoading = false;
        this.hasMore = true;
        this.loadedBooks = [];
        
        this.config = {
            initialPerPageMobile: 10,
            initialPerPageDesktop: 24,
            perLoadMore: 4,
            mobileBreakpoint: 768
        };
        
        this.imageObserver = null;
        this.debounceTimeout = null;
        
        this.init();
    }
    
    async init() {
        try {
            console.log('BooksSection: Starting initialization...');
            this.hideError();
            this.setupEventListeners();
            this.setupObservers();
            console.log('BooksSection: Loading categories...');
            await this.renderCategories();
            console.log('BooksSection: Loading books...');
            await this.loadBooks(true);
            console.log('BooksSection: Initialization complete!');
        } catch (error) {
            console.error('Initialization error:', error);
            this.showError('Failed to load books. Please try again.');
        }
    }
    
    setupEventListeners() {
        if (this.showMoreBtn) {
            this.showMoreBtn.addEventListener('click', () => this.loadMore());
        }
        
        this.booksGrid?.addEventListener('click', (e) => this.handleBookClick(e));
        window.addEventListener('resize', () => this.handleResize());
    }
    
    setupObservers() {
        if ('IntersectionObserver' in window) {
            this.imageObserver = new IntersectionObserver(
                (entries) => this.handleImageIntersection(entries),
                { rootMargin: '50px 0px', threshold: 0.1 }
            );
        }
    }
    
    handleBookClick(e) {
        const btn = e.target.closest('.learn-more-btn');
        if (!btn) return;
        
        const card = btn.closest('.book-card');
        if (!card) return;
        
        const bookId = card.dataset.bookId;
        if (!bookId) return;
        
        window.dispatchEvent(new CustomEvent('books:open', { 
            detail: { bookId } 
        }));
    }
    
    handleResize() {
        if (this.debounceTimeout) {
            clearTimeout(this.debounceTimeout);
        }
        
        this.debounceTimeout = setTimeout(() => {
            const newInitialCount = this.getInitialBooksCount();
        }, 300);
    }
    
    getInitialBooksCount() {
        return window.innerWidth < this.config.mobileBreakpoint 
            ? this.config.initialPerPageMobile 
            : this.config.initialPerPageDesktop;
    }
    
    async renderCategories() {
        console.log('renderCategories: Starting, categoriesUL exists:', !!this.categoriesUL);
        if (!this.categoriesUL) return;
        
        this.setCategoriesLoading(true);
        
        try {
            const categories = await window.booksAPI.getCategories();
            console.log('renderCategories: Got categories:', categories.length);
            
            const allCategories = ['All categories', ...categories];
            
            this.categoriesUL.innerHTML = allCategories.map((name, index) => {
                const isAll = index === 0;
                const value = isAll ? 'all' : name;
                const isActive = (isAll && this.currentCategory === 'all') || 
                               (this.currentCategory === value);
                
                return `
                    <li class="category-item ${isActive ? 'active' : ''}" data-category="${this.escapeHtml(value)}">
                        <button 
                            class="category-button" 
                            type="button"
                            aria-pressed="${isActive}"
                        >
                            ${this.escapeHtml(name)}
                        </button>
                    </li>
                `;
            }).join('');
            
            this.categoriesUL.querySelectorAll('.category-button').forEach(btn => {
                btn.addEventListener('click', (e) => {
                    const item = e.currentTarget.closest('.category-item');
                    const category = item?.dataset.category;
                    if (category && category !== this.currentCategory) {
                        this.filterByCategory(category);
                    }
                });
            });
            
        } catch (error) {
            console.error('Categories loading error:', error);
            this.categoriesUL.innerHTML = `
                <li class="category-item active" data-category="all">
                    <button class="category-button" type="button" aria-pressed="true">
                        All categories
                    </button>
                </li>
            `;
        } finally {
            this.setCategoriesLoading(false);
        }
    }
    
    async loadBooks(reset = false) {
        console.log('loadBooks: Starting, reset:', reset, 'category:', this.currentCategory);
        if (this.isLoading) return;
        
        this.setLoading(true);
        this.hideError();
        
        try {
            const limit = reset ? this.getInitialBooksCount() : this.config.perLoadMore;
            const page = reset ? 1 : this.currentPage + 1;
            console.log('loadBooks: Requesting page:', page, 'limit:', limit);
            
            const data = await window.booksAPI.getBooks(this.currentCategory, page, limit);
            console.log('loadBooks: Got data, books:', data.books.length, 'total:', data.total);
            
            if (reset) {
                this.loadedBooks = [...data.books];
                this.currentPage = 1;
                this.renderBooks(this.loadedBooks);
            } else {
                this.loadedBooks = [...this.loadedBooks, ...data.books];
                this.currentPage = page;
                this.appendBooks(data.books);
            }
            
            this.hasMore = data.hasMore;
            this.updateCounter(data.showing, data.total);
            this.updateShowMoreButton();
            
        } catch (error) {
            console.error('Books loading error:', error);
            const errorMessage = error.message || 'Failed to load books. Please try again.';
            this.showError(errorMessage);
        } finally {
            this.setLoading(false);
        }
    }
    
    renderBooks(books) {
        console.log('renderBooks: Starting, booksGrid exists:', !!this.booksGrid, 'books count:', books.length);
        if (!this.booksGrid) return;
        
        this.booksGrid.innerHTML = '';
        this.appendBooks(books);
        console.log('renderBooks: Completed, final children count:', this.booksGrid.children.length);
    }
    
    appendBooks(books) {
        console.log('appendBooks: Starting, books:', books.length);
        if (!this.booksGrid || !Array.isArray(books)) return;
        
        const fragment = document.createDocumentFragment();
        
        books.forEach((book, index) => {
            const bookElement = this.createBookItem(book, this.loadedBooks.length - books.length + index);
            if (bookElement) {
                fragment.appendChild(bookElement);
            }
        });
        
        this.booksGrid.appendChild(fragment);
        this.booksGrid.setAttribute('aria-busy', 'false');
    }
    
    createBookItem(book, index = 0) {
        if (!book || !book.id) return null;
        
        const li = document.createElement('li');
        li.className = 'book-card';
        li.dataset.bookId = book.id;
        li.setAttribute('role', 'listitem');
        li.style.animationDelay = `${(index % 8) * 0.05}s`;
        
        const coverUrl = book.cover || 'https://via.placeholder.com/227x323/f0f0f0/666666?text=No+Image';
        
        li.innerHTML = `
            <div class="book-media">
                <img 
                    class="book-cover" 
                    data-src="${this.escapeHtml(coverUrl)}" 
                    alt="${this.escapeHtml(book.title)} cover" 
                    loading="lazy" 
                    decoding="async" 
                    referrerpolicy="no-referrer"
                >
            </div>
            <div class="book-info">
                <div class="book-title-row">
                    <h3 class="book-title">${this.escapeHtml(book.title)}</h3>
                    <span class="book-price">${this.escapeHtml(book.price)}</span>
                </div>
                <p class="book-author">${this.escapeHtml(book.author)}</p>
            </div>
            <div class="book-footer">
                <button class="learn-more-btn" type="button">Learn More</button>
            </div>
        `;
        
        const img = li.querySelector('.book-cover');
        if (this.imageObserver && img?.dataset.src) {
            this.imageObserver.observe(img);
        } else if (img) {
            this.loadImage(img);
        }
        
        return li;
    }
    
    loadImage(img) {
        const src = img.dataset.src;
        if (!src) return;
        
        img.classList.add('loading');
        
        const loader = new Image();
        loader.onload = () => {
            img.src = src;
            img.classList.remove('loading');
            img.removeAttribute('data-src');
        };
        
        loader.onerror = () => {
            img.classList.remove('loading');
            img.src = 'https://via.placeholder.com/227x323/f0f0f0/666666?text=No+Image';
            img.removeAttribute('data-src');
        };
        
        loader.referrerPolicy = 'no-referrer';
        loader.src = src;
    }
    
    handleImageIntersection(entries) {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const img = entry.target;
                this.loadImage(img);
                this.imageObserver.unobserve(img);
            }
        });
    }
    
    async filterByCategory(category) {
        if (category === this.currentCategory || this.isLoading) return;
        
        this.updateActiveCategory(category);
        this.currentCategory = category;
        this.currentPage = 1;
        this.hasMore = true;
        this.loadedBooks = [];
        
        await this.loadBooks(true);
    }
    
    updateActiveCategory(category) {
        if (!this.categoriesUL) return;
        
        this.categoriesUL.querySelectorAll('.category-item').forEach(item => {
            item.classList.remove('active');
            const button = item.querySelector('.category-button');
            if (button) button.setAttribute('aria-pressed', 'false');
        });
        
        const activeCategory = this.categoriesUL.querySelector(
            `.category-item[data-category="${CSS.escape(category)}"]`
        );
        if (activeCategory) {
            activeCategory.classList.add('active');
            const button = activeCategory.querySelector('.category-button');
            if (button) button.setAttribute('aria-pressed', 'true');
        }
    }
    
    async loadMore() {
        if (!this.hasMore || this.isLoading) return;
        await this.loadBooks(false);
    }
    
    updateCounter(showing, total) {
        if (this.booksCounter) {
            this.booksCounter.textContent = `Showing ${showing} of ${total}`;
        }
    }
    
    updateShowMoreButton() {
        if (!this.showMoreBtn) return;
        
        const shouldShow = this.hasMore && !this.isLoading && this.loadedBooks.length > 0;
        this.showMoreBtn.style.display = shouldShow ? 'block' : 'none';
        this.showMoreBtn.disabled = this.isLoading || !this.hasMore;
        
        const buttonText = this.showMoreBtn.querySelector('.button-text');
        if (buttonText) {
            buttonText.textContent = this.isLoading ? 'Loading...' : 'Show More';
        }
    }
    
    setLoading(isLoading) {
        this.isLoading = isLoading;
        
        if (this.booksLoader) {
            this.booksLoader.classList.toggle('hidden', !isLoading);
        }
        
        if (this.showMoreBtn) {
            this.showMoreBtn.disabled = isLoading || !this.hasMore;
        }
        
        if (this.booksGrid) {
            this.booksGrid.setAttribute('aria-busy', String(isLoading));
        }
    }
    
    setCategoriesLoading(isLoading) {
        this.isCategoriesLoading = isLoading;
        
        if (this.categoriesLoader) {
            this.categoriesLoader.classList.toggle('hidden', !isLoading);
        }
    }
    
    showError(message) {
        if (!this.errorElement) return;
        
        const messageElement = this.errorElement.querySelector('.error-message');
        if (messageElement) {
            messageElement.textContent = message;
        }
        
        const retryBtn = this.errorElement.querySelector('.retry-btn');
        if (retryBtn) {
            retryBtn.onclick = () => this.init();
        }
        
        this.errorElement.style.display = 'block';
        
        setTimeout(() => {
            if (this.errorElement && this.errorElement.style.display === 'block') {
                this.hideError();
            }
        }, 10000);
    }
    
    hideError() {
        if (this.errorElement) {
            this.errorElement.style.display = 'none';
        }
    }
    
    escapeHtml(text) {
        if (!text) return '';
        const map = {
            '&': '&amp;',
            '<': '&lt;',
            '>': '&gt;',
            '"': '&quot;',
            "'": '&#039;'
        };
        return String(text).replace(/[&<>"']/g, m => map[m]);
    }
    
    destroy() {
        if (this.imageObserver) {
            this.imageObserver.disconnect();
        }
        if (this.debounceTimeout) {
            clearTimeout(this.debounceTimeout);
        }
    }
}

document.addEventListener('DOMContentLoaded', () => {
    if (!window.booksAPI) {
        console.error('booksAPI not found. Make sure books-data.js is loaded.');
        return;
    }
    
    window.booksSection = new BooksSection();
});

window.addEventListener('beforeunload', () => {
    if (window.booksSection && typeof window.booksSection.destroy === 'function') {
        window.booksSection.destroy();
    }
});




