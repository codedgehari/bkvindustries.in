const firebaseConfig = {
  apiKey: "AIzaSyCFVGb493Yqvu5t_aOYGcIa7u3Q9e0J884",
  authDomain: "high-tech-products.firebaseapp.com",
  projectId: "high-tech-products",
  storageBucket: "high-tech-products.appspot.com",
  messagingSenderId: "356225221226",
  appId: "1:356225221226:web:cd953ba67db834919b4013",
};

firebase.initializeApp(firebaseConfig);
const db = firebase.firestore();

let products = [];
let brands = new Set();
let filteredProducts = null;
let currentPage = 1;
const productsPerPage = 35;

/* ================= FETCH PRODUCTS ================= */
async function fetchProducts() {
  products = [];
  brands.clear();

  const snapshot = await db.collection("products").get();
  snapshot.forEach((doc) => {
    const data = doc.data();
    products.push({ id: doc.id, ...data });
    if (data.brand) brands.add(data.brand);
  });

  generateBrandFilter();
  renderProducts(products);
}

/* ================= BRAND FILTER ================= */
function generateBrandFilter() {
  const container = document.getElementById("brandFilter");
  container.innerHTML = "";

  const allBtn = document.createElement("button");
  allBtn.innerText = "All";
  allBtn.classList.add("active");
  allBtn.onclick = () => filterBrand("All", allBtn);
  container.appendChild(allBtn);

  brands.forEach((b) => {
    const btn = document.createElement("button");
    btn.innerText = b;
    btn.onclick = () => filterBrand(b, btn);
    container.appendChild(btn);
  });
}

function filterBrand(brand, btn) {
  document
    .querySelectorAll("#brandFilter button")
    .forEach((b) => b.classList.remove("active"));

  btn.classList.add("active");
  currentPage = 1;

  if (brand === "All") renderProducts(products);
  else renderProducts(products.filter((p) => p.brand === brand));
}

/* ================= RENDER PRODUCTS ================= */
function renderProducts(list) {
  filteredProducts = list;
  const grid = document.getElementById("list");
  grid.innerHTML = "";

  const start = (currentPage - 1) * productsPerPage;
  const end = start + productsPerPage;
  const paginated = list.slice(start, end);

  paginated.forEach((p) => {
    const card = document.createElement("div");
    card.className = "card";
    card.style.cursor = "pointer";

    card.innerHTML = `
      <img src="${p.img || ""}" />
      <h3>${p.title || ""}</h3>
      <p>${p.desc || ""}</p>
      <div class="price">${p.price || ""}</div>
    `;

    card.onclick = () => openDetails(p);
    grid.appendChild(card);
  });

  renderPagination(list.length);
}

/* ================= PAGINATION ================= */
function renderPagination(totalProducts) {
  const container = document.getElementById("pagination");
  container.innerHTML = "";

  const totalPages = Math.ceil(totalProducts / productsPerPage);

  const prev = document.createElement("button");
  prev.innerText = "Prev";
  prev.disabled = currentPage === 1;
  prev.onclick = () => {
    currentPage--;
    renderProducts(filteredProducts || products);
  };
  container.appendChild(prev);

  for (let i = 1; i <= totalPages; i++) {
    const btn = document.createElement("button");
    btn.innerText = i;
    if (i === currentPage) btn.classList.add("active");
    btn.onclick = () => {
      currentPage = i;
      renderProducts(filteredProducts || products);
    };
    container.appendChild(btn);
  }

  const next = document.createElement("button");
  next.innerText = "Next";
  next.disabled = currentPage === totalPages;
  next.onclick = () => {
    currentPage++;
    renderProducts(filteredProducts || products);
  };
  container.appendChild(next);
}

/* ================= DETAILS PAGE ================= */
function openDetails(p) {
  document.getElementById("d-img").src = p.img || "";
  document.getElementById("d-title").innerText = p.title || "";
  document.getElementById("d-price").innerText = p.price || "";
  document.getElementById("d-desc").innerText = p.desc || "";
  document.getElementById("d-notes").innerText = p.notes || "";
  document.getElementById("d-material").innerText = p.material || "N/A";
  document.getElementById("d-Stock").innerText =
    p.stockStatus === "in-stock" ? "In Stock" : "Out of Stock";


  const ul = document.getElementById("d-features");
  ul.innerHTML = "";

  let features = [];

  if (Array.isArray(p.features)) {
    features = p.features;
  } else if (typeof p.features === "string") {
    features = p.features.split(",").map(f => f.trim());
  }

  features.forEach((f) => {
    const li = document.createElement("li");
    li.innerText = f;
    ul.appendChild(li);
  });

  document.getElementById("list").style.display = "none";
  document.getElementById("pagination").style.display = "none";
  document.getElementById("details").style.display = "block";
}

function goBack() {
  document.getElementById("details").style.display = "none";
  document.getElementById("pagination").style.display = "flex";
  document.getElementById("list").style.display = "grid";
}

/* ================= WHATSAPP ================= */
function sendWhatsApp() {
  const phoneNumber = "916369970106";
  const title = document.getElementById("d-title").innerText;
  const price = document.getElementById("d-price").innerText;
  const desc = document.getElementById("d-desc").innerText;
  const img = document.getElementById("d-img").src;
  const productLink = window.location.href;

  const message = `*${title}*\nPrice: ${price}\n${desc}\nImage: ${img}\nProduct Link: ${productLink}`;
  const url = `https://wa.me/${phoneNumber}?text=${encodeURIComponent(message)}`;
  window.open(url, "_blank");
}

/* ================= ADMIN ================= */
function closeModal() {
  document.getElementById("adminModal").style.display = "none";
}

/* ================= LOAD ================= */
window.addEventListener("load", fetchProducts);
