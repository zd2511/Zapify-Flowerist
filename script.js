
"use strict";

/*
  PETAL & POETRY — WEBSITE SETTINGS

  Before accepting real orders:
  1. Replace whatsappNumber with your WhatsApp number.
     Use international digits only, e.g. 27821234567.
  2. Replace sample product names, prices and photos with real stock.
  3. Connect the newsletter to an actual email marketing service.
*/

const CONFIG = {
  whatsappNumber: "27XXXXXXXXX",
  currency: "ZAR",
  locale: "en-ZA"
};

const products = [
  {
    id: "peach-daydream",
    name: "Peach Daydream",
    category: "bouquets",
    price: 450,
    tag: "A little favourite",
    description: "Peach roses, creamy petals & a little magic.",
    image: "https://images.unsplash.com/photo-1490750967868-88aa4486c946?auto=format&fit=crop&w=800&q=85",
    alt: "Soft pastel flowers in a romantic arrangement"
  },
  {
    id: "rosy-whisper",
    name: "Rosy Whisper",
    category: "romantic",
    price: 520,
    tag: "Made for love",
    description: "Blush roses for the things words can't say.",
    image: "https://images.unsplash.com/photo-1520763185298-1b434c919102?auto=format&fit=crop&w=800&q=85",
    alt: "Romantic pink flowers with delicate petals"
  },
  {
    id: "garden-party",
    name: "Garden Party",
    category: "seasonal",
    price: 390,
    tag: "Seasonal magic",
    description: "A joyful gathering of colour and texture.",
    image: "https://images.unsplash.com/photo-1457089328109-e5d9bd499191?auto=format&fit=crop&w=800&q=85",
    alt: "Colourful garden-inspired flowers"
  },
  {
    id: "sweet-nothings",
    name: "Sweet Nothings",
    category: "romantic",
    price: 580,
    tag: "Extra love",
    description: "A tender, thoughtful little declaration.",
    image: "https://images.unsplash.com/photo-1525310072745-f49212b5ac6d?auto=format&fit=crop&w=800&q=85",
    alt: "Elegant soft-toned flower bouquet"
  },
  {
    id: "wildflower-waltz",
    name: "Wildflower Waltz",
    category: "bouquets",
    price: 420,
    tag: "Wild & lovely",
    description: "Loose, natural blooms with garden charm.",
    image: "https://images.unsplash.com/photo-1508610048659-a06b669e3321?auto=format&fit=crop&w=800&q=85",
    alt: "Natural, garden-style floral arrangement"
  },
  {
    id: "little-sunshine",
    name: "Little Sunshine",
    category: "seasonal",
    price: 350,
    tag: "A happy thought",
    description: "Bright, cheerful flowers for an ordinary day.",
    image: "https://images.unsplash.com/photo-1494625927555-6ec4433b1571?auto=format&fit=crop&w=800&q=85",
    alt: "Beautiful flowers arranged in soft natural light"
  }
];

const testimonials = [
  {
    quote: "The kind of flowers that make an ordinary Tuesday feel like something worth celebrating.",
    credit: "THE FLOWER-LOVING HEART"
  },
  {
    quote: "Every petal, every colour, every little detail feels like it was chosen just for you.",
    credit: "A LITTLE NOTE OF LOVE"
  },
  {
    quote: "Sometimes the smallest bunch of flowers can make the biggest difference to someone's day.",
    credit: "FROM OUR IMAGINARY GUESTBOOK"
  }
];

const $ = (selector, root = document) => root.querySelector(selector);
const $$ = (selector, root = document) => [...root.querySelectorAll(selector)];

const productGrid = $("#productGrid");
const productTotal = $("#productTotal");
const cartCount = $("#cartCount");
const cartDrawer = $("#cartDrawer");
const cartBackdrop = $("#cartBackdrop");
const cartItems = $("#cartItems");
const cartTotal = $("#cartTotal");
const toast = $("#toast");

let activeFilter = "all";
let cart = {};
let toastTimer;
let lastFocusedElement = null;
let testimonialIndex = 0;

const money = amount =>
  new Intl.NumberFormat(CONFIG.locale, {
    style: "currency",
    currency: CONFIG.currency,
    maximumFractionDigits: 0
  }).format(amount);

function escapeHTML(value) {
  return String(value).replace(/[&<>"']/g, character => ({
    "&": "&amp;",
    "<": "&lt;",
    ">": "&gt;",
    '"': "&quot;",
    "'": "&#39;"
  })[character]);
}

function showToast(message) {
  toast.textContent = message;
  toast.classList.add("show");
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => {
    toast.classList.remove("show");
  }, 2600);
}

function renderProducts() {
  const filtered = activeFilter === "all"
    ? products
    : products.filter(product => product.category === activeFilter);

  productGrid.innerHTML = filtered.map(product => `
    <article class="product-card">
      <div class="product-photo">
        <img
          src="${escapeHTML(product.image)}"
          alt="${escapeHTML(product.alt)}"
          loading="lazy"
        >
        <span class="product-tag">${escapeHTML(product.tag)}</span>
        <button
          class="quick-add"
          data-add="${escapeHTML(product.id)}"
          type="button"
        >+ Add to your basket — ${money(product.price)}</button>
      </div>
      <div class="product-info">
        <div class="product-title-line">
          <h3>${escapeHTML(product.name)}</h3>
          <span class="product-price">${money(product.price)}</span>
        </div>
        <p>${escapeHTML(product.description)}</p>
        <button
          class="mobile-add"
          data-add="${escapeHTML(product.id)}"
          type="button"
        >Add to basket +</button>
      </div>
    </article>
  `).join("");

  productTotal.textContent =
    `${String(filtered.length).padStart(2, "0")} little wonders`;
}

$("#filters").addEventListener("click", event => {
  const button = event.target.closest("[data-filter]");
  if (!button) return;

  activeFilter = button.dataset.filter;

  $$(".filter").forEach(filter => {
    const isActive = filter === button;
    filter.classList.toggle("active", isActive);
    filter.setAttribute("aria-pressed", String(isActive));
  });

  renderProducts();
});

productGrid.addEventListener("click", event => {
  const button = event.target.closest("[data-add]");
  if (!button) return;
  addToCart(button.dataset.add);
});

function addToCart(productId) {
  const product = products.find(item => item.id === productId);
  if (!product) return;

  cart[productId] = (cart[productId] || 0) + 1;
  renderCart();
  showToast(`${product.name} has been added to your basket ♡`);
}

function updateQuantity(productId, change) {
  if (!cart[productId]) return;

  cart[productId] += change;

  if (cart[productId] <= 0) {
    delete cart[productId];
  }

  renderCart();
}

function removeFromCart(productId) {
  delete cart[productId];
  renderCart();
  showToast("Flower removed from your basket.");
}

function renderCart() {
  const entries = Object.entries(cart)
    .map(([id, quantity]) => ({
      product: products.find(item => item.id === id),
      quantity
    }))
    .filter(entry => entry.product);

  const totalQuantity = entries.reduce(
    (sum, entry) => sum + entry.quantity, 0
  );

  const totalPrice = entries.reduce(
    (sum, entry) => sum + entry.product.price * entry.quantity, 0
  );

  cartCount.textContent = totalQuantity;
  cartCount.setAttribute(
    "aria-label",
    `${totalQuantity} items in basket`
  );
  cartTotal.textContent = money(totalPrice);

  if (entries.length === 0) {
    cartItems.innerHTML = `
      <div class="empty-cart">
        <span>✿</span>
        <p>Your basket is waiting to bloom.</p>
        <span style="font-size:11px">There's always room for flowers.</span>
      </div>
    `;
    return;
  }

  cartItems.innerHTML = entries.map(({ product, quantity }) => `
    <article class="cart-item">
      <img src="${escapeHTML(product.image)}"
           alt="${escapeHTML(product.alt)}">
      <div>
        <h3>${escapeHTML(product.name)}</h3>
        <p>${money(product.price)} each</p>
        <div class="quantity-control" aria-label="Quantity">
          <button type="button" data-quantity="${escapeHTML(product.id)}"
            data-change="-1" aria-label="Decrease quantity">−</button>
          <span>${quantity}</span>
          <button type="button" data-quantity="${escapeHTML(product.id)}"
            data-change="1" aria-label="Increase quantity">+</button>
        </div>
        <button type="button" class="remove-item"
          data-remove="${escapeHTML(product.id)}">Remove</button>
      </div>
      <strong class="cart-item-price">${money(product.price * quantity)}</strong>
    </article>
  `).join("");
}

cartItems.addEventListener("click", event => {
  const quantityButton = event.target.closest("[data-quantity]");
  const removeButton = event.target.closest("[data-remove]");

  if (quantityButton) {
    updateQuantity(
      quantityButton.dataset.quantity,
      Number(quantityButton.dataset.change)
    );
  }

  if (removeButton) {
    removeFromCart(removeButton.dataset.remove);
  }
});

function openCart() {
  lastFocusedElement = document.activeElement;
  cartDrawer.classList.add("open");
  cartBackdrop.classList.add("open");
  cartDrawer.setAttribute("aria-hidden", "false");
  document.body.classList.add("cart-open");
  $("#cartClose").focus();
}

function closeCart() {
  cartDrawer.classList.remove("open");
  cartBackdrop.classList.remove("open");
  cartDrawer.setAttribute("aria-hidden", "true");
  document.body.classList.remove("cart-open");

  if (lastFocusedElement) lastFocusedElement.focus();
}

$("#cartToggle").addEventListener("click", openCart);
$("#cartClose").addEventListener("click", closeCart);
$("#continueShopping").addEventListener("click", closeCart);
cartBackdrop.addEventListener("click", closeCart);

document.addEventListener("keydown", event => {
  if (event.key === "Escape" && cartDrawer.classList.contains("open")) {
    closeCart();
  }
});

function openWhatsApp(message) {
  if (!/^27\d{9}$/.test(CONFIG.whatsappNumber)) {
    showToast("Please configure the shop's WhatsApp number in script.js first.");
    return false;
  }

  const url = `https://wa.me/${CONFIG.whatsappNumber}?text=${encodeURIComponent(message)}`;
  window.open(url, "_blank", "noopener,noreferrer");
  return true;
}

$("#checkoutButton").addEventListener("click", () => {
  const entries = Object.entries(cart)
    .map(([id, quantity]) => ({
      product: products.find(item => item.id === id),
      quantity
    }))
    .filter(entry => entry.product);

  if (entries.length === 0) {
    showToast("Your basket is still empty. Let's find you some flowers!");
    return;
  }

  const total = entries.reduce(
    (sum, entry) => sum + entry.product.price * entry.quantity, 0
  );

  const lines = entries.map(({ product, quantity }) =>
    `• ${product.name} × ${quantity} — ${money(product.price * quantity)}`
  );

  const message = [
    "Hello Petal & Poetry! ♡",
    "",
    "I'd love to enquire about ordering these flowers:",
    ...lines,
    "",
    `Estimated subtotal: ${money(total)}`,
    "",
    "Please confirm availability, delivery costs and the final total.",
    "My name and delivery details are: "
  ].join("\n");

  openWhatsApp(message);
});

// Mobile navigation
const menuToggle = $("#menuToggle");
const navigation = $("#navigation");

function closeMenu() {
  menuToggle.setAttribute("aria-expanded", "false");
  menuToggle.setAttribute("aria-label", "Open navigation");
  navigation.classList.remove("open");
}

menuToggle.addEventListener("click", () => {
  const expanded = menuToggle.getAttribute("aria-expanded") !== "true";
  menuToggle.setAttribute("aria-expanded", String(expanded));
  menuToggle.setAttribute(
    "aria-label",
    expanded ? "Close navigation" : "Open navigation"
  );
  navigation.classList.toggle("open", expanded);
});

navigation.addEventListener("click", event => {
  if (event.target.closest("a")) closeMenu();
});

document.addEventListener("click", event => {
  if (!navigation.contains(event.target) && !menuToggle.contains(event.target)) {
    closeMenu();
  }
});

// Wedding and event enquiry shortcuts
$$("[data-enquiry]").forEach(link => {
  link.addEventListener("click", () => {
    $("#enquiryType").value = link.dataset.enquiry === "Wedding flowers"
      ? "Wedding flowers"
      : "Event styling";
  });
});

// Enquiry form: prepare a real WhatsApp message, not a fake form submission
$("#enquiryForm").addEventListener("submit", event => {
  event.preventDefault();

  const form = event.currentTarget;
  if (!form.reportValidity()) return;

  const data = new FormData(form);
  const name = String(data.get("name") || "").trim();
  const email = String(data.get("email") || "").trim();
  const type = String(data.get("type") || "").trim();
  const messageText = String(data.get("message") || "").trim();

  const message = [
    "Hello Petal & Poetry! ♡",
    "",
    "I'd love to enquire about your floral services.",
    "",
    `Name: ${name}`,
    `Email: ${email}`,
    `Interested in: ${type}`,
    `Details: ${messageText || "I'd love to discuss the details."}`,
    "",
    "Please let me know the next steps. Thank you!"
  ].join("\n");

  if (openWhatsApp(message)) {
    $("#formStatus").textContent =
      "Your message is ready in WhatsApp. Please send it there to complete your enquiry.";
  }
});

// The testimonials are illustrative sample copy.
function showTestimonial(index) {
  testimonialIndex = (index + testimonials.length) % testimonials.length;

  $("#testimonialText").textContent = testimonials[testimonialIndex].quote;
  $("#testimonialCredit").textContent = testimonials[testimonialIndex].credit;
  $("#testimonialIndex").textContent =
    `${String(testimonialIndex + 1).padStart(2, "0")} / ${String(testimonials.length).padStart(2, "0")}`;
}

$("#prevTestimonial").addEventListener("click", () => {
  showTestimonial(testimonialIndex - 1);
});

$("#nextTestimonial").addEventListener("click", () => {
  showTestimonial(testimonialIndex + 1);
});

// Gentle scroll reveal, with a fallback for older browsers.
const revealElements = $$(".reveal");

if ("IntersectionObserver" in window) {
  const revealObserver = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add("visible");
        revealObserver.unobserve(entry.target);
      }
    });
  }, { threshold: 0.12 });

  revealElements.forEach(element => revealObserver.observe(element));
} else {
  revealElements.forEach(element => element.classList.add("visible"));
}

// Newsletter prototype: no email is sent or stored.
$("#newsletterForm").addEventListener("submit", event => {
  event.preventDefault();

  const input = $("#newsletterEmail");
  if (!input.reportValidity()) return;

  $("#newsletterStatus").textContent =
    "Thank you for your interest! The newsletter needs an email service connection before subscriptions can be saved.";

  input.value = "";
});

$("#year").textContent = new Date().getFullYear();

renderProducts();
renderCart();
showTestimonial(0);
