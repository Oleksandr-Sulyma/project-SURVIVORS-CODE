// src/js/books-data.js
const BOOKS_BASE_URL = 'https://books-backend.p.goit.global';

// Запит у форматі JSON
async function fetchJSON(path) {
  const res = await fetch(`${BOOKS_BASE_URL}${path}`);
  if (!res.ok) throw new Error(`API ${res.status} – ${res.statusText}`);
  return res.json();
}

// Стала псевдо-ціна, розрахована з id (щоб виглядало реалістно)
function pseudoPriceFromId(id) {
  let hash = 0;
  for (let i = 0; i < id.length; i++) {
    hash = (hash << 5) - hash + id.charCodeAt(i);
    hash |= 0;
  }
  const n = 10 + Math.abs(hash % 15); // $10–$24
  return `$${n}`;
}

// Форматуємо книгу під верстку
function normalizeBook(b) {
  return {
    id: b._id,
    title: b.title || 'Untitled',
    author: b.author || 'Unknown',
    description: b.description || '',
    cover: b.book_image || '',
    price: pseudoPriceFromId(b._id),  // ← додаємо ціну
    buy_links: b.buy_links || [],
    category: b.list_name || ''
  };
}

class BooksAPI {
  // 1️⃣ Перелік категорій
  async getCategories() {
    const data = await fetchJSON('/books/category-list');
    return [...new Set(data.map(c => c.list_name).filter(Boolean))];
  }

  // 2️⃣ Популярні книги з усіх категорій
  async getTopBooksFlatten() {
    const groups = await fetchJSON('/books/top-books');
    const all = [];
    for (const g of groups) {
      if (Array.isArray(g.books)) {
        all.push(...g.books.map(normalizeBook));
      }
    }
    return all;
  }

  // 3️⃣ Книги конкретної категорії
  async getBooksByCategory(categoryName) {
    const data = await fetchJSON(`/books/category?category=${encodeURIComponent(categoryName)}`);
    return data.map(normalizeBook);
  }

  // 4️⃣ Деталі однієї книги
  async getBookById(id) {
    const data = await fetchJSON(`/books/${id}`);
    return normalizeBook(data);
  }

  // 5️⃣ Пагінована вибірка для UI
  async getBooks(category = 'all', page = 1, limit = 12) {
    const all = category === 'all'
      ? await this.getTopBooksFlatten()
      : await this.getBooksByCategory(category);

    const total = all.length;
    const start = (page - 1) * limit;
    const end = start + limit;
    return {
      books: all.slice(start, end),
      total,
      currentPage: page,
      hasMore: end < total,
      showing: Math.min(end, total),
    };
  }
}

window.booksAPI = new BooksAPI();

