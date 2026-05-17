const STORAGE_KEY = "mfs-project-v1";

const categories = ["Электроника", "Одежда", "Дом и кухня", "Спорт", "Красота"];

const roleMeta = {
  admin: { label: "Админ", dashboard: "admin.html", login: "admin-login.html", hint: "admin@platform.local / admin123" },
  seller: { label: "Продавец", dashboard: "seller.html", login: "seller-login.html", hint: "seller@platform.local / seller123" },
  buyer: { label: "Покупатель", dashboard: "buyer.html", login: "buyer-login.html", hint: "buyer@platform.local / buyer123" }
};

function buildDemoProducts() {
  const templates = {
    "Электроника": { prefix: "Smart", nouns: ["Наушники", "Колонка", "Часы", "Планшет", "Камера", "Мышь", "Клавиатура", "Монитор", "Зарядка", "Сенсор"], desc: "Подходит для ежедневного использования, отличается стабильной работой и современным дизайном." },
    "Одежда": { prefix: "Urban", nouns: ["Куртка", "Худи", "Футболка", "Рубашка", "Брюки", "Кроссовки", "Жилет", "Пальто", "Свитшот", "Шорты"], desc: "Комфортная посадка, практичные материалы и аккуратный внешний вид для города и поездок." },
    "Дом и кухня": { prefix: "Home", nouns: ["Кастрюля", "Блендер", "Чайник", "Органайзер", "Сковорода", "Контейнер", "Кофеварка", "Лампа", "Полка", "Набор"], desc: "Удобное решение для дома, сочетающее полезность, долговечность и простое обслуживание." },
    "Спорт": { prefix: "Active", nouns: ["Коврик", "Гантели", "Рюкзак", "Бутылка", "Куртка", "Мяч", "Эспандер", "Форма", "Трекер", "Сумка"], desc: "Разработан для тренировок, активного ритма и комфортного использования вне дома." },
    "Красота": { prefix: "Glow", nouns: ["Сыворотка", "Крем", "Маска", "Шампунь", "Бальзам", "Тонер", "Скраб", "Масло", "Пенка", "Набор"], desc: "Легкая текстура, продуманная формула и приятный ежедневный уход." }
  };

  const products = [];
  let counter = 1;

  categories.forEach((category) => {
    const template = templates[category];
    for (let i = 1; i <= 50; i += 1) {
      const noun = template.nouns[(i - 1) % template.nouns.length];
      products.push({
        id: "product-" + counter,
        sellerId: "seller-1",
        name: template.prefix + " " + noun + " " + i,
        category,
        price: 4500 + i * 650 + counter * 90,
        stock: 4 + (i % 23),
        description: template.desc + " Серия " + i + "."
      });
      counter += 1;
    }
  });

  return products;
}

const demoState = {
  currentUserId: null,
  users: [
    { id: "admin-1", role: "admin", name: "Алина Админ", email: "admin@platform.local", password: "admin123" },
    { id: "seller-1", role: "seller", name: "Марат Store", email: "seller@platform.local", password: "seller123" },
    { id: "buyer-1", role: "buyer", name: "Диана Buyer", email: "buyer@platform.local", password: "buyer123" }
  ],
  products: buildDemoProducts(),
  feedbacks: [
    { id: "feedback-1", productId: "product-1", buyerId: "buyer-1", rating: 5, message: "Качество отличное, товар соответствует описанию.", sellerReply: "Спасибо за отзыв. Рады, что покупка вам понравилась.", createdAt: "2026-04-10T09:00:00.000Z" },
    { id: "feedback-2", productId: "product-57", buyerId: "buyer-1", rating: 4, message: "Материал хороший, но хотелось бы больше вариантов цвета.", sellerReply: "Приняли к сведению, спасибо.", createdAt: "2026-04-11T14:30:00.000Z" }
  ]
};

function cloneDemoState() { return JSON.parse(JSON.stringify(demoState)); }

function loadState() {
  const raw = localStorage.getItem(STORAGE_KEY);
  if (!raw) {
    const initial = cloneDemoState();
    localStorage.setItem(STORAGE_KEY, JSON.stringify(initial));
    return initial;
  }
  try {
    return JSON.parse(raw);
  } catch (error) {
    const fallback = cloneDemoState();
    localStorage.setItem(STORAGE_KEY, JSON.stringify(fallback));
    return fallback;
  }
}

function saveState(state) { localStorage.setItem(STORAGE_KEY, JSON.stringify(state)); }
function currentUser(state) { return state.users.find((user) => user.id === state.currentUserId) || null; }
function sellerById(state, id) { return state.users.find((user) => user.id === id); }
function buyerById(state, id) { return state.users.find((user) => user.id === id); }
function productById(state, id) { return state.products.find((product) => product.id === id); }
function formatPrice(value) { return new Intl.NumberFormat("ru-RU").format(value) + " ₸"; }
function formatDate(value) { return new Intl.DateTimeFormat("ru-RU", { day: "2-digit", month: "long", year: "numeric", hour: "2-digit", minute: "2-digit" }).format(new Date(value)); }
function stars(rating) { return "★".repeat(rating) + "☆".repeat(5 - rating); }
function nextId(prefix) { return prefix + "-" + Math.random().toString(36).slice(2, 8); }
function roleLabel(role) { return roleMeta[role] ? roleMeta[role].label : role; }
function productStockQty(product) { return Number(product.stock ?? product.stock_qty ?? 0); }

function setSessionBadge(state, element) {
  const user = currentUser(state);
  element.className = "badge " + (user ? user.role : "buyer");
  element.textContent = "Management Feedback system";
}

function renderRoleCards(container, state) {
  const activeUser = currentUser(state);
  container.innerHTML = "";
  Object.entries(roleMeta).forEach(([role, meta]) => {
    const account = state.users.find((item) => item.role === role);
    const card = document.createElement("div");
    card.className = "login-card" + (activeUser && activeUser.id === account.id ? " active" : "");
    card.innerHTML = `
      <div class="role-title">
        <div>
          <h3>${meta.label}</h3>
          <div class="muted small">Отдельная страница входа и свой кабинет.</div>
        </div>
        <span class="tag ${role}">${meta.label}</span>
      </div>
      <div class="hint">${meta.hint}</div>
      <a class="button ${activeUser && activeUser.id === account.id ? "secondary" : "primary"}" href="${meta.login}">
        ${activeUser && activeUser.id === account.id ? "Открыть кабинет" : "Перейти ко входу"}
      </a>
    `;
    container.appendChild(card);
  });
}

function renderStats(state, elements) {
  elements.products.textContent = state.products.length;
  elements.feedbacks.textContent = state.feedbacks.length;
  elements.pending.textContent = state.feedbacks.filter((feedback) => !feedback.sellerReply).length;
}

function setupNav(state) {
  const badge = document.querySelector("[data-session-badge]");
  if (badge) setSessionBadge(state, badge);
  document.querySelectorAll("[data-logout]").forEach((logoutButton) => {
    logoutButton.addEventListener("click", () => {
      state.currentUserId = null;
      saveState(state);
      window.location.replace("Приглашение.html");
    });
  });
}

function requireRole(state, role) {
  const user = currentUser(state);
  if (!user || user.role !== role) {
    window.location.href = roleMeta[role].login;
    return null;
  }
  return user;
}

function loginForRole(state, role, email, password) {
  const account = state.users.find((user) => user.role === role && user.email.toLowerCase() === email.toLowerCase() && user.password === password);
  if (!account) return false;
  state.currentUserId = account.id;
  saveState(state);
  window.location.href = roleMeta[role].dashboard;
  return true;
}

function visibleFeedbacks(state, role, userId) {
  if (role === "admin") return [...state.feedbacks];
  if (role === "seller") {
    const ownProductIds = state.products.filter((product) => product.sellerId === userId).map((product) => product.id);
    return state.feedbacks.filter((feedback) => ownProductIds.includes(feedback.productId));
  }
  return state.feedbacks.filter((feedback) => feedback.buyerId === userId);
}

function productAverageRating(state, productId) {
  const productFeedbacks = state.feedbacks.filter((feedback) => feedback.productId === productId);
  if (!productFeedbacks.length) return 0;
  return productFeedbacks.reduce((sum, item) => sum + item.rating, 0) / productFeedbacks.length;
}

function filterProducts(state, options = {}) {
  const { category = "all", search = "", minPrice = "", maxPrice = "", stockFilter = "all", sort = "default", limitToSellerId = null } = options;
  const minPriceValue = minPrice === "" ? null : Number(minPrice);
  const maxPriceValue = maxPrice === "" ? null : Number(maxPrice);

  const products = state.products.filter((product) => {
    if (limitToSellerId && product.sellerId !== limitToSellerId) return false;
    const seller = sellerById(state, product.sellerId);
    const stockQty = productStockQty(product);
    const matchesCategory = category === "all" || product.category === category;
    const haystack = [product.name, product.description, seller ? seller.name : ""].join(" ").toLowerCase();
    const matchesSearch = !search || haystack.includes(search.toLowerCase());
    const matchesMinPrice = minPriceValue === null || product.price >= minPriceValue;
    const matchesMaxPrice = maxPriceValue === null || product.price <= maxPriceValue;
    const matchesStock = stockFilter === "all" || (stockFilter === "available" && stockQty > 0) || (stockFilter === "low" && stockQty > 0 && stockQty <= 5);
    return matchesCategory && matchesSearch && matchesMinPrice && matchesMaxPrice && matchesStock;
  });

  products.sort((a, b) => {
    if (sort === "priceAsc") return a.price - b.price;
    if (sort === "priceDesc") return b.price - a.price;
    if (sort === "ratingDesc") return productAverageRating(state, b.id) - productAverageRating(state, a.id);
    if (sort === "feedbackDesc") return state.feedbacks.filter((f) => f.productId === b.id).length - state.feedbacks.filter((f) => f.productId === a.id).length;
    return a.name.localeCompare(b.name, "ru");
  });

  return products;
}

function renderProductsList(state, container, options = {}) {
  const { showReviewButton = false, reviewPage = "review.html" } = options;
  const products = filterProducts(state, options);
  container.innerHTML = "";
  if (!products.length) {
    container.innerHTML = '<div class="empty">По текущим фильтрам товары не найдены.</div>';
    return;
  }

  products.forEach((product) => {
    const productFeedbacks = state.feedbacks.filter((feedback) => feedback.productId === product.id);
    const avg = productFeedbacks.length ? (productFeedbacks.reduce((sum, item) => sum + item.rating, 0) / productFeedbacks.length).toFixed(1) : "Нет";
    const seller = sellerById(state, product.sellerId);
    const stockQty = productStockQty(product);
    const card = document.createElement("article");
    card.className = "product-card";
    card.innerHTML = `
      <div class="product-top">
        <div>
          <h3>${product.name}</h3>
          <div class="meta-line">
            <span class="pill">${product.category}</span>
            <span class="pill">Продавец: ${seller ? seller.name : "Неизвестно"}</span>
            <span class="pill">Остаток: ${stockQty}</span>
          </div>
        </div>
        <div class="price">${formatPrice(product.price)}</div>
      </div>
      <div class="muted">${product.description}</div>
      <div class="row">
        <div class="muted small">Средняя оценка: <strong>${avg}</strong></div>
        <div class="muted small">Отзывов: <strong>${productFeedbacks.length}</strong></div>
      </div>
      ${showReviewButton ? `<a class="button secondary" href="${reviewPage}?productId=${product.id}">Оставить отзыв</a>` : ""}
    `;
    container.appendChild(card);
  });
}

function renderFeedbackList(state, container, options) {
  const { role, userId } = options;
  const items = visibleFeedbacks(state, role, userId).sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
  container.innerHTML = "";
  if (!items.length) {
    container.innerHTML = '<div class="empty">Для этой страницы пока нет доступных отзывов.</div>';
    return;
  }

  items.forEach((feedback) => {
    const product = productById(state, feedback.productId);
    const buyer = buyerById(state, feedback.buyerId);
    const seller = product ? sellerById(state, product.sellerId) : null;
    const card = document.createElement("article");
    card.className = "feedback-card";
    const canReply = role === "seller" && product && product.sellerId === userId;
    const canDelete = role === "admin";

    card.innerHTML = `
      <div class="feedback-head">
        <div>
          <h3>${product ? product.name : "Товар удален"}</h3>
          <div class="feedback-meta muted small">
            <span>Покупатель: ${buyer ? buyer.name : "Неизвестно"}</span>
            <span>Продавец: ${seller ? seller.name : "Неизвестно"}</span>
            <span>${formatDate(feedback.createdAt)}</span>
          </div>
        </div>
        <div class="rating">${stars(feedback.rating)}</div>
      </div>
      <div>${feedback.message}</div>
      ${feedback.sellerReply ? `<div class="reply"><strong>Ответ продавца:</strong><br />${feedback.sellerReply}</div>` : '<div class="login-note small">Ответ продавца пока не добавлен.</div>'}
      ${canReply && !feedback.sellerReply ? `
        <form data-reply-form="${feedback.id}">
          <label>
            Ответ покупателю
            <textarea name="reply" placeholder="Напишите ответ на отзыв" required></textarea>
          </label>
          <button class="primary" type="submit">Сохранить ответ</button>
        </form>
      ` : ""}
      ${canDelete ? `<button class="danger" data-delete-feedback="${feedback.id}">Удалить отзыв</button>` : ""}
    `;
    container.appendChild(card);
  });

  container.querySelectorAll("[data-reply-form]").forEach((form) => {
    form.addEventListener("submit", (event) => {
      event.preventDefault();
      const feedbackId = form.dataset.replyForm;
      const text = form.elements.reply.value.trim();
      if (!text) return;
      const feedback = state.feedbacks.find((item) => item.id === feedbackId);
      if (!feedback) return;
      feedback.sellerReply = text;
      saveState(state);
      renderFeedbackList(state, container, options);
    });
  });

  container.querySelectorAll("[data-delete-feedback]").forEach((button) => {
    button.addEventListener("click", () => {
      const feedbackId = button.dataset.deleteFeedback;
      state.feedbacks = state.feedbacks.filter((feedback) => feedback.id !== feedbackId);
      saveState(state);
      renderFeedbackList(state, container, options);
    });
  });
}

function fillCategorySelect(select, selected = "all", includeAll = true) {
  select.innerHTML = includeAll ? '<option value="all">Все категории</option>' : "";
  categories.forEach((category) => {
    const option = document.createElement("option");
    option.value = category;
    option.textContent = category;
    select.appendChild(option);
  });
  select.value = categories.includes(selected) || selected === "all" ? selected : includeAll ? "all" : categories[0];
}

function fillProductSelect(state, select, selectedId = "") {
  select.innerHTML = "";
  state.products.forEach((product) => {
    const option = document.createElement("option");
    option.value = product.id;
    option.textContent = product.name + " [" + product.category + "]";
    select.appendChild(option);
  });
  if (state.products.some((product) => product.id === selectedId)) {
    select.value = selectedId;
  }
}
