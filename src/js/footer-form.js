const footerForm = document.querySelector(".footer-input-box");
const footerInput = document.querySelector(".footer-input");
const remark = document.querySelector(".footer-remark");
const emailBox = [];
footerForm.addEventListener('submit', e => {
    e.preventDefault();
    if (!footerInput.validity.valid) {
    if (footerInput.validity.valueMissing) {
      remark.textContent = "* Required field";
      remark.style.color =' #0b0500';
    } else if (footerInput.validity.patternMismatch) {
      remark.textContent = "Error text";
      remark.style.color =' #ad0000';
    }
  } else {
    remark.textContent = "✅ Email saved!";
    remark.style.color = "green";
    setTimeout(() => remark.textContent = "", 2000);
    console.log(footerInput.value.trim());
    emailBox.push(footerInput.value.trim());
    console.log(emailBox);
    footerForm.reset();
  }
});

