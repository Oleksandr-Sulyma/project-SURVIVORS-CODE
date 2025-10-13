// src/js/render-functions.js
import { HTML_ESCAPE_MAP } from './constants.js';
import refs from './refs';

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
        ${
          priceText
            ? `<span class="book-price">${escapeHtml(priceText)}</span>`
            : ''
        }
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
    <li class="category-item ${
      isActive ? 'active' : ''
    }" data-category="${escapeHtml(value)}">
      <button class="category-button" type="button" data-category="${escapeHtml(
        value
      )}">
        ${escapeHtml(name)}
      </button>
    </li>
  `;
}

export function renderCategories(
  container,
  categories,
  activeCategory = 'all'
) {
  if (!container) return;
  container.innerHTML = categories
    .map(c => createCategoryItem(c.name, c.value, c.value === activeCategory))
    .join('');
}

export function populateDropdowns(
  dropdowns,
  categories,
  activeCategory = 'all'
) {
  dropdowns.forEach(select => {
    if (!select) return;
    select.innerHTML = categories
      .map(
        c => `<option value="${escapeHtml(c.value)}" ${
          c.value === activeCategory ? 'selected' : ''
        }>
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
  if (!books || books.length === 0) {
    container.innerHTML = `<li class="no-books">No books found</li>`;
    return;
  }
  books.forEach((b, i) => {
    const card = createBookCard(b, i);
    container.appendChild(card);
  });
}

export function appendBooks(container, books) {
  if (!container || !books?.length) return;
  const start = container.children.length;
  books.forEach((b, i) => {
    const card = createBookCard(b, start + i);
    container.appendChild(card);
  });
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

export function createBookModalCard(book) {
  const bookCard = document.createElement('div');
  bookCard.className = 'modal-book-layout';

  const priceDisplay =
    book.price && book.price !== '0.00' ? book.price : '0.00';

  const description =
    book.description && book.description.trim() !== ''
      ? book.description
      : null;

  const publisherText = book.publisher
    ? `<br>Publisher: <b>${book.publisher}</b>.`
    : null;

  const weeksCount = book.weeks_on_list;
  const weeksText = weeksCount === 1 ? 'week' : 'weeks';

  const rankText =
    book.rank && book.rank > 0 && weeksCount && weeksCount > 0
      ? `<br>This book is ranked <b>#${book.rank}</b> on the bestseller list, having been on it for <b>${weeksCount}</b> ${weeksText}.`
      : null;

  let detailsContent = description || '';

  if (description) {
    let additionalInfo = '';
    if (publisherText) additionalInfo += publisherText;
    if (rankText) additionalInfo += rankText;

    if (additionalInfo) {
      detailsContent += additionalInfo;
    }
  }

  if (!detailsContent) {
    detailsContent = 'No description available for this book.';
  }

  bookCard.innerHTML = `
        <img
            class="book-cover-img"
            src="${book.book_image || ''}"
            alt="Book cover for '${book.title}' by ${book.author}"
            width="309"
            height="467"
        />

        <div class="mobile-content">
            <div class="section-header">
                <h2 class="book-title-mobile">${book.title}</h2>
                <p class="book-author">${book.author}</p>
                <p class="price-mobile">$${priceDisplay}</p>
            </div>

            <div class="quantity-control" data-item-id="${book._id}">
                <button type="button" class="decrease-btn" aria-label="Decrease quantity" disabled>-</button>
                <input type="number" class="quantity-input" value="1" min="1" max="99" aria-label="Book quantity"/>
                <button type="button" class="increase-btn" aria-label="Increase quantity">+</button>
            </div>

            <div class="modal-book-actions">
                <button class="btn add-to-cart-btn" type="button" data-action="add-to-cart">Add to Cart</button>
                <button class="btn buy-now-btn btn-secondary" type="button" data-action="buy-now">Buy Now</button>
            </div>
            
            <div class="accordion-container">
                <div class="ac">
                    <div class="ac-header">
                        <h4 class="ac-title">Details</h4>
                        <svg class="ac-icon arrow-down" width="24" height="25">
                            <use href="/img/symbol-defs.svg#icon-chevron-down"></use>
                        </svg>
                        <svg class="ac-icon arrow-up" width="24" height="25">
                            <use href="/img/symbol-defs.svg#icon-chevron-up"></use>
                        </svg>
                    </div>
                    <div class="ac-panel">
                        <p class="ac-text">${detailsContent}</p>
                    </div>
                </div>

                <div class="ac">
                    <div class="ac-header">
                        <h4 class="ac-title">Shipping</h4> 
                        <svg class="ac-icon arrow-down" width="24" height="25">
                            <use href="/img/symbol-defs.svg#icon-chevron-down"></use>
                        </svg>
                        <svg class="ac-icon arrow-up" width="24" height="25">
                            <use href="/img/symbol-defs.svg#icon-chevron-up"></use>
                        </svg>
                    </div>
                    <div class="ac-panel">
                        <p class="ac-text">
                            We ship across the United States within 2-6 business days. All
                            orders are processed through USPS or a reliable courier service. Enjoy free standard shipping on orders over $50.
                        </p>
                    </div>
                </div>
            
                <div class="ac">
                    <div class="ac-header">
                        <h4 class="ac-title">Returns</h4> 
                        <svg class="ac-icon arrow-down" width="24" height="25">
                            <use href="/img/symbol-defs.svg#icon-chevron-down"></use>
                        </svg>
                        <svg class="ac-icon arrow-up" width="24" height="25">
                            <use href="/img/symbol-defs.svg#icon-chevron-up"></use>
                        </svg>
                    </div>
                    <div class="ac-panel">
                        <p class="ac-text">
                            You can return an item within 14 days of receiving your order,
                            provided it hasn't been used and is in its original condition.
                            To start a return, please contact our support team — we'll guide you through the process quickly and hassle-free.
                        </p>
                    </div>
                </div>
            </div>
        </div>
    `;
  return bookCard;
}
