import BooksSection from './books-data.js';

// Keep a single instance across HMR & repeated imports
let instance = window.__booksSectionInstance || null;

export function mountBooks() {
  if (instance) return instance;
  instance = new BooksSection();
  window.__booksSectionInstance = instance;
  return instance;
}

// Auto–mount exactly once
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => mountBooks(), { once: true });
} else {
  mountBooks();
}

// Clean up on Vite HMR to avoid duplicated mounts
if (import.meta?.hot) {
  import.meta.hot.dispose(() => {
    if (instance) {
      instance.destroy?.();
      instance = null;
      window.__booksSectionInstance = null;
    }
  });
}


