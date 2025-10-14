import iziToast from 'izitoast';
import 'izitoast/dist/css/iziToast.min.css';



// showError(message). Ця функція приймає повідомлення помилки і відображає його для користувача
export function showError(message) {
 return iziToast.error({
  title: 'Error',
  message: `${message}`,
  position: 'topRight', // Рекомендується додати позицію
    timeout: 5000,
    progressBarColor: '#ff9999',
    maxWidth: 482,
    messageSize: '16',
    messageColor: 'black',
});
}
// showWarning(numberPage, maxPage). Ця функція нічого не приймає відображає повідомлення про
// завантаження усіх сторінок
export function showWarning(text) {
  iziToast.info({
    message: text,
    position: 'topRight',
    maxWidth: 482,
    messageSize: '16',
    messageColor: 'black',
    timeout: 5000,
  });
}

export function showGreeting(text) {
 return iziToast.success({ // Використовуємо .success для стандартного зеленого (або перекриваємо фоном)
  title: '🎉 PURCHASE SUCCESSFUL: You have purchased', // Відповідна назва
  message: text, // Текст повідомлення
  position: 'topRight',
  maxWidth: 482,
  messageSize: '16',
  messageColor: 'black',
  timeout: 5000,
  backgroundColor: '#8a2be2', // Пурпурний колір (наприклад, BlueViolet)
  titleColor: 'white', // Робимо заголовок білим для кращої контрастності
  messageColor: 'white', // Робимо текст повідомлення білим
  icon: 'ico-bell', // Додаємо іншу іконку (наприклад, дзвіночок)
 });
}