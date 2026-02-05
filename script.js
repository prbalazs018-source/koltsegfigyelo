const form = document.getElementById("expense-form");
const list = document.getElementById("expense-list");
const recurringList = document.getElementById("recurring-list");
const statsList = document.getElementById("stats-list");
const categorySelect = document.getElementById("category");
const monthPicker = document.getElementById("monthPicker");
const totalEl = document.getElementById("total");

const tabMonth = document.getElementById("tab-month");
const tabRecurring = document.getElementById("tab-recurring");
const tabStats = document.getElementById("tab-stats");

const monthView = document.getElementById("month-view");
const recurringView = document.getElementById("recurring-view");
const statsView = document.getElementById("stats-view");

const CATEGORIES = [  "🍔 Szórakozás",
  "🏠 Lakhatás Csapó",
  "🛖 Lakhatás Albi",
  "🚗 Benzin",
  "📱 Előfizetés",
  "🛒 Bevásárlás",
  "🐶 Kutya",
  "📦 Egyéb"
];
CATEGORIES.forEach(cat=>{
  const opt = document.createElement("option");
  opt.value=cat; opt.textContent=cat;
  categorySelect.appendChild(opt);
});

let expenses = JSON.parse(localStorage.getItem("expenses")) || [];
let recurringExpenses = JSON.parse(localStorage.getItem("recurring")) || [];

monthPicker.value = new Date().toISOString().slice(0,7);

function activate(tab){
  [tabMonth,tabRecurring,tabStats].forEach(t=>t.classList.remove("active"));
  [monthView,recurringView,statsView].forEach(v=>v.classList.add("hidden"));
  tab.classList.add("active");
  if(tab===tabMonth) monthView.classList.remove("hidden");
  if(tab===tabRecurring) recurringView.classList.remove("hidden");
  if(tab===tabStats) statsView.classList.remove("hidden");
}

tabMonth.onclick=()=>activate(tabMonth);
tabRecurring.onclick=()=>activate(tabRecurring);
tabStats.onclick=()=>activate(tabStats);

function createExpenseItem(e,index,isRecurring){
  const li=document.createElement("li");
  const net=e.revenue-e.amount;
  li.innerHTML=`<strong>Kiadás:</strong> ${e.amount} Ft | <strong>Bevétel:</strong> ${e.revenue} Ft | <strong>Nettó:</strong> ${net} Ft<br>
    <strong>Kategória:</strong> ${e.category} <br><small>${e.note||""}</small>
    <div style="margin-top:6px; display:flex; gap:6px;">
      <button data-edit>✏️</button>
      <button data-delete>🗑️</button>
    </div>
  `;

  li.querySelector("[data-delete]").onclick=()=>{
    if(!confirm("Biztos törlöd?")) return;
    (isRecurring?recurringExpenses:expenses).splice(index,1);
    localStorage.setItem(isRecurring?"recurring":"expenses",JSON.stringify(isRecurring?recurringExpenses:expenses));
    renderAll();
  };

  li.querySelector("[data-edit]").onclick=()=>{
    const newAmount=prompt("Új kiadás (Ft):",e.amount);
    if(newAmount===null)return;
    const newRevenue=prompt("Új bevétel (Ft):",e.revenue);
    if(newRevenue===null)return;
    const newCategory=prompt("Új kategória:",e.category);
    const newNote=prompt("Új megjegyzés:",e.note||"");
    e.amount=Number(newAmount);
    e.revenue=Number(newRevenue);
    e.category=newCategory;
    e.note=newNote;
    localStorage.setItem(isRecurring?"recurring":"expenses",JSON.stringify(isRecurring?recurringExpenses:expenses));
    renderAll();
  };

  return li;
}

function renderMonth(){
  list.innerHTML="";
  let totalAmount=0,totalRevenue=0;
  const month=monthPicker.value;

  recurringExpenses.forEach(e=>{
    totalAmount+=e.amount; totalRevenue+=e.revenue;
    list.appendChild(createExpenseItem(e,0,true));
  });

  expenses.filter(e=>e.date===month).forEach((e,i)=>{
    totalAmount+=e.amount; totalRevenue+=e.revenue;
    list.appendChild(createExpenseItem(e,i,false));
  });

  totalEl.textContent=`Összesen: ${totalAmount} Ft | Bevétel: ${totalRevenue} Ft | Nettó: ${totalRevenue-totalAmount} Ft`;
}

function renderRecurring(){
  recurringList.innerHTML="";
  recurringExpenses.forEach((e,i)=>recurringList.appendChild(createExpenseItem(e,i,true)));
}

function renderStats(){
  statsList.innerHTML="";
  const month=monthPicker.value;
  const map={};

  recurringExpenses.forEach(e=>{
    if(!map[e.category]) map[e.category]={amount:0,revenue:0};
    map[e.category].amount+=e.amount;
    map[e.category].revenue+=e.revenue;
  });
  expenses.filter(e=>e.date===month).forEach(e=>{
    if(!map[e.category]) map[e.category]={amount:0,revenue:0};
    map[e.category].amount+=e.amount;
    map[e.category].revenue+=e.revenue;
  });

  Object.entries(map).sort((a,b)=>(b[1].revenue-b[1].amount)-(a[1].revenue-a[1].amount)).forEach(([cat,val],i)=>{
    const li=document.createElement("li");
    const net=val.revenue-val.amount;
    li.innerHTML=`${i<3?"🔥":""}<strong>${cat}</strong> | Kiadás: ${val.amount} Ft | Bevétel: ${val.revenue} Ft | Nettó: ${net} Ft`;
    statsList.appendChild(li);
  });

  // Kördiagram
  const canvas=document.getElementById("stats-chart");
  const ctx=canvas.getContext("2d");
  ctx.clearRect(0,0,canvas.width,canvas.height);
  const entries=Object.entries(map);
  if(entries.length===0) return;

  const totalNet=entries.reduce((acc,[,v])=>acc+v.revenue-v.amount,0);
  let startAngle=-0.5*Math.PI;
  const colors=["#22c55e","#facc15","#3b82f6","#f87171","#a855f7","#14b8a6","#f97316","#eab308"];

  entries.forEach(([cat,val],i)=>{
    const slice=(val.revenue-val.amount)/totalNet*2*Math.PI;
    ctx.fillStyle=colors[i%colors.length];
    ctx.beginPath();
    ctx.moveTo(200,200);
    ctx.arc(200,200,150,startAngle,startAngle+slice);
    ctx.closePath();
    ctx.fill();
    startAngle+=slice;
  });
}

form.addEventListener("submit",e=>{
  e.preventDefault();
  const expense={
    amount:Number(amount.value),
    revenue:Number(document.getElementById("revenue").value),
    category:category.value,
    note:note.value,
    date:monthPicker.value
  };
  if(document.getElementById("recurring").checked) recurringExpenses.push(expense);
  else expenses.push(expense);

  localStorage.setItem("expenses",JSON.stringify(expenses));
  localStorage.setItem("recurring",JSON.stringify(recurringExpenses));
  form.reset();
  renderAll();
});

monthPicker.addEventListener("change",renderAll);
function renderAll(){renderMonth();renderRecurring();renderStats();}
renderAll();
