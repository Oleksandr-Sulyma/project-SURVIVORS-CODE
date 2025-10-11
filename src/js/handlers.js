export function createShowMoreHandler(section){ return ()=>section.loadMore(); }

export function createBookClickHandler(){
  return e => {
    const btn = e.target.closest('.learn-more-btn'); if (!btn) return;
    e.preventDefault(); const url = btn.dataset.amazonUrl;
    if (url && url !== '#') window.open(url,'_blank','noopener,noreferrer');
  };
}

export function createResizeHandler(section){
  return () => {
    if (section.debounceTimeout) clearTimeout(section.debounceTimeout);
    section.debounceTimeout = setTimeout(() => {
      const cards = section.elements.booksGrid?.querySelectorAll('.book-card') ?? [];
      cards.forEach((card,i)=>card.style.animationDelay = `${(i % 8)*0.05 + 0.1}s`);
    }, 250);
  };
}

export function createCategoryChangeHandler(section){ return e => section.filterByCategory(e.target.value); }

export function createCategoryButtonHandler(section){
  return e => {
    const li = e.currentTarget.closest('.category-item');
    const cat = li?.dataset.category;
    if (cat && cat !== section.currentCategory) section.filterByCategory(cat);
  };
}

export function createRetryHandler(section){ return ()=>section.loadBooks(true); }

export function createIntersectionObserver(onLoad){
  return new IntersectionObserver(entries => {
    entries.forEach(entry => { if (entry.isIntersecting) onLoad(entry.target); });
  }, { rootMargin: '50px 0px' });
}

export function loadImage(img, observer){
  const src = img.dataset.src; if(!src) return;
  img.classList.add('loading');
  const t = new Image();
  t.onload = () => { img.src = src; img.classList.remove('loading'); img.classList.add('loaded'); delete img.dataset.src; observer?.unobserve(img); };
  t.onerror = () => { img.classList.remove('loading'); img.classList.add('error'); observer?.unobserve(img); };
  t.src = src;
}