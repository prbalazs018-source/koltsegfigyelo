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

  // TÖRLÉS
  li.querySelector("[data-delete]").onclick = () => {
    if (!confirm("Biztos törlöd?")) return;
    (isRecurring ? recurringExpenses : expenses).splice(index, 1);
    localStorage.setItem(isRecurring ? "recurring" : "expenses",
      JSON.stringify(isRecurring ? recurringExpenses : expenses));
    renderAll();
  };

  // SZERKESZTÉS
  li.querySelector("[data-edit]").onclick = () => {
    const newAmount = prompt("Új összeg (Ft):", e.amount);
    if (newAmount === null) return;

    const newCategory = prompt("Új kategória:", e.category);
    const newNote = prompt("Új megjegyzés:", e.note || "");

    e.amount = Number(newAmount);
    e.category = newCategory;
    e.note = newNote;

    localStorage.setItem(isRecurring ? "recurring" : "expenses",
      JSON.stringify(isRecurring ? recurringExpenses : expenses));
    renderAll();
  };

  return li;
}

// 📅 HAVI RENDER
function renderMonth() {
  list.innerHTML = "";
  let total = 0;
  const month = monthPicker.value;

  recurringExpenses.forEach(e => {
    total += e.amount;
    list.appendChild(createExpenseItem(e, 0, true));
  });

  expenses.filter(e => e.date === month).forEach((e, i) => {
    total += e.amount;
    list.appendChild(createExpenseItem(e, i, false));
  });

  totalEl.textContent = `Összesen: ${total} Ft`;
}

// 🔁 ÁLLANDÓ
function renderRecurring() {
  recurringList.innerHTML = "";
  recurringExpenses.forEach((e, i) => {
    recurringList.appendChild(createExpenseItem(e, i, true));
  });
}

// 📊 STATISZTIKA
function renderStats() {
  statsList.innerHTML = "";
  const month = monthPicker.value;
  const map = {};

  // Összegzés
  recurringExpenses.forEach(e => {
    map[e.category] = (map[e.category] || 0) + e.amount;
  });
  expenses.filter(e => e.date === month).forEach(e => {
    map[e.category] = (map[e.category] || 0) + e.amount;
  });

  // Listázás top 3 kiemelve
  Object.entries(map)
    .sort((a, b) => b[1] - a[1])
    .forEach(([cat, sum], i) => {
      const li = document.createElement("li");
      li.innerHTML = `${i < 3 ? "🔥 " : ""}<strong>${cat}</strong>: ${sum} Ft`;
      statsList.appendChild(li);
    });

  // KÖRDIAGRAM
  const canvas = document.getElementById("stats-chart");
  const ctx = canvas.getContext("2d");
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  const entries = Object.entries(map);
  if (entries.length === 0) return;

  const total = entries.reduce((acc, [, val]) => acc + val, 0);
  let startAngle = -0.5 * Math.PI;

  const colors = [
    "#22c55e","#facc15","#3b82f6","#f87171","#a855f7","#14b8a6","#f97316","#eab308"
  ];

  entries.forEach(([cat, val], i) => {
    const slice = (val / total) * 2 * Math.PI;
    ctx.fillStyle = colors[i % colors.length];
    ctx.beginPath();
    ctx.moveTo(200, 200); 
    ctx.arc(200, 200, 150, startAngle, startAngle + slice);
    ctx.closePath();
    ctx.fill();
    startAngle += slice;
  });

  // címek
  let angle = -0.5 * Math.PI;
  ctx.font = "16px sans-serif";
  ctx.fillStyle = "#e5e7eb";
  entries.forEach(([cat, val], i) => {
    const slice = (val / total) * 2 * Math.PI;
    const x = 200 + Math.cos(angle + slice / 2) * 100;
    const y = 200 + Math.sin(angle + slice / 2) * 100;
    ctx.fillText(cat, x - 20, y);
    angle += slice;
  });
}

// ➕ ÚJ KÖLTSÉG
form.addEventListener("submit", e => {
  e.preventDefault();
  const expense = {
    amount: Number(amount.value),
    category: category.value,
    note: note.value,
    date: monthPicker.value
  };

  if (recurring.checked) recurringExpenses.push(expense);
  else expenses.push(expense);

  localStorage.setItem("expenses", JSON.stringify(expenses));
  localStorage.setItem("recurring", JSON.stringify(recurringExpenses));

  form.reset();
  renderAll();
});

monthPicker.addEventListener("change", renderAll);

function renderAll() {
  renderMonth();
  renderRecurring();
  renderStats();
}

// START
renderAll();
