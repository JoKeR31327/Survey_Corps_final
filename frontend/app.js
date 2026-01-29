const API = "http://localhost:3000"; // Order Service

let cart = {};
let orders = [];

// Fake product catalog (static)
const products = [
  { id: "P1", name: "Product 1", price: 100 },
  { id: "P2", name: "Product 2", price: 200 },
  { id: "P3", name: "Product 3", price: 150 },
];

// -------- NAVIGATION --------
function show(page) {
  document.querySelectorAll(".page").forEach((p) => p.classList.add("hidden"));
  document.getElementById(page).classList.remove("hidden");
}

function login() {
  show("main-page");
  renderProducts();
}

function goToCart() {
  show("cart-page");
  renderCart();
}
function goToOrders() {
  show("orders-page");
  renderOrders();
}
function goToMain() {
  show("main-page");
}

// -------- PRODUCTS --------
function renderProducts() {
  const list = document.getElementById("product-list");
  list.innerHTML = "";

  products.forEach((p) => {
    const div = document.createElement("div");
    div.innerHTML = `
      ${p.name} - ${p.price}
      <button onclick="addToCart('${p.id}')">ADD TO CART</button>
    `;
    list.appendChild(div);
  });
}

function addToCart(id) {
  cart[id] = (cart[id] || 0) + 1;
}

// -------- CART --------
function renderCart() {
  const list = document.getElementById("cart-items");
  list.innerHTML = "";
  list.className = "small-list";

  let total = 0;

  for (const id in cart) {
    const product = products.find((p) => p.id === id);
    total += product.price * cart[id];

    const row = document.createElement("div");
    row.className = "list-item";
    row.innerHTML = `
      <span>${product.name} x ${cart[id]}</span>
      <span>${product.price * cart[id]}</span>
    `;
    list.appendChild(row);
  }

  document.getElementById("subtotal").innerText = total;
}

// -------- ORDER PLACEMENT --------
async function placeOrder() {
  const requestId = "order-" + Date.now();

  try {
    const res = await fetch(API + "/order", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        items: cart,
        requestId,
      }),
    });

    const data = await res.json();

    orders.push({
      id: requestId,
      status: data.status,
    });

    cart = {};
    goToOrders();
  } catch (e) {
    // THIS IS IMPORTANT — we show failure clearly
    orders.push({
      id: requestId,
      status: "PENDING (Inventory timeout)",
    });

    goToOrders();
  }
}

// -------- ORDERS --------
function renderOrders() {
  const list = document.getElementById("orders-list");
  list.innerHTML = "";
  list.className = "small-list";

  orders.forEach((o) => {
    const row = document.createElement("div");
    row.className = "list-item";
    row.innerHTML = `
      <span>${o.id}</span>
      <span>${o.status}</span>
    `;
    list.appendChild(row);
  });
}
