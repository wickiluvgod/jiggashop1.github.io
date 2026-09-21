document.body.classList.add("loading");

window.addEventListener("load", () => {
  setTimeout(() => {
    document.querySelector(".loader").classList.add("done");
    document.body.classList.remove("loading");
  }, 1500);
});

const cursor = document.querySelector(".cursor");
const ring = document.querySelector(".cursor-ring");
let mx = innerWidth / 2, my = innerHeight / 2, rx = mx, ry = my;

window.addEventListener("mousemove", e => {
  mx = e.clientX; my = e.clientY;
  cursor.style.left = mx + "px";
  cursor.style.top = my + "px";
});

function cursorLoop(){
  rx += (mx-rx)*.14;
  ry += (my-ry)*.14;
  ring.style.left = rx + "px";
  ring.style.top = ry + "px";
  requestAnimationFrame(cursorLoop);
}
cursorLoop();

document.querySelectorAll("a,button,.product-card").forEach(el => {
  el.addEventListener("mouseenter", () => {
    ring.style.width = "52px";
    ring.style.height = "52px";
    ring.style.borderColor = "#aaa";
  });
  el.addEventListener("mouseleave", () => {
    ring.style.width = "32px";
    ring.style.height = "32px";
    ring.style.borderColor = "#777";
  });
});

const observer = new IntersectionObserver(entries => {
  entries.forEach(entry => {
    if(entry.isIntersecting){
      entry.target.classList.add("visible");
      observer.unobserve(entry.target);
    }
  });
},{threshold:.13});

document.querySelectorAll(".reveal").forEach(el => observer.observe(el));

const toast = document.getElementById("toast");
const count = document.getElementById("bagCount");
const cartPanel = document.getElementById("cartPanel");
const cartBackdrop = document.getElementById("cartBackdrop");
const cartItems = document.getElementById("cartItems");
const cartEmpty = document.getElementById("cartEmpty");
const cartTotal = document.getElementById("cartTotal");
const cartCheckout = document.getElementById("cartCheckout");
const products = {
  "CHAMPION": { name: "CHAMPION", description: "Cropped t-shirt", price: 16500 },
  "DRUGS KILL JIGG": { name: "DRUGS KILL JIGG", description: "Regular slim t-shirt", price: 14500 }
};
const bag = {};

function formatPrice(price) {
  return `₸ ${price.toLocaleString("en-US")}`;
}

function renderCart() {
  const items = Object.values(bag);
  const itemCount = items.reduce((total, item) => total + item.quantity, 0);
  const total = items.reduce((sum, item) => sum + item.price * item.quantity, 0);
  count.textContent = itemCount;
  cartTotal.textContent = formatPrice(total);
  cartEmpty.hidden = items.length > 0;
  cartItems.innerHTML = items.map(item => `
    <div class="cart-item">
      <div>
        <strong>${item.name}</strong>
        <span>${item.description} / ${item.color ? `${item.color.toUpperCase()} / ` : ""}SIZE ${item.size}</span>
        <small>${formatPrice(item.price)}</small>
      </div>
      <div class="quantity" aria-label="Quantity for ${item.name}, size ${item.size}">
        <button data-action="decrease" data-product="${item.key}" aria-label="Decrease ${item.name} size ${item.size} quantity">−</button>
        <span>${item.quantity}</span>
        <button data-action="increase" data-product="${item.key}" aria-label="Increase ${item.name} size ${item.size} quantity">+</button>
      </div>
    </div>
  `).join("");
  cartCheckout.disabled = items.length === 0;
}

function toggleCart(open) {
  cartPanel.classList.toggle("open", open);
  cartBackdrop.classList.toggle("open", open);
  cartPanel.setAttribute("aria-hidden", String(!open));
  document.body.classList.toggle("cart-open", open);
}

document.getElementById("bagButton").addEventListener("click", () => toggleCart(true));
document.getElementById("cartClose").addEventListener("click", () => toggleCart(false));
cartBackdrop.addEventListener("click", () => toggleCart(false));
document.addEventListener("keydown", event => {
  if (event.key === "Escape") toggleCart(false);
});

cartItems.addEventListener("click", event => {
  const button = event.target.closest("button[data-action]");
  if (!button) return;
  const product = button.dataset.product;
  if (button.dataset.action === "increase") bag[product].quantity++;
  if (button.dataset.action === "decrease") {
    bag[product].quantity--;
    if (bag[product].quantity === 0) delete bag[product];
  }
  renderCart();
});

document.querySelectorAll(".size-selector").forEach(selector => {
  selector.addEventListener("click", event => {
    const option = event.target.closest(".size-option");
    if (!option) return;
    selector.querySelectorAll(".size-option").forEach(size => {
      size.classList.remove("selected");
      size.setAttribute("aria-pressed", "false");
    });
    option.classList.add("selected");
    option.setAttribute("aria-pressed", "true");
  });
});

const championGallery = document.querySelector(".champion-gallery");
const championSlides = championGallery ? [...championGallery.querySelectorAll(".champion-slide")] : [];
const swipeCensor = championGallery ? championGallery.querySelector(".swipe-censor") : null;
let championSlideIndex = 0;
let championSwipeStart = 0;
let championSwipeStartY = 0;
let censorTimeout;
let revealTimeout;

function showSwipeCensor() {
  if (!swipeCensor) return;
  clearTimeout(censorTimeout);
  championGallery.classList.add("swiping");
  censorTimeout = setTimeout(() => championGallery.classList.remove("swiping"), 900);
}

function showChampionSlide(index) {
  if (!championSlides.length) return;
  if (championSlides.length === 1) return;
  championSlideIndex = (index + championSlides.length) % championSlides.length;
  championSlides.forEach((slide, slideIndex) => slide.classList.toggle("active", slideIndex === championSlideIndex));
  championGallery.dataset.slide = championSlideIndex;
  championGallery.querySelector(".gallery-counter").textContent = `${championSlides[championSlideIndex].dataset.color.toUpperCase()} / ${championSlides[championSlideIndex].dataset.view.toUpperCase()}`;
}

if (championGallery) {
  championGallery.addEventListener("pointerdown", event => {
    championSwipeStart = event.clientX;
    championSwipeStartY = event.clientY;
    championGallery.setPointerCapture(event.pointerId);
  });
  championGallery.addEventListener("pointerup", event => {
    const distanceX = event.clientX - championSwipeStart;
    const distanceY = event.clientY - championSwipeStartY;
    if (Math.max(Math.abs(distanceX), Math.abs(distanceY)) > 35) {
      showSwipeCensor();
      clearTimeout(revealTimeout);
      revealTimeout = setTimeout(() => championGallery.classList.remove("awaiting-swipe"), 260);
      showChampionSlide(championSlideIndex + (distanceX < 0 ? 1 : -1));
    }
  });
}

document.querySelectorAll(".add").forEach(button => {
  button.addEventListener("click", () => {
    const product = products[button.dataset.product];
    const card = button.closest(".product-card");
    const size = card.querySelector(".size-option.selected").dataset.size;
    const key = `${product.name}-${size}`;
    if (!bag[key]) bag[key] = { ...product, key, size, quantity: 0 };
    bag[key].quantity++;
    renderCart();
    const original = button.innerHTML;
    button.innerHTML = "ADDED TO BAG <span>✓</span>";
    toast.classList.add("show");
    setTimeout(() => toast.classList.remove("show"), 1300);
    setTimeout(() => button.innerHTML = original, 1000);
  });
});

renderCart();

document.querySelectorAll(".magnetic").forEach(el => {
  el.addEventListener("mousemove", e => {
    const r = el.getBoundingClientRect();
    const x = (e.clientX - r.left - r.width/2) * .15;
    const y = (e.clientY - r.top - r.height/2) * .15;
    el.style.transform = `translate(${x}px,${y}px)`;
  });
  el.addEventListener("mouseleave", () => el.style.transform = "");
});

window.addEventListener("scroll", () => {
  const bg = document.querySelector(".hero-bg");
  if(bg) bg.style.transform = `rotate(-8deg) scale(1.15) translateY(${scrollY*.08}px)`;
});
