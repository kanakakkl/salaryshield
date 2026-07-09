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
  { id: 'transport', label: 'Transport & Commute',        cliiKey: 'transport', color: '#06b6d4' },
  { id: 'misc',      label: 'Miscellaneous / Other',     cliiKey: 'total',     color: '#ec4899' }
];

export const DEFAULT_BUDGET = {
  city: 'Hyderabad',
  income: 150000,
  expenses: { rent: 35000, loan: 25000, children: 20000, groceries: 18000, utilities: 8000, transport: 7000, misc: 10000 }
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
    if (raw) {
      const parsed = JSON.parse(raw);
      return {
        ...DEFAULT_BUDGET,
        ...parsed,
        expenses: {
          ...DEFAULT_BUDGET.expenses,
          ...parsed.expenses
        }
      };
    }
  } catch { /* ignore corrupt storage */ }
  return DEFAULT_BUDGET;
}

// ---------------------------------------------------------------------------
// Employer workforce model — per-city headcount, pay and gender split. The
// Employer Console derives EVERY metric from this dataset + the live CLII
// index, so nothing is hardcoded: change CLII or the hike and it all recomputes.
// ---------------------------------------------------------------------------
export const WORKFORCE = [
  { city: 'Hyderabad', employees: 85, avgLPA: 16.5, femaleShare: 0.34, femalePayRatio: 0.945 },
  { city: 'Bengaluru', employees: 98, avgLPA: 18.2, femaleShare: 0.31, femalePayRatio: 0.950 },
  { city: 'Mumbai',    employees: 32, avgLPA: 19.5, femaleShare: 0.29, femalePayRatio: 0.930 },
  { city: 'Pune',      employees: 35, avgLPA: 14.0, femaleShare: 0.33, femalePayRatio: 0.955 }
];

const threatFor = (clii) =>
  clii >= 9 ? { label: 'Critical', color: '#dc2626' }
  : clii >= 8 ? { label: 'High', color: '#ef4444' }
  : clii >= 7 ? { label: 'Elevated', color: '#f59e0b' }
  : { label: 'Medium', color: '#f59e0b' };

// hikePercent = the corrective salary hike from the Budget Simulator slider.
export function analyzeWorkforce(hikePercent = 0) {
  const cities = WORKFORCE.map((w) => {
    const clii = (cliiData[w.city] || cliiData.Hyderabad).total;
    const salary = w.avgLPA * 100000;
    // Attrition risk rises with local inflation lag; the hike buys it down.
    const baseRisk = Math.min(85, Math.round(clii * 7 + 17));
    const simRisk = Math.max(18, Math.round(baseRisk - hikePercent * 4.5));
    const gapLakh = (w.avgLPA * clii) / 100; // annual purchasing-power loss (₹L)
    const baseExits = w.employees * (baseRisk / 100);
    const simExits = w.employees * (simRisk / 100);
    const retained = Math.max(0, baseExits - simExits);
    const t = threatFor(clii);
    return {
      ...w, clii, salary, baseRisk, simRisk, gapLakh, retained,
      addlBudget: w.employees * salary * (hikePercent / 100),
      savings: retained * salary * 1.5, // replacement cost ≈ 1.5× salary
      threat: t.label, color: t.color
    };
  });

  const totalHeadcount = cities.reduce((s, c) => s + c.employees, 0);
  const wAvg = (sel) => cities.reduce((s, c) => s + c.employees * sel(c), 0) / totalHeadcount;

  const weightedInflation = wAvg((c) => c.clii);
  const baseAttrition = Math.round(wAvg((c) => c.baseRisk));
  const simAttrition = Math.round(wAvg((c) => c.simRisk));
  const additionalBudget = cities.reduce((s, c) => s + c.addlBudget, 0);
  const replacementSavings = cities.reduce((s, c) => s + c.savings, 0);
  const employeesRetained = Math.round(cities.reduce((s, c) => s + c.retained, 0));
  const netSavings = replacementSavings - additionalBudget;
  const roiMultiplier = additionalBudget > 0 ? replacementSavings / additionalBudget : 0;
  const annualPayroll = cities.reduce((s, c) => s + c.employees * c.salary, 0);

  // Pay-fairness: weighted gender gap + budget to close it
  const genderGap = wAvg((c) => (1 - c.femalePayRatio)) * 100;
  const remediationBudget = cities.reduce(
    (s, c) => s + c.employees * c.femaleShare * c.salary * (1 - c.femalePayRatio), 0
  );
  const tenureEquity = 100 - genderGap * 1.6; // derived proxy index

  return {
    cities, totalHeadcount, weightedInflation, baseAttrition, simAttrition,
    additionalBudget, replacementSavings, employeesRetained, netSavings,
    roiMultiplier, annualPayroll, genderGap, remediationBudget, tenureEquity
  };
}
