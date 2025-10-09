
class BooksSection {
  constructor() {
    this.booksGrid    = document.getElementById('books-grid');
    this.booksLoader  = document.getElementById('books-loader');
    this.booksCounter = document.getElementById('books-counter-text');
    this.showMoreBtn  = document.getElementById('show-more-btn');
    this.categoriesUL = document.getElementById('categories-list');

    
    this.modal        = document.getElementById('book-modal');
    this.modalOverlay = document.getElementById('modal-overlay');
    this.modalClose   = document.getElementById('modal-close');

 
    this.currentCategory = 'all';
    this.currentPage  = 1;
    this.isLoading    = false;
    this.hasMore      = true;
    this.loadedBooks  = [];

   
    this.initialPerPage = window.innerWidth >= 1280 ? 24 : 10; 
    this.perLoad        = 4;                                   

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
    if (this.modalClose)   this.modalClose.addEventListener('click', () => this.closeModal());
    if (this.modalOverlay) this.modalOverlay.addEventListener('click', () => this.closeModal());
    document.addEventListener('keydown', e => {
      if (e.key === 'Escape' && this.modal && !this.modal.classList.contains('hidden')) this.closeModal();
    });

    this.booksGrid.addEventListener('click', e => {
      const card = e.target.closest('.book-card');
      if (!card) return;
      e.preventDefault();
      const id = card.dataset.bookId;
      this.openModal(id);
    });
  }

  async renderCategories() {
    try {
      const categories = await window.booksAPI.getCategories();
      
      const all = ['All categories', ...categories];
      this.categoriesUL.innerHTML = all
        .map((name, idx) => {
          const isAll = idx === 0;
          const data = isAll ? 'all' : name; 
          return `
            <li class="category-item ${isAll ? 'active' : ''}" data-category="${this.escapeHtml(data)}">
              <button class="category-button">${this.escapeHtml(name)}</button>
            </li>`;
        })
        .join('');

     
      this.categoriesUL.querySelectorAll('.category-button').forEach(btn => {
        btn.addEventListener('click', e => {
          const item = e.currentTarget.closest('.category-item');
          const category = item.dataset.category;
          this.filterByCategory(category);
        });
      });
    } catch (err) {
      console.error('Failed to load categories', err);
      this.categoriesUL.innerHTML = `
        <li class="category-item active" data-category="all">
          <button class="category-button">All categories</button>
        </li>`;
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
    } catch (err) {
      console.error('Error loading books:', err);
      this.showError('Помилка завантаження книг. Спробуйте пізніше.');
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
    books.forEach((book, i) => frag.appendChild(this.createBookCard(book, i)));
    this.booksGrid.appendChild(frag);
  }

  createBookCard(book, index = 0) {
    const card = document.createElement('div');
    card.className = 'book-card';
    card.dataset.bookId = book.id;
    card.style.animationDelay = `${(index % 6) * 0.1}s`;

   
    const priceHTML = book.price ? `<span class="book-price">${this.escapeHtml(book.price)}</span>` : `<span class="book-price"></span>`;

    card.innerHTML = `
      <img
        class="book-cover"
        data-src="${book.cover}"
        alt="${this.escapeHtml(book.title)} cover"
        loading="lazy"
        referrerpolicy="no-referrer"
      >
      <div class="book-info">
        <div class="book-title-row">
          <h3 class="book-title">${this.escapeHtml(book.title)}</h3>
          ${priceHTML}
        </div>
        <p class="book-author">${this.escapeHtml(book.author)}</p>
      </div>
      <div class="book-footer">
        <button class="learn-more-btn" onclick="event.stopPropagation()">Learn More</button>
      </div>
    `;

    const img = card.querySelector('.book-cover');
    if (this.imageObserver && img.dataset.src) this.imageObserver.observe(img);
    else this.loadImage(img);
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
    this.categoriesUL.querySelectorAll('.category-item').forEach(i => i.classList.remove('active'));
    const active = this.categoriesUL.querySelector(`.category-item[data-category="${CSS.escape(category)}"]`);
    if (active) active.classList.add('active');
  }

  async loadMore() {
    if (!this.hasMore || this.isLoading) return;
    this.currentPage += 1;
    await this.loadBooks(false);
  }

  async openModal(bookId) {
    if (!this.modal) return;
    try {
      const book = await window.booksAPI.getBookById(bookId);
      if (!book) return;
      this.populateModal(book);
      this.modal.classList.remove('hidden');
      document.body.style.overflow = 'hidden';
    } catch (err) {
      console.error('Error loading book details:', err);
      this.showError('Помилка завантаження деталей книги.');
    }
  }

  populateModal(book) {
    const cover = document.getElementById('modal-book-cover');
    const title = document.getElementById('modal-book-title');
    const author = document.getElementById('modal-book-author');
    const price = document.getElementById('modal-book-price');
    const descr = document.getElementById('modal-book-description');
    if (cover)  { cover.src = book.cover; cover.referrerPolicy = 'no-referrer'; }
    if (title)  title.textContent = book.title;
    if (author) author.textContent = book.author;
    if (price)  price.textContent = book.price || ''; 
    if (descr)  descr.textContent = book.description || '';
  }

  closeModal() {
    if (!this.modal) return;
    this.modal.classList.add('hidden');
    document.body.style.overflow = '';
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
    this.updateShowMoreButton();
  }

  showError(msg) { alert(msg); }

  escapeHtml(text) {
    const map = { '&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#039;' };
    return String(text ?? '').replace(/[&<>"']/g, m => map[m]);
  }
}


document.addEventListener('DOMContentLoaded', () => {
  if (!window.booksAPI) {
    console.error('BooksAPI not found! Make sure books-data.js is loaded.');
    return;
  }
  window.booksSection = new BooksSection();
});
