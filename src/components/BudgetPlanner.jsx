import React, { useState, useEffect } from 'react';
import {
  Wallet,
  Home,
  Landmark,
  GraduationCap,
  ShoppingCart,
  HeartPulse,
  Bus,
  PiggyBank,
  TrendingUp,
  AlertTriangle,
  Info,
  Gauge,
  RotateCcw,
  MoreHorizontal,
  ArrowRight
} from 'lucide-react';
import {
  cliiData,
  DEFAULT_BUDGET,
  BUDGET_STORAGE_KEY,
  fmtINR,
  analyzeBudget,
  savingsSeries,
  loadBudget
} from '../lib/inflation';

// Category id -> icon (icons stay in the UI layer; the model lives in lib).
const ICONS = {
  rent: Home,
  loan: Landmark,
  children: GraduationCap,
  groceries: ShoppingCart,
  utilities: HeartPulse,
  transport: Bus,
  misc: MoreHorizontal
};

export default function BudgetPlanner({ setActiveTab }) {
  const initial = loadBudget();
  const [city, setCity] = useState(initial.city);
  const [income, setIncome] = useState(initial.income);
  const [nominalSalary, setNominalSalary] = useState(initial.nominalSalary || 2500000);
  const [expenses, setExpenses] = useState(initial.expenses);
  const [allocation, setAllocation] = useState(initial.allocation || { equity: 40, debt: 30, gold: 15, cash: 15 });

  // Persist inputs so the demo survives a page refresh
  useEffect(() => {
    localStorage.setItem(BUDGET_STORAGE_KEY, JSON.stringify({ city, income, nominalSalary, expenses, allocation }));
  }, [city, income, nominalSalary, expenses, allocation]);

  const a = analyzeBudget({ city, income, nominalSalary, expenses });
  const clii = a.clii;

  const setExpense = (id, value) => {
    const num = value === '' ? 0 : Math.max(0, Number(value) || 0);
    setExpenses((prev) => ({ ...prev, [id]: num }));
  };

  const resetSample = () => {
    setCity(DEFAULT_BUDGET.city);
    setIncome(DEFAULT_BUDGET.income);
    setNominalSalary(DEFAULT_BUDGET.nominalSalary);
    setExpenses(DEFAULT_BUDGET.expenses);
    setAllocation(DEFAULT_BUDGET.allocation);
  };

  const handleAllocationChange = (key, value) => {
    const newVal = Math.max(0, Math.min(100, Number(value)));
    const diff = newVal - allocation[key];
    const otherKeys = Object.keys(allocation).filter((k) => k !== key);
    const sumOthers = otherKeys.reduce((s, k) => s + allocation[k], 0);

    let next = { ...allocation, [key]: newVal };
    if (sumOthers > 0) {
      otherKeys.forEach((k) => {
        const proportion = allocation[k] / sumOthers;
        next[k] = Math.max(0, Math.min(100, Math.round((allocation[k] - diff * proportion) * 10) / 10));
      });
    } else {
      otherKeys.forEach((k) => {
        next[k] = Math.max(0, Math.min(100, Math.round(((100 - newVal) / 3) * 10) / 10));
      });
    }

    const finalSum = Object.values(next).reduce((s, v) => s + v, 0);
    if (finalSum !== 100) {
      const err = 100 - finalSum;
      next[otherKeys[0]] = Math.max(0, Math.min(100, Math.round((next[otherKeys[0]] + err) * 10) / 10));
    }
    setAllocation(next);
  };

  const applyPreset = (presetName) => {
    if (presetName === 'aggressive') {
      setAllocation({ equity: 70, debt: 10, gold: 15, cash: 5 });
    } else if (presetName === 'balanced') {
      setAllocation({ equity: 40, debt: 30, gold: 15, cash: 15 });
    } else if (presetName === 'preservation') {
      setAllocation({ equity: 15, debt: 50, gold: 15, cash: 20 });
    }
  };

  const maxRow = Math.max(...a.rows.map((r) => r.amount), 1);
  const savingsColor = a.savings < 0 ? 'var(--danger)' : a.savingsRate < 15 ? 'var(--accent)' : 'var(--secondary)';

  // Savings-depletion chart geometry (SVG 0 0 460 140)
  const series = savingsSeries(a);
  const vhi = Math.max(...series, 0);
  const vlo = Math.min(...series, 0);
  const span = (vhi - vlo) || 1;
  const px = (m) => 12 + (m / 12) * 436;
  const py = (v) => 118 - ((v - vlo) / span) * 96;
  const linePath = series.map((v, m) => `${m === 0 ? 'M' : 'L'} ${px(m).toFixed(1)},${py(v).toFixed(1)}`).join(' ');
  const areaPath = `${linePath} L ${px(12).toFixed(1)},118 L ${px(0).toFixed(1)},118 Z`;
  const zeroY = py(0);
  const endsNegative = series[12] < 0;

  // Investment Allocator Calculations
  const availableSavings = Math.max(0, a.savings);
  const eqAmt = (availableSavings * allocation.equity) / 100;
  const debtAmt = (availableSavings * allocation.debt) / 100;
  const goldAmt = (availableSavings * allocation.gold) / 100;
  const cashAmt = (availableSavings * allocation.cash) / 100;

  const portfolioReturn = (
    (allocation.equity * 12.0) +
    (allocation.debt * 7.2) +
    (allocation.gold * 8.5) +
    (allocation.cash * 6.0)
  ) / 100;

  const netRealReturn = portfolioReturn - a.personalInflation;

  // 3-Year Future Value Compounding (compounded monthly)
  const months = 36;
  const nominalRate = (portfolioReturn / 100) / 12;
  const fvNominal = nominalRate > 0 
    ? availableSavings * ((Math.pow(1 + nominalRate, months) - 1) / nominalRate)
    : availableSavings * months;

  const realRate = (netRealReturn / 100) / 12;
  const fvReal = realRate !== 0
    ? availableSavings * ((Math.pow(1 + realRate, months) - 1) / realRate)
    : availableSavings * months;

  return (
    <div className="animate-fade-in" style={{ padding: '30px 40px 30px 20px', marginLeft: 'calc(var(--sidebar-width) + 40px)', minHeight: '100vh' }}>

      {/* Header */}
      <div className="flex-between" style={{ marginBottom: '32px' }}>
        <div>
          <h1 style={{ fontSize: '2rem', fontWeight: '800', marginBottom: '6px' }}>My Budget &amp; Inflation Planner</h1>
          <p style={{ color: 'var(--text-secondary)' }}>Enter your real salary and expenses. See how <strong>your city's inflation</strong> erodes your savings — and the raise you need to stay ahead.</p>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <div>
            <label style={{ fontSize: '0.72rem', color: 'var(--text-muted)', display: 'block', marginBottom: '4px', fontWeight: '600' }}>YOUR CITY</label>
            <select
              value={city}
              onChange={(e) => setCity(e.target.value)}
              style={{
                padding: '10px 14px', borderRadius: '8px', backgroundColor: 'var(--bg-secondary)',
                border: '1px solid var(--border-color)', color: 'var(--text-primary)', fontSize: '0.9rem', cursor: 'pointer', outline: 'none'
              }}
            >
              {Object.keys(cliiData).map((c) => <option key={c} value={c}>{c} — {cliiData[c].total}% CLII</option>)}
            </select>
          </div>
          <button className="btn btn-secondary" style={{ marginTop: '18px' }} onClick={resetSample}>
            <RotateCcw size={14} /> Sample
          </button>
        </div>
      </div>

      {/* Row 1: Inputs + Monthly snapshot */}
      <div style={{ display: 'grid', gridTemplateColumns: '5fr 7fr', gap: '30px', marginBottom: '32px' }}>

        {/* Input card */}
        <div className="glass-panel" style={{ padding: '28px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '20px' }}>
            <Wallet size={22} color="var(--primary)" />
            <h2 style={{ fontSize: '1.25rem' }}>Your Monthly Numbers</h2>
          </div>

          {/* Annual Nominal Salary */}
          <div style={{ marginBottom: '20px' }}>
            <label style={{ fontSize: '0.78rem', color: 'var(--text-muted)', display: 'block', marginBottom: '6px', fontWeight: '600' }}>ANNUAL NOMINAL SALARY (LPA)</label>
            <div style={{ position: 'relative' }}>
              <input
                type="number" min="0" step="0.5" value={nominalSalary / 100000}
                onChange={(e) => setNominalSalary(e.target.value === '' ? 0 : Math.max(0, Number(e.target.value) * 100000 || 0))}
                style={{
                  width: '100%', padding: '12px 14px', borderRadius: '8px',
                  backgroundColor: 'var(--bg-secondary)', border: '1px solid var(--primary)',
                  color: 'var(--text-primary)', fontSize: '1.05rem', fontWeight: '700', outline: 'none'
                }}
              />
              <span style={{ position: 'absolute', right: '14px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-secondary)', fontSize: '0.85rem', fontWeight: '600' }}>LPA</span>
            </div>
          </div>

          {/* Income */}
          <div style={{ marginBottom: '20px' }}>
            <label style={{ fontSize: '0.78rem', color: 'var(--text-muted)', display: 'block', marginBottom: '6px', fontWeight: '600' }}>MONTHLY TAKE-HOME SALARY</label>
            <div style={{ position: 'relative' }}>
              <span style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-secondary)' }}>₹</span>
              <input
                type="number" min="0" value={income}
                onChange={(e) => setIncome(e.target.value === '' ? 0 : Math.max(0, Number(e.target.value) || 0))}
                style={{
                  width: '100%', padding: '12px 14px 12px 28px', borderRadius: '8px',
                  backgroundColor: 'var(--bg-secondary)', border: '1px solid var(--primary)',
                  color: 'var(--text-primary)', fontSize: '1.05rem', fontWeight: '700', outline: 'none'
                }}
              />
            </div>
          </div>

          <div style={{ height: '1px', backgroundColor: 'var(--border-color)', margin: '4px 0 18px' }} />

          {/* Expense inputs */}
          <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)', display: 'block', marginBottom: '12px', fontWeight: '600' }}>MONTHLY EXPENSES</span>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {a.rows.map((r) => {
              const Icon = ICONS[r.id];
              return (
                <div key={r.id} style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <div style={{
                    width: '34px', height: '34px', borderRadius: '8px', flexShrink: 0,
                    backgroundColor: 'var(--bg-inner-white-03)', border: '1px solid var(--border-color)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center'
                  }}>
                    <Icon size={16} color={r.color} />
                  </div>
                  <div style={{ flex: 1 }}>
                    <span style={{ fontSize: '0.82rem', fontWeight: '500', display: 'block' }}>{r.label}</span>
                    <span style={{ fontSize: '0.68rem', color: 'var(--text-muted)' }}>
                      {r.cliiKey === 'fixed' ? 'Inflation-fixed (EMI locked)' : `Inflating at ${r.rate}% / yr`}
                    </span>
                  </div>
                  <div style={{ position: 'relative', width: '120px' }}>
                    <span style={{ position: 'absolute', left: '10px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)', fontSize: '0.85rem' }}>₹</span>
                    <input
                      type="number" min="0" value={r.amount}
                      onChange={(e) => setExpense(r.id, e.target.value)}
                      style={{
                        width: '100%', padding: '8px 10px 8px 22px', borderRadius: '8px',
                        backgroundColor: 'var(--bg-secondary)', border: '1px solid var(--border-color)',
                        color: 'var(--text-primary)', fontSize: '0.88rem', fontWeight: '600', outline: 'none'
                      }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Snapshot card */}
        <div className="glass-panel" style={{ padding: '28px', display: 'flex', flexDirection: 'column' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '20px' }}>
            <PiggyBank size={22} color="var(--secondary)" />
            <h2 style={{ fontSize: '1.25rem' }}>Monthly Snapshot</h2>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '16px', marginBottom: '24px' }}>
            <div style={{ backgroundColor: 'var(--bg-inner-white-02)', padding: '16px', borderRadius: '10px', border: '1px solid var(--border-color)' }}>
              <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)', display: 'block', fontWeight: '600' }}>INCOME</span>
              <span style={{ fontSize: '1.3rem', fontWeight: '800' }}>{fmtINR(a.income)}</span>
            </div>
            <div style={{ backgroundColor: 'var(--bg-inner-white-02)', padding: '16px', borderRadius: '10px', border: '1px solid var(--border-color)' }}>
              <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)', display: 'block', fontWeight: '600' }}>EXPENSES</span>
              <span style={{ fontSize: '1.3rem', fontWeight: '800', color: 'var(--danger)' }}>{fmtINR(a.totalExpenses)}</span>
            </div>
            <div style={{ backgroundColor: 'var(--bg-inner-white-02)', padding: '16px', borderRadius: '10px', border: `1px solid ${savingsColor}` }}>
              <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)', display: 'block', fontWeight: '600' }}>SAVINGS</span>
              <span style={{ fontSize: '1.3rem', fontWeight: '800', color: savingsColor }}>{fmtINR(a.savings)}</span>
            </div>
          </div>

          {/* Savings rate bar */}
          <div style={{ marginBottom: '24px' }}>
            <div className="flex-between" style={{ fontSize: '0.82rem', marginBottom: '6px' }}>
              <span style={{ color: 'var(--text-secondary)' }}>Savings Rate</span>
              <span style={{ color: savingsColor, fontWeight: '700' }}>{a.savingsRate.toFixed(1)}%</span>
            </div>
            <div style={{ height: '10px', backgroundColor: 'var(--bg-inner-white-05)', borderRadius: '5px', overflow: 'hidden' }}>
              <div style={{ width: `${Math.max(0, Math.min(100, a.savingsRate))}%`, height: '100%', backgroundColor: savingsColor, transition: 'width 0.4s ease' }} />
            </div>
            <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>
              {a.savings < 0 ? 'You are spending more than you earn.' : a.savingsRate < 15 ? 'Below the healthy 20% savings benchmark.' : 'Healthy — above the 20% benchmark.'}
            </span>
          </div>

          {/* Expense composition */}
          <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)', display: 'block', marginBottom: '12px', fontWeight: '600' }}>WHERE YOUR MONEY GOES</span>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            {a.rows.filter((r) => r.amount > 0).sort((x, y) => y.amount - x.amount).map((r) => (
              <div key={r.id}>
                <div className="flex-between" style={{ fontSize: '0.78rem', marginBottom: '3px' }}>
                  <span style={{ color: 'var(--text-secondary)' }}>{r.label}</span>
                  <span style={{ color: 'var(--text-primary)', fontWeight: '600' }}>{fmtINR(r.amount)} <span style={{ color: 'var(--text-muted)', fontWeight: '400' }}>({a.totalExpenses > 0 ? ((r.amount / a.totalExpenses) * 100).toFixed(0) : 0}%)</span></span>
                </div>
                <div style={{ height: '6px', backgroundColor: 'var(--bg-inner-white-05)', borderRadius: '3px', overflow: 'hidden' }}>
                  <div style={{ width: `${(r.amount / maxRow) * 100}%`, height: '100%', backgroundColor: r.color }} />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Row 2: Inflation impact + category breakdown */}
      <div style={{ display: 'grid', gridTemplateColumns: '6fr 6fr', gap: '30px' }}>

        {/* Inflation impact */}
        <div className="glass-panel" style={{ padding: '28px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '8px' }}>
            <Gauge size={22} color="var(--accent)" />
            <h2 style={{ fontSize: '1.25rem' }}>Your Inflation Reality (12-Month Projection)</h2>
          </div>
          <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: '20px' }}>
            Based on {city}'s CLII, applied to <em>your</em> spending mix.
          </p>

          {/* Personal vs city inflation */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '20px' }}>
            <div style={{ backgroundColor: 'var(--accent-glow)', padding: '16px', borderRadius: '10px', border: '1px solid var(--border-color)' }}>
              <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)', display: 'block', fontWeight: '600' }}>YOUR PERSONAL INFLATION</span>
              <span style={{ fontSize: '1.5rem', fontWeight: '800', color: 'var(--accent)' }}>{a.personalInflation.toFixed(1)}%</span>
              <span style={{ fontSize: '0.68rem', color: 'var(--text-secondary)', display: 'block' }}>
                {a.personalInflation >= clii.total ? 'Higher' : 'Lower'} than the {clii.total}% city average
              </span>
            </div>
            <div style={{ backgroundColor: 'var(--bg-inner-white-02)', padding: '16px', borderRadius: '10px', border: '1px solid var(--border-color)' }}>
              <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)', display: 'block', fontWeight: '600' }}>{city} HEADLINE CLII</span>
              <span style={{ fontSize: '1.5rem', fontWeight: '800' }}>{clii.total}%</span>
              <span style={{ fontSize: '0.68rem', color: 'var(--text-secondary)', display: 'block' }}>City basket average</span>
            </div>
          </div>

          {/* Numbers */}
          <div style={{ backgroundColor: 'var(--bg-inner-dark)', borderRadius: '12px', padding: '18px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
            <div className="flex-between" style={{ fontSize: '0.85rem' }}>
              <span style={{ color: 'var(--text-secondary)' }}>Extra spend next year (inflation tax)</span>
              <span style={{ color: 'var(--danger)', fontWeight: '700' }}>{fmtINR(a.annualInflationTax)}/yr</span>
            </div>
            <div className="flex-between" style={{ fontSize: '0.85rem' }}>
              <span style={{ color: 'var(--text-secondary)' }}>Projected monthly expenses</span>
              <span style={{ color: 'var(--text-primary)', fontWeight: '700' }}>{fmtINR(a.projectedExpenses)} <span style={{ color: 'var(--text-muted)', fontWeight: '400', fontSize: '0.78rem' }}>(+{fmtINR(a.totalMonthlyIncrease)})</span></span>
            </div>
            <div className="flex-between" style={{ fontSize: '0.85rem', borderTop: '1px solid var(--border-white-06)', paddingTop: '12px' }}>
              <span style={{ color: 'var(--text-secondary)' }}>Savings next year (if salary is flat)</span>
              <span style={{ color: a.projectedSavings < 0 ? 'var(--danger)' : a.projectedSavings < a.savings ? 'var(--accent)' : 'var(--secondary)', fontWeight: '800', fontSize: '1.05rem' }}>{fmtINR(a.projectedSavings)}/mo</span>
            </div>
          </div>

          {/* Savings-depletion chart */}
          <div style={{ marginTop: '20px' }}>
            <h4 style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', marginBottom: '10px' }}>Monthly Savings — Next 12 Months (salary flat)</h4>
            <div style={{
              height: '140px', backgroundColor: 'var(--bg-inner-dark-light)',
              border: '1px solid var(--border-color)', borderRadius: '8px', position: 'relative', overflow: 'hidden'
            }}>
              <svg width="100%" height="100%" viewBox="0 0 460 140" preserveAspectRatio="none" style={{ position: 'absolute', top: 0, left: 0 }}>
                <defs>
                  <linearGradient id="savFill" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="var(--accent)" stopOpacity="0.35" />
                    <stop offset="100%" stopColor="var(--accent)" stopOpacity="0" />
                  </linearGradient>
                </defs>
                {/* Zero line (only meaningful if savings dip below 0) */}
                {vlo < 0 && (
                  <line x1="0" y1={zeroY} x2="460" y2={zeroY} stroke="var(--danger)" strokeWidth="1" strokeDasharray="4 4" opacity="0.6" />
                )}
                <path d={areaPath} fill="url(#savFill)" />
                <path d={linePath} fill="none" stroke={endsNegative ? 'var(--danger)' : 'var(--accent)'} strokeWidth="3" strokeLinecap="round" />
                {/* End marker */}
                <circle cx={px(12)} cy={py(series[12])} r="4" fill={endsNegative ? 'var(--danger)' : 'var(--accent)'} />
              </svg>
              <div style={{ position: 'absolute', bottom: '6px', left: '10px', fontSize: '0.65rem', color: 'var(--text-muted)' }}>Now: {fmtINR(series[0])}</div>
              <div style={{ position: 'absolute', bottom: '6px', right: '10px', fontSize: '0.65rem', fontWeight: '700', color: endsNegative ? 'var(--danger)' : 'var(--accent)' }}>Month 12: {fmtINR(series[12])}</div>
            </div>
          </div>

          {/* Break-even call-out */}
          <div style={{
            marginTop: '18px', padding: '16px', borderRadius: '10px',
            backgroundColor: 'var(--primary-glow)', border: '1px solid var(--border-color-hover)',
            display: 'flex', gap: '12px', alignItems: 'center'
          }}>
            <TrendingUp size={26} color="var(--primary)" style={{ flexShrink: 0 }} />
            <div>
              <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', display: 'block' }}>Raise needed just to break even with inflation</span>
              <span style={{ fontSize: '1.4rem', fontWeight: '800', color: 'var(--primary)' }}>+{a.breakEvenHike.toFixed(1)}%</span>
              <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}> &nbsp;≈ {fmtINR(a.totalMonthlyIncrease)}/mo more take-home</span>
            </div>
          </div>

          {/* GenAI Copilot consultation redirect */}
          <button 
            onClick={() => {
              // Prefill the query in local storage so the Copilot can auto-send or focus it!
              localStorage.setItem('copilot_prefilled_query', `Based on my budget planner, my personal inflation is ${a.personalInflation.toFixed(1)}% and I need a raise of ${a.breakEvenHike.toFixed(1)}% to break even in ${city}. How should I negotiate this package adjust?`);
              setActiveTab('copilot');
            }}
            style={{
              marginTop: '14px',
              width: '100%',
              padding: '12px',
              borderRadius: '10px',
              border: 'none',
              background: 'linear-gradient(135deg, var(--primary) 0%, var(--primary-glow) 100%)',
              color: 'white',
              fontSize: '0.82rem',
              fontWeight: '700',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '8px',
              transition: 'all 0.2s ease',
              boxShadow: '0 4px 12px var(--primary-glow)'
            }}
          >
            <span>Ask GenAI Copilot to Shield Your Salary</span>
            <ArrowRight size={14} />
          </button>

          {a.projectedSavings < 0 && (
            <div style={{
              marginTop: '14px', padding: '12px', borderRadius: '8px',
              backgroundColor: 'var(--danger-glow)', border: '1px dashed var(--border-color)',
              display: 'flex', gap: '8px', alignItems: 'center', fontSize: '0.78rem', color: 'var(--danger)'
            }}>
              <AlertTriangle size={16} style={{ flexShrink: 0 }} />
              <span>Warning: without a raise, {city} inflation pushes you into a monthly deficit next year.</span>
            </div>
          )}
        </div>

        {/* Category breakdown */}
        <div className="glass-panel" style={{ padding: '28px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '8px' }}>
            <TrendingUp size={22} color="var(--danger)" />
            <h2 style={{ fontSize: '1.25rem' }}>Category-wise Inflation Bite</h2>
          </div>
          <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: '18px' }}>
            How much each expense grows over the next 12 months in {city}.
          </p>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
            {a.rows.map((r) => {
              const Icon = ICONS[r.id];
              return (
                <div key={r.id} style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <div style={{
                    width: '30px', height: '30px', borderRadius: '8px', flexShrink: 0,
                    backgroundColor: 'var(--bg-inner-white-03)', border: '1px solid var(--border-color)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center'
                  }}>
                    <Icon size={15} color={r.color} />
                  </div>
                  <div style={{ flex: 1 }}>
                    <div className="flex-between" style={{ fontSize: '0.8rem', marginBottom: '3px' }}>
                      <span style={{ color: 'var(--text-primary)', fontWeight: '500' }}>{r.label}</span>
                      <span style={{ color: r.rate === 0 ? 'var(--secondary)' : 'var(--danger)', fontWeight: '600' }}>
                        {r.rate === 0 ? 'Fixed 0%' : `+${fmtINR(r.monthlyIncrease)}/mo`}
                      </span>
                    </div>
                    <div style={{ height: '6px', backgroundColor: 'var(--bg-inner-white-05)', borderRadius: '3px', overflow: 'hidden' }}>
                      <div style={{ width: `${(r.rate / 15) * 100}%`, height: '100%', backgroundColor: r.rate === 0 ? 'var(--secondary)' : r.color }} />
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          <div style={{
            marginTop: '20px', padding: '14px', borderRadius: '8px',
            backgroundColor: 'var(--secondary-glow)', border: '1px solid var(--border-color-hover)',
            display: 'flex', gap: '10px', alignItems: 'flex-start', fontSize: '0.78rem', color: 'var(--text-secondary)'
          }}>
            <Info size={16} color="var(--secondary)" style={{ flexShrink: 0, marginTop: '1px' }} />
            <span><strong style={{ color: 'var(--secondary)' }}>Insight:</strong> your loan EMIs stay fixed while everything else inflates — so debt repayment is effectively an inflation hedge. Rent &amp; education are your biggest inflation drivers.</span>
          </div>
        </div>
      </div>

      {/* Row 3: Savings Plan & Investment Allocator (Full Width) */}
      <div className="glass-panel" style={{ padding: '28px', marginTop: '30px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '20px', flexWrap: 'wrap', gap: '16px' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '4px' }}>
              <TrendingUp size={22} color="var(--secondary)" />
              <h2 style={{ fontSize: '1.25rem', fontWeight: '800' }}>Inflation-Shielded Investment & Savings Planner</h2>
            </div>
            <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
              Strategize how to allocate your monthly savings of <strong>{fmtINR(availableSavings)}</strong> to hedge against purchasing power losses.
            </p>
          </div>
          <div style={{ display: 'flex', gap: '8px' }}>
            <button
              onClick={() => applyPreset('aggressive')}
              style={{
                padding: '6px 12px', fontSize: '0.75rem', fontWeight: '700', borderRadius: '20px', border: '1px solid var(--border-color)',
                background: 'var(--bg-secondary)', color: 'var(--text-primary)', cursor: 'pointer', transition: 'all 0.2s'
              }}
            >🔥 Aggressive (SIP heavy)</button>
            <button
              onClick={() => applyPreset('balanced')}
              style={{
                padding: '6px 12px', fontSize: '0.75rem', fontWeight: '700', borderRadius: '20px', border: '1px solid var(--border-color)',
                background: 'var(--bg-secondary)', color: 'var(--text-primary)', cursor: 'pointer', transition: 'all 0.2s'
              }}
            >⚖️ Balanced Hedge</button>
            <button
              onClick={() => applyPreset('preservation')}
              style={{
                padding: '6px 12px', fontSize: '0.75rem', fontWeight: '700', borderRadius: '20px', border: '1px solid var(--border-color)',
                background: 'var(--bg-secondary)', color: 'var(--text-primary)', cursor: 'pointer', transition: 'all 0.2s'
              }}
            >🛡️ Capital Preservation</button>
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '7fr 5fr', gap: '30px' }}>
          {/* Sliders */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '18px' }}>
            <div>
              <div className="flex-between" style={{ fontSize: '0.82rem', marginBottom: '6px' }}>
                <span style={{ fontWeight: '600', color: 'var(--text-primary)' }}>📈 Equity Mutual Funds / SIPs (Expected Return: 12.0%)</span>
                <span style={{ fontWeight: '700', color: 'var(--secondary)' }}>{allocation.equity}% ({fmtINR(eqAmt)}/mo)</span>
              </div>
              <input
                type="range" min="0" max="100" value={allocation.equity}
                onChange={(e) => handleAllocationChange('equity', e.target.value)}
                style={{ width: '100%', accentColor: 'var(--secondary)', cursor: 'pointer' }}
              />
            </div>

            <div>
              <div className="flex-between" style={{ fontSize: '0.82rem', marginBottom: '6px' }}>
                <span style={{ fontWeight: '600', color: 'var(--text-primary)' }}>🛡️ Fixed Income / PPF / EPF (Expected Return: 7.2%)</span>
                <span style={{ fontWeight: '700', color: 'var(--primary)' }}>{allocation.debt}% ({fmtINR(debtAmt)}/mo)</span>
              </div>
              <input
                type="range" min="0" max="100" value={allocation.debt}
                onChange={(e) => handleAllocationChange('debt', e.target.value)}
                style={{ width: '100%', accentColor: 'var(--primary)', cursor: 'pointer' }}
              />
            </div>

            <div>
              <div className="flex-between" style={{ fontSize: '0.82rem', marginBottom: '6px' }}>
                <span style={{ fontWeight: '600', color: 'var(--text-primary)' }}>🏆 Gold Bonds / Commodities (Expected Return: 8.5%)</span>
                <span style={{ fontWeight: '700', color: 'var(--accent)' }}>{allocation.gold}% ({fmtINR(goldAmt)}/mo)</span>
              </div>
              <input
                type="range" min="0" max="100" value={allocation.gold}
                onChange={(e) => handleAllocationChange('gold', e.target.value)}
                style={{ width: '100%', accentColor: 'var(--accent)', cursor: 'pointer' }}
              />
            </div>

            <div>
              <div className="flex-between" style={{ fontSize: '0.82rem', marginBottom: '6px' }}>
                <span style={{ fontWeight: '600', color: 'var(--text-primary)' }}>💵 Cash & Liquid FDs (Expected Return: 6.0%)</span>
                <span style={{ fontWeight: '700', color: 'var(--text-secondary)' }}>{allocation.cash}% ({fmtINR(cashAmt)}/mo)</span>
              </div>
              <input
                type="range" min="0" max="100" value={allocation.cash}
                onChange={(e) => handleAllocationChange('cash', e.target.value)}
                style={{ width: '100%', accentColor: 'var(--text-secondary)', cursor: 'pointer' }}
              />
            </div>
          </div>

          {/* Impact Stats */}
          <div style={{ backgroundColor: 'var(--bg-inner-dark)', padding: '20px', borderRadius: '16px', border: '1px solid var(--border-color)', display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', fontWeight: '600' }}>PORTFOLIO YIELD</span>
              <span style={{ fontSize: '1.4rem', fontWeight: '800', color: 'var(--secondary)' }}>{portfolioReturn.toFixed(2)}%</span>
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', fontWeight: '600' }}>PERSONAL INFLATION</span>
              <span style={{ fontSize: '1.4rem', fontWeight: '800', color: 'var(--danger)' }}>{a.personalInflation.toFixed(1)}%</span>
            </div>

            <div style={{ borderTop: '1px solid var(--border-color)', paddingTop: '12px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', fontWeight: '600' }}>NET REAL YIELD</span>
              <span style={{ fontSize: '1.4rem', fontWeight: '800', color: netRealReturn >= 0 ? 'var(--secondary)' : 'var(--danger)' }}>
                {netRealReturn >= 0 ? '+' : ''}{netRealReturn.toFixed(2)}%
              </span>
            </div>

            <div style={{
              padding: '10px 12px', borderRadius: '8px', fontSize: '0.78rem', fontWeight: '700', textAlign: 'center',
              backgroundColor: netRealReturn >= 0 ? 'var(--secondary-glow)' : 'var(--danger-glow)',
              color: netRealReturn >= 0 ? 'var(--secondary)' : 'var(--danger)',
              border: '1px solid var(--border-color)'
            }}>
              {netRealReturn >= 0 ? '✅ Inflation-Shielded Portfolio Yield' : '⚠️ Inflation-Vulnerable Yield (Eroding Capital)'}
            </div>

            {/* 3-Year Projection Summary */}
            <div style={{ borderTop: '1px solid var(--border-color)', paddingTop: '12px' }}>
              <span style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', fontWeight: '600', display: 'block', marginBottom: '8px' }}>3-YEAR SIP VALUE PROJECTION</span>
              <div className="flex-between" style={{ fontSize: '0.82rem', marginBottom: '4px' }}>
                <span style={{ color: 'var(--text-muted)' }}>Nominal SIP Future Value:</span>
                <span style={{ fontWeight: '700', color: 'var(--text-primary)' }}>{fmtINR(fvNominal)}</span>
              </div>
              <div className="flex-between" style={{ fontSize: '0.82rem' }}>
                <span style={{ color: 'var(--text-muted)' }}>Inflation-Adjusted Value:</span>
                <span style={{ fontWeight: '700', color: netRealReturn >= 0 ? 'var(--secondary)' : 'var(--danger)' }}>{fmtINR(fvReal)}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
