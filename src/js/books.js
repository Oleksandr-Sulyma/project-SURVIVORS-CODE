class BooksSection {
    constructor() {
        // Desktop elements
        this.booksGrid = document.getElementById('books-grid');
        this.booksLoader = document.getElementById('books-loader');
        this.showMoreBtn = document.getElementById('show-more-btn');
        this.categoriesUL = document.getElementById('categories-list');
        this.categoriesLoader = document.getElementById('categories-loader');
        this.errorElement = document.getElementById('books-error');
        
        // Counter element (same for all layouts)
        this.booksCounter = document.getElementById('books-counter-text');
        
        // Category select elements for different layouts
        this.categoriesSelectTablet = document.getElementById('categories-select-tablet');
        this.categoriesSelectMobile = document.getElementById('categories-select-mobile');
        
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
            mobileBreakpoint: 768,
            tabletBreakpoint: 1024
        };
        
        this.imageObserver = null;
        this.debounceTimeout = null;
        
        this.init();
    }
    
    async init() {
        try {
            this.hideError();
            this.setupEventListeners();
            this.setupObservers();
            await this.renderCategories();
            await this.loadBooks(true);
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
        
        // Setup dropdown change handlers
        if (this.categoriesSelectTablet) {
            this.categoriesSelectTablet.addEventListener('change', (e) => {
                this.filterByCategory(e.target.value);
            });
        }
        
        if (this.categoriesSelectMobile) {
            this.categoriesSelectMobile.addEventListener('change', (e) => {
                this.filterByCategory(e.target.value);
            });
        }
    }
    
    setupObservers() {
        if ('IntersectionObserver' in window) {
            this.imageObserver = new IntersectionObserver((entries) => {
                entries.forEach(entry => {
                    if (entry.isIntersecting) {
                        const img = entry.target;
                        if (img.dataset.src) {
                            this.loadImage(img);
                        }
                    }
                });
            }, { rootMargin: '50px' });
        }
    }
    
    async renderCategories() {
        if (!this.categoriesUL) return;
        
        this.setCategoriesLoading(true);
        
        try {
            const categories = await window.booksAPI.getCategories();
            
            // Render desktop categories (sidebar)
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
            
            // Populate dropdown selects for tablet and mobile
            this.populateDropdowns(categories);
            
        } catch (error) {
            console.error('Error rendering categories:', error);
        } finally {
            this.setCategoriesLoading(false);
        }
    }
    
    populateDropdowns(categories) {
        const dropdowns = [this.categoriesSelectTablet, this.categoriesSelectMobile];
        
        dropdowns.forEach(dropdown => {
            if (!dropdown) return;
            
            // Очищуємо dropdown
            dropdown.innerHTML = '<option value="all">Categories</option>';
            
            // Додаємо категорії, перевіряючи що це строки та не пусті
            if (Array.isArray(categories)) {
                categories.forEach(category => {
                    if (typeof category === 'string' && category.trim()) {
                        const option = document.createElement('option');
                        option.value = category;
                        option.textContent = category;
                        dropdown.appendChild(option);
                    }
                });
            }
            
            dropdown.value = this.currentCategory;
        });
    }
    
    async loadBooks(reset = false) {
        if (this.isLoading) return;
        
        this.setLoading(true);
        this.hideError();
        
        try {
            const limit = reset ? this.getInitialBooksCount() : this.config.perLoadMore;
            const page = reset ? 1 : this.currentPage + 1;
            
            const data = await window.booksAPI.getBooks(this.currentCategory, page, limit);
            
            if (reset) {
                this.loadedBooks = [...data.books];
                this.currentPage = 1;
                this.renderBooks(this.loadedBooks);
            } else {
                this.loadedBooks.push(...data.books);
                this.currentPage = page;
                this.appendBooks(data.books);
            }
            
            this.hasMore = data.hasMore;
            this.updateShowMoreButton();
            this.updateBooksCounter(data.showing, data.total);
            
        } catch (error) {
            console.error('Error loading books:', error);
            this.showError(`Failed to load books: ${error.message}`);
        } finally {
            this.setLoading(false);
        }
    }
    
    renderBooks(books) {
        if (!this.booksGrid) return;
        
        this.booksGrid.innerHTML = '';
        this.appendBooks(books);
    }
    
    appendBooks(books) {
        if (!this.booksGrid || !Array.isArray(books)) return;
        
        const fragment = document.createDocumentFragment();
        
        books.forEach((book, index) => {
            const bookCard = this.createBookCard(book, index);
            fragment.appendChild(bookCard);
        });
        
        this.booksGrid.appendChild(fragment);
    }
    
    createBookCard(book, index = 0) {
        const li = document.createElement('li');
        li.className = 'book-card';
        li.style.animationDelay = `${(index % 8) * 0.05 + 0.1}s`;
        
        const priceText = book.price && book.price !== '$0' ? book.price : '';
        
        li.innerHTML = `
            <div class="book-media">
                <img 
                    class="book-cover loading" 
                    src="data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='227' height='323'%3E%3Crect width='100%25' height='100%25' fill='%23f0f0f0'/%3E%3C/svg%3E"
                    ${book.image ? `data-src="${book.image}"` : ''}
                    alt="${this.escapeHtml(book.title)}"
                    loading="lazy"
                >
            </div>
            <div class="book-info">
                <div class="book-title-row">
                    <h3 class="book-title">${this.escapeHtml(book.title)}</h3>
                    ${priceText ? `<span class="book-price">${this.escapeHtml(priceText)}</span>` : ''}
                </div>
                <p class="book-author">${this.escapeHtml(book.author)}</p>
            </div>
            <div class="book-footer">
                <button 
                    class="learn-more-btn" 
                    type="button"
                    data-book-id="${this.escapeHtml(book.id)}"
                    data-amazon-url="${this.escapeHtml(book.amazon_product_url)}"
                >
                    Learn More
                </button>
            </div>
        `;
        
        const img = li.querySelector('.book-cover');
        if (img && book.image) {
            if (this.imageObserver) {
                this.imageObserver.observe(img);
            } else {
                this.loadImage(img);
            }
        }
        
        return li;
    }
    
    loadImage(img) {
        if (!img.dataset.src) return;
        
        const tempImg = new Image();
        tempImg.onload = () => {
            img.src = img.dataset.src;
            img.classList.remove('loading');
            img.removeAttribute('data-src');
        };
        tempImg.onerror = () => {
            img.classList.remove('loading');
            img.removeAttribute('data-src');
        };
        tempImg.src = img.dataset.src;
        
        if (this.imageObserver) {
            this.imageObserver.unobserve(img);
        }
    }
    
    async filterByCategory(category) {
        if (category === this.currentCategory) return;
        
        this.currentCategory = category;
        this.currentPage = 1;
        this.loadedBooks = [];
        
        // Update active states in desktop sidebar
        this.updateCategoriesActiveState(category);
        
        // Update dropdown values
        if (this.categoriesSelectTablet) this.categoriesSelectTablet.value = category;
        if (this.categoriesSelectMobile) this.categoriesSelectMobile.value = category;
        
        await this.loadBooks(true);
    }
    
    updateCategoriesActiveState(activeCategory) {
        if (!this.categoriesUL) return;
        
        this.categoriesUL.querySelectorAll('.category-item').forEach(item => {
            const category = item.dataset.category;
            const isActive = category === activeCategory;
            
            item.classList.toggle('active', isActive);
            
            const button = item.querySelector('.category-button');
            if (button) {
                button.setAttribute('aria-pressed', isActive.toString());
            }
        });
    }
    
    async loadMore() {
        if (!this.hasMore || this.isLoading) return;
        await this.loadBooks(false);
    }
    
    updateShowMoreButton() {
        if (!this.showMoreBtn) return;
        
        if (this.hasMore && !this.isLoading) {
            this.showMoreBtn.style.display = 'block';
            this.showMoreBtn.disabled = false;
            this.showMoreBtn.textContent = 'Show More';
        } else if (this.isLoading) {
            this.showMoreBtn.disabled = true;
            this.showMoreBtn.textContent = 'Loading...';
        } else {
            this.showMoreBtn.style.display = 'none';
        }
    }
    
    updateBooksCounter(showing, total) {
        const text = `Showing ${showing} of ${total}`;
        
        if (this.booksCounter) {
            this.booksCounter.textContent = text;
        }
    }
    
    handleBookClick(e) {
        const button = e.target.closest('.learn-more-btn');
        if (!button) return;
        
        e.preventDefault();
        
        const amazonUrl = button.dataset.amazonUrl;
        if (amazonUrl && amazonUrl !== '#') {
            window.open(amazonUrl, '_blank', 'noopener,noreferrer');
        }
    }
    
    handleResize() {
        if (this.debounceTimeout) {
            clearTimeout(this.debounceTimeout);
        }
        
        this.debounceTimeout = setTimeout(() => {
            this.updateBooksGrid();
        }, 250);
    }
    
    updateBooksGrid() {
        // Force recalculation of grid layout if needed
        if (this.booksGrid) {
            this.booksGrid.style.display = 'none';
            this.booksGrid.offsetHeight; // Trigger reflow
            this.booksGrid.style.display = 'grid';
        }
    }
    
    getInitialBooksCount() {
        const isMobile = window.innerWidth <= this.config.mobileBreakpoint;
        return isMobile ? this.config.initialPerPageMobile : this.config.initialPerPageDesktop;
    }
    
    setLoading(isLoading) {
        this.isLoading = isLoading;
        
        if (this.booksLoader) {
            this.booksLoader.classList.toggle('hidden', !isLoading);
        }
        
        if (this.booksGrid) {
            this.booksGrid.setAttribute('aria-busy', isLoading.toString());
        }
        
        this.updateShowMoreButton();
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




