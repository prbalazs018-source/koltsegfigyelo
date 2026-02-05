const form = document.getElementById("expense-form");
const list = document.getElementById("expense-list");
const recurringList = document.getElementById("recurring-list");
const statsList = document.getElementById("stats-list");
const categorySelect = document.getElementById("category");
const monthPicker = document.getElementById("monthPicker");
const totalEl = document.getElementById("total");

// TABOK
const tabMonth = document.getElementById("tab-month");
const tabRecurring = document.getElementById("tab-recurring");
const tabStats = document.getElementById("tab-stats");

const monthView = document.getElementById("month-view");
const recurringView = document.getElementById("recurring-view");
const statsView = document.getElementById("stats-view");

// KATEGÓRIÁK
const CATEGORIES = [
  "🍔 Étel",
  "🏠 Lakhatás",
  "🚗 Közlekedés",
  "📱 Előfizetés",
  "🎮 Szórakozás",
  "🛒 Bevásárlás",
  "💊 Egészség",
  "📦 Egyéb"
];

CATEGORIES.forEach(cat => {
  const opt = document.createElement("option");
  opt.value = cat;
  opt.textContent = cat;
  categorySelect.appendChild(opt);
});

// ADATOK
let expenses = JSON.parse(localStorage.getItem("expenses")) || [];
let recurringExpenses = JSON.parse(localStorage.getItem("recurring")) || [];

// AKTUÁLIS HÓNAP
monthPicker.value = new Date().toISOString().slice(0, 7);

// TAB VÁLTÁS
function activate(tab) {
  [tabMonth, tabRecurring, tabStats].forEach(t => t.classList.remove("active"));
  [monthView, recurringView, statsView].forEach(v => v.classList.add("hidden"));

  tab.classList.add("active");

  if (tab === tabMonth) monthView.classList.remove("hidden");
  if (tab === tabRecurring) recurringView.classList.remove("hidden");
  if (tab === tabStats) statsView.classList.remove("hidden");
}

tabMonth.onclick = () => activate(tabMonth);
tabRecurring.onclick = () => activate(tabRecurring);
tabStats.onclick = () => activate(tabStats);

// 🧩 KÖLTSÉG SOR
function createExpenseItem(e, index, isRecurring) {
  const li = document.createElement("li");
  li.innerHTML = `
    <strong>${e.amount} Ft</strong> – ${e.category}<br>
    <small>${e.note || ""}</small>
    <div style="margin-top:6px; display:flex; gap:6px;">
      <button data-edit>✏️</button>
      <button data-delete>🗑️</button>
    </div>
  `;

  li.querySelector("[data-delete]").onclick = () => {
    if (!confirm("Biztos törlöd?")) return;
    (isRecurring ? recurringExpenses : expenses).splice(index, 1);
    localStorage.setItem(isRecurring ? "recurring" : "expenses",
      JSON.stringify(isRecurring ? recurringExpenses : expenses));
    renderAll();
  };

  li.querySelector("[data-edit]").onclick = () => {
    e.amount = Number(prompt("Új összeg:", e.amount));
    e.category = prompt("Új kategória:", e.category);
    e.note = prompt("Megjegyzés:", e.note || "");
    localStorage.setItem(isRecurring ? "recurring" : "expenses",
      JSON.stringify(isRecurring ? recurringExpenses : expenses)
