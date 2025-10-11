import BooksSection from './books-data.js';

function initBooks() {
  const section = document.getElementById('books-section');
  if (section) new BooksSection();
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initBooks);
} else {
  initBooks();
}


