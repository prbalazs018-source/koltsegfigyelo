const form = document.getElementById("expense-form");
const list = document.getElementById("expense-list");
const categorySelect = document.getElementById("category");

// 🔹 Előre definiált kategóriák
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

// 🔹 Kategóriák betöltése
CATEGORIES.forEach(cat => {
  const option = document.createElement("option");
  option.value = cat;
  option.textContent = cat;
  categorySelect.appendChild(option);
});

// 🔹 Adatok betöltése
let expenses = JSON.parse(localStorage.getItem("expenses")) || [];
let recurringExpenses = JSON.parse(localStorage.getItem("recurring")) || [];

// 🔹 Renderelés
function render() {
  list.innerHTML = "";

  recurringExpenses.forEach(e => {
    const li = document.createElement("li");
    li.innerHTML = `
      <strong>${e.amount} Ft</strong> – ${e.category} 🔁<br>
      <small>${e.note || "Állandó költség"}</small>
    `;
    list.appendChild(li);
  });

  expenses.forEach(e => {
    const li = document.createElement("li");
    li.innerHTML = `
      <strong>${e.amount} Ft</strong> – ${e.category}<br>
      <small>${e.note || ""}</small>
    `;
    list.appendChild(li);
  });
}

// 🔹 Új költség hozzáadása
form.addEventListener("submit", (e) => {
  e.preventDefault();

  const expense = {
    amount: Number(amount.value),
    category: category.value,
    note: note.value,
    date: new Date().toISOString()
  };

  if (recurring.checked) {
    recurringExpenses.push(expense);
    localStorage.setItem("recurring", JSON.stringify(recurringExpenses));
  } else {
    expenses.unshift(expense);
    localStorage.setItem("expenses", JSON.stringify(expenses));
  }

  form.reset();
  render();
});

// 🔹 Első betöltés
render();
