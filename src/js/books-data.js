const BOOKS_BASE_URL = 'https://books-backend.p.goit.global';

async function fetchJSON(path) {
  const res = await fetch(`${BOOKS_BASE_URL}${path}`);
  if (!res.ok) throw new Error(`API ${res.status} – ${res.statusText}`);
  return res.json();
}

function pseudoPriceFromId(id) {
  let hash = 0;
  const s = String(id || '');
  for (let i = 0; i < s.length; i++) {
    hash = ((hash << 5) - hash) + s.charCodeAt(i);
    hash |= 0;
  }
  const n = 10 + Math.abs(hash % 15);
  return `$${n}`;
}

function normalizeBook(b) {
  return {
    id: b._id,
    title: b.title || 'Untitled',
    author: b.author || 'Unknown',
    description: b.description || '',
    cover: b.book_image || '',
    price: pseudoPriceFromId(b._id),
    buy_links: b.buy_links || [],
    category: b.list_name || ''
  };
}

class BooksAPI {
  async getCategories() {
    const data = await fetchJSON('/books/category-list');
    return [...new Set(data.map(c => c.list_name).filter(Boolean))];
  }

  async getTopBooksFlatten() {
    const groups = await fetchJSON('/books/top-books');
    const all = [];
    for (const g of groups) {
      if (Array.isArray(g.books)) all.push(...g.books.map(normalizeBook));
    }
    return all;
  }

  async getBooksByCategory(categoryName) {
    const data = await fetchJSON(`/books/category?category=${encodeURIComponent(categoryName)}`);
    return data.map(normalizeBook);
  }

  async getBookById(id) {
    const data = await fetchJSON(`/books/${id}`);
    return normalizeBook(data);
  }

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
      showing: Math.min(end, total)
    };
  }
}

window.booksAPI = new BooksAPI();

