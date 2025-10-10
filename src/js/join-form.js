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

  footerBtn.classList.remove('btn-error', 'btn-success');
  remark.classList.remove('remark-error', 'remark-success');

  if (!footerInput.validity.valid) {
    if (footerInput.validity.valueMissing) {
      remark.textContent = '* Required field';
      remark.classList.add('remark-default');

      iziToast.warning({
        title: 'Caution',
        message: 'Required field',
        position: 'topRight',
      });
    } else if (footerInput.validity.patternMismatch) {
      remark.textContent = 'Please enter a valid email';
      remark.classList.add('remark-error');
      footerBtn.classList.add('btn-error');
      iziToast.error({
        title: 'Error',
        message: 'Please enter a valid email',
        position: 'topRight',
      });
    }
    setTimeout(() => {
      remark.textContent = '';
      remark.classList.remove('remark-error', 'remark-success');
      footerBtn.classList.remove('btn-error', 'btn-success');
    }, ms);
    footerForm.reset();
  } else {
    remark.textContent = '✅ Email saved!';
    remark.classList.add('remark-success');
    footerBtn.classList.add('btn-success');

    iziToast.success({
      title: 'OK',
      message: 'Email saved!',
    });

    setTimeout(() => {
      remark.textContent = '';
      remark.classList.remove('remark-success');
      footerBtn.classList.remove('btn-success');
    }, ms);
    emailBox.push(footerInput.value.trim());
    console.log(emailBox);
    footerForm.reset();
  }
});
