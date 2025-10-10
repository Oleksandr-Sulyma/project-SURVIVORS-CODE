import iziToast from 'izitoast';
import 'izitoast/dist/css/iziToast.min.css';

const footerForm = document.querySelector('.footer-input-box');
const footerInput = document.querySelector('.footer-input');
const remark = document.querySelector('.footer-remark');
const footerBtn = document.querySelector('.footer-btn');
const emailBox = [];
const ms = 3000;

footerForm.addEventListener('submit', e => {
  e.preventDefault();

  if (!footerInput.validity.valid) {
    if (footerInput.validity.valueMissing) {
      remark.textContent = '* Required field';
      remark.style.color = 'var(--clr-dark)';
      iziToast.warning({
    title: 'Caution',
    message: 'Required field',
    position: 'topRight',
});
    } else if (footerInput.validity.patternMismatch) {
      remark.textContent = 'Please enter a valid email';
      remark.style.borderColor = 'var(--clr-error)';
      footerBtn.style.borderColor = 'var(--clr-error)';
      iziToast.error({
        title: 'Error',
        message: 'Please enter a valid email',
        position: 'topRight',
      });
    }
    setTimeout(() => {
      (remark.textContent = ''),
        (footerBtn.style.borderColor = 'var(--clr-dark)');
    }, ms);
  } else {
    remark.textContent = '✅ Email saved!';
    remark.style.color = 'green';
    footerBtn.style.backgroundColor = 'var(--clr-orange-dark)';
    iziToast.success({
    title: 'OK',
    message: 'Email saved!',
});

    setTimeout(() => {
      (remark.textContent = ''),
        (footerBtn.style.backgroundColor = 'var(--clr-orange-light)');
    }, ms);
    footerForm.reset();
  }
});
