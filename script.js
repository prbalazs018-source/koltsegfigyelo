const form = document.getElementById("expense-form");
const list = document.getElementById("expense-list");
const recurringList = document.getElementById("recurring-list");
const categorySelect = document.getElementById("category");
const monthPicker = document.getElementById("monthPicker");
const totalEl = document.getElementById("total");

// TABOK
const tabMonth = document.getElementById("tab-month");
const tabRecurring = document.getElementById("tab-recurring");
const monthView = document.getElementById("month-view");
const recurringView = document.getElementById("recurring-view");

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
tabMonth.onclick = () => {
  tabMonth.classList.add("active");
  tabRecurring.classList.remove("active");
  monthView.classList.remove("hidden");
  recurringView.classList.add("hidden");
};

tabRecurring.onclick = () => {
  tabRecurring.classList.add("active");
  tabMonth.classList.remove("active");
  recurringView.classList.remove("hidden");
  monthView.classList.add("hidden");
};

// RENDER HAVI
function renderMonth() {
  list.innerHTML = "";
  let total = 0;
  const selectedMonth = monthPicker.value;

  recurringExpenses.forEach(e => {
    total += e.amount;
    const li = document.createElement("li");
    li.innerHTML = `<strong>${e.amount} Ft</strong> – ${e.category} 🔁`;
    list.appendChild(li);
  });

  expenses
    .filter(e => e.date === selectedMonth)
    .forEach(e => {
      total += e.amount;
      const li = document.createElement("li");
      li.innerHTML = `<strong>${e.amount} Ft</strong> – ${e.category}`;
      list.appendChild(li);
    });

  totalEl.textContent = `Összesen: ${total} Ft`;
}

// RENDER ÁLLANDÓ
function renderRecurring() {
  recurringList.innerHTML = "";

  recurringExpenses.forEach(e => {
    const li = document.createElement("li");
    li.innerHTML = `
      <strong>${e.amount} Ft</strong> – ${e.category}<br>
      <small>${e.note || ""}</small>
    `;
    recurringList.appendChild(li);
  });
}

// ÚJ KÖLTSÉG
form.addEventListener("submit", (e) => {
  e.preventDefault();

  const expense = {
    amount: Number(amount.value),
    category: category.value,
    note: note.value,
    date: monthPicker.value
  };

  if (recurring.checked) {
    recurringExpenses.push(expense);
    localStorage.setItem("recurring", JSON.stringify(recurringExpenses));
  } else {
    expenses.push(expense);
    localStorage.setItem("expenses", JSON.stringify(expenses));
  }

  form.reset();
  renderMonth();
  renderRecurring();
});

// HÓNAP VÁLTÁS
monthPicker.addEventListener("change", renderMonth);

// START
renderMonth();
renderRecurring();
