const form = document.getElementById("expense-form");
const list = document.getElementById("expense-list");
const categorySelect = document.getElementById("category");
const monthPicker = document.getElementById("monthPicker");
const totalEl = document.getElementById("total");

// 📂 KATEGÓRIÁK
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

// 📦 ADATOK
let expenses = JSON.parse(localStorage.getItem("expenses")) || [];
let recurringExpenses = JSON.parse(localStorage.getItem("recurring")) || [];

// 📅 AKTUÁLIS HÓNAP
const now = new Date();
monthPicker.value = now.toISOString().slice(0, 7);

// 🔁 RENDER
function render() {
  list.innerHTML = "";
  let total = 0;

  const selectedMonth = monthPicker.value;

  // 🔁 ÁLLANDÓ KÖLTSÉGEK (minden hónapban)
  recurringExpenses.forEach(e => {
    const li = document.createElement("li");
    li.innerHTML = `
      <strong>${e.amount} Ft</strong> – ${e.category} 🔁<br>
      <small>${e.note || "Állandó költség"}</small>
    `;
    list.appendChild(li);
    total += e.amount;
  });

  // 📅 HAVI KÖLTSÉGEK
  expenses
    .filter(e => e.date.startsWith(selectedMonth))
    .forEach(e => {
      const li = document.createElement("li");
      li.innerHTML = `
        <strong>${e.amount} Ft</strong> – ${e.category}<br>
        <small>${e.note || ""}</small>
      `;
      list.appendChild(li);
      total += e.amount;
    });

  totalEl.textContent = `Összesen: ${total} Ft`;
}

// ➕ ÚJ KÖLTSÉG
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
  render();
});

// 📅 HÓNAP VÁLTÁS
monthPicker.addEventListener("change", render);

// 🚀 START
render();
