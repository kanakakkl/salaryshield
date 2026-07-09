import React, { useState, useEffect } from 'react';
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
  Wallet,
  Sparkles,
  Loader2,
  AlertTriangle
} from 'lucide-react';
import { loadBudget, analyzeBudget, fmtINR, cliiData } from '../lib/inflation';
import { generateNegotiationScript } from '../lib/llm';

const DYNAMIC_SKILLS_DATABASE = {
  'Tech Lead': {
    'Web (JS/TS/React)': [
      { name: 'System Architecture & NextJS', premium: 18, color: 'var(--primary)', certifications: ['Vercel Certified Developer', 'AWS Solutions Architect Associate'] },
      { name: 'Micro-Frontend & Module Federation', premium: 16, color: '#3b82f6', certifications: ['StateOfJS Advanced React Architect', 'Webpack Specialist'] },
      { name: 'GenAI Engineering & LLM Integration', premium: 22, color: 'var(--secondary)', certifications: ['DeepLearning.AI GenAI Certification'] },
      { name: 'CI/CD & Cloud Infrastructure', premium: 14, color: 'var(--accent)', certifications: ['Terraform Associate', 'GitHub Actions Specialist'] }
    ],
    'Data & AI (Python/PyTorch)': [
      { name: 'Generative AI & LLM Engineering', premium: 22, color: 'var(--primary)', certifications: ['DeepLearning.AI GenAI Certification', 'Google Cloud Professional ML Engineer'] },
      { name: 'MLOps & Pipeline Deployment', premium: 18, color: '#3b82f6', certifications: ['AWS Machine Learning Specialty', 'Databricks Certified Machine Learning Associate'] },
      { name: 'Data Engineering & Kafka', premium: 12, color: 'var(--secondary)', certifications: ['Confluent Certified Developer for Apache Kafka (CCDAK)', 'GCP Professional Data Engineer'] },
      { name: 'Distributed Computing (Spark/Ray)', premium: 15, color: 'var(--accent)', certifications: ['Databricks Certified Associate Developer'] }
    ],
    'Cloud Native (Go/Rust/K8s)': [
      { name: 'Cloud Native / Kubernetes', premium: 15, color: 'var(--primary)', certifications: ['CKA (Certified Kubernetes Administrator)', 'AWS Solutions Architect Professional'] },
      { name: 'Distributed Systems in Go', premium: 18, color: '#3b82f6', certifications: ['Google Developer Go Specialist'] },
      { name: 'Service Mesh & Istio Security', premium: 14, color: 'var(--secondary)', certifications: ['HashiCorp Certified Vault Associate'] },
      { name: 'GitOps & ArgoCD Pipelines', premium: 12, color: 'var(--accent)', certifications: ['GitOps Certified Associate'] }
    ],
    'Enterprise Java/Spring': [
      { name: 'Spring Cloud & Microservices', premium: 14, color: 'var(--primary)', certifications: ['Spring Professional Certification'] },
      { name: 'Reactive Programming & WebFlux', premium: 12, color: '#3b82f6', certifications: ['Oracle Certified Java Professional'] },
      { name: 'Enterprise Security & OAuth2', premium: 15, color: 'var(--secondary)', certifications: ['CISSP Associate'] },
      { name: 'Cloud Native Java (AWS)', premium: 18, color: 'var(--accent)', certifications: ['AWS Developer Associate'] }
    ]
  },
  'Data Scientist': {
    'Data & AI (Python/PyTorch)': [
      { name: 'Deep Learning & PyTorch', premium: 20, color: 'var(--primary)', certifications: ['DeepLearning.AI Deep Learning Specialization'] },
      { name: 'MLOps & Pipeline Deployment', premium: 18, color: '#3b82f6', certifications: ['AWS Machine Learning Specialty'] },
      { name: 'NLP & Transformer Models', premium: 22, color: 'var(--secondary)', certifications: ['Hugging Face NLP Specialist'] },
      { name: 'Big Data & PySpark', premium: 14, color: 'var(--accent)', certifications: ['Databricks Certified ML Professional'] }
    ]
  },
  'Cloud/DevOps Engineer': {
    'Cloud Native (Go/Rust/K8s)': [
      { name: 'Multi-Cloud Infrastructure (IaC)', premium: 18, color: 'var(--primary)', certifications: ['HashiCorp Certified Terraform Professional'] },
      { name: 'Kubernetes Security (CKS)', premium: 20, color: '#3b82f6', certifications: ['CKS (Certified Kubernetes Security Specialist)'] },
      { name: 'SRE & Prometheus Monitoring', premium: 12, color: 'var(--secondary)', certifications: ['Prometheus Certified Associate'] },
      { name: 'AWS / GCP Solutions Professional', premium: 15, color: 'var(--accent)', certifications: ['AWS Certified Solutions Architect - Professional'] }
    ]
  },
  'Fullstack Developer': {
    'Web (JS/TS/React)': [
      { name: 'TypeScript & NextJS SSR', premium: 12, color: 'var(--primary)', certifications: ['Vercel Certified NextJS Developer'] },
      { name: 'NodeJS Microservices', premium: 14, color: '#3b82f6', certifications: ['OpenJS Node.js Application Developer'] },
      { name: 'GraphQL & Apollo Federation', premium: 10, color: 'var(--secondary)', certifications: ['Apollo GraphQL Professional'] },
      { name: 'AWS Serverless (Lambda/Dynamo)', premium: 15, color: 'var(--accent)', certifications: ['AWS Certified Developer'] }
    ]
  },
  'Engineering Manager': {
    'Management & Strategy': [
      { name: 'System Design & High Scale', premium: 15, color: 'var(--primary)', certifications: ['AWS Certified Solutions Architect', 'GCP Professional Cloud Architect'] },
      { name: 'Agile Delivery & Scrum', premium: 12, color: '#3b82f6', certifications: ['PMI-ACP (Agile Practitioner)', 'CSM (Certified ScrumMaster)'] },
      { name: 'People Leadership & Executive Strategy', premium: 20, color: 'var(--secondary)', certifications: ['Oxford Executive Leadership Programme', 'HBR Leadership Academy'] },
      { name: 'Product Management & Execution', premium: 14, color: 'var(--accent)', certifications: ['Pragmatic Certified Product Manager', 'Product School PM Certificate'] }
    ]
  }
};

export default function EmployeePortal() {
  // Pull the employee's salary dynamically from the loaded budget
  const [nominalSalary, setNominalSalary] = useState(() => {
    const b = loadBudget();
    return b.nominalSalary || 2500000;
  });
  const [homeCity, setHomeCity] = useState(() => loadBudget().city || 'Hyderabad');

  // Local inflation now tracks the city set in the Budget Planner, instead of
  // being pinned to Hyderabad regardless of where the user actually lives.
  const localInflation = (cliiData[homeCity] || cliiData.Hyderabad).total;
  const purchasingPowerLoss = Math.round(nominalSalary * (localInflation / 100));
  const realSalary = nominalSalary - purchasingPowerLoss;
  const realSalaryScore = (100 - localInflation).toFixed(1);

  // Pull the employer's hike percentage from the simulator
  const [employerHike, setEmployerHike] = useState(() => {
    const val = localStorage.getItem('salaryshield_employer_hike');
    return val ? parseFloat(val) : 3.5;
  });

  // Sync state variables dynamically from localStorage
  useEffect(() => {
    const syncState = () => {
      const val = localStorage.getItem('salaryshield_employer_hike');
      if (val) setEmployerHike(parseFloat(val));
      
      const b = loadBudget();
      if (b.nominalSalary) setNominalSalary(b.nominalSalary);
      if (b.city) setHomeCity(b.city);
    };
    syncState();
    const id = setInterval(syncState, 1000);
    return () => clearInterval(id);
  }, []);

  // States
  const [selectedCity, setSelectedCity] = useState('Mumbai');
  const [addedSkills, setAddedSkills] = useState([]);
  const [copiedText, setCopiedText] = useState(false);
  const [negotiationTopic, setNegotiationTopic] = useState('email');

  const [role, setRole] = useState(() => localStorage.getItem('salaryshield_user_role') || 'Tech Lead');
  const [techStack, setTechStack] = useState(() => localStorage.getItem('salaryshield_user_techstack') || 'Web (JS/TS/React)');

  const handleRoleChange = (newRole) => {
    setRole(newRole);
    setAddedSkills([]);
    localStorage.setItem('salaryshield_user_role', newRole);
    
    const stacks = Object.keys(DYNAMIC_SKILLS_DATABASE[newRole] || {});
    if (stacks.length > 0) {
      // If current techStack is not supported by new role, switch to default
      if (!stacks.includes(techStack)) {
        setTechStack(stacks[0]);
        localStorage.setItem('salaryshield_user_techstack', stacks[0]);
      }
    }
  };

  const handleTechStackChange = (newStack) => {
    setTechStack(newStack);
    setAddedSkills([]);
    localStorage.setItem('salaryshield_user_techstack', newStack);
  };

  // Simulator constants
  const cityMultipliers = {
    Mumbai: { name: 'Mumbai', rent: 1.45, inflation: 9.1, localLPA: 25.0 },
    Bengaluru: { name: 'Bengaluru', rent: 1.25, inflation: 7.9, localLPA: 25.0 },
    Pune: { name: 'Pune', rent: 0.85, inflation: 6.8, localLPA: 25.0 },
    Hyderabad: { name: 'Hyderabad', rent: 1.0, inflation: 8.4, localLPA: 25.0 }
  };

  // Resolve skill database dynamically
  const skillsList = DYNAMIC_SKILLS_DATABASE[role]?.[techStack] || 
                     (DYNAMIC_SKILLS_DATABASE[role] ? Object.values(DYNAMIC_SKILLS_DATABASE[role])[0] : []) || [];

  // Calculate simulated salary based on skills added
  const totalSkillPremiumPercent = addedSkills.reduce((sum, skillName) => {
    const skill = skillsList.find(s => s.name === skillName);
    return sum + (skill ? skill.premium : 0);
  }, 0);
  const simulatedSalary = nominalSalary * (1 + totalSkillPremiumPercent / 100);

  // Calculate equivalent cost of living salary (relative to the user's home city)
  const currentCityObj = cityMultipliers[homeCity] || cityMultipliers.Hyderabad;
  const targetCityObj = cityMultipliers[selectedCity];
  // Cost factor relative to the home city
  const rentCostDifference = ((targetCityObj.rent - currentCityObj.rent) * 100).toFixed(0);
  const inflationDifference = (targetCityObj.inflation - currentCityObj.inflation).toFixed(1);
  // Equivalent salary in target city to maintain home-city purchasing power
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
    navigator.clipboard.writeText(displayedScript);
    setCopiedText(true);
    setTimeout(() => setCopiedText(false), 2000);
  };

  // AI-generated negotiation script (Gemini) — an alternative to the static
  // template, written fresh by the model but grounded in the same live data.
  const [aiScripts, setAiScripts] = useState({});
  const [aiLoading, setAiLoading] = useState(false);
  const [aiError, setAiError] = useState(null);

  const generateWithAI = async () => {
    setAiLoading(true);
    setAiError(null);
    try {
      const text = await generateNegotiationScript(budget, negotiationTopic, 'confident');
      setAiScripts((prev) => ({ ...prev, [negotiationTopic]: text }));
    } catch (err) {
      setAiError(err.message);
    } finally {
      setAiLoading(false);
    }
  };

  const displayedScript = aiScripts[negotiationTopic] || scripts[negotiationTopic];

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
            Nominal vs. Purchasing-Power Adjusted income based on {homeCity}'s {localInflation}% inflation.
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
              <span style={{ fontSize: '1.2rem', fontWeight: '700' }}>₹{(nominalSalary / 100000).toFixed(1)} Lakhs</span>
            </div>
            <div style={{ textAlign: 'right' }}>
              <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', display: 'block' }}>REAL INCOME (CLII Adj.)</span>
              <span style={{ fontSize: '1.2rem', fontWeight: '700', color: 'var(--danger)' }}>₹{(realSalary / 100000).toFixed(1)} Lakhs</span>
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

          {/* Role & Tech Stack Selectors */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '20px' }}>
            <div>
              <label style={{ fontSize: '0.72rem', color: 'var(--text-muted)', display: 'block', marginBottom: '6px', fontWeight: '600', textTransform: 'uppercase' }}>Select Your Role</label>
              <select
                value={role}
                onChange={(e) => handleRoleChange(e.target.value)}
                style={{
                  width: '100%',
                  padding: '10px 12px',
                  borderRadius: '8px',
                  backgroundColor: 'var(--bg-secondary)',
                  border: '1px solid var(--border-color)',
                  color: 'var(--text-primary)',
                  fontSize: '0.85rem',
                  fontWeight: '600',
                  outline: 'none',
                  cursor: 'pointer'
                }}
              >
                {Object.keys(DYNAMIC_SKILLS_DATABASE).map((r) => (
                  <option key={r} value={r}>{r}</option>
                ))}
              </select>
            </div>
            <div>
              <label style={{ fontSize: '0.72rem', color: 'var(--text-muted)', display: 'block', marginBottom: '6px', fontWeight: '600', textTransform: 'uppercase' }}>Select Tech Stack</label>
              <select
                value={techStack}
                onChange={(e) => handleTechStackChange(e.target.value)}
                style={{
                  width: '100%',
                  padding: '10px 12px',
                  borderRadius: '8px',
                  backgroundColor: 'var(--bg-secondary)',
                  border: '1px solid var(--border-color)',
                  color: 'var(--text-primary)',
                  fontSize: '0.85rem',
                  fontWeight: '600',
                  outline: 'none',
                  cursor: 'pointer'
                }}
              >
                {Object.keys(DYNAMIC_SKILLS_DATABASE[role] || {}).map((s) => (
                  <option key={s} value={s}>{s}</option>
                ))}
              </select>
            </div>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginBottom: '20px' }}>
            {skillsList.map((skill, idx) => {
              const isSelected = addedSkills.includes(skill.name);
              return (
                <div 
                  key={idx}
                  style={{
                    padding: '14px 16px',
                    borderRadius: '12px',
                    backgroundColor: isSelected ? 'var(--primary-glow)' : 'var(--bg-inner-white-01)',
                    border: isSelected ? '1px solid var(--primary)' : '1px solid var(--border-color)',
                    transition: 'all 0.2s ease',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '10px'
                  }}
                >
                  <div
                    onClick={() => toggleSkill(skill.name)}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      cursor: 'pointer'
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                      <div style={{
                        width: '6px',
                        height: '6px',
                        borderRadius: '50%',
                        backgroundColor: skill.color,
                        flexShrink: 0
                      }} />
                      <span style={{ fontSize: '0.9rem', fontWeight: '600', color: 'var(--text-primary)' }}>{skill.name}</span>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                      <span style={{ fontSize: '0.82rem', color: isSelected ? 'var(--primary)' : 'var(--text-secondary)', fontWeight: '700' }}>
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

                  {/* Certifications suggestions tags shown by default */}
                  <div style={{ 
                    paddingTop: '8px', 
                    borderTop: '1px dotted var(--border-color)',
                    display: 'flex',
                    flexWrap: 'wrap',
                    gap: '6px',
                    alignItems: 'center'
                  }}>
                    <span style={{ fontSize: '0.68rem', color: 'var(--text-muted)', fontWeight: '600', textTransform: 'uppercase' }}>Certifications:</span>
                    {skill.certifications.map((cert, cIdx) => (
                      <span 
                        key={cIdx} 
                        style={{ 
                          fontSize: '0.68rem', 
                          padding: '2px 8px', 
                          borderRadius: '4px', 
                          backgroundColor: 'var(--bg-secondary)', 
                          color: 'var(--text-secondary)', 
                          border: '1px solid var(--border-color)'
                        }}
                      >
                        {cert}
                      </span>
                    ))}
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

      {/* Dynamic Tri-Factor Salary Valuation Matrix */}
      <div className="glass-panel" style={{ padding: '28px', marginBottom: '32px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '10px' }}>
          <Calculator size={20} color="var(--primary)" />
          <h3 style={{ fontSize: '1.35rem' }}>Compensation Valuation Matrix</h3>
        </div>
        <p style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', marginBottom: '24px' }}>
          Compare your current baseline valuation, the salary adjustment proposed by your employer, and your open-market value based on simulated upskilling.
        </p>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '20px' }}>
          
          {/* 1. Cost of Employee (Current Base) */}
          <div style={{ 
            backgroundColor: 'var(--bg-inner-white-02)', 
            padding: '20px', 
            borderRadius: '12px', 
            border: '1px solid var(--border-color)',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-between'
          }}>
            <div>
              <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)', display: 'block', marginBottom: '6px', fontWeight: '600' }}>COST OF EMPLOYEE (CURRENT BASE)</span>
              <span style={{ fontSize: '1.6rem', fontWeight: '800', color: 'var(--text-primary)' }}>₹{(nominalSalary / 100000).toFixed(1)} LPA</span>
              <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', display: 'block', marginTop: '4px' }}>Your current base cost to the organization.</span>
            </div>
            <div style={{ height: '4px', backgroundColor: 'var(--bg-inner-white-05)', borderRadius: '2px', marginTop: '16px', overflow: 'hidden' }}>
              <div style={{ width: '100%', height: '100%', backgroundColor: 'var(--text-muted)' }}></div>
            </div>
          </div>

          {/* 2. Cost of Employer Given (Proposed Hike Alignment) */}
          <div style={{ 
            backgroundColor: 'var(--bg-inner-white-02)', 
            padding: '20px', 
            borderRadius: '12px', 
            border: '1px solid var(--primary-glow)',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-between'
          }}>
            <div>
              <div className="flex-between">
                <span style={{ fontSize: '0.78rem', color: 'var(--primary)', display: 'block', marginBottom: '6px', fontWeight: '700' }}>COST OF EMPLOYER GIVEN</span>
                <span style={{ fontSize: '0.7rem', backgroundColor: 'var(--primary-glow)', color: 'var(--primary)', padding: '2px 6px', borderRadius: '4px', fontWeight: '700' }}>+{employerHike}% OFFER</span>
              </div>
              <span style={{ fontSize: '1.6rem', fontWeight: '800', color: 'var(--primary)' }}>₹{((nominalSalary * (1 + employerHike / 100)) / 100000).toFixed(1)} LPA</span>
              <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', display: 'block', marginTop: '4px' }}>Proposed base with current company correction hike.</span>
            </div>
            <div style={{ height: '4px', backgroundColor: 'var(--bg-inner-white-05)', borderRadius: '2px', marginTop: '16px', overflow: 'hidden' }}>
              <div style={{ width: `${100 * (1 + employerHike / 100) / (simulatedSalary / nominalSalary)}%`, height: '100%', backgroundColor: 'var(--primary)' }}></div>
            </div>
          </div>

          {/* 3. Cost of Market (Skills + Benchmarks) */}
          <div style={{ 
            backgroundColor: 'var(--bg-inner-white-02)', 
            padding: '20px', 
            borderRadius: '12px', 
            border: '1px solid var(--secondary-glow)',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-between'
          }}>
            <div>
              <div className="flex-between">
                <span style={{ fontSize: '0.78rem', color: 'var(--secondary)', display: 'block', marginBottom: '6px', fontWeight: '700' }}>COST OF MARKET VALUE</span>
                <span style={{ fontSize: '0.7rem', backgroundColor: 'var(--secondary-glow)', color: 'var(--secondary)', padding: '2px 6px', borderRadius: '4px', fontWeight: '700' }}>+{totalSkillPremiumPercent}% PREMIUM</span>
              </div>
              <span style={{ fontSize: '1.6rem', fontWeight: '800', color: 'var(--secondary)' }}>₹{(simulatedSalary / 100000).toFixed(1)} LPA</span>
              <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', display: 'block', marginTop: '4px' }}>Value of your profile in the open tech market.</span>
            </div>
            <div style={{ height: '4px', backgroundColor: 'var(--bg-inner-white-05)', borderRadius: '2px', marginTop: '16px', overflow: 'hidden' }}>
              <div style={{ width: '100%', height: '100%', backgroundColor: 'var(--secondary)' }}></div>
            </div>
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
            Planning a transfer or job change? Calculate the real income equivalent required in your target city to maintain {homeCity} standards.
          </p>

          <div style={{ display: 'flex', gap: '16px', marginBottom: '24px' }}>
            <div style={{ flex: 1 }}>
              <label style={{ fontSize: '0.78rem', color: 'var(--text-muted)', display: 'block', marginBottom: '6px' }}>CURRENT CITY</label>
              <div style={{ padding: '10px 14px', borderRadius: '8px', backgroundColor: 'var(--bg-inner-dark)', border: '1px solid var(--border-color)', fontSize: '0.9rem', color: 'var(--text-secondary)' }}>
                {homeCity}
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

          <div className="flex-between" style={{ marginBottom: '14px' }}>
            <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', margin: 0 }}>
              {aiScripts[negotiationTopic]
                ? 'AI-written pitch, grounded in your live budget data.'
                : 'Copy-paste this dynamically compiled pitch structure to back up your case during your upcoming appraisal reviews.'}
            </p>
            <button
              onClick={generateWithAI}
              disabled={aiLoading}
              style={{
                display: 'flex', alignItems: 'center', gap: '6px', flexShrink: 0, marginLeft: '12px',
                padding: '6px 12px', borderRadius: '8px', border: '1px solid var(--primary)',
                backgroundColor: aiScripts[negotiationTopic] ? 'var(--primary)' : 'var(--primary-glow)',
                color: aiScripts[negotiationTopic] ? '#fff' : 'var(--primary)',
                fontSize: '0.75rem', fontWeight: '700', cursor: aiLoading ? 'not-allowed' : 'pointer',
                opacity: aiLoading ? 0.6 : 1
              }}
            >
              {aiLoading ? <Loader2 size={14} className="spin" /> : <Sparkles size={14} />}
              {aiLoading ? 'Writing...' : aiScripts[negotiationTopic] ? 'Regenerate with AI' : 'Write with AI'}
            </button>
          </div>

          {aiError && (
            <div style={{
              display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '12px',
              padding: '8px 12px', borderRadius: '8px',
              backgroundColor: 'var(--danger-glow)', border: '1px solid var(--danger)',
              fontSize: '0.75rem', color: '#f87171'
            }}>
              <AlertTriangle size={14} style={{ flexShrink: 0 }} />
              <span>{aiError}</span>
            </div>
          )}

          <div style={{
            flex: 1,
            backgroundColor: 'var(--bg-inner-dark)',
            border: aiScripts[negotiationTopic] ? '1px solid var(--primary)' : '1px solid var(--border-color)',
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
            {displayedScript}
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
