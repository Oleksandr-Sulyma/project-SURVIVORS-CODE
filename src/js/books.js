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

    this.initialPerPage = window.innerWidth >= 1440 ? 24 : 10;
    this.perLoad = 4;

    this.imageObserver = null;
    this.init();
  }

  async init() {
    this.setupGlobalListeners();
    this.setupImageObserver();
    await this.renderCategories();
    await this.loadBooks(true);
  }

  setupGlobalListeners() {
    if (this.showMoreBtn) this.showMoreBtn.addEventListener('click', () => this.loadMore());

    this.booksGrid.addEventListener('click', e => {
      const btn = e.target.closest('.learn-more-btn');
      if (btn) {
        const card = btn.closest('.book-card');
        if (!card) return;
        const bookId = card.dataset.bookId;
        window.dispatchEvent(new CustomEvent('books:open', { detail: { bookId } }));
      }
    });
  }

  async renderCategories() {
    try {
      const categories = await window.booksAPI.getCategories();
      const all = ['All categories', ...categories];
      this.categoriesUL.innerHTML = all.map((name, idx) => {
        const isAll = idx === 0;
        const value = isAll ? 'all' : name;
        return `<li class="category-item ${isAll ? 'active' : ''}" data-category="${this.escapeHtml(value)}"><button class="category-button">${this.escapeHtml(name)}</button></li>`;
      }).join('');
      this.categoriesUL.querySelectorAll('.category-button').forEach(btn => {
        btn.addEventListener('click', e => {
          const item = e.currentTarget.closest('.category-item');
          const category = item.dataset.category;
          this.filterByCategory(category);
        });
      });
    } catch {
      this.categoriesUL.innerHTML = `<li class="category-item active" data-category="all"><button class="category-button">All categories</button></li>`;
    }
  }

  setupImageObserver() {
    if (!('IntersectionObserver' in window)) return;
    this.imageObserver = new IntersectionObserver((entries, obs) => {
      for (const entry of entries) {
        if (entry.isIntersecting) {
          const img = entry.target;
          this.loadImage(img);
          obs.unobserve(img);
        }
      }
    }, { rootMargin: '50px 0px', threshold: 0.1 });
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
    } catch {
      alert('Помилка завантаження книг. Спробуйте пізніше.');
    } finally {
      this.setLoading(false);
    }
  }

  renderBooks(books) {
    this.booksGrid.innerHTML = '';
    this.appendBooks(books);
  }

  appendBooks(books) {
    const frag = document.createDocumentFragment();
    books.forEach((book, i) => frag.appendChild(this.createBookItem(book, i)));
    this.booksGrid.appendChild(frag);
  }

  createBookItem(book, index = 0) {
    const li = document.createElement('li');
    li.className = 'book-card';
    li.dataset.bookId = book.id;
    li.setAttribute('role', 'listitem');
    li.style.animationDelay = `${(index % 6) * 0.1}s`;

    li.innerHTML = `
      <div class="book-media">
        <img class="book-cover" data-src="${book.cover}" alt="${this.escapeHtml(book.title)} cover" loading="lazy" decoding="async" referrerpolicy="no-referrer">
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
    if (this.imageObserver && img.dataset.src) this.imageObserver.observe(img);
    else this.loadImage(img);
    return li;
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
    this.categoriesUL.querySelectorAll('.category-item').forEach(i => i.classList.remove('active'));
    const active = this.categoriesUL.querySelector(`.category-item[data-category="${CSS.escape(category)}"]`);
    if (active) active.classList.add('active');
  }

  async loadMore() {
    if (!this.hasMore || this.isLoading) return;
    this.currentPage += 1;
    await this.loadBooks(false);
  }

  updateCounter(showing, total) {
    if (this.booksCounter) this.booksCounter.textContent = `Showing ${showing} of ${total}`;
  }

  updateShowMoreButton() {
    if (!this.showMoreBtn) return;
    this.showMoreBtn.style.display = this.hasMore ? 'inline-block' : 'none';
    this.showMoreBtn.disabled = this.isLoading || !this.hasMore;
  }

  setLoading(flag) {
    this.isLoading = flag;
    if (this.booksLoader) this.booksLoader.classList.toggle('hidden', !flag);
    if (this.showMoreBtn) this.showMoreBtn.classList.toggle('loading', flag);
    if (this.booksGrid) this.booksGrid.setAttribute('aria-busy', String(flag));
    this.updateShowMoreButton();
  }

  escapeHtml(text) {
    const map = { '&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#039;' };
    return String(text ?? '').replace(/[&<>"']/g, m => map[m]);
  }
}

document.addEventListener('DOMContentLoaded', () => {
  if (!window.booksAPI) return;
  window.booksSection = new BooksSection();
});




