document.addEventListener('DOMContentLoaded', () => {
    // 1. Отримання посилань на елементи
    const modal = document.getElementById('book-modal');
    // Примітка: modal.querySelector('.modal-close-btn') шукає кнопку всередині backdrop/modal
    const closeBtn = modal ? modal.querySelector('.modal-close-btn') : null;

    if (!modal || !closeBtn) {
        // Якщо модалка не знайдена, виходимо
        console.warn("Modal or Close Button not found. Modal script not initialized.");
        return;
    }

    // 2. Функція перемикання стану модалки
    const toggleModal = () => {
        modal.classList.toggle('active');
        
        // Блокування скролу: додаємо/видаляємо клас до <body> та <html>
        document.body.classList.toggle('modal-open'); 
        document.documentElement.classList.toggle('modal-open'); 
        
        // Керування доступністю (Accessibility)
        const isModalOpen = modal.classList.contains('active');
        modal.setAttribute('aria-hidden', !isModalOpen);
        
        if (isModalOpen) {
            // При відкритті: фокус на кнопку закриття або перший інтерактивний елемент
            closeBtn.focus();
        } else {
            // При закритті: повертаємо фокус на елемент, який відкрив модалку (ця логіка має бути реалізована там, де ви відкриваєте модалку)
        }
    };

    // 3. Обробники подій для закриття

    // Закриття по кліку на кнопку
    closeBtn.addEventListener('click', toggleModal);
    
    // Закриття по кліку на фон (backdrop)
    modal.addEventListener('click', (e) => {
        // Перевіряємо, чи клік був саме на елементі .modal-backdrop
        if (e.target.classList.contains('modal-backdrop')) {
            toggleModal();
        }
    });

    // Закриття по натисканню клавіші Esc
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && modal.classList.contains('active')) {
            toggleModal();
        }
    });

    // --- Додаткова логіка: Quantity Control (для повноти) ---
    
    // Функція для оновлення кнопок кількості
    const updateQuantityButtons = (quantityControl) => {
        const input = quantityControl.querySelector('.quantity-input');
        const decreaseBtn = quantityControl.querySelector('.decrease-btn');
        const value = parseInt(input.value);
        const min = parseInt(input.min);

        decreaseBtn.disabled = value <= min;
    };

    // Обробка кліків на кнопки + і -
    const quantityControl = modal.querySelector('.quantity-control');
    if (quantityControl) {
        const input = quantityControl.querySelector('.quantity-input');
        const increaseBtn = quantityControl.querySelector('.increase-btn');
        const decreaseBtn = quantityControl.querySelector('.decrease-btn');
        const min = parseInt(input.min) || 1;
        const max = parseInt(input.max) || 99;

        updateQuantityButtons(quantityControl); // Ініціалізуємо стан

        increaseBtn.addEventListener('click', () => {
            let value = parseInt(input.value);
            if (value < max) {
                input.value = value + 1;
            }
            updateQuantityButtons(quantityControl);
        });

        decreaseBtn.addEventListener('click', () => {
            let value = parseInt(input.value);
            if (value > min) {
                input.value = value - 1;
            }
            updateQuantityButtons(quantityControl);
        });

        input.addEventListener('input', () => {
            let value = parseInt(input.value);
            if (isNaN(value) || value < min) {
                input.value = min;
            } else if (value > max) {
                input.value = max;
            }
            updateQuantityButtons(quantityControl);
        });
    }
});
