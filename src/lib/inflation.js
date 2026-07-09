// Shared inflation model — single source of truth for the Budget Planner and
// the Negotiation Coach so both compute identical numbers from the same data.

// City-Level Inflation Index breakdown (mirrors the CLII Engine, with an added
// education sub-index — schooling/tuition inflation runs high in India).
export const cliiData = {
  Hyderabad: { total: 8.4, housing: 12.2, food: 7.8, transport: 6.5, utilities: 5.2, education: 10.5 },
  Bengaluru: { total: 7.9, housing: 10.5, food: 8.2, transport: 6.8, utilities: 4.8, education: 9.8 },
  Mumbai:    { total: 9.1, housing: 14.8, food: 7.1, transport: 5.4, utilities: 6.2, education: 11.2 },
  Pune:      { total: 6.8, housing: 7.5,  food: 6.9, transport: 6.2, utilities: 5.0, education: 9.0 }
};

// Each expense category maps to the CLII sub-index that drives its inflation.
// 'fixed' = does not inflate (loan EMIs are locked, so debt is an inflation hedge).
export const EXPENSE_CATEGORIES = [
  { id: 'rent',      label: 'Rent / Housing',            cliiKey: 'housing',   color: 'var(--danger)' },
  { id: 'loan',      label: 'Loan EMIs (Home/Car)',      cliiKey: 'fixed',     color: 'var(--secondary)' },
  { id: 'children',  label: 'Children & Education',       cliiKey: 'education', color: 'var(--primary)' },
  { id: 'groceries', label: 'Groceries & Food',          cliiKey: 'food',      color: 'var(--accent)' },
  { id: 'utilities', label: 'Family: Utilities & Health', cliiKey: 'utilities', color: '#3b82f6' },
  { id: 'transport', label: 'Transport & Commute',        cliiKey: 'transport', color: '#06b6d4' }
];

export const DEFAULT_BUDGET = {
  city: 'Hyderabad',
  income: 150000,
  expenses: { rent: 35000, loan: 25000, children: 20000, groceries: 18000, utilities: 8000, transport: 7000 }
};

export const BUDGET_STORAGE_KEY = 'salaryshield_budget_v1';

export const fmtINR = (n) => '₹' + Math.round(Number(n) || 0).toLocaleString('en-IN');

// Core analysis: takes a budget { city, income, expenses } and returns every
// derived metric used across the app.
export function analyzeBudget(budget) {
  const b = budget || DEFAULT_BUDGET;
  const clii = cliiData[b.city] || cliiData.Hyderabad;
  const income = Number(b.income) || 0;

  const rows = EXPENSE_CATEGORIES.map((c) => {
    const amount = Number(b.expenses?.[c.id]) || 0;
    const rate = c.cliiKey === 'fixed' ? 0 : (clii[c.cliiKey] ?? clii.total);
    const nextYear = amount * (1 + rate / 100);
    const monthlyIncrease = nextYear - amount;
    return { ...c, amount, rate, nextYear, monthlyIncrease };
  });

  const totalExpenses = rows.reduce((s, r) => s + r.amount, 0);
  const savings = income - totalExpenses;
  const savingsRate = income > 0 ? (savings / income) * 100 : 0;
  const totalMonthlyIncrease = rows.reduce((s, r) => s + r.monthlyIncrease, 0);
  const projectedExpenses = totalExpenses + totalMonthlyIncrease;
  const projectedSavings = income - projectedExpenses;
  const annualInflationTax = totalMonthlyIncrease * 12;
  // Expense-weighted "personal inflation" — reflects THIS person's spending mix.
  const personalInflation = totalExpenses > 0 ? (totalMonthlyIncrease / totalExpenses) * 100 : 0;
  // Raise needed just to keep today's savings intact next year.
  const breakEvenHike = income > 0 ? (totalMonthlyIncrease / income) * 100 : 0;

  return {
    clii, city: b.city, income, rows, totalExpenses, savings, savingsRate,
    totalMonthlyIncrease, projectedExpenses, projectedSavings,
    annualInflationTax, personalInflation, breakEvenHike
  };
}

// Month-by-month savings series (months 0..12) for the depletion chart.
// Expenses compound at the personal inflation rate; income stays flat.
export function savingsSeries(analysis) {
  const { income, totalExpenses, personalInflation } = analysis;
  return Array.from({ length: 13 }, (_, m) => income - totalExpenses * Math.pow(1 + personalInflation / 100, m / 12));
}

export function loadBudget() {
  try {
    const raw = localStorage.getItem(BUDGET_STORAGE_KEY);
    if (raw) return { ...DEFAULT_BUDGET, ...JSON.parse(raw) };
  } catch { /* ignore corrupt storage */ }
  return DEFAULT_BUDGET;
}
