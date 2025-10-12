// src/js/render-functions.js
import { HTML_ESCAPE_MAP } from './constants.js';

export function escapeHtml(text) {
  if (!text) return '';
  return String(text).replace(/[&<>"']/g, m => HTML_ESCAPE_MAP[m]);
}

/** Single book card */
export function createBookCard(book, index = 0) {
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
        alt="${escapeHtml(book.title)}"
        loading="lazy"
      >
    </div>
    <div class="book-info">
      <div class="book-title-row">
        <h3 class="book-title">${escapeHtml(book.title)}</h3>
        ${priceText ? `<span class="book-price">${escapeHtml(priceText)}</span>` : ''}
      </div>
      <p class="book-author">${escapeHtml(book.author)}</p>
    </div>
    <div class="book-footer">
      <button
        class="learn-more-btn"
        type="button"
        data-book-id="${escapeHtml(book.id)}"
        data-amazon-url="${escapeHtml(book.amazon_product_url)}"
      >
        Learn More
      </button>
    </div>
  `;
  return li;
}

export function createCategoryItem(name, value, isActive) {
  return `
    <li class="category-item ${isActive ? 'active' : ''}" data-category="${escapeHtml(value)}">
      <button class="category-button" type="button" data-category="${escapeHtml(value)}">
        ${escapeHtml(name)}
      </button>
    </li>
  `;
}

/** Categories renderers */
export function renderCategories(container, categories, activeCategory = 'all') {
  if (!container) return;
  container.innerHTML = categories
    .map(c => createCategoryItem(c.name, c.value, c.value === activeCategory))
    .join('');
}

export function populateDropdowns(dropdowns, categories, activeCategory = 'all') {
  dropdowns.forEach(select => {
    if (!select) return;
    select.innerHTML = categories
      .map(
        c => `<option value="${escapeHtml(c.value)}" ${c.value === activeCategory ? 'selected' : ''}>
          ${escapeHtml(c.name)}
        </option>`
      )
      .join('');
  });
}

/** Books list renderers */
export function renderBooks(container, books) {
  if (!container) return;
  container.innerHTML = '';
  books?.forEach((b, i) => container.appendChild(createBookCard(b, i)));
}

export function appendBooks(container, books) {
  if (!container || !books?.length) return;
  const start = container.children.length;
  books.forEach((b, i) => container.appendChild(createBookCard(b, start + i)));
}

/** UI helpers */
export function updateBooksCounter(counter, showing, total) {
  if (counter) counter.textContent = `Showing ${showing} of ${total}`;
}

export function updateShowMoreButton(button, hasMore, isLoading) {
  if (!button) return;
  const text = button.querySelector('.button-text');
  if (!text) return;

  if (isLoading) {
    text.textContent = 'Loading...';
    button.disabled = true;
  } else if (hasMore) {
    text.textContent = 'Show More';
    button.disabled = false;
    button.style.display = 'block';
  } else {
    button.style.display = 'none';
  }
}

export function showError(errorElement, message) {
  if (!errorElement) return;
  const messageElement = errorElement.querySelector('.error-message');
  if (messageElement) messageElement.textContent = message;
  errorElement.style.display = 'block';
}

export function hideError(errorElement) {
  if (errorElement) errorElement.style.display = 'none';
}

export function setLoading(loader, listEl, isLoading) {
  loader?.classList.toggle('hidden', !isLoading);
  listEl?.setAttribute('aria-busy', String(isLoading));
}

export function setCategoriesLoading(loader, isLoading) {
  loader?.classList.toggle('hidden', !isLoading);
}

export function updateCategoriesActiveState(container, activeCategory) {
  if (!container) return;
  container.querySelectorAll('.category-item').forEach(li => {
    li.classList.toggle('active', li.dataset.category === activeCategory);
  });
}

/** Empty-state helpers */
export function renderEmptyState(container, categoryName = 'this category') {
  if (!container) return;
  container.innerHTML = `
    <li class="book-card" style="width:100%;max-width:100%;opacity:1;animation:none">
      <div style="padding:24px;border:1px dashed #ccc;border-radius:12px;background:#fff">
        <p style="margin:0;font-weight:600">No books in ${escapeHtml(categoryName)} yet.</p>
        <p style="margin:8px 0 0;color:#666">Try another category.</p>
      </div>
    </li>
  `;
}

export function clearContainer(el) {
  if (el) el.innerHTML = '';
}

