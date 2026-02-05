const form = document.getElementById("expense-form");
const list = document.getElementById("expense-list");

let expenses = JSON.parse(localStorage.getItem("expenses")) || [];

function render() {
  list.innerHTML = "";
  expenses.forEach((e) => {
    const li = document.createElement("li");
    li.innerHTML = `
      <strong>${e.amount} Ft</strong> – ${e.category}<br>
      <small>${e.note || ""}</small>
    `;
    list.appendChild(li);
  });
}

form.addEventListener("submit", (e) => {
  e.preventDefault();

  const expense = {
    amount: amount.value,
    category: category.value,
    note: note.value,
    date: new Date().toISOString()
  };

  expenses.unshift(expense);
  localStorage.setItem("expenses", JSON.stringify(expenses));
  form.reset();
  render();
});

render();
