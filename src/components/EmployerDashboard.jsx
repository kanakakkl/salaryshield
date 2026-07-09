import React, { useState, useEffect } from 'react';
import {
  Users,
  TrendingDown,
  DollarSign,
  ShieldCheck,
  ArrowUpRight,
  AlertTriangle,
  Info,
  Sliders,
  Award,
  Activity,
  Sparkles,
  Loader2
} from 'lucide-react';
import { analyzeWorkforce, fmtINR } from '../lib/inflation';
import { generateWorkforceInsight } from '../lib/llm';

export default function EmployerDashboard() {
  // Budget Simulator state
  const [hikePercentage, setHikePercentage] = useState(() => {
    const val = localStorage.getItem('salaryshield_employer_hike');
    return val ? parseFloat(val) : 3.5;
  });

  // Live-sync ticker — recomputes the "synced Xs ago" clock every second so the
  // console reads as a live stream. Resets on a ~20s cadence.
  const [syncSecs, setSyncSecs] = useState(0);
  useEffect(() => {
    const id = setInterval(() => setSyncSecs((s) => (s + 1) % 20), 1000);
    return () => clearInterval(id);
  }, []);

  useEffect(() => {
    localStorage.setItem('salaryshield_employer_hike', hikePercentage);
  }, [hikePercentage]);

  // AI Workforce Insight — Gemini narrates the biggest risk driver in the
  // live analyzeWorkforce() output. The AI never computes new numbers here,
  // it only explains numbers the engine already derived.
  const [aiInsight, setAiInsight] = useState(null);
  const [aiInsightHike, setAiInsightHike] = useState(null); // hike% the insight was generated for
  const [aiLoading, setAiLoading] = useState(false);
  const [aiError, setAiError] = useState(null);

  const generateInsight = async () => {
    setAiLoading(true);
    setAiError(null);
    try {
      const text = await generateWorkforceInsight(hikePercentage);
      setAiInsight(text);
      setAiInsightHike(hikePercentage);
    } catch (err) {
      setAiError(err.message);
    } finally {
      setAiLoading(false);
    }
  };

  const insightStale = aiInsight && aiInsightHike !== hikePercentage;

  // Everything below is DERIVED from the workforce dataset + live CLII index.
  const wf = analyzeWorkforce(hikePercentage);
  const employeeCount = wf.totalHeadcount;
  const simulatedAttritionRisk = wf.simAttrition;
  const additionalBudget = wf.additionalBudget;
  const employeesRetained = wf.employeesRetained;
  const replacementSavings = wf.replacementSavings;
  const netSavings = wf.netSavings;
  const roiMultiplier = wf.roiMultiplier.toFixed(1);

  // Heatmap rows mapped from the derived per-city analysis
  const cities = wf.cities.map((c) => ({
    name: c.city,
    employees: c.employees,
    inflation: c.clii,
    avgSalary: `${c.avgLPA.toFixed(1)} LPA`,
    gap: `₹${c.gapLakh.toFixed(1)}L`,
    risk: c.threat,
    color: c.color
  }));

  // Dynamic coordinates for SVG Attrition Lag curve (HD visual representation)
  // Lag months stagnant: 0, 3, 6, 9, 12
  const getRiskAtLag = (lagMonths) => {
    const ratio = simulatedAttritionRisk / 74; 
    if (lagMonths === 0) return Math.round(15 * ratio);
    if (lagMonths === 3) return Math.round(25 * ratio);
    if (lagMonths === 6) return Math.round(40 * ratio);
    if (lagMonths === 9) return Math.round(60 * ratio);
    return simulatedAttritionRisk; 
  };

  const r0 = getRiskAtLag(0);
  const r3 = getRiskAtLag(3);
  const r6 = getRiskAtLag(6);
  const r9 = getRiskAtLag(9);
  const r12 = getRiskAtLag(12);

  const yVal = (risk) => 130 - (risk / 100) * 110;
  
  const pathData = `M 10,${yVal(r0)} ` +
                   `C 110,${yVal(r0)} 110,${yVal(r3)} 120,${yVal(r3)} ` +
                   `C 220,${yVal(r3)} 220,${yVal(r6)} 230,${yVal(r6)} ` +
                   `C 330,${yVal(r6)} 330,${yVal(r9)} 340,${yVal(r9)} ` +
                   `C 440,${yVal(r9)} 440,${yVal(r12)} 450,${yVal(r12)}`;

  const areaData = `${pathData} L 450,130 L 10,130 Z`;

  return (
    <div className="animate-fade-in" style={{ padding: '30px 40px 30px 20px', marginLeft: 'calc(var(--sidebar-width) + 40px)', minHeight: '100vh' }}>
      
      {/* Top Header */}
      <div className="flex-between" style={{ marginBottom: '32px' }}>
        <div>
          <h1 style={{ fontSize: '2rem', fontWeight: '800', marginBottom: '6px' }}>Employer Intelligence Console</h1>
          <p style={{ color: 'var(--text-secondary)' }}>Workforce compensation analysis, real-time inflation tracking & attrition risk modeling.</p>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <div style={{
            backgroundColor: 'var(--accent-glow)',
            border: '1px solid rgba(245, 158, 11, 0.2)',
            borderRadius: '10px',
            padding: '8px 14px',
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            fontSize: '0.82rem',
            color: 'var(--accent)'
          }}>
            <Activity size={15} className="text-glow-primary" />
            <span>Live CLII stream · synced {syncSecs}s ago</span>
          </div>
          <div style={{
            backgroundColor: 'var(--secondary-glow)',
            border: '1px solid var(--border-color-hover)',
            borderRadius: '10px',
            padding: '8px 16px',
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            fontSize: '0.88rem',
            color: 'var(--secondary)'
          }}>
            <ShieldCheck size={16} />
            <span>Fair Pay Audit: Active</span>
          </div>
        </div>
      </div>

      {/* Main KPI Row */}
      <div className="dashboard-grid" style={{ marginBottom: '32px', gridTemplateColumns: 'repeat(4, 1fr)' }}>
        <div className="glass-panel" style={{ padding: '20px' }}>
          <div className="flex-between" style={{ marginBottom: '12px' }}>
            <span style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', fontWeight: '600' }}>TOTAL ACTIVE HEADCOUNT</span>
            <Users size={20} color="var(--primary)" />
          </div>
          <h3 style={{ fontSize: '1.75rem', fontWeight: '700' }}>{employeeCount}</h3>
          <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Enterprise Segment (India IT)</span>
        </div>
        
        <div className="glass-panel" style={{ padding: '20px' }}>
          <div className="flex-between" style={{ marginBottom: '12px' }}>
            <span style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', fontWeight: '600' }}>AVG NATIONAL INFLATION</span>
            <TrendingDown size={20} color="var(--danger)" />
          </div>
          <h3 style={{ fontSize: '1.75rem', fontWeight: '700', color: 'var(--danger)' }}>{wf.weightedInflation.toFixed(2)}%</h3>
          <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Headcount-weighted CLII Index</span>
        </div>

        <div className="glass-panel" style={{ padding: '20px' }}>
          <div className="flex-between" style={{ marginBottom: '12px' }}>
            <span style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', fontWeight: '600' }}>PROJECTED ATTRITION RATE</span>
            <AlertTriangle size={20} color={simulatedAttritionRisk > 50 ? 'var(--danger)' : simulatedAttritionRisk > 30 ? 'var(--accent)' : 'var(--secondary)'} />
          </div>
          <h3 style={{ 
            fontSize: '1.75rem', 
            fontWeight: '700',
            color: simulatedAttritionRisk > 50 ? 'var(--danger)' : simulatedAttritionRisk > 30 ? 'var(--accent)' : 'var(--secondary)'
          }}>{simulatedAttritionRisk}%</h3>
          <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>With current corrective hike</span>
        </div>

        <div className="glass-panel-accent" style={{ padding: '20px' }}>
          <div className="flex-between" style={{ marginBottom: '12px' }}>
            <span style={{ fontSize: '0.85rem', color: 'var(--secondary)', fontWeight: '700' }}>PREVENTED REPLACEMENT COSTS</span>
            <DollarSign size={20} color="var(--secondary)" />
          </div>
          <h3 style={{ fontSize: '1.75rem', fontWeight: '700', color: 'var(--secondary)' }}>
            ₹{(replacementSavings / 100000).toFixed(1)}L
          </h3>
          <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{employeesRetained} key talents retained</span>
        </div>
      </div>

      {/* Grid: Simulator & Attrition Graph */}
      <div style={{ display: 'grid', gridTemplateColumns: '7fr 5fr', gap: '30px', marginBottom: '32px' }}>
        
        {/* Module 1: Budget Simulator */}
        <div className="glass-panel" style={{ padding: '28px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '20px' }}>
            <Sliders size={22} color="var(--primary)" />
            <h2 style={{ fontSize: '1.35rem' }}>Dynamic Compensation Budget Simulator</h2>
          </div>
          
          <p style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', marginBottom: '24px' }}>
            Slide to adjust the <strong>Average Inflation-Adaptive Salary Correction Hike</strong>. 
            See the dynamic impact on workforce flight risk and bottom-line return on investment.
          </p>

          <div style={{ marginBottom: '28px' }}>
            <div className="flex-between">
              <span style={{ fontWeight: '600', fontSize: '0.95rem' }}>Salary Correction Hike %</span>
              <span style={{ color: 'var(--primary)', fontSize: '1.5rem', fontWeight: '800' }}>{hikePercentage}%</span>
            </div>
            <input 
              type="range" 
              min="0" 
              max="15" 
              step="0.5" 
              value={hikePercentage} 
              onChange={(e) => setHikePercentage(parseFloat(e.target.value))} 
            />
            <div className="flex-between" style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
              <span>0% (No adjustment)</span>
              <span>7.5% (Match core inflation)</span>
              <span>15% (Aggressive retention)</span>
            </div>
          </div>

          <div style={{ 
            backgroundColor: 'var(--bg-inner-dark)', 
            borderRadius: '12px', 
            padding: '20px',
            border: '1px solid var(--bg-inner-white-03)'
          }}>
            <h4 style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', marginBottom: '16px', letterSpacing: '0.05em', textTransform: 'uppercase' }}>Financial Implications</h4>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
              <div>
                <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)', display: 'block' }}>ADDITIONAL BUDGET SPENT</span>
                <span style={{ fontSize: '1.25rem', fontWeight: '700', color: 'var(--text-primary)' }}>
                  ₹{(additionalBudget / 100000).toFixed(2)} Lakhs
                </span>
              </div>
              <div>
                <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)', display: 'block' }}>REPLACEMENT COSTS PREVENTED</span>
                <span style={{ fontSize: '1.25rem', fontWeight: '700', color: 'var(--secondary)' }}>
                  ₹{(replacementSavings / 100000).toFixed(2)} Lakhs
                </span>
              </div>
              <div style={{ gridColumn: 'span 2', borderTop: '1px solid var(--border-white-06)', paddingTop: '16px' }}>
                <div className="flex-between">
                  <div>
                    <span style={{ fontSize: '0.82rem', color: 'var(--text-muted)', display: 'block' }}>NET RETENTION PAYBACK (ROI)</span>
                    <span style={{ 
                      fontSize: '1.4rem', 
                      fontWeight: '800', 
                      color: netSavings >= 0 ? 'var(--secondary)' : 'var(--danger)' 
                    }}>
                      {netSavings >= 0 ? '+' : ''}₹{(netSavings / 100000).toFixed(2)} Lakhs
                    </span>
                  </div>
                  {roiMultiplier > 0 && (
                    <div style={{ 
                      backgroundColor: 'var(--secondary-glow)', 
                      borderRadius: '8px', 
                      padding: '6px 12px', 
                      textAlign: 'right' 
                    }}>
                      <span style={{ fontSize: '0.75rem', color: 'var(--secondary)', display: 'block', fontWeight: '600' }}>ROI MULTIPLIER</span>
                      <span style={{ fontSize: '1.1rem', fontWeight: '800', color: 'var(--secondary)' }}>{roiMultiplier}x Saved</span>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Attrition Risk Curve Card */}
        <div className="glass-panel" style={{ padding: '28px', display: 'flex', flexDirection: 'column' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '16px' }}>
            <TrendingDown size={22} color="var(--danger)" />
            <h2 style={{ fontSize: '1.35rem' }}>Attrition Probability & Inflation Lag</h2>
          </div>
          <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: '20px' }}>
            Historical analysis shows a direct correlation between how long salaries remain stagnant (inflation lag) and Employee Flight Risk.
          </p>

          {/* HD SVG Attrition Curve Representation */}
          <div style={{ flex: 1, position: 'relative', marginTop: '10px' }}>
            <div style={{
              height: '160px',
              backgroundColor: 'var(--bg-inner-dark-light)',
              border: '1px solid var(--border-color)',
              borderRadius: '12px',
              position: 'relative',
              overflow: 'hidden',
              padding: '10px'
            }}>
              <svg width="100%" height="100%" viewBox="0 0 460 140" preserveAspectRatio="none" style={{ position: 'absolute', top: 0, left: 0 }}>
                <defs>
                  <linearGradient id="attritionFill" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="var(--danger)" stopOpacity="0.25" />
                    <stop offset="100%" stopColor="var(--danger)" stopOpacity="0.02" />
                  </linearGradient>
                </defs>
                
                {/* Horizontal Grid lines */}
                <line x1="0" y1="20" x2="460" y2="20" stroke="var(--border-white-05)" strokeWidth="1" strokeDasharray="3 3" />
                <line x1="0" y1="75" x2="460" y2="75" stroke="var(--border-white-05)" strokeWidth="1" strokeDasharray="3 3" />
                <line x1="0" y1="130" x2="460" y2="130" stroke="var(--border-white-05)" strokeWidth="1" />

                {/* Vertical segment markers */}
                <line x1="120" y1="10" x2="120" y2="130" stroke="var(--border-white-05)" strokeWidth="1" strokeDasharray="2 2" />
                <line x1="230" y1="10" x2="230" y2="130" stroke="var(--border-white-05)" strokeWidth="1" strokeDasharray="2 2" />
                <line x1="340" y1="10" x2="340" y2="130" stroke="var(--border-white-05)" strokeWidth="1" strokeDasharray="2 2" />

                {/* Filled Area under curve */}
                <path d={areaData} fill="url(#attritionFill)" />

                {/* Main Curve Line */}
                <path 
                  d={pathData} 
                  fill="none" 
                  stroke="var(--danger)" 
                  strokeWidth="3" 
                  strokeLinecap="round"
                  style={{ filter: 'drop-shadow(0 2px 8px var(--danger-glow))' }}
                />

                {/* Control points / circles */}
                <circle cx="10" cy={yVal(r0)} r="4" fill="var(--secondary)" />
                <circle cx="120" cy={yVal(r3)} r="4" fill="var(--secondary)" />
                <circle cx="230" cy={yVal(r6)} r="4" fill="var(--accent)" />
                <circle cx="340" cy={yVal(r9)} r="4" fill="var(--danger)" />
                <circle cx="450" cy={yVal(r12)} r="5" fill="var(--danger)" />
              </svg>
              
              {/* Text labels overlaid on key points */}
              <div style={{ position: 'absolute', top: `${yVal(r0) - 20}px`, left: '15px', fontSize: '0.65rem', color: 'var(--secondary)', fontWeight: '600' }}>0-3m ({r0}%)</div>
              <div style={{ position: 'absolute', top: `${yVal(r3) - 20}px`, left: '110px', fontSize: '0.65rem', color: 'var(--secondary)', fontWeight: '600' }}>4-6m ({r3}%)</div>
              <div style={{ position: 'absolute', top: `${yVal(r6) - 20}px`, left: '220px', fontSize: '0.65rem', color: 'var(--accent)', fontWeight: '600' }}>7-9m ({r6}%)</div>
              <div style={{ position: 'absolute', top: `${yVal(r12) - 20}px`, right: '15px', fontSize: '0.65rem', color: 'var(--danger)', fontWeight: '700' }}>10-12m ({r12}%)</div>
            </div>
            
            {/* Legend / Axis labels */}
            <div className="flex-between" style={{ marginTop: '8px', fontSize: '0.72rem', color: 'var(--text-muted)' }}>
              <span>Flat Pay (Lag 0m)</span>
              <span>Inflation Lag Scale (Months stagnant)</span>
              <span>Lag 12m+</span>
            </div>
          </div>
          
          <div style={{ 
            marginTop: '20px', 
            padding: '12px', 
            backgroundColor: 'var(--danger-glow)', 
            border: '1px dashed var(--border-color)',
            borderRadius: '8px',
            display: 'flex',
            gap: '8px',
            alignItems: 'center',
            fontSize: '0.78rem',
            color: 'var(--danger)'
          }}>
            <Info size={16} style={{ flexShrink: 0 }} />
            <span>Alert: Over 45% of your product engineering workforce currently resides in the High/Critical Attrition Zone due to local rent inflation.</span>
          </div>
        </div>
      </div>

      {/* Workforce Inflation Impact Heatmap (City level grid) */}
      <div className="glass-panel" style={{ padding: '28px', marginBottom: '32px' }}>
        <h3 style={{ fontSize: '1.35rem', marginBottom: '10px' }}>Workforce Inflation Impact Heatmap</h3>
        <p style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', marginBottom: '20px' }}>
          Breakdown of purchasing power erosion and employee flight risk across geographical offices.
        </p>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '20px' }}>
          {cities.map((city, idx) => (
            <div 
              key={idx} 
              style={{
                backgroundColor: 'var(--bg-inner-white-02)',
                border: '1px solid var(--border-color)',
                borderRadius: '12px',
                padding: '20px',
                position: 'relative',
                overflow: 'hidden'
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '14px' }}>
                <div>
                  <h4 style={{ fontSize: '1.1rem', fontWeight: '700' }}>{city.name}</h4>
                  <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>{city.employees} Employees</span>
                </div>
                <span 
                  className="heat-dot" 
                  style={{ color: city.color, backgroundColor: city.color }}
                ></span>
              </div>
              
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', fontSize: '0.82rem' }}>
                <div className="flex-between">
                  <span style={{ color: 'var(--text-muted)' }}>City Inflation (CLII)</span>
                  <span style={{ color: 'var(--danger)', fontWeight: '600' }}>{city.inflation}%</span>
                </div>
                <div className="flex-between">
                  <span style={{ color: 'var(--text-muted)' }}>Avg Annual Salary</span>
                  <span style={{ color: 'var(--text-primary)' }}>{city.avgSalary}</span>
                </div>
                <div className="flex-between">
                  <span style={{ color: 'var(--text-muted)' }}>Avg Purchasing Power Loss</span>
                  <span style={{ color: 'var(--danger)', fontWeight: '500' }}>-{city.gap}</span>
                </div>
                <div className="flex-between" style={{ borderTop: '1px solid var(--border-white-05)', paddingTop: '8px', marginTop: '4px' }}>
                  <span style={{ color: 'var(--text-muted)' }}>Local Threat Level</span>
                  <span style={{ color: city.color, fontWeight: '700', textTransform: 'uppercase', fontSize: '0.75rem' }}>{city.risk}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Module 3.5: AI Workforce Insight — Gemini narrates the risk data above */}
      <div className="glass-panel" style={{ padding: '28px', marginBottom: '32px' }}>
        <div className="flex-between" style={{ marginBottom: '12px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <Sparkles size={22} color="var(--primary)" />
            <h3 style={{ fontSize: '1.35rem' }}>AI Workforce Insight</h3>
          </div>
          <button
            onClick={generateInsight}
            disabled={aiLoading}
            style={{
              display: 'flex', alignItems: 'center', gap: '6px',
              padding: '8px 14px', borderRadius: '8px', border: '1px solid var(--primary)',
              backgroundColor: aiInsight ? 'var(--primary)' : 'var(--primary-glow)',
              color: aiInsight ? '#fff' : 'var(--primary)',
              fontSize: '0.8rem', fontWeight: '700', cursor: aiLoading ? 'not-allowed' : 'pointer',
              opacity: aiLoading ? 0.6 : 1
            }}
          >
            {aiLoading ? <Loader2 size={15} className="spin" /> : <Sparkles size={15} />}
            {aiLoading ? 'Analyzing...' : insightStale ? 'Re-analyze at new hike %' : aiInsight ? 'Re-analyze' : 'Explain this data with AI'}
          </button>
        </div>
        <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: '16px' }}>
          Gemini explains the biggest attrition/fairness risk driver from the live workforce data above — grounded in the exact numbers, no new math.
        </p>

        {aiError && (
          <div style={{
            display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '12px',
            padding: '10px 14px', borderRadius: '8px',
            backgroundColor: 'var(--danger-glow)', border: '1px solid var(--danger)',
            fontSize: '0.78rem', color: '#f87171'
          }}>
            <AlertTriangle size={15} style={{ flexShrink: 0 }} />
            <span>{aiError}</span>
          </div>
        )}

        {aiInsight ? (
          <div style={{
            padding: '16px', borderRadius: '10px',
            backgroundColor: 'var(--bg-inner-dark)', border: '1px solid var(--primary)',
            fontSize: '0.88rem', color: 'var(--text-secondary)', lineHeight: '1.6', whiteSpace: 'pre-wrap'
          }}>
            {insightStale && (
              <div style={{ color: 'var(--accent)', fontSize: '0.72rem', fontWeight: '700', marginBottom: '8px', textTransform: 'uppercase' }}>
                Slider moved since this was generated — click Re-analyze for a fresh read
              </div>
            )}
            {aiInsight}
          </div>
        ) : (
          <div style={{
            padding: '16px', borderRadius: '10px', textAlign: 'center',
            backgroundColor: 'var(--bg-inner-dark)', border: '1px dashed var(--border-color)',
            fontSize: '0.82rem', color: 'var(--text-muted)'
          }}>
            Click "Explain this data with AI" for a plain-English read on your biggest workforce risk right now.
          </div>
        )}
      </div>

      {/* Module 4: Fairness Audit */}
      <div className="glass-panel" style={{ padding: '28px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '16px' }}>
          <Award size={22} color="var(--secondary)" />
          <h3 style={{ fontSize: '1.35rem' }}>Enterprise Compensation Fairness Audit</h3>
        </div>
        <p style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', marginBottom: '20px' }}>
          Continuous analysis of workforce equity indices, detecting structural anomalies and correcting gender or tenure disparities.
        </p>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '20px' }}>
          <div style={{ backgroundColor: 'var(--bg-inner-white-02)', padding: '16px', borderRadius: '10px', border: '1px solid var(--border-color)' }}>
            <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)', display: 'block', marginBottom: '4px' }}>GENDER WAGE GAP</span>
            <div style={{ display: 'flex', alignItems: 'baseline', gap: '8px' }}>
              <span style={{ fontSize: '1.4rem', fontWeight: '700', color: 'var(--accent)' }}>{wf.genderGap.toFixed(1)}%</span>
              <span style={{ fontSize: '0.72rem', color: 'var(--text-secondary)' }}>Overall organizational disparity</span>
            </div>
            <div style={{ height: '4px', backgroundColor: 'var(--bg-inner-white-05)', borderRadius: '2px', marginTop: '8px', overflow: 'hidden' }}>
              <div style={{ width: `${100 - wf.genderGap}%`, height: '100%', backgroundColor: 'var(--accent)' }}></div>
            </div>
          </div>

          <div style={{ backgroundColor: 'var(--bg-inner-white-02)', padding: '16px', borderRadius: '10px', border: '1px solid var(--border-color)' }}>
            <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)', display: 'block', marginBottom: '4px' }}>TENURE EQUITY COEFFICIENT</span>
            <div style={{ display: 'flex', alignItems: 'baseline', gap: '8px' }}>
              <span style={{ fontSize: '1.4rem', fontWeight: '700', color: 'var(--secondary)' }}>{wf.tenureEquity.toFixed(0)}%</span>
              <span style={{ fontSize: '0.72rem', color: 'var(--text-secondary)' }}>Target threshold: &gt;95%</span>
            </div>
            <div style={{ height: '4px', backgroundColor: 'var(--bg-inner-white-05)', borderRadius: '2px', marginTop: '8px', overflow: 'hidden' }}>
              <div style={{ width: `${wf.tenureEquity}%`, height: '100%', backgroundColor: 'var(--secondary)' }}></div>
            </div>
          </div>

          <div style={{ backgroundColor: 'var(--bg-inner-white-02)', padding: '16px', borderRadius: '10px', border: '1px solid var(--border-color)' }}>
            <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)', display: 'block', marginBottom: '4px' }}>FAIRNESS REMEDIATION BUDGET</span>
            <div style={{ display: 'flex', alignItems: 'baseline', gap: '8px' }}>
              <span style={{ fontSize: '1.4rem', fontWeight: '700' }}>₹{(wf.remediationBudget / 100000).toFixed(1)} Lakhs</span>
              <span style={{ fontSize: '0.72rem', color: 'var(--text-secondary)' }}>Required to align outliers</span>
            </div>
            <button style={{
              background: 'transparent',
              border: 'none',
              color: 'var(--primary)',
              fontSize: '0.75rem',
              fontWeight: '600',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '4px',
              marginTop: '8px',
              padding: 0
            }}>
              Auto-Allocate Correction <ArrowUpRight size={14} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
