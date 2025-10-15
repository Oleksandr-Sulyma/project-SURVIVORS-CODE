import {showRegistrationSuccess} from './cart'
const modalBackdrop = document.getElementById('modal');
const modal = modalBackdrop.querySelector('.modal-content');
const modalEventTitle = document.getElementById('modal-event-title');
const openButtons = document.querySelectorAll('.open-modal-btn, #open-contact');
const closeButtons = modalBackdrop.querySelectorAll('.modal-close-btn');
const form = document.querySelector('.register-form');


let lastFocusedEl = null;


const htmlElement = document.documentElement;
let handleKeydownRef = null;     
let handleBackdropClickRef = null;

//   POTENTIAL PROBLEM

function openModal(eventTitle, opener) {
  lastFocusedEl = opener || document.activeElement;
  modalBackdrop.classList.add('active');
  
  document.body.classList.add('modal-open');
  htmlElement.classList.add('modal-open'); 

  const firstInput = modal.querySelector('input, textarea, button');
  firstInput && firstInput.focus();

  handleKeydownRef = function(e) {
      if (e.key === 'Escape') {
          closeModal();
      }
    
      if (e.key === 'Tab') {
          trapTabKey(e);
      }
  }

  handleBackdropClickRef = function(e) {
      if (e.target === modalBackdrop) {
          closeModal();
      }
  }
  
  document.addEventListener('keydown', handleKeydownRef);
  modalBackdrop.addEventListener('click', handleBackdropClickRef);
}

function closeModal() {
  modalBackdrop.classList.remove('active');

  if (handleKeydownRef) {
      document.removeEventListener('keydown', handleKeydownRef);
  }
  if (handleBackdropClickRef) {
      modalBackdrop.removeEventListener('click', handleBackdropClickRef);
  }

  document.body.classList.remove('modal-open');
  htmlElement.classList.remove('modal-open'); 

  lastFocusedEl && lastFocusedEl.focus();
  
  handleKeydownRef = null;
  handleBackdropClickRef = null;
}

openButtons.forEach(btn => {
  btn.addEventListener('click', e => {
    const title = btn.dataset.eventTitle;
    modalEventTitle.textContent = title;
    btn.getAttribute('data-event-title');
    openModal(title, btn);
  });
});



closeButtons.forEach(b => b.addEventListener('click', closeModal));

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

form.addEventListener('submit', e => {
  e.preventDefault();
  if (!form.checkValidity()) {
   
    const invalid = form.querySelector(':invalid');
    if (invalid) invalid.focus();
    return;
  }

  const name = form.name.value;
  const email = form.email.value;
  console.log('Submitted:', { name, email, message: form.message.value });
  closeModal();
  showRegistrationSuccess(`Thank you for registering, ${name}! We will contact you at ${email}.`);
  form.reset();
});
 
