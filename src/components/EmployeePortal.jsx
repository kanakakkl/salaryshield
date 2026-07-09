import React, { useState } from 'react';
import {
  ShieldAlert,
  MapPin,
  BookOpen,
  Award,
  ChevronRight,
  ArrowUpRight,
  Copy,
  Check,
  Calculator,
  Compass,
  Wallet
} from 'lucide-react';
import { loadBudget, analyzeBudget, fmtINR } from '../lib/inflation';

export default function EmployeePortal() {
  const nominalSalary = 2500000; // ₹25.0 LPA (Priya's salary in Hyderabad)
  const localInflation = 8.4; // Hyderabad housing + food inflation
  const purchasingPowerLoss = Math.round(nominalSalary * (localInflation / 100));
  const realSalary = nominalSalary - purchasingPowerLoss;
  const realSalaryScore = (100 - localInflation).toFixed(1);

  // States
  const [selectedCity, setSelectedCity] = useState('Mumbai');
  const [addedSkills, setAddedSkills] = useState([]);
  const [copiedText, setCopiedText] = useState(false);
  const [negotiationTopic, setNegotiationTopic] = useState('email');

  // Simulator constants
  const cityMultipliers = {
    Mumbai: { name: 'Mumbai', rent: 1.45, inflation: 9.1, localLPA: 25.0 },
    Bengaluru: { name: 'Bengaluru', rent: 1.25, inflation: 7.9, localLPA: 25.0 },
    Pune: { name: 'Pune', rent: 0.85, inflation: 6.8, localLPA: 25.0 },
    Hyderabad: { name: 'Hyderabad', rent: 1.0, inflation: 8.4, localLPA: 25.0 }
  };

  // Skill database
  const skillsList = [
    { name: 'Generative AI & LLM Engineering', premium: 22, color: 'var(--primary)' },
    { name: 'Cloud Native / Kubernetes', premium: 15, color: '#3b82f6' },
    { name: 'Data Engineering & Kafka', premium: 12, color: 'var(--secondary)' },
    { name: 'MLOps & Pipeline Deployment', premium: 18, color: 'var(--accent)' }
  ];

  // Calculate simulated salary based on skills added
  const totalSkillPremiumPercent = addedSkills.reduce((sum, skillName) => {
    const skill = skillsList.find(s => s.name === skillName);
    return sum + (skill ? skill.premium : 0);
  }, 0);
  const simulatedSalary = nominalSalary * (1 + totalSkillPremiumPercent / 100);

  // Calculate equivalent cost of living salary
  const currentCityObj = cityMultipliers['Hyderabad'];
  const targetCityObj = cityMultipliers[selectedCity];
  // Cost factor relative to Hyderabad
  const rentCostDifference = ((targetCityObj.rent - currentCityObj.rent) * 100).toFixed(0);
  const inflationDifference = (targetCityObj.inflation - currentCityObj.inflation).toFixed(1);
  // Equivalent salary in target city to maintain Hyderabad purchasing power
  const equivalentTargetSalary = Math.round(nominalSalary * (targetCityObj.rent / currentCityObj.rent));

  // Toggle skills
  const toggleSkill = (skillName) => {
    if (addedSkills.includes(skillName)) {
      setAddedSkills(addedSkills.filter(s => s !== skillName));
    } else {
      setAddedSkills([...addedSkills, skillName]);
    }
  };

  // Pull the user's real budget (from the Budget Planner) so the negotiation
  // scripts cite their actual inflation impact instead of hardcoded figures.
  const [budget] = useState(() => loadBudget());
  const budgetA = analyzeBudget(budget);
  const negCity = budget.city;
  // Ask = inflation break-even + a market/performance premium.
  const recommendedAsk = Math.round((budgetA.breakEvenHike + 7) * 10) / 10;
  const targetLPA = (nominalSalary * (1 + recommendedAsk / 100)) / 100000;

  // Negotiation scripts (dynamically compiled from the live budget analysis)
  const scripts = {
    email: `Subject: Request for Annual Compensation Alignment Discussion — Priya Sharma

Dear [Manager's Name],

I am writing to formally request a brief meeting to discuss my current compensation and alignment with local market standards.

Over the past 12 months in ${negCity}, my personal cost of living has risen roughly ${budgetA.personalInflation.toFixed(1)}% — driven mainly by housing and essential expenses — eroding about ${fmtINR(budgetA.annualInflationTax)} of my annual take-home purchasing power. To simply preserve my current savings, a correction of ${budgetA.breakEvenHike.toFixed(1)}% would be required.

Given my recent contributions, including leading the tech development stack, and current market benchmarks, I would appreciate discussing an inflation-adaptive adjustment of ${recommendedAsk}% to align my salary to ₹${targetLPA.toFixed(1)} LPA. This correction matches local benchmarks and reflects my commitments.

Thank you for your guidance and support.

Sincerely,
Priya Sharma`,

    meeting: `1. Introduce the Economic Fact Sheet:
"Thank you for taking the time to meet, [Manager]. I want to focus on my salary's alignment with local economics. In ${negCity}, my personal cost inflation is running at ${budgetA.personalInflation.toFixed(1)}%, which is eroding roughly ${fmtINR(budgetA.annualInflationTax)} of my take-home each year."

2. Pivot to Performance & Market Value:
"Over the last year, I've successfully delivered our core services and expanded our stack. Looking at benchmark data from Glassdoor and Naukri, the market percentile for a Tech Lead with my skill premium is currently ₹${targetLPA.toFixed(1)} Lakhs."

3. Call to Action (The Inflation Guard request):
"Just to break even with inflation I'd need ${budgetA.breakEvenHike.toFixed(1)}%; factoring in my performance and market data, I'd love to explore adjusting my package to ₹${targetLPA.toFixed(1)} LPA. This correction would secure my financial parity and keep me fully focused on leading our engineering sprints."`
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText(scripts[negotiationTopic]);
    setCopiedText(true);
    setTimeout(() => setCopiedText(false), 2000);
  };

  return (
    <div className="animate-fade-in" style={{ padding: '30px 40px 30px 20px', marginLeft: 'calc(var(--sidebar-width) + 40px)', minHeight: '100vh' }}>
      
      {/* Top Header */}
      <div className="flex-between" style={{ marginBottom: '32px' }}>
        <div>
          <h1 style={{ fontSize: '2rem', fontWeight: '800', marginBottom: '6px' }}>Employee Financial Dashboard</h1>
          <p style={{ color: 'var(--text-secondary)' }}>Track your real earnings, simulate geographical moves, discover skill premiums, and plan your appraisals.</p>
        </div>
        <div style={{
          backgroundColor: 'var(--primary-glow)',
          border: '1px solid var(--border-color-hover)',
          borderRadius: '10px',
          padding: '8px 16px',
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
          fontSize: '0.88rem',
          color: 'var(--primary)'
        }}>
          <ShieldAlert size={16} />
          <span>Real Salary Protection: Alert (Erosion detected)</span>
        </div>
      </div>

      {/* Grid: Score Card & Skill Premium */}
      <div style={{ display: 'grid', gridTemplateColumns: '5fr 7fr', gap: '30px', marginBottom: '32px' }}>
        
        {/* Real Salary Scorecard */}
        <div className="glass-panel" style={{ padding: '28px', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', textAlign: 'center' }}>
          <h3 style={{ fontSize: '1.25rem', marginBottom: '8px', width: '100%', textAlign: 'left' }}>Real Salary Score Card</h3>
          <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: '24px', width: '100%', textAlign: 'left' }}>
            Nominal vs. Purchasing-Power Adjusted income based on Hyderabad's 8.4% inflation.
          </p>

          {/* Custom gauge using CSS variables */}
          <div style={{ 
            '--angle': `${-135 + (realSalaryScore / 100) * 270}deg`,
            '--needle-angle': `${-90 + (realSalaryScore / 100) * 180}deg`
          } } className="speedometer-container">
            <div className="speedometer-track"></div>
            <div className="speedometer-fill"></div>
            <div className="speedometer-needle"></div>
            <div className="speedometer-center"></div>
          </div>

          <div style={{ marginTop: '16px' }}>
            <span style={{ fontSize: '2rem', fontWeight: '800', display: 'block', lineHeight: 1 }}>{realSalaryScore}</span>
            <span style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', textTransform: 'uppercase', fontWeight: '600', letterSpacing: '0.05em' }}>Real Wage Index</span>
          </div>

          <div style={{ width: '100%', borderTop: '1px solid var(--border-white-06)', marginTop: '24px', paddingTop: '20px', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
            <div style={{ textAlign: 'left' }}>
              <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', display: 'block' }}>NOMINAL INCOME</span>
              <span style={{ fontSize: '1.2rem', fontWeight: '700' }}>₹25.0 Lakhs</span>
            </div>
            <div style={{ textAlign: 'right' }}>
              <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', display: 'block' }}>REAL INCOME (CLII Adj.)</span>
              <span style={{ fontSize: '1.2rem', fontWeight: '700', color: 'var(--danger)' }}>₹23.4 Lakhs</span>
            </div>
            <div style={{ gridColumn: 'span 2', textAlign: 'center', backgroundColor: 'var(--danger-glow)', padding: '10px', borderRadius: '8px', border: '1px solid var(--border-color)' }}>
              <span style={{ fontSize: '0.8rem', color: '#f87171', display: 'block' }}>
                Annual Purchasing Power Lost: <strong>₹{purchasingPowerLoss.toLocaleString('en-IN')}</strong>
              </span>
            </div>
          </div>
        </div>

        {/* Skill Recommendation Engine */}
        <div className="glass-panel" style={{ padding: '28px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <BookOpen size={20} color="var(--primary)" />
              <h3 style={{ fontSize: '1.25rem' }}>Inflation-Resilient Skill Premium Engine</h3>
            </div>
            {addedSkills.length > 0 && (
              <span style={{ fontSize: '0.75rem', color: 'var(--secondary)', fontWeight: '600', backgroundColor: 'var(--secondary-glow)', padding: '4px 8px', borderRadius: '6px' }}>
                +{totalSkillPremiumPercent}% Premium Active
              </span>
            )}
          </div>
          <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: '16px' }}>
            Select skills to simulate upskilling. See the estimated bump in your market value to offset inflation erosion.
          </p>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginBottom: '20px' }}>
            {skillsList.map((skill, idx) => {
              const isSelected = addedSkills.includes(skill.name);
              return (
                <div 
                  key={idx}
                  onClick={() => toggleSkill(skill.name)}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '12px 16px',
                    borderRadius: '10px',
                    backgroundColor: isSelected ? 'var(--primary-glow)' : 'var(--bg-inner-white-01)',
                    border: isSelected ? '1px solid var(--border-color-hover)' : '1px solid var(--border-color)',
                    cursor: 'pointer',
                    transition: 'all 0.2s ease'
                  }}
                  onMouseEnter={(e) => {
                    if (!isSelected) e.currentTarget.style.borderColor = 'var(--border-white-15)';
                  }}
                  onMouseLeave={(e) => {
                    if (!isSelected) e.currentTarget.style.borderColor = 'var(--border-color)';
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <div style={{
                      width: '6px',
                      height: '6px',
                      borderRadius: '50%',
                      backgroundColor: skill.color
                    }} />
                    <span style={{ fontSize: '0.9rem', fontWeight: '500' }}>{skill.name}</span>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <span style={{ fontSize: '0.82rem', color: isSelected ? 'var(--primary)' : 'var(--text-secondary)', fontWeight: '600' }}>
                      +{skill.premium}% Hike Premium
                    </span>
                    <div style={{
                      width: '18px',
                      height: '18px',
                      borderRadius: '4px',
                      border: '1px solid var(--text-muted)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      backgroundColor: isSelected ? 'var(--primary)' : 'transparent',
                      borderColor: isSelected ? 'var(--primary)' : 'var(--text-muted)'
                    }}>
                      {isSelected && <span style={{ color: 'white', fontSize: '0.65rem', fontWeight: 'bold' }}>✓</span>}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          <div style={{ borderTop: '1px solid var(--border-white-06)', paddingTop: '16px' }} className="flex-between">
            <div>
              <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', display: 'block' }}>SIMULATED MARKET VALUE</span>
              <span style={{ fontSize: '1.25rem', fontWeight: '800', color: totalSkillPremiumPercent > 0 ? 'var(--secondary)' : 'var(--text-primary)' }}>
                ₹{(simulatedSalary / 100000).toFixed(1)} LPA
              </span>
            </div>
            {totalSkillPremiumPercent > 0 && (
              <span style={{ fontSize: '0.75rem', color: 'var(--secondary)', fontWeight: '500' }}>
                Offsets inflation by {((totalSkillPremiumPercent / localInflation) * 100).toFixed(0)}%
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Grid: Move Simulator & Script Coach */}
      <div style={{ display: 'grid', gridTemplateColumns: '6fr 6fr', gap: '30px' }}>
        
        {/* Career Move Cost-of-Living Simulator */}
        <div className="glass-panel" style={{ padding: '28px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '16px' }}>
            <Compass size={20} color="var(--accent)" />
            <h3 style={{ fontSize: '1.25rem' }}>Geographical Cost-of-Living Simulator</h3>
          </div>
          <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: '20px' }}>
            Planning a transfer or job change? Calculate the real income equivalent required in your target city to maintain Hyderabad standards.
          </p>

          <div style={{ display: 'flex', gap: '16px', marginBottom: '24px' }}>
            <div style={{ flex: 1 }}>
              <label style={{ fontSize: '0.78rem', color: 'var(--text-muted)', display: 'block', marginBottom: '6px' }}>CURRENT CITY</label>
              <div style={{ padding: '10px 14px', borderRadius: '8px', backgroundColor: 'var(--bg-inner-dark)', border: '1px solid var(--border-color)', fontSize: '0.9rem', color: 'var(--text-secondary)' }}>
                Hyderabad
              </div>
            </div>
            <div style={{ flex: 1 }}>
              <label style={{ fontSize: '0.78rem', color: 'var(--text-muted)', display: 'block', marginBottom: '6px' }}>TARGET CITY</label>
              <select 
                value={selectedCity} 
                onChange={(e) => setSelectedCity(e.target.value)}
                style={{
                  width: '100%',
                  padding: '10px 14px',
                  borderRadius: '8px',
                  backgroundColor: 'var(--bg-secondary)',
                  border: '1px solid var(--border-color)',
                  color: 'var(--text-primary)',
                  fontSize: '0.9rem',
                  outline: 'none',
                  cursor: 'pointer'
                }}
              >
                <option value="Mumbai">Mumbai</option>
                <option value="Bengaluru">Bengaluru</option>
                <option value="Pune">Pune</option>
              </select>
            </div>
          </div>

          <div style={{ backgroundColor: 'var(--bg-inner-dark-light)', borderRadius: '10px', padding: '16px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
            <div className="flex-between" style={{ fontSize: '0.82rem' }}>
              <span style={{ color: 'var(--text-secondary)' }}>Rent / Living Index Difference</span>
              <span style={{ color: rentCostDifference > 0 ? 'var(--danger)' : 'var(--secondary)', fontWeight: '600' }}>
                {rentCostDifference > 0 ? `+${rentCostDifference}% costlier` : `${rentCostDifference}% cheaper`}
              </span>
            </div>
            <div className="flex-between" style={{ fontSize: '0.82rem' }}>
              <span style={{ color: 'var(--text-secondary)' }}>Core Inflation Rate Gap</span>
              <span style={{ color: inflationDifference > 0 ? 'var(--danger)' : 'var(--secondary)', fontWeight: '600' }}>
                {inflationDifference > 0 ? `+${inflationDifference}% higher` : `${inflationDifference}% lower`}
              </span>
            </div>
            <div className="flex-between" style={{ borderTop: '1px solid var(--border-white-06)', paddingTop: '12px', marginTop: '4px' }}>
              <div>
                <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', display: 'block' }}>EQUIVALENT SALARY IN {selectedCity.toUpperCase()}</span>
                <span style={{ fontSize: '1.2rem', fontWeight: '800', color: 'var(--accent)' }}>
                  ₹{(equivalentTargetSalary / 100000).toFixed(1)} LPA
                </span>
              </div>
              <div style={{ textAlign: 'right' }}>
                <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)', display: 'block' }}>NOMINAL VARIANCE</span>
                <span style={{ fontSize: '0.88rem', color: equivalentTargetSalary > nominalSalary ? 'var(--danger)' : 'var(--secondary)', fontWeight: '700' }}>
                  {equivalentTargetSalary > nominalSalary ? `+₹${((equivalentTargetSalary - nominalSalary)/100000).toFixed(1)}L` : `-₹${((nominalSalary - equivalentTargetSalary)/100000).toFixed(1)}L`}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* AI Negotiation Coach / Scripts */}
        <div className="glass-panel" style={{ padding: '28px', display: 'flex', flexDirection: 'column' }}>
          <div className="flex-between" style={{ marginBottom: '16px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Award size={20} color="var(--primary)" />
              <h3 style={{ fontSize: '1.25rem' }}>AI Negotiation Script Coach</h3>
            </div>
            <div style={{ display: 'flex', gap: '4px' }}>
              <button 
                onClick={() => setNegotiationTopic('email')}
                style={{
                  padding: '4px 10px',
                  borderRadius: '6px',
                  border: 'none',
                  fontSize: '0.72rem',
                  fontWeight: '600',
                  cursor: 'pointer',
                  backgroundColor: negotiationTopic === 'email' ? 'var(--primary)' : 'var(--bg-inner-white-03)',
                  color: negotiationTopic === 'email' ? '#fff' : 'var(--text-secondary)'
                }}
              >
                Written Email
              </button>
              <button 
                onClick={() => setNegotiationTopic('meeting')}
                style={{
                  padding: '4px 10px',
                  borderRadius: '6px',
                  border: 'none',
                  fontSize: '0.72rem',
                  fontWeight: '600',
                  cursor: 'pointer',
                  backgroundColor: negotiationTopic === 'meeting' ? 'var(--primary)' : 'var(--bg-inner-white-03)',
                  color: negotiationTopic === 'meeting' ? '#fff' : 'var(--text-secondary)'
                }}
              >
                In-Person Pitch
              </button>
            </div>
          </div>

          <div style={{
            display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '12px',
            padding: '8px 12px', borderRadius: '8px',
            backgroundColor: 'var(--primary-glow)', border: '1px solid var(--border-color-hover)',
            fontSize: '0.75rem', color: 'var(--text-secondary)'
          }}>
            <Wallet size={14} color="var(--primary)" style={{ flexShrink: 0 }} />
            <span>Live from your <strong style={{ color: 'var(--primary)' }}>Budget Planner</strong> — {negCity}: personal inflation {budgetA.personalInflation.toFixed(1)}%, break-even +{budgetA.breakEvenHike.toFixed(1)}%.</span>
          </div>

          <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: '14px' }}>
            Copy-paste this dynamically compiled pitch structure to back up your case during your upcoming appraisal reviews.
          </p>

          <div style={{
            flex: 1,
            backgroundColor: 'var(--bg-inner-dark)',
            border: '1px solid var(--border-color)',
            borderRadius: '8px',
            padding: '16px',
            fontSize: '0.82rem',
            color: 'var(--text-secondary)',
            fontFamily: 'monospace',
            whiteSpace: 'pre-wrap',
            maxHeight: '180px',
            overflowY: 'auto',
            marginBottom: '16px'
          }}>
            {scripts[negotiationTopic]}
          </div>

          <button 
            onClick={copyToClipboard}
            className="btn btn-secondary"
            style={{ width: '100%', justifyContent: 'center' }}
          >
            {copiedText ? (
              <>
                <Check size={16} color="var(--secondary)" />
                <span>Copied to Clipboard!</span>
              </>
            ) : (
              <>
                <Copy size={16} />
                <span>Copy Negotiation Script</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
