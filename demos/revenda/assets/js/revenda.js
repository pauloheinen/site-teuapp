const VEHICLE_STORAGE_KEY = "revenda-demo-vehicles";
let savedVehicles = [];
try {
  savedVehicles = JSON.parse(localStorage.getItem(VEHICLE_STORAGE_KEY) || "[]");
} catch {
  savedVehicles = [];
}
const VEHICLES = [...DEFAULT_VEHICLES, ...savedVehicles];

const grid = document.getElementById("vehicle-grid");
const count = document.getElementById("result-count");
const modal = document.getElementById("vehicle-modal");
const modalContent = document.getElementById("modal-content");
const filters = {
  search: document.getElementById("search"),
  brand: document.getElementById("brand"),
  fuel: document.getElementById("fuel"),
  year: document.getElementById("year"),
  sort: document.getElementById("sort")
};

function formatCurrency(value) {
  return new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(value);
}

function formatKm(value) {
  return new Intl.NumberFormat("pt-BR").format(value);
}

function normalize(value) {
  return String(value || "")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase();
}

function getWhatsappUrl(vehicle) {
  const text = `Olá! Gostaria de saber mais condições sobre o ${vehicle.brand} ${vehicle.model} ${vehicle.year} que vi no site.`;
  return `https://wa.me/${vehicle.seller.phone}?text=${encodeURIComponent(text)}`;
}

function populateBrands() {
  [...new Set(VEHICLES.map(vehicle => vehicle.brand))].sort().forEach(brand => {
    const option = document.createElement("option");
    option.value = brand;
    option.textContent = brand;
    filters.brand.appendChild(option);
  });
}

function renderVehicles(items) {
  count.textContent = items.length === 1 ? "1 veículo encontrado" : `${items.length} veículos encontrados`;

  if (!items.length) {
    grid.innerHTML = `<div class="empty-state">Nenhum veículo encontrado com estes filtros.</div>`;
    return;
  }

  grid.innerHTML = items.map(vehicle => `
    <article class="vehicle-card">
      <button class="vehicle-open" type="button" onclick="openVehicle('${vehicle.id}')">
        <span class="vehicle-image">
          <img src="${vehicle.image}" alt="${vehicle.brand} ${vehicle.model}" loading="lazy" />
          ${vehicle.featured ? '<span class="badge">Destaque</span>' : ""}
          <span class="km-badge">${formatKm(vehicle.mileage)} km</span>
        </span>
        <span class="vehicle-info">
          <span class="vehicle-title-row">
            <strong>${vehicle.brand} ${vehicle.model}</strong>
            <small>${vehicle.year}</small>
          </span>
          <span class="vehicle-version">${vehicle.version}</span>
          <span class="vehicle-price">${formatCurrency(vehicle.price)}</span>
          <span class="vehicle-spec-grid">
            <span><small>Câmbio</small>${vehicle.transmission}</span>
            <span><small>Comb.</small>${vehicle.fuel}</span>
            <span><small>Cor</small>${vehicle.color}</span>
          </span>
          <span class="vehicle-option-preview">${vehicle.options.slice(0, 3).join(" · ")}</span>
        </span>
      </button>
      <div class="vehicle-actions">
        <button type="button" onclick="openVehicle('${vehicle.id}')">Ver ficha</button>
        <a href="${getWhatsappUrl(vehicle)}" target="_blank" rel="noopener noreferrer">WhatsApp</a>
      </div>
    </article>
  `).join("");
}

function applyFilters() {
  const search = normalize(filters.search.value);
  const brand = filters.brand.value;
  const fuel = filters.fuel.value;
  const year = filters.year.value;
  const sort = filters.sort.value;

  let items = VEHICLES.filter(vehicle => {
    const searchable = normalize(`${vehicle.brand} ${vehicle.model} ${vehicle.version}`);
    if (search && !searchable.includes(search)) return false;
    if (brand !== "all" && vehicle.brand !== brand) return false;
    if (fuel !== "all" && vehicle.fuel !== fuel) return false;
    if (year !== "all" && vehicle.year < Number(year)) return false;
    return true;
  });

  if (sort === "price-asc") items.sort((a, b) => a.price - b.price);
  else if (sort === "price-desc") items.sort((a, b) => b.price - a.price);
  else if (sort === "year-desc") items.sort((a, b) => b.year - a.year);
  else items.sort((a, b) => Number(b.featured) - Number(a.featured));

  renderVehicles(items);
}

function openVehicle(id) {
  const vehicle = VEHICLES.find(item => item.id === id);
  if (!vehicle) return;

  modalContent.innerHTML = `
    <div class="modal-media">
      <img id="modal-main-image" src="${vehicle.gallery[0]}" alt="${vehicle.brand} ${vehicle.model}" />
      ${vehicle.gallery.length > 1 ? `
        <div class="modal-thumbs">
          ${vehicle.gallery.map((src, index) => `
            <button class="${index === 0 ? "active" : ""}" type="button" onclick="setModalImage('${src}', this)">
              <img src="${src}" alt="Foto ${index + 1} de ${vehicle.brand} ${vehicle.model}" />
            </button>
          `).join("")}
        </div>
      ` : ""}
    </div>
    <div class="modal-body">
      <div class="modal-main">
        <section class="vehicle-detail-main">
          <span class="modal-kicker">${vehicle.brand}</span>
          <h2 id="modal-title">${vehicle.model}</h2>
          <p class="modal-version">${vehicle.version}</p>
          <div class="detail-highlights">
            ${vehicle.highlights.map(item => `<span>${item}</span>`).join("")}
          </div>

          <div class="detail-section">
            <h3>Descrição</h3>
            <p>${vehicle.description}</p>
          </div>

          <div class="modal-spec-grid">
            <span><small>Ano</small>${vehicle.year}</span>
            <span><small>Km</small>${formatKm(vehicle.mileage)}</span>
            <span><small>Combustível</small>${vehicle.fuel}</span>
            <span><small>Câmbio</small>${vehicle.transmission}</span>
            <span><small>Cor</small>${vehicle.color}</span>
            <span><small>Carroceria</small>${vehicle.body}</span>
            <span><small>Portas</small>${vehicle.doors}</span>
            <span><small>Placa</small>${vehicle.plate}</span>
          </div>

          <div class="option-list">
            <h3>Opcionais e equipamentos</h3>
            <ul>${vehicle.options.map(option => `<li>${option}</li>`).join("")}</ul>
          </div>
        </section>

        <aside class="proposal-panel">
          <span class="proposal-label">${vehicle.condition}</span>
          <strong class="modal-price">${formatCurrency(vehicle.price)}</strong>
          <div class="proposal-list">
            <span><small>Garantia</small>${vehicle.warranty}</span>
            <span><small>Documentação</small>${vehicle.documentation}</span>
            <span><small>Troca</small>${vehicle.acceptsTrade ? "Aceita veículo na troca" : "Consultar condições"}</span>
            <span><small>Vendedor</small>${vehicle.seller.name}</span>
          </div>
          <a class="modal-whatsapp" href="${getWhatsappUrl(vehicle)}" target="_blank" rel="noopener noreferrer">
            Enviar proposta pelo WhatsApp
          </a>
          <a class="finance-link" href="${getWhatsappUrl(vehicle)}" target="_blank" rel="noopener noreferrer">
            Simular financiamento
          </a>
        </aside>
      </div>
    </div>
  `;

  modal.setAttribute("aria-hidden", "false");
  document.body.style.overflow = "hidden";
}

function setModalImage(src, button) {
  document.getElementById("modal-main-image").src = src;
  document.querySelectorAll(".modal-thumbs button").forEach(item => item.classList.remove("active"));
  button.classList.add("active");
}

function closeVehicle() {
  modal.setAttribute("aria-hidden", "true");
  document.body.style.overflow = "";
}

Object.values(filters).forEach(input => input.addEventListener("input", applyFilters));
Object.values(filters).forEach(input => input.addEventListener("change", applyFilters));
document.getElementById("modal-close").addEventListener("click", closeVehicle);
modal.addEventListener("click", event => {
  if (event.target === modal) closeVehicle();
});
document.addEventListener("keydown", event => {
  if (event.key === "Escape") closeVehicle();
});

populateBrands();
applyFilters();
