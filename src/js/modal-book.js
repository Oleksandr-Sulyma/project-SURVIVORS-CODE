import Accordion from 'accordion-js';
import MicroModal from 'micromodal';
import {getBookById} from './api-service'
export function initModal() {
  MicroModal.init({
    disableScroll: true,
    disableFocus: false,
    awaitCloseAnimation: true,
  });
}

export function showModal(content) {
  const modalContent = document.getElementById('modal-1-content');
  if (!modalContent) return;

  if (typeof content === 'string') {
    modalContent.innerHTML = content;
  } 
  
  else if (content instanceof HTMLElement) {
    modalContent.innerHTML = '';
    modalContent.appendChild(content);
  }

  MicroModal.show('modal-1');
}

(async () => {
  try {
    const book = await getBookById('68680e31ac8a51f74dd6a25c');
    console.log('Book:', book);
  } catch (err) {
    console.error('Error:', err);
  }
})();

