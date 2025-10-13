const modalBackdrop = document.getElementById('modal');
const modal = modalBackdrop.querySelector('.modal');
const modalEventTitle = document.getElementById('modal-event-title');
const openButtons = document.querySelectorAll('.js-open-modal, #open-contact');
const closeButtons = modalBackdrop.querySelectorAll('[data-close]');
const form = document.getElementById('register-form');
let lastFocusedEl = null;

function openModal(eventTitle, opener) {
  lastFocusedEl = opener || document.activeElement;
  modalEventTitle.textContent = eventTitle;
  modalBackdrop.setAttribute('aria-hidden', 'false');
  document.body.style.overflow = 'hidden'; // не даємо сторінці скролитись
  // focus management
  const firstInput = modal.querySelector('input, textarea, button');
  firstInput && firstInput.focus();
  // add key listener
  document.addEventListener('keydown', handleKeydown);
}

function closeModal() {
  modalBackdrop.setAttribute('aria-hidden', 'true');
  document.body.style.overflow = '';
  // повертаємо фокус
  lastFocusedEl && lastFocusedEl.focus();
  document.removeEventListener('keydown', handleKeydown);
}

// Open buttons attach
openButtons.forEach(btn => {
  btn.addEventListener('click', (e) => {
      const title = btn.dataset.eventTitle
      btn.getAttribute('data-event-title')
    openModal(title, btn);
  });
});

// Close by clicking backdrop (але не по модалці)
modalBackdrop.addEventListener('click', (e) => {
  if (e.target === modalBackdrop) {
    closeModal();
  }
});

// Close buttons
closeButtons.forEach(b => b.addEventListener('click', closeModal));

// Key handling (Escape)
function handleKeydown(e) {
  if (e.key === 'Escape') {
    closeModal();
  }
  // Simple focus trap: keep focus inside modal for Tab
  if (e.key === 'Tab') {
    trapTabKey(e);
  }
}

// Very small focus trap
function trapTabKey(e) {
  const focusable = modal.querySelectorAll('a[href], button:not([disabled]), textarea, input, select, [tabindex]:not([tabindex="-1"])');
  if (!focusable.length) return;
  const first = focusable[0];
  const last = focusable[focusable.length - 1];
  if (e.shiftKey && document.activeElement === first) {
    last.focus();
    e.preventDefault();
  } else if (!e.shiftKey && document.activeElement === last) {
    first.focus();
    e.preventDefault();
  }
}

// Simple form handling (client-side validation shown)
form.addEventListener('submit', (e) => {
    e.preventDefault();
    if (!form.checkValidity()) {
        // Find first invalid element and focus
        const invalid = form.querySelector(':invalid');
        if (invalid) invalid.focus();
        return;
    }

    // Simulate successful submission
    const name = form.name.value;
    const email = form.email.value;
    console.log('Submitted:', { name, email, message: form.message.value });

 

    // Set current year in footer
  document.getElementById('year').textContent = new Date().getFullYear();
  alert('Thank you for registering! We will contact you soon.');
    form.reset();
    closeModal();
      


})