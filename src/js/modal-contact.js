import {showRegistrationSuccess} from './cart'
const modalBackdrop = document.getElementById('modal');
const modal = modalBackdrop.querySelector('.modal-content');
const modalEventTitle = document.getElementById('modal-event-title');
const openButtons = document.querySelectorAll('.open-modal-btn, #open-contact');
const closeButtons = modalBackdrop.querySelectorAll('.modal-close-btn');
const form = document.querySelector('.register-form');
let lastFocusedEl = null;

//     POTENTIAL PROBLEM

function openModal(eventTitle, opener) {
  lastFocusedEl = opener || document.activeElement;
  modalBackdrop.classList.add('active');
  document.body.style.overflow = 'hidden'; 
  const firstInput = modal.querySelector('input, textarea, button');
  firstInput && firstInput.focus();
  // add key listener
  document.addEventListener('keydown', handleKeydown);
}

function closeModal() {
  modalBackdrop.classList.remove('active');
  document.body.style.overflow = '';
  // повертаємо фокус
  lastFocusedEl && lastFocusedEl.focus();
  document.removeEventListener('keydown', handleKeydown);
}

// Open buttons attach
openButtons.forEach(btn => {
  btn.addEventListener('click', e => {
    const title = btn.dataset.eventTitle;
    modalEventTitle.textContent = title;
    btn.getAttribute('data-event-title');
    openModal(title, btn);
  });
});

// Close by clicking backdrop (але не по модалці)
modalBackdrop.addEventListener('click', e => {
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
  const focusable = modal.querySelectorAll(
    'a[href], button:not([disabled]), textarea, input, select, [tabindex]:not([tabindex="-1"])'
  );
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
form.addEventListener('submit', e => {
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
  closeModal();
  showRegistrationSuccess(`Thank you for registering, ${name}! We will contact you at ${email}.`);
  form.reset();
});
  
  // Set current year in footer
  // document.getElementById('year').textContent = new Date().getFullYear();
  

