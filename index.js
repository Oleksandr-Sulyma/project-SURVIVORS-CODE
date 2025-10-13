/* empty css                      */import{S as B,N as F,P as U,A as R,K as j,M as K,a as Y,b as V}from"./assets/vendor-B-hV6q5a.js";(function(){const t=document.createElement("link").relList;if(t&&t.supports&&t.supports("modulepreload"))return;for(const r of document.querySelectorAll('link[rel="modulepreload"]'))s(r);new MutationObserver(r=>{for(const n of r)if(n.type==="childList")for(const a of n.addedNodes)a.tagName==="LINK"&&a.rel==="modulepreload"&&s(a)}).observe(document,{childList:!0,subtree:!0});function o(r){const n={};return r.integrity&&(n.integrity=r.integrity),r.referrerPolicy&&(n.referrerPolicy=r.referrerPolicy),r.crossOrigin==="use-credentials"?n.credentials="include":r.crossOrigin==="anonymous"?n.credentials="omit":n.credentials="same-origin",n}function s(r){if(r.ep)return;r.ep=!0;const n=o(r);fetch(r.href,n)}})();const w=document.querySelector("[data-navbar]");document.querySelector("[data-navbar-open]").addEventListener("click",()=>{w.classList.remove("is-close"),w.classList.add("is-open"),document.body.classList.add("no-scroll")});document.querySelector("[data-navbar-close]").addEventListener("click",()=>{w.classList.replace("is-open","is-close"),document.body.classList.remove("no-scroll")});B.use([F,U,R,j,K]);document.addEventListener("DOMContentLoaded",function(){const e=document.querySelector(".feedbacks-slider");if(!e){console.error("Swiper: Контейнер .feedbacks-slider не знайдено.");return}new B(e,{slidesPerView:1,spaceBetween:24,watchOverflow:!0,navigation:{nextEl:".swiper-arrows .swiper-button-next",prevEl:".swiper-arrows .swiper-button-prev"},pagination:{el:".carousel-navigation .swiper-pagination",clickable:!0},a11y:{enabled:!0},keyboard:{enabled:!0},mousewheel:{enabled:!0,forceToAxis:!0},breakpoints:{320:{slidesPerView:1,spaceBetween:24},768:{slidesPerView:2,spaceBetween:32},1440:{slidesPerView:3,spaceBetween:32}}})});const N=new B(".heroSwiper",{spaceBetween:5,speed:500,navigation:{nextEl:".swiper-button-next",prevEl:".swiper-button-prev"},keyboard:!0}),W=document.querySelector(".button-next"),J=document.querySelector(".button-prev");W.addEventListener("click",()=>{console.log("next"),N.slideNext()});J.addEventListener("click",()=>{console.log("prev"),N.slidePrev()});const D="https://books-backend.p.goit.global",Q=1e4,S=3,X=1e3,m={initialPerPageMobile:10,initialPerPageDesktop:24,perLoadMoreDesktop:24,perLoadMoreMobile:10,mobileBreakpoint:768,tabletBreakpoint:1024},C={maxSize:50,ttl:5*60*1e3},$=["Hardcover Fiction","Hardcover Nonfiction","Trade Fiction Paperback","Mass Market Monthly","Paperback Trade Fiction","Paperback Nonfiction","E-Book Fiction","E-Book Nonfiction","Hardcover Advice","Paperback Advice","Advice How-To and Miscellaneous","Children's Middle Grade Hardcover","Picture Books","Series Books","Young Adult Hardcover","Audio Fiction","Audio Nonfiction","Business Books","Graphic Books and Manga","Mass Market","Middle Grade Paperback","Young Adult Paperback"],u={booksGrid:"books-grid",booksLoader:"books-loader",showMoreBtn:"show-more-btn",categoriesList:"categories-list",categoriesLoader:"categories-loader",booksError:"books-error",booksCounter:"books-counter-text",categoriesSelectTablet:"categories-select-tablet",categoriesSelectMobile:"categories-select-mobile"},Z={"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#039;"};async function A(e,t={}){const o=new AbortController,s=setTimeout(()=>o.abort(),Q);let r=null;for(let n=1;n<=S;n++)try{const a=await fetch(`${D}${e}`,{signal:o.signal,headers:{"Content-Type":"application/json",Accept:"application/json"},...t});if(clearTimeout(s),!a.ok){const l=await a.text().catch(()=>"");throw new Error(`API ${a.status}: ${a.statusText}. ${l}`)}return await a.json()}catch(a){if(r=a,a.name==="AbortError")throw new Error("Request timeout. Please check your connection.");if(n===S)throw r;await new Promise(l=>setTimeout(l,X*n))}}function T(e,t=""){return{id:e._id||"no-id",title:e.title||"Untitled",author:e.author||"Unknown Author",image:e.book_image||t,amazon_product_url:e.amazon_product_url||"#",price:e.price||""}}class ee{constructor(t=C.maxSize,o=C.ttl){this.cache=new Map,this.maxSize=t,this.ttl=o}set(t,o){if(this.cache.size>=this.maxSize){const s=this.cache.keys().next().value;this.cache.delete(s)}this.cache.set(t,{value:o,ts:Date.now()})}get(t){const o=this.cache.get(t);return o?Date.now()-o.ts>this.ttl?(this.cache.delete(t),null):o.value:null}clear(){this.cache.clear()}}class te{constructor(){this.cache=new ee}async getCategories(){const t="categories",o=this.cache.get(t);if(o)return o;try{const s=await A("/books/category-list");let r=[];s&&Array.isArray(s.results)&&(r=s.results.map(a=>typeof a=="object"&&a.list_name?{name:a.list_name,value:a.list_name}:typeof a=="string"?{name:a,value:a}:null).filter(Boolean)),r.length||(r=$.map(a=>({name:a,value:a})));const n=[{name:"All Categories",value:"all"},...r];return this.cache.set(t,n),n}catch{return[{name:"All Categories",value:"all"},...$.map(s=>({name:s,value:s}))]}}async getBooks(t="all",o=1,s){var a;s||(s=window.innerWidth<=768?10:24);const r=`books_${t}_${o}_${s}`,n=this.cache.get(r);if(n)return n;try{let l="/books/top-books";t!=="all"&&(l=`/books/category?category=${encodeURIComponent(t)}`);const i=await A(l),c=[],b=new Set;t==="all"?Array.isArray(i)&&i.forEach(v=>{Array.isArray(v.books)&&v.books.forEach(k=>{const g=T(k),p=`${g.title}__${g.image}`;b.has(p)||(b.add(p),c.push(g))})}):((a=i==null?void 0:i.results)!=null&&a.length?i.results:Array.isArray(i)?i:[]).forEach(k=>{const g=T(k),p=`${g.title}__${g.image}`;b.has(p)||(b.add(p),c.push(g))}),c.length||console.log(`У категорії "${t}" немає книг.`);const E=(o-1)*s,y=E+s,M={books:c.slice(E,y),total:c.length,showing:Math.min(y,c.length),hasMore:y<c.length,currentPage:o};return this.cache.set(r,M),M}catch(l){throw new Error(`Failed to load books: ${l.message}`)}}}const I=new te,oe=async e=>{try{const{data:t}=await Y.get(`${D}/books/${e}`);return t}catch(t){throw t}},h={elBookModal:document.querySelector("#book-modal"),elModalContent:modal.querySelector(".modal-content"),elBtnOpenModal:document.getElementById("open-modal-btn"),footerForm:document.querySelector(".footer-input-box"),footerInput:document.querySelector(".footer-input"),footerRemark:document.querySelector(".footer-remark"),footerBtn:document.querySelector(".footer-btn")};function d(e){return e?String(e).replace(/[&<>"']/g,t=>Z[t]):""}function z(e,t=0){const o=document.createElement("li");o.className="book-card",o.style.animationDelay=`${t%8*.05+.1}s`;const s=e.price&&e.price!=="$0"?e.price:"";return o.innerHTML=`
    <div class="book-media">
      <img
        class="book-cover loading"
        src="data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='227' height='323'%3E%3Crect width='100%25' height='100%25' fill='%23f0f0f0'/%3E%3C/svg%3E"
        ${e.image?`data-src="${e.image}"`:""}
        alt="${d(e.title)}"
        loading="lazy"
      >
    </div>
    <div class="book-info">
      <div class="book-title-row">
        <h3 class="book-title">${d(e.title)}</h3>
        ${s?`<span class="book-price">${d(s)}</span>`:""}
      </div>
      <p class="book-author">${d(e.author)}</p>
    </div>
    <div class="book-footer">
      <button
        class="learn-more-btn"
        type="button"
        data-book-id="${d(e.id)}"
        data-amazon-url="${d(e.amazon_product_url)}"
      >
        Learn More
      </button>
    </div>
  `,o}function se(e,t,o){return`
    <li class="category-item ${o?"active":""}" data-category="${d(t)}">
      <button class="category-button" type="button" data-category="${d(t)}">
        ${d(e)}
      </button>
    </li>
  `}function re(e,t,o="all"){e&&(e.innerHTML=t.map(s=>se(s.name,s.value,s.value===o)).join(""))}function ne(e,t,o="all"){e.forEach(s=>{s&&(s.innerHTML=t.map(r=>`<option value="${d(r.value)}" ${r.value===o?"selected":""}>
          ${d(r.name)}
        </option>`).join(""))})}function ae(e,t){if(e){if(e.innerHTML="",!t||t.length===0){e.innerHTML='<li class="no-books">No books found</li>';return}t.forEach((o,s)=>{const r=z(o,s);e.appendChild(r)})}}function ie(e,t){if(!e||!(t!=null&&t.length))return;const o=e.children.length;t.forEach((s,r)=>{const n=z(s,o+r);e.appendChild(n)})}function ce(e,t,o){e&&(e.textContent=`Showing ${t} of ${o}`)}function le(e,t,o){if(!e)return;const s=e.querySelector(".button-text");s&&(o?(s.textContent="Loading...",e.disabled=!0):t?(s.textContent="Show More",e.disabled=!1,e.style.display="block"):e.style.display="none")}function P(e,t){if(!e)return;const o=e.querySelector(".error-message");o&&(o.textContent=t),e.style.display="block"}function x(e){e&&(e.style.display="none")}function de(e,t,o){e==null||e.classList.toggle("hidden",!o),t==null||t.setAttribute("aria-busy",String(o))}function q(e,t){e==null||e.classList.toggle("hidden",!t)}function ue(e,t){e&&e.querySelectorAll(".category-item").forEach(o=>{o.classList.toggle("active",o.dataset.category===t)})}function he(e){const t=document.createElement("div");t.className="modal-book-layout";const o=e.price&&e.price!=="0.00"?e.price:"0.00",s=e.description&&e.description.trim()!==""?e.description:null,r=e.publisher?`<br>Publisher: <b>${e.publisher}</b>.`:null,n=e.weeks_on_list,a=n===1?"week":"weeks",l=e.rank&&e.rank>0&&n&&n>0?`<br>This book is ranked <b>#${e.rank}</b> on the bestseller list, having been on it for <b>${n}</b> ${a}.`:null;let i=s||"";if(s){let c="";r&&(c+=r),l&&(c+=l),c&&(i+=c)}return i||(i="No description available for this book."),t.innerHTML=`
        <img
            class="book-cover-img"
            src="${e.book_image||""}"
            alt="Book cover for '${e.title}' by ${e.author}"
            width="309"
            height="467"
        />

        <div class="mobile-content">
            <div class="section-header">
                <h2 class="book-title-mobile">${e.title}</h2>
                <p class="book-author">${e.author}</p>
                <p class="price-mobile">$${o}</p>
            </div>

            <div class="quantity-control" data-item-id="${e._id}">
                <button type="button" class="decrease-btn" aria-label="Decrease quantity" disabled>-</button>
                <input type="number" class="quantity-input" value="1" min="1" max="99" aria-label="Book quantity"/>
                <button type="button" class="increase-btn" aria-label="Increase quantity">+</button>
            </div>

            <div class="modal-book-actions">
                <button class="btn add-to-cart-btn" type="button" data-action="add-to-cart">Add to Cart</button>
                <button class="btn buy-now-btn btn-secondary" type="button" data-action="buy-now">Buy Now</button>
            </div>
            
            <div class="accordion-container">
                <div class="ac">
                    <div class="ac-header">
                        <h4 class="ac-title">Details</h4>
                        <svg class="ac-icon arrow-down" width="24" height="25">
                            <use href="/img/symbol-defs.svg#icon-chevron-down"></use>
                        </svg>
                        <svg class="ac-icon arrow-up" width="24" height="25">
                            <use href="/img/symbol-defs.svg#icon-chevron-up"></use>
                        </svg>
                    </div>
                    <div class="ac-panel">
                        <p class="ac-text">${i}</p>
                    </div>
                </div>

                <div class="ac">
                    <div class="ac-header">
                        <h4 class="ac-title">Shipping</h4> 
                        <svg class="ac-icon arrow-down" width="24" height="25">
                            <use href="/img/symbol-defs.svg#icon-chevron-down"></use>
                        </svg>
                        <svg class="ac-icon arrow-up" width="24" height="25">
                            <use href="/img/symbol-defs.svg#icon-chevron-up"></use>
                        </svg>
                    </div>
                    <div class="ac-panel">
                        <p class="ac-text">
                            We ship across the United States within 2-6 business days. All
                            orders are processed through USPS or a reliable courier service. Enjoy free standard shipping on orders over $50.
                        </p>
                    </div>
                </div>
            
                <div class="ac">
                    <div class="ac-header">
                        <h4 class="ac-title">Returns</h4> 
                        <svg class="ac-icon arrow-down" width="24" height="25">
                            <use href="/img/symbol-defs.svg#icon-chevron-down"></use>
                        </svg>
                        <svg class="ac-icon arrow-up" width="24" height="25">
                            <use href="/img/symbol-defs.svg#icon-chevron-up"></use>
                        </svg>
                    </div>
                    <div class="ac-panel">
                        <p class="ac-text">
                            You can return an item within 14 days of receiving your order,
                            provided it hasn't been used and is in its original condition.
                            To start a return, please contact our support team — we'll guide you through the process quickly and hassle-free.
                        </p>
                    </div>
                </div>
            </div>
        </div>
    `,t}async function ge(e){const t=h.elBookModal;h.elModalContent.querySelectorAll(".modal-book-layout").forEach(r=>r.remove());const o=he(e);h.elModalContent.appendChild(o),t.classList.add("active","is-open"),t.setAttribute("aria-hidden","false"),document.body.classList.add("modal-open"),document.documentElement.classList.add("modal-open"),h.elBookModal.addEventListener("click",G),window.addEventListener("keydown",me,{once:!0});const s=Array.from(h.elModalContent.querySelectorAll(".accordion-container"));s.length>0&&new V(s,{duration:300,showMultiple:!0,triggerClass:"ac-header"})}function L(){const e=h.elBookModal;document.body.focus(),h.elBookModal.removeEventListener("click",G),e.classList.remove("active","is-open"),e.setAttribute("aria-hidden","true"),h.elModalContent.querySelectorAll(".modal-book-layout").forEach(o=>o.remove()),document.querySelectorAll(".modal-backdrop.is-open").length>0||(document.body.classList.remove("modal-open"),document.documentElement.classList.remove("modal-open"))}function G(e){if(e.target.closest(".modal-close-btn")||e.target===h.elBookModal)return L();const t=e.target.closest(".decrease-btn")||e.target.closest(".increase-btn");if(t){const o=t.closest(".quantity-control"),s=o.querySelector(".quantity-input");let r=parseInt(s.value);const n=parseInt(s.min)||1,a=parseInt(s.max)||99;t.classList.contains("increase-btn")&&r<a?s.value=r+1:t.classList.contains("decrease-btn")&&r>n&&(s.value=r-1),o.querySelector(".decrease-btn").disabled=parseInt(s.value)<=n;return}}function me(e){if(e.key==="Escape")return L()}function pe(e){return()=>e.loadMore()}function fe(){return async function(t){const o=t.target.closest(".learn-more-btn");if(!o)return;t.preventDefault();const s=o.dataset.bookId;if(!(!s||s==="no-id"))try{const r=await oe(s);ge(r)}catch(r){console.error("Error fetching book:",r)}}}function be(e){return()=>{e.debounceTimeout&&clearTimeout(e.debounceTimeout),e.debounceTimeout=setTimeout(()=>{var o;(((o=e.elements.booksGrid)==null?void 0:o.querySelectorAll(".book-card"))??[]).forEach((s,r)=>s.style.animationDelay=`${r%8*.05+.1}s`)},250)}}function _(e){return t=>e.filterByCategory(t.target.value)}function ye(e){return t=>{const o=t.currentTarget.closest(".category-item"),s=o==null?void 0:o.dataset.category;s&&s!==e.currentCategory&&e.filterByCategory(s)}}function ve(e){return()=>e.loadBooks(!0)}function ke(e){return new IntersectionObserver(t=>{t.forEach(o=>{o.isIntersecting&&e(o.target)})},{rootMargin:"50px 0px"})}function we(e,t){const o=e.dataset.src;if(!o)return;e.classList.add("loading");const s=new Image;s.onload=()=>{e.src=o,e.classList.remove("loading"),e.classList.add("loaded"),delete e.dataset.src,t==null||t.unobserve(e)},s.onerror=()=>{e.classList.remove("loading"),e.classList.add("error"),t==null||t.unobserve(e)},s.src=o}function O(e){return String(e||"").toLowerCase().replace(/&amp;/g,"&").replace(/\s+/g," ").replace(/[^\p{L}\p{N}\s]/gu,"").trim()}function Le(e){const t=O(e.title),o=O(e.author);return t||o?`ta:${t}|${o}`:`id:${e.id||"no-id"}`}function Be(e=[]){const t=new Set,o=[];for(const s of e){const r=Le(s);t.has(r)||(t.add(r),o.push(s))}return o}class Ee{constructor(){this.elements={booksGrid:document.getElementById(u.booksGrid),booksLoader:document.getElementById(u.booksLoader),showMoreBtn:document.getElementById(u.showMoreBtn),categoriesUL:document.getElementById(u.categoriesList),categoriesLoader:document.getElementById(u.categoriesLoader),errorElement:document.getElementById(u.booksError),booksCounter:document.getElementById(u.booksCounter),categoriesSelectTablet:document.getElementById(u.categoriesSelectTablet),categoriesSelectMobile:document.getElementById(u.categoriesSelectMobile)},this.currentCategory="all",this.currentPage=1,this.isLoading=!1,this.hasMore=!0,this.loadedBooks=[],this.imageObserver=null,this.debounceTimeout=null,this.initialCount=this.getInitialBooksCount(),this.init()}async init(){try{x(this.elements.errorElement),this.setupEventListeners(),this.setupObservers(),await this.renderCategories(),await this.loadBooks(!0)}catch(t){console.error("Books init error:",t),P(this.elements.errorElement,"Failed to load books. Please try again.")}}setupEventListeners(){var t,o,s,r,n,a;(t=this.elements.showMoreBtn)==null||t.addEventListener("click",pe(this)),(o=this.elements.booksGrid)==null||o.addEventListener("click",fe()),window.addEventListener("resize",be(this)),(s=this.elements.categoriesSelectTablet)==null||s.addEventListener("change",_(this)),(r=this.elements.categoriesSelectMobile)==null||r.addEventListener("change",_(this)),(a=(n=this.elements.errorElement)==null?void 0:n.querySelector(".retry-btn"))==null||a.addEventListener("click",ve(this))}setupObservers(){"IntersectionObserver"in window&&(this.imageObserver=ke(t=>we(t,this.imageObserver)))}async renderCategories(){if(this.elements.categoriesUL){q(this.elements.categoriesLoader,!0);try{const t=await I.getCategories();re(this.elements.categoriesUL,t,this.currentCategory),this.elements.categoriesUL.querySelectorAll(".category-button").forEach(o=>o.addEventListener("click",ye(this))),ne([this.elements.categoriesSelectTablet,this.elements.categoriesSelectMobile],t,this.currentCategory)}finally{q(this.elements.categoriesLoader,!1)}}}async loadBooks(t=!1){if(!this.isLoading){this.setLoading(!0),x(this.elements.errorElement);try{const o=t?this.getInitialBooksCount():window.innerWidth<=m.mobileBreakpoint?m.perLoadMoreMobile:m.perLoadMoreDesktop,s=t?1:this.currentPage+1,r=await I.getBooks(this.currentCategory,s,o);t?(this.loadedBooks=[...r.books],this.currentPage=1,ae(this.elements.booksGrid,this.loadedBooks)):(this.loadedBooks.push(...r.books),this.currentPage=s,ie(this.elements.booksGrid,r.books)),this.setupLazyLoading();const n=typeof r.total=="number"?r.total:Be(this.loadedBooks).length;this.hasMore=!!r.hasMore&&this.loadedBooks.length<n,this.updateShowMoreButton(),ce(this.elements.booksCounter,this.loadedBooks.length,n)}catch(o){console.error("Load books error:",o),P(this.elements.errorElement,`Failed to load books: ${o.message}`)}finally{this.setLoading(!1)}}}setupLazyLoading(){var t;this.imageObserver&&((t=this.elements.booksGrid)==null||t.querySelectorAll(".book-cover[data-src]").forEach(o=>this.imageObserver.observe(o)))}async filterByCategory(t){t!==this.currentCategory&&(this.currentCategory=t,this.currentPage=1,this.loadedBooks=[],ue(this.elements.categoriesUL,t),this.elements.categoriesSelectTablet&&(this.elements.categoriesSelectTablet.value=t),this.elements.categoriesSelectMobile&&(this.elements.categoriesSelectMobile.value=t),await this.loadBooks(!0))}async loadMore(){!this.hasMore||this.isLoading||await this.loadBooks(!1)}updateShowMoreButton(){le(this.elements.showMoreBtn,this.hasMore,this.isLoading)}getInitialBooksCount(){return window.innerWidth<=m.mobileBreakpoint?m.initialPerPageMobile:m.initialPerPageDesktop}setLoading(t){this.isLoading=t,de(this.elements.booksLoader,this.elements.booksGrid,t),this.updateShowMoreButton()}destroy(){var t;(t=this.imageObserver)==null||t.disconnect(),this.debounceTimeout&&clearTimeout(this.debounceTimeout)}}let f=window.__booksSectionInstance||null;function H(){return f||(f=new Ee,window.__booksSectionInstance=f,f)}document.readyState==="loading"?document.addEventListener("DOMContentLoaded",()=>H(),{once:!0}):H();
//# sourceMappingURL=index.js.map
