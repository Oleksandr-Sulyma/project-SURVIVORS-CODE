const scrollBtn = document.querySelector('.scroll-top');
const scrollTriggerPoint = document.querySelector('.hero');

function handleIntersection(entries) {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      scrollBtn.classList.add('hidden');
    } else {
      scrollBtn.classList.remove('hidden');
    }
  });
}

const observer = new IntersectionObserver(handleIntersection);
observer.observe(scrollTriggerPoint);

function scrollToTop() {
  window.scrollTo({
    top: 0,
    behavior: 'smooth',
  });
}

scrollBtn.addEventListener('click', scrollToTop);
