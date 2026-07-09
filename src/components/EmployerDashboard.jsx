import React, { useState } from 'react';
import { 
  Users, 
  TrendingDown, 
  DollarSign, 
  ShieldCheck, 
  ArrowUpRight, 
  AlertTriangle,
  Info,
  Sliders,
  Award
} from 'lucide-react';

export default function EmployerDashboard() {
  // Budget Simulator state
  const [hikePercentage, setHikePercentage] = useState(3.5);

  // Workforce constants for simulation
  const employeeCount = 250;
  const avgSalary = 1500000; // 15 LPA
  const annualPayroll = employeeCount * avgSalary; // 37.5 Crores
  const baseAttritionRisk = 74; // Attrition risk at 0% correction
  
  // Dynamic formulas
  // Attrition Risk drops as hike increases
  const simulatedAttritionRisk = Math.max(18, Math.round(baseAttritionRisk - hikePercentage * 4.5));
  
  // Budget needed
  const additionalBudget = (annualPayroll * (hikePercentage / 100));
  
  // Attrition prevented
  const baseAttrits = Math.round(employeeCount * (baseAttritionRisk / 100));
  const newAttrits = Math.round(employeeCount * (simulatedAttritionRisk / 100));
  const employeesRetained = Math.max(0, baseAttrits - newAttrits);
  
  // Savings: Replacement cost is estimated at 1.5x of annual salary per employee
  const replacementCostPerEmp = avgSalary * 1.5;
  const replacementSavings = employeesRetained * replacementCostPerEmp;
  
  // Net ROI
  const netSavings = replacementSavings - additionalBudget;
  const roiMultiplier = additionalBudget > 0 ? (replacementSavings / additionalBudget).toFixed(1) : 0;

  // City Data for Heatmap
  const cities = [
    { name: 'Hyderabad', employees: 85, inflation: 8.4, avgSalary: '16.5 LPA', gap: '₹1.8L', risk: 'High', color: '#ef4444' },
    { name: 'Bengaluru', employees: 98, inflation: 7.9, avgSalary: '18.2 LPA', gap: '₹1.6L', risk: 'High', color: '#ef4444' },
    { name: 'Mumbai', employees: 32, inflation: 9.1, avgSalary: '19.5 LPA', gap: '₹2.1L', risk: 'Critical', color: '#dc2626' },
    { name: 'Pune', employees: 35, inflation: 6.8, avgSalary: '14.0 LPA', gap: '₹1.2L', risk: 'Medium', color: '#f59e0b' }
  ];

  return (
    <div className="animate-fade-in" style={{ padding: '30px 40px', marginLeft: 'var(--sidebar-width)', minHeight: '100vh' }}>
      
      {/* Top Header */}
      <div className="flex-between" style={{ marginBottom: '32px' }}>
        <div>
          <h1 style={{ fontSize: '2rem', fontWeight: '800', marginBottom: '6px' }}>Employer Intelligence Console</h1>
          <p style={{ color: 'var(--text-secondary)' }}>Workforce compensation analysis, real-time inflation tracking & attrition risk modeling.</p>
        </div>
        <div style={{
          backgroundColor: 'rgba(16, 185, 129, 0.1)',
          border: '1px solid rgba(16, 185, 129, 0.2)',
          borderRadius: '10px',
          padding: '8px 16px',
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
          fontSize: '0.88rem',
          color: 'var(--secondary)'
        }}>
          <ShieldCheck size={16} />
          <span>Fair Pay Audit Status: Active & Optimizing</span>
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
          <h3 style={{ fontSize: '1.75rem', fontWeight: '700', color: 'var(--danger)' }}>8.05%</h3>
          <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Weighted CLII Index</span>
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
            backgroundColor: 'rgba(0,0,0,0.2)', 
            borderRadius: '12px', 
            padding: '20px',
            border: '1px solid rgba(255,255,255,0.03)'
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
              <div style={{ gridColumn: 'span 2', borderTop: '1px solid rgba(255,255,255,0.06)', paddingTop: '16px' }}>
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
                      backgroundColor: 'rgba(16, 185, 129, 0.1)', 
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

          {/* CSS Chart representing Lag vs Risk */}
          <div style={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'space-between', gap: '12px' }}>
            <div>
              <div className="flex-between" style={{ fontSize: '0.8rem', marginBottom: '4px' }}>
                <span style={{ color: 'var(--text-secondary)' }}>0-3 Months Lag (Normal)</span>
                <span style={{ color: 'var(--secondary)', fontWeight: '600' }}>18% Risk</span>
              </div>
              <div style={{ height: '8px', backgroundColor: 'rgba(255,255,255,0.05)', borderRadius: '4px', overflow: 'hidden' }}>
                <div style={{ width: '18%', height: '100%', backgroundColor: 'var(--secondary)' }}></div>
              </div>
            </div>

            <div>
              <div className="flex-between" style={{ fontSize: '0.8rem', marginBottom: '4px' }}>
                <span style={{ color: 'var(--text-secondary)' }}>4-6 Months Lag (Acceptable)</span>
                <span style={{ color: 'var(--accent)', fontWeight: '600' }}>35% Risk</span>
              </div>
              <div style={{ height: '8px', backgroundColor: 'rgba(255,255,255,0.05)', borderRadius: '4px', overflow: 'hidden' }}>
                <div style={{ width: '35%', height: '100%', backgroundColor: 'var(--accent)' }}></div>
              </div>
            </div>

            <div>
              <div className="flex-between" style={{ fontSize: '0.8rem', marginBottom: '4px' }}>
                <span style={{ color: 'var(--text-secondary)' }}>7-9 Months Lag (High Attrition Zone)</span>
                <span style={{ color: 'var(--danger)', fontWeight: '600' }}>58% Risk</span>
              </div>
              <div style={{ height: '8px', backgroundColor: 'rgba(255,255,255,0.05)', borderRadius: '4px', overflow: 'hidden' }}>
                <div style={{ width: '58%', height: '100%', backgroundColor: 'var(--danger)' }}></div>
              </div>
            </div>

            <div>
              <div className="flex-between" style={{ fontSize: '0.8rem', marginBottom: '4px' }}>
                <span style={{ color: 'var(--text-secondary)' }}>10-12+ Months Lag (Critical Threat)</span>
                <span style={{ color: 'var(--danger)', fontWeight: '600', textShadow: '0 0 5px var(--danger)' }}>74% Risk</span>
              </div>
              <div style={{ height: '8px', backgroundColor: 'rgba(255,255,255,0.05)', borderRadius: '4px', overflow: 'hidden' }}>
                <div style={{ width: '74%', height: '100%', backgroundColor: '#dc2626' }}></div>
              </div>
            </div>
          </div>
          
          <div style={{ 
            marginTop: '20px', 
            padding: '12px', 
            backgroundColor: 'rgba(239, 68, 68, 0.05)', 
            border: '1px dashed rgba(239, 68, 68, 0.2)',
            borderRadius: '8px',
            display: 'flex',
            gap: '8px',
            alignItems: 'center',
            fontSize: '0.78rem',
            color: '#f87171'
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
                backgroundColor: 'rgba(255,255,255,0.02)',
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
                <div className="flex-between" style={{ borderTop: '1px solid rgba(255,255,255,0.05)', paddingTop: '8px', marginTop: '4px' }}>
                  <span style={{ color: 'var(--text-muted)' }}>Local Threat Level</span>
                  <span style={{ color: city.color, fontWeight: '700', textTransform: 'uppercase', fontSize: '0.75rem' }}>{city.risk}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
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
          <div style={{ backgroundColor: 'rgba(255,255,255,0.02)', padding: '16px', borderRadius: '10px', border: '1px solid var(--border-color)' }}>
            <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)', display: 'block', marginBottom: '4px' }}>GENDER WAGE GAP</span>
            <div style={{ display: 'flex', alignItems: 'baseline', gap: '8px' }}>
              <span style={{ fontSize: '1.4rem', fontWeight: '700', color: 'var(--accent)' }}>5.7%</span>
              <span style={{ fontSize: '0.72rem', color: 'var(--text-secondary)' }}>Male: ₹15.8L vs Female: ₹14.9L</span>
            </div>
            <div style={{ height: '4px', backgroundColor: 'rgba(255,255,255,0.05)', borderRadius: '2px', marginTop: '8px', overflow: 'hidden' }}>
              <div style={{ width: '94.3%', height: '100%', backgroundColor: 'var(--accent)' }}></div>
            </div>
          </div>

          <div style={{ backgroundColor: 'rgba(255,255,255,0.02)', padding: '16px', borderRadius: '10px', border: '1px solid var(--border-color)' }}>
            <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)', display: 'block', marginBottom: '4px' }}>TENURE EQUITY COEFFICIENT</span>
            <div style={{ display: 'flex', alignItems: 'baseline', gap: '8px' }}>
              <span style={{ fontSize: '1.4rem', fontWeight: '700', color: 'var(--secondary)' }}>92%</span>
              <span style={{ fontSize: '0.72rem', color: 'var(--text-secondary)' }}>Target threshold: &gt;95%</span>
            </div>
            <div style={{ height: '4px', backgroundColor: 'rgba(255,255,255,0.05)', borderRadius: '2px', marginTop: '8px', overflow: 'hidden' }}>
              <div style={{ width: '92%', height: '100%', backgroundColor: 'var(--secondary)' }}></div>
            </div>
          </div>

          <div style={{ backgroundColor: 'rgba(255,255,255,0.02)', padding: '16px', borderRadius: '10px', border: '1px solid var(--border-color)' }}>
            <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)', display: 'block', marginBottom: '4px' }}>FAIRNESS REMEDIATION BUDGET</span>
            <div style={{ display: 'flex', alignItems: 'baseline', gap: '8px' }}>
              <span style={{ fontSize: '1.4rem', fontWeight: '700' }}>₹12.4 Lakhs</span>
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
