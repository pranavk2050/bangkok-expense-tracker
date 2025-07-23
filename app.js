// app.js

let expenses = JSON.parse(localStorage.getItem("expenses") || "[]");
let initialAmounts = JSON.parse(localStorage.getItem("initialAmounts") || '{"Pranav":0,"Vaishali":0}');

const expenseForm = document.getElementById("expenseForm");
const editIndexInput = document.getElementById("editIndex");
const submitBtn = document.getElementById("submitBtn");

// Initialize input fields for initial amounts
document.getElementById("initialPranav").value = initialAmounts.Pranav || 0;
document.getElementById("initialVaishali").value = initialAmounts.Vaishali || 0;

function saveInitialAmounts() {
  const p = parseFloat(document.getElementById("initialPranav").value) || 0;
  const v = parseFloat(document.getElementById("initialVaishali").value) || 0;
  initialAmounts = { Pranav: p, Vaishali: v };
  localStorage.setItem("initialAmounts", JSON.stringify(initialAmounts));
  renderSummary();
}

expenseForm.addEventListener("submit", function(e) {
  e.preventDefault();

  const date = document.getElementById("date").value;
  const description = document.getElementById("description").value.trim();
  const amount = parseFloat(document.getElementById("amount").value);
  const category = document.getElementById("category").value;
  const payer = document.getElementById("payer").value;

  if (!date || !description || !amount || amount <= 0 || !category || !payer) {
    alert("Please fill all fields correctly.");
    return;
  }

  const expenseData = { date, description, amount, category, payer };
  const editIndex = editIndexInput.value;

  if (editIndex === "") {
    expenses.push(expenseData);
  } else {
    expenses[parseInt(editIndex)] = expenseData;
  }

  localStorage.setItem("expenses", JSON.stringify(expenses));
  clearForm();
  renderExpenses();
  renderSummary();
  renderCharts();
});

function clearForm() {
  expenseForm.reset();
  editIndexInput.value = "";
  submitBtn.textContent = "Add";
}

function renderExpenses() {
  const tbody = document.querySelector("#expenseTable tbody");
  tbody.innerHTML = "";
  expenses.forEach((exp, i) => {
    const row = document.createElement("tr");

    row.innerHTML = `
      <td>${exp.date}</td>
      <td>${exp.description}</td>
      <td>฿${exp.amount.toFixed(2)}</td>
      <td>${exp.category}</td>
      <td>${exp.payer}</td>
      <td>
        <button class="btn btn-sm btn-info me-2" onclick="editExpense(${i})">Edit</button>
        <button class="btn btn-sm btn-danger" onclick="deleteExpense(${i})">Delete</button>
      </td>
    `;
    tbody.appendChild(row);
  });
}

function editExpense(index) {
  const exp = expenses[index];
  document.getElementById("date").value = exp.date;
  document.getElementById("description").value = exp.description;
  document.getElementById("amount").value = exp.amount;
  document.getElementById("category").value = exp.category;
  document.getElementById("payer").value = exp.payer;
  editIndexInput.value = index;
  submitBtn.textContent = "Update";
  window.scrollTo({ top: 0, behavior: "smooth" });
}

function deleteExpense(index) {
  if (confirm("Are you sure you want to delete this expense?")) {
    expenses.splice(index, 1);
    localStorage.setItem("expenses", JSON.stringify(expenses));
    renderExpenses();
    renderSummary();
    renderCharts();
  }
}

function renderSummary() {
  let pranavSpent = 0,
    vaishaliSpent = 0;

  expenses.forEach((exp) => {
    if (exp.payer === "Pranav") pranavSpent += exp.amount;
    else if (exp.payer === "Vaishali") vaishaliSpent += exp.amount;
    else if (exp.payer === "Split") {
      pranavSpent += exp.amount / 2;
      vaishaliSpent += exp.amount / 2;
    }
  });

  const totalSpent = pranavSpent + vaishaliSpent;

  // Shares based on equal split of total spent
  const sharePerPerson = totalSpent / 2;

  const pranavInitial = initialAmounts.Pranav || 0;
  const vaishaliInitial = initialAmounts.Vaishali || 0;

  // Net = initial - share + spent
  const pranavNet = pranavInitial - sharePerPerson + pranavSpent;
  const vaishaliNet = vaishaliInitial - sharePerPerson + vaishaliSpent;

  let balanceText = "";
  if (pranavNet > vaishaliNet) {
    balanceText = `Vaishali owes Pranav ฿${(pranavNet - vaishaliNet).toFixed(2)}`;
  } else if (vaishaliNet > pranavNet) {
    balanceText = `Pranav owes Vaishali ฿${(vaishaliNet - pranavNet).toFixed(2)}`;
  } else {
    balanceText = "All settled up!";
  }

  document.getElementById(
    "summaryText"
  ).innerHTML = `
    <p><strong>Pranav initial:</strong> ฿${pranavInitial.toFixed(2)}</p>
    <p><strong>Vaishali initial:</strong> ฿${vaishaliInitial.toFixed(2)}</p>
    <p><strong>Pranav spent:</strong> ฿${pranavSpent.toFixed(2)}</p>
    <p><strong>Vaishali spent:</strong> ฿${vaishaliSpent.toFixed(2)}</p>
    <p><strong>Total spent:</strong> ฿${totalSpent.toFixed(2)}</p>
    <p><strong>Balance:</strong> ${balanceText}</p>
  `;
}

function renderCharts() {
  const categoryData = {};
  const contributionData = { Pranav: 0, Vaishali: 0 };

  expenses.forEach((exp) => {
    categoryData[exp.category] = (categoryData[exp.category] || 0) + exp.amount;
    if (exp.payer === "Split") {
      contributionData["Pranav"] += exp.amount / 2;
      contributionData["Vaishali"] += exp.amount / 2;
    } else {
      contributionData[exp.payer] += exp.amount;
    }
  });

  const catCtx = document.getElementById("categoryChart").getContext("2d");
  const conCtx = document.getElementById("contributionChart").getContext("2d");


  if (window.categoryChart && typeof window.categoryChart.destroy === "function") {
    window.categoryChart.destroy();
  }
  if (window.contributionChart && typeof window.contributionChart.destroy === "function") {
    window.contributionChart.destroy();
  }

  window.categoryChart = new Chart(catCtx, {
    type: "pie",
    data: {
      labels: Object.keys(categoryData),
      datasets: [
        {
          data: Object.values(categoryData),
          backgroundColor: ["#f87171", "#fbbf24", "#34d399", "#60a5fa", "#c084fc"],
        },
      ],
    },
    options: { plugins: { title: { display: true, text: "Spending by Category" } } },
  });

  window.contributionChart = new Chart(conCtx, {
    type: "bar",
    data: {
      labels: Object.keys(contributionData),
      datasets: [
        {
          label: "Contribution (THB)",
          data: Object.values(contributionData),
          backgroundColor: ["#3b82f6", "#ec4899"],
        },
      ],
    },
    options: {
      plugins: { title: { display: true, text: "Individual Contributions" } },
      scales: { y: { beginAtZero: true } },
    },
  });
}

// Initialize app on load
renderExpenses();
renderSummary();
renderCharts();
