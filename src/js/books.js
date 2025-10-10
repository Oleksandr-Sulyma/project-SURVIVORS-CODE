class BooksSection {
  constructor() {
    this.booksGrid = document.getElementById('books-grid');
    this.booksLoader = document.getElementById('books-loader');
    this.booksCounter = document.getElementById('books-counter-text');
    this.showMoreBtn = document.getElementById('show-more-btn');
    this.categoriesUL = document.getElementById('categories-list');

    this.currentCategory = 'all';
    this.currentPage = 1;
    this.isLoading = false;
    this.hasMore = true;
    this.loadedBooks = [];

    this.initialPerPage = window.innerWidth >= 1024 ? 24 : 10;
    this.perLoad = 4;

    this.imageObserver = null;
    this.init();
  }

  async init() {
    try {
      this.setupGlobalListeners();
      this.setupImageObserver();
      await this.renderCategories();
      await this.loadBooks(true);
    } catch (error) {
      console.error('Failed to initialize Books section:', error);
    }
  }

  setupGlobalListeners() {
    if (this.showMoreBtn) {
      this.showMoreBtn.addEventListener('click', () => this.loadMore());
    }

    this.booksGrid.addEventListener('click', (e) => {
      const learnMoreBtn = e.target.closest('.learn-more-btn');
      if (learnMoreBtn) {
        e.stopPropagation();
        const card = learnMoreBtn.closest('.book-card');
        const bookId = card?.dataset.bookId;
        
        if (bookId) {
          console.log('Learn More clicked for book ID:', bookId);
          this.handleLearnMoreClick(bookId);
        }
        return;
      }

      const card = e.target.closest('.book-card');
      if (card) {
        const bookId = card.dataset.bookId;
        if (bookId) {
          console.log('Book card clicked, ID:', bookId);
          this.handleBookCardClick(bookId);
        }
      }
    });
  }

  handleLearnMoreClick(bookId) {
    if (window.bookModal && typeof window.bookModal.open === 'function') {
      window.bookModal.open(bookId);
    } else {
      console.log('Modal not available yet. Book ID:', bookId);
    }

    const event = new CustomEvent('bookLearnMore', {
      detail: { bookId, bookData: this.getBookData(bookId) }
    });
    document.dispatchEvent(event);
  }

  handleBookCardClick(bookId) {
    if (window.bookModal && typeof window.bookModal.open === 'function') {
      window.bookModal.open(bookId);
    }

    const event = new CustomEvent('bookCardClick', {
      detail: { bookId, bookData: this.getBookData(bookId) }
    });
    document.dispatchEvent(event);
  }

  async renderCategories() {
    try {
      const categories = await window.booksAPI.getCategories();
      
      const categoryItems = [
        { name: 'All categories', value: 'all' },
        ...categories.map(cat => ({ name: cat, value: cat }))
      ];

      this.categoriesUL.innerHTML = categoryItems
        .map((item, idx) => {
          const isActive = idx === 0;
          return `
            <li class="category-item ${isActive ? 'active' : ''}" data-category="${this.escapeHtml(item.value)}">
              <button class="category-button" type="button">${this.escapeHtml(item.name)}</button>
            </li>`;
        })
        .join('');

      this.categoriesUL.querySelectorAll('.category-button').forEach(btn => {
        btn.addEventListener('click', async (e) => {
          if (this.isLoading) return;
          
          const item = e.currentTarget.closest('.category-item');
          const category = item.dataset.category;
          
          await this.filterByCategory(category);
        });
      });
    } catch (err) {
      console.error('Failed to load categories', err);
      this.categoriesUL.innerHTML = `
        <li class="category-item active" data-category="all">
          <button class="category-button" type="button">All categories</button>
        </li>`;
    }
  }

  setupImageObserver() {
    if (!('IntersectionObserver' in window)) {
      return;
    }

    this.imageObserver = new IntersectionObserver((entries, obs) => {
      for (const entry of entries) {
        if (entry.isIntersecting) {
          const img = entry.target;
          this.loadImage(img);
          obs.unobserve(img);
        }
      }
    }, { 
      rootMargin: '50px 0px', 
      threshold: 0.1 
    });
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
      img.src = 'https://via.placeholder.com/300x400/f0f0f0/666666?text=No+Image';
      img.removeAttribute('data-src');
    };
    
    loader.referrerPolicy = 'no-referrer';
    loader.src = src;
  }

  async loadBooks(reset = false) {
    if (this.isLoading) return;

    this.setLoading(true);
    
    try {
      const limit = reset ? this.initialPerPage : this.perLoad;
      const data = await window.booksAPI.getBooks(this.currentCategory, this.currentPage, limit);
      
      if (reset) {
        this.loadedBooks = [...data.books];
        this.renderBooks(this.loadedBooks);
      } else {
        this.loadedBooks = [...this.loadedBooks, ...data.books];
        this.appendBooks(data.books);
      }

      this.hasMore = data.hasMore;
      this.updateCounter(data.showing, data.total);
      this.updateShowMoreButton();
    } catch (err) {
      console.error('Error loading books:', err);
    } finally {
      this.setLoading(false);
    }
  }

  renderBooks(books) {
    this.booksGrid.innerHTML = '';
    this.appendBooks(books);
  }

  appendBooks(books) {
    if (!books.length) return;

    const frag = document.createDocumentFragment();
    books.forEach((book, i) => {
      const card = this.createBookCard(book, i);
      if (card) {
        frag.appendChild(card);
      }
    });
    this.booksGrid.appendChild(frag);
  }

  createBookCard(book, index = 0) {
    if (!book || !book.id) return null;

    const card = document.createElement('li');
    card.className = 'book-card';
    card.dataset.bookId = book.id;
    card.style.animationDelay = `${(index % 6) * 0.1}s`;

    const priceHTML = book.price ? 
      `<span class="book-price">${this.escapeHtml(book.price)}</span>` : 
      `<span class="book-price">N/A</span>`;

    card.innerHTML = `
      <img
        class="book-cover"
        data-src="${this.escapeHtml(book.cover)}"
        alt="${this.escapeHtml(book.title)} cover"
        loading="lazy"
        referrerpolicy="no-referrer"
        src="data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMzAwIiBoZWlnaHQ9IjQwMCIgdmlld0JveD0iMCAwIDMwMCA0MDAiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+CjxyZWN0IHdpZHRoPSIzMDAiIGhlaWdodD0iNDAwIiBmaWxsPSIjRjBGMEYwIi8+Cjx0ZXh0IHg9IjE1MCIgeT0iMjAwIiBmb250LWZhbWlseT0ic2Fucy1zZXJpZiIgZm9udC1zaXplPSIxOCIgZmlsbD0iIzY2NjY2NiIgdGV4dC1hbmNob3I9Im1pZGRsZSI+TG9hZGluZy4uLjwvdGV4dD4KPHN2Zz4K"
      >
      <div class="book-info">
        <div class="book-title-row">
          <h3 class="book-title">${this.escapeHtml(book.title)}</h3>
          ${priceHTML}
        </div>
        <p class="book-author">${this.escapeHtml(book.author)}</p>
      </div>
      <div class="book-footer">
        <button class="learn-more-btn" type="button">Learn More</button>
      </div>
    `;

    const img = card.querySelector('.book-cover');
    if (this.imageObserver && img.dataset.src) {
      this.imageObserver.observe(img);
    } else {
      setTimeout(() => this.loadImage(img), 100);
    }

    return card;
  }

  async filterByCategory(category) {
    if (category === this.currentCategory || this.isLoading) return;

    this.updateActiveCategory(category);
    this.currentCategory = category;
    this.currentPage = 1;
    this.hasMore = true;
    
    await this.loadBooks(true);
  }

  updateActiveCategory(category) {
    this.categoriesUL.querySelectorAll('.category-item').forEach(item => {
      item.classList.remove('active');
    });
    
    const activeItem = this.categoriesUL.querySelector(`.category-item[data-category="${CSS.escape(category)}"]`);
    if (activeItem) {
      activeItem.classList.add('active');
    }
  }

  async loadMore() {
    if (!this.hasMore || this.isLoading) return;

    this.currentPage += 1;
    await this.loadBooks(false);
  }

  updateCounter(showing, total) {
    if (this.booksCounter) {
      this.booksCounter.textContent = `Showing ${showing} of ${total}`;
    }
  }

  updateShowMoreButton() {
    if (!this.showMoreBtn) return;
    
    this.showMoreBtn.style.display = this.hasMore ? 'inline-block' : 'none';
    this.showMoreBtn.disabled = this.isLoading || !this.hasMore;
  }

  setLoading(flag) {
    this.isLoading = flag;
    
    if (this.booksLoader) {
      this.booksLoader.classList.toggle('visually-hidden', !flag);
    }
    
    this.updateShowMoreButton();
  }

  escapeHtml(text) {
    if (text === null || text === undefined) return '';
    
    const map = {
      '&': '&amp;',
      '<': '&lt;',
      '>': '&gt;',
      '"': '&quot;',
      "'": '&#039;'
    };
    
    return String(text).replace(/[&<>"']/g, m => map[m]);
  }

  getBookData(bookId) {
    return this.loadedBooks.find(book => book.id === bookId);
  }

  async getBookDetails(bookId) {
    try {
      return await window.booksAPI.getBookById(bookId);
    } catch (err) {
      console.error('Error getting book details:', err);
      return null;
    }
  }
}

document.addEventListener('DOMContentLoaded', () => {
  if (!window.booksAPI) {
    console.error('BooksAPI not found! Make sure books-data.js is loaded.');
    return;
  }

  window.booksSection = new BooksSection();
});

if (typeof module !== 'undefined' && module.exports) {
  module.exports = BooksSection;
}

