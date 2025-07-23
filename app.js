// app.js

let expenses = JSON.parse(localStorage.getItem("expenses") || "[]");

function addExpense() {
  const date = document.getElementById("date").value;
  const description = document.getElementById("description").value;
  const amount = parseFloat(document.getElementById("amount").value);
  const category = document.getElementById("category").value;
  const payer = document.getElementById("payer").value;

  if (!date || !description || !amount || !payer) {
    alert("Please fill all fields.");
    return;
  }

  expenses.push({ date, description, amount, category, payer });
  localStorage.setItem("expenses", JSON.stringify(expenses));

  renderExpenses();
  renderSummary();
  renderCharts();

  document.getElementById("date").value = "";
  document.getElementById("description").value = "";
  document.getElementById("amount").value = "";
}

function renderExpenses() {
  const tbody = document.querySelector("#expenseTable tbody");
  tbody.innerHTML = "";
  expenses.forEach(exp => {
    const row = `<tr><td>${exp.date}</td><td>${exp.description}</td><td>${exp.amount.toFixed(2)}</td><td>${exp.category}</td><td>${exp.payer}</td></tr>`;
    tbody.innerHTML += row;
  });
}

function renderSummary() {
  let pranavTotal = 0, vaishaliTotal = 0;
  expenses.forEach(exp => {
    if (exp.payer === "Pranav") pranavTotal += exp.amount;
    else if (exp.payer === "Vaishali") vaishaliTotal += exp.amount;
    else if (exp.payer === "Split") {
      pranavTotal += exp.amount / 2;
      vaishaliTotal += exp.amount / 2;
    }
  });

  const total = pranavTotal + vaishaliTotal;
  document.getElementById("summaryText").innerHTML = `
    <p><strong>Pranav:</strong> ฿${pranavTotal.toFixed(2)}</p>
    <p><strong>Vaishali:</strong> ฿${vaishaliTotal.toFixed(2)}</p>
    <p><strong>Total:</strong> ฿${total.toFixed(2)}</p>
    <p><strong>Balance:</strong> 
      ${pranavTotal > vaishaliTotal
        ? `Vaishali owes Pranav ฿${((pranavTotal - vaishaliTotal)/2).toFixed(2)}`
        : `Pranav owes Vaishali ฿${((vaishaliTotal - pranavTotal)/2).toFixed(2)}`
      }
    </p>`;
}

function renderCharts() {
  const categoryData = {};
  const contributionData = { "Pranav": 0, "Vaishali": 0 };

  expenses.forEach(exp => {
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

  if (window.categoryChart) window.categoryChart.destroy();
  if (window.contributionChart) window.contributionChart.destroy();

  window.categoryChart = new Chart(catCtx, {
    type: 'pie',
    data: {
      labels: Object.keys(categoryData),
      datasets: [{
        data: Object.values(categoryData),
        backgroundColor: ['#f87171', '#fbbf24', '#34d399', '#60a5fa', '#c084fc'],
      }]
    },
    options: { plugins: { title: { display: true, text: 'Spending by Category' } } }
  });

  window.contributionChart = new Chart(conCtx, {
    type: 'bar',
    data: {
      labels: Object.keys(contributionData),
      datasets: [{
        label: 'Contribution (THB)',
        data: Object.values(contributionData),
        backgroundColor: ['#3b82f6', '#ec4899']
      }]
    },
    options: {
      plugins: { title: { display: true, text: 'Individual Contributions' } },
      scales: { y: { beginAtZero: true } }
    }
  });
}

renderExpenses();
renderSummary();
renderCharts();
