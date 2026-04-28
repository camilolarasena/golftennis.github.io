/* ===========================
   STATE
   =========================== */
let cart = []; // { id, name, price, image, qty }

const els = {
  cartCount: document.getElementById("cartCount"),
  cartModal: document.getElementById("cartModal"),
  cartItems: document.getElementById("cartItems"),
  emptyCart: document.getElementById("emptyCart"),
  totalAmount: document.getElementById("totalAmount"),
  openCartBtn: document.getElementById("openCartBtn"),
  closeCartBtn: document.getElementById("closeCartBtn"),
  clearCartBtn: document.getElementById("clearCartBtn"),
  checkoutBtn: document.getElementById("checkoutBtn"),

  // quick view
  qvModal: document.getElementById("qvModal"),
  qvCloseBtn: document.getElementById("qvCloseBtn"),
  qvImage: document.getElementById("qvImage"),
  qvCategory: document.getElementById("qvCategory"),
  qvTitle: document.getElementById("qvTitle"),
  qvDesc: document.getElementById("qvDesc"),
  qvPrice: document.getElementById("qvPrice"),
  qvAddBtn: document.getElementById("qvAddBtn"),

  // mobile
  mobileMenuToggle: document.getElementById("mobileMenuToggle"),
  mobileNav: document.getElementById("mobileNav"),

  // newsletter
  newsletterForm: document.getElementById("newsletterForm"),

  // search
  searchBtn: document.getElementById("searchBtn"),
};

/* ===========================
   HELPERS
   =========================== */
function formatUSD(value) {
  return `$${Number(value).toFixed(2)}`;
}

function cartTotalQty() {
  return cart.reduce((sum, item) => sum + item.qty, 0);
}

function cartTotalAmount() {
  return cart.reduce((sum, item) => sum + item.price * item.qty, 0);
}

function setCartCount() {
  els.cartCount.textContent = String(cartTotalQty());
}

function openCart() {
  els.cartModal.classList.add("active");
  els.cartModal.setAttribute("aria-hidden", "false");
}

function closeCart() {
  els.cartModal.classList.remove("active");
  els.cartModal.setAttribute("aria-hidden", "true");
}

function openQuickView(product) {
  els.qvImage.src = product.image;
  els.qvImage.alt = product.name;
  els.qvCategory.textContent = product.category;
  els.qvTitle.textContent = product.name;
  els.qvDesc.textContent = product.description;
  els.qvPrice.textContent = formatUSD(product.price);

  els.qvAddBtn.onclick = () => {
    addToCart(product.name, product.price, product.image);
    closeQuickView();
    openCart();
  };

  els.qvModal.classList.add("active");
  els.qvModal.setAttribute("aria-hidden", "false");
}

function closeQuickView() {
  els.qvModal.classList.remove("active");
  els.qvModal.setAttribute("aria-hidden", "true");
}

/* ===========================
   CART ACTIONS
   =========================== */
function addToCart(name, price, image) {
  const id = name.toLowerCase().replace(/\s+/g, "-");
  const existing = cart.find((x) => x.id === id);

  if (existing) {
    existing.qty += 1;
  } else {
    cart.push({ id, name, price: Number(price), image, qty: 1 });
  }

  setCartCount();
  renderCart();
}

function removeFromCart(id) {
  cart = cart.filter((x) => x.id !== id);
  setCartCount();
  renderCart();
}

function changeQty(id, delta) {
  const item = cart.find((x) => x.id === id);
  if (!item) return;

  item.qty += delta;
  if (item.qty <= 0) {
    removeFromCart(id);
    return;
  }

  setCartCount();
  renderCart();
}

function clearCart() {
  cart = [];
  setCartCount();
  renderCart();
}

function renderCart() {
  // remove previous items except empty state (we'll rebuild)
  const currentItems = els.cartItems.querySelectorAll(".cart-item");
  currentItems.forEach((n) => n.remove());

  const hasItems = cart.length > 0;
  els.emptyCart.style.display = hasItems ? "none" : "block";

  cart.forEach((item) => {
    const row = document.createElement("div");
    row.className = "cart-item";

    row.innerHTML = `
      <div class="cart-item-image">
        <img src="${item.image}" alt="${item.name}">
      </div>
      <div class="cart-item-info">
        <div class="cart-item-name">${item.name}</div>
        <div class="cart-item-price">${formatUSD(item.price)}</div>
      </div>
      <div class="cart-item-actions">
        <div class="qty-controls">
          <button class="qty-btn" aria-label="Disminuir cantidad">-</button>
          <div class="qty-value">${item.qty}</div>
          <button class="qty-btn" aria-label="Aumentar cantidad">+</button>
        </div>
        <button class="cart-item-remove" aria-label="Eliminar">
          <i class="fas fa-trash"></i>
        </button>
      </div>
    `;

    const [minusBtn, plusBtn] = row.querySelectorAll(".qty-btn");
    const removeBtn = row.querySelector(".cart-item-remove");

    minusBtn.addEventListener("click", () => changeQty(item.id, -1));
    plusBtn.addEventListener("click", () => changeQty(item.id, +1));
    removeBtn.addEventListener("click", () => removeFromCart(item.id));

    els.cartItems.appendChild(row);
  });

  els.totalAmount.textContent = formatUSD(cartTotalAmount());
}

/* ===========================
   BIND PRODUCT BUTTONS
   =========================== */
function bindProductCards() {
  const cards = document.querySelectorAll(".product-card");

  cards.forEach((card) => {
    const btnAdd = card.querySelector(".btn-add-cart");
    const btnQV = card.querySelector(".quick-view-btn");

    const product = {
      name: card.dataset.name,
      price: Number(card.dataset.price),
      image: card.dataset.image,
      category: card.dataset.category,
      description: card.dataset.description,
    };

    btnAdd.addEventListener("click", () => {
      addToCart(product.name, product.price, product.image);
      openCart();
    });

    btnQV.addEventListener("click", () => {
      openQuickView(product);
    });
  });
}

/* ===========================
   UI EVENTS
   =========================== */
els.openCartBtn.addEventListener("click", openCart);
els.closeCartBtn.addEventListener("click", closeCart);
els.clearCartBtn.addEventListener("click", clearCart);

els.checkoutBtn.addEventListener("click", () => {
  if (cart.length === 0) {
    alert("Tu carrito está vacío.");
    return;
  }
  alert(`Total a pagar: ${formatUSD(cartTotalAmount())}\n(Checkout demo)`);
});

els.qvCloseBtn.addEventListener("click", closeQuickView);

// close quick view on backdrop click
els.qvModal.addEventListener("click", (e) => {
  if (e.target === els.qvModal) closeQuickView();
});

// close cart if user clicks outside on mobile (optional)
document.addEventListener("keydown", (e) => {
  if (e.key === "Escape") {
    closeCart();
    closeQuickView();
  }
});

// mobile menu
els.mobileMenuToggle.addEventListener("click", () => {
  els.mobileNav.classList.toggle("show");
});

// close mobile nav on link click
els.mobileNav.querySelectorAll("a").forEach((a) => {
  a.addEventListener("click", () => els.mobileNav.classList.remove("show"));
});

// newsletter
els.newsletterForm.addEventListener("submit", (e) => {
  e.preventDefault();
  const email = els.newsletterForm.querySelector("input[type='email']").value.trim();
  if (!email) return;
  alert(`Gracias por suscribirte: ${email}`);
  els.newsletterForm.reset();
});

// search (demo)
els.searchBtn.addEventListener("click", () => {
  alert("Búsqueda (demo). Aquí puedes abrir un modal o una página de búsqueda.");
});

/* ===========================
   INIT
   =========================== */
bindProductCards();
setCartCount();
renderCart();