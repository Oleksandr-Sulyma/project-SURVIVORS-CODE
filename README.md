# 📚 Booksy E-Commerce

---

## 📝 Project Overview

**Booksy** is a modern, responsive e-commerce website for books, built with a **Mobile-First** approach.  
The site features dynamic book loading from a backend, interactive elements (sliders, modals, accordions, menus, forms),  
and a cart system with local data persistence.

**Key Features:**
- Fetch books data via **REST API**
- **Filtering** and **pagination** of books
- **Modal windows** for book previews and event registration
- **Interactive sliders** using **Swiper.js**
- User notifications via **iziToast**
- Local caching for faster performance

---

## 🚀 Technologies & Libraries

| Category | Technology / Library | Purpose |
|----------|--------------------|---------|
| **Build** | [Vite](https://vitejs.dev/) | Fast dev server, HMR, and build optimization |
| **Styles** | PostCSS, Sort Media Queries, modern-normalize | Mobile-First support, auto media query sorting, style normalization |
| **Frontend** | JavaScript (ES Modules) | Component logic and modular architecture |
| **API** | [Axios](https://axios-http.com/) | Async backend requests: https://books-backend-v2.b.goit.study/api-docs/ |
| **Sliders** | [Swiper.js](https://swiperjs.com/) | Sliders in Hero, Feedbacks, and Events sections |
| **Components** | Accordion Library | Expandable blocks (Details, Shipping, Returns) in modals |
| **Notifications** | [iziToast](https://github.com/marcelodolza/iziToast) | Visual confirmation of user actions and errors |
| **Caching** | Custom MemoryCache | Local caching for categories and books |
| **Validation** | Custom + HTML pattern | Email input validation in forms |
| **Responsive Layout** | CSS Grid / Flexbox | Fluid layout for breakpoints 320px, 768px, 1440px |

---

## 📐 Breakpoints

- **Mobile:** from 320px (fluid), adjusted at 375px  
- **Tablet:** from 768px  
- **Desktop:** from 1440px

---

## 💡 Core Functionality

- **BooksSection Class:** manages book data, caching, pagination, rendering  
- **Cart Module:** add/remove books with `localStorage` persistence  
- **API Service:** centralized requests to `/books/*` with error handling  
- **Swiper Initialization:** three sliders (Hero, Feedbacks, Events) with different settings  
- **Modal System:** shared logic for Book Modal and Event Modal  
- **Email Form:** subscription with success/error notifications  
- **Lazy Loading:** only load visible images  
- **Responsive Layout:** adaptive positioning for all breakpoints  

---

## 🧑‍💻 Team

- **Team Lead:** Oleksandr Sulyma (Modal Window)
- **Front-End Developers:** Serhii Borodulin, Serhii Kutovyi, Anna Ovcharenko, Ihor Orikh, Danyil Vorobiov, Volodymyr Triukhan
- **Scrum Master:** Anastasiia Chaplyhina
- **QA / Tester:** Serhii Borodulin, Serhii Kutovyi

---

## 📜 License

This project was created for educational purposes as part of the GoIT FullStack course.  
License: **MIT** — free for educational or non-commercial use.
