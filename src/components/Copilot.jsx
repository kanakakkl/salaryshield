import React, { useState, useRef, useEffect } from 'react';
import { 
  Send, 
  Bot, 
  User, 
  Sparkles, 
  HelpCircle, 
  ArrowRight,
  TrendingUp,
  BrainCircuit
} from 'lucide-react';
import { loadBudget, analyzeBudget, fmtINR } from '../lib/inflation';

export default function Copilot() {
  const [messages, setMessages] = useState([
    {
      sender: 'ai',
      text: "Hello! I am your SalaryShield GenAI Advisor, backed by live inflation data and market compensation models. How can I help you optimize compensation or understand your purchasing power today?",
      time: '12:00 PM'
    }
  ]);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  
  const chatEndRef = useRef(null);

  // Auto-scroll to bottom of chat
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isTyping]);

  const quickQuestions = [
    { text: "Am I underpaid?", value: "underpaid" },
    { text: "What is my attrition risk?", value: "attrition" },
    { text: "Why is rent inflation in Hyderabad so high?", value: "hyderabad_rent" },
    { text: "Suggest high-value skills.", value: "skills" }
  ];

  // Pull the user's live budget so the Copilot answers with their real numbers
  const budget = loadBudget();
  const bA = analyzeBudget(budget);
  const nominalLPA = 25.0;
  const recommendedAsk = Math.round((bA.breakEvenHike + 7) * 10) / 10;
  const targetLPA = nominalLPA * (1 + recommendedAsk / 100);
  const realLPA = nominalLPA * (1 - bA.personalInflation / 100);

  const getSimulatedResponse = (queryType) => {
    switch (queryType) {
      case 'underpaid':
        return `Based on your profile as a **Tech Lead** in **${budget.city}** earning **₹${nominalLPA.toFixed(1)} LPA**:

1. **Purchasing Power Loss**: Your **personal inflation** (computed live from your Budget Planner spending mix) is **${bA.personalInflation.toFixed(1)}%**, eroding roughly **${fmtINR(bA.annualInflationTax)}** of your annual take-home. In real terms your ₹${nominalLPA.toFixed(1)} LPA is now worth about **₹${realLPA.toFixed(1)} LPA**.
2. **Break-Even Threshold**: You would need a **${bA.breakEvenHike.toFixed(1)}%** correction just to keep your current savings steady against ${budget.city}'s cost curve.
3. **Recommendation**: Factoring in market benchmarks, request a corrective adjustment of **${recommendedAsk}%** to bring your salary to **₹${targetLPA.toFixed(1)} LPA**, moving you toward the **75th percentile** and fully shielding you against local inflation.`;

      case 'attrition':
        return `Your individual flight risk scoring breakdown:

* **Inflation Lag Score**: High (personal inflation running at **${bA.personalInflation.toFixed(1)}%** with no correction in the past 12 months).
* **Savings Erosion**: At current pay your monthly savings fall from **${fmtINR(bA.savings)}** to **${fmtINR(bA.projectedSavings)}** next year — a key driver of exit intent.
* **Estimated Attrition Probability**: **64%** (Categorized as **High Alert Zone**).

**HR Retention Recommendation**: A proactive **${recommendedAsk}%** alignment within the next 30 days will reduce your flight risk to **18%**, saving the company an estimated **₹37.5 Lakhs** in direct recruitment, training, and onboarding costs.`;

      case 'hyderabad_rent':
        return `**Hyderabad Rent Inflation Breakdown (CLII Engine Analysis)**:

* **Regional Rent Index**: **+12.2%** over the last 12 months (IT Corridor zones like Financial District, Gachibowli, Hitec City, Madhapur).
* **Key Drivers**:
  1. Return-to-office (RTO) mandates leading to high occupancy demands near tech parks.
  2. Construction supply chain bottlenecks for premium gated complexes.
  3. Utility cost hikes (+5.2%) passed down by landlords to tenants.

**Impact**: This housing surge accounts for **55%** of your total purchasing power erosion this fiscal year.`;

      case 'skills':
        return `To shield your salary against inflation, we recommend acquiring high-premium, inflation-resilient skills:

1. **Generative AI & LLM Engineering**: Current market premium of **+22%**. Average salary for certified engineers is **₹30.5 LPA**.
2. **MLOps & Pipeline Deployment**: Current market premium of **+18%**. Highly sought after as companies move models to production.
3. **Cloud Native / Kubernetes**: Current market premium of **+15%**. Focus on high-availability container architectures.

Learning just one of these and adding it to your appraisal packet can boost your market value by up to **₹5.5 Lakhs**.`;

      default:
        return `I've analyzed your question against your live profile in **${budget.city}**. Based on SalaryShield's core modules, our AI engine suggests:

* Your **personal inflation** is **${bA.personalInflation.toFixed(1)}%** — a **${bA.breakEvenHike.toFixed(1)}%** raise is the break-even floor to protect your savings.
* Incorporating skills like **Generative AI** (+22% premium) or **MLOps** (+18% premium) to offset real-wage erosion.
* Targeting a **${recommendedAsk}%** correction (≈ ₹${targetLPA.toFixed(1)} LPA) to align to market and decrease talent flight risk below 30%.

Is there a specific city, skill, or role benchmark you would like me to audit?`;
    }
  };

  const handleSend = (text, type = null) => {
    if (!text.trim()) return;

    // Add user message
    const userMsg = {
      sender: 'user',
      text: text,
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };
    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setIsTyping(true);

    // Simulate AI response delay
    setTimeout(() => {
      const responseText = getSimulatedResponse(type || 'default');
      const aiMsg = {
        sender: 'ai',
        text: responseText,
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };
      setMessages(prev => [...prev, aiMsg]);
      setIsTyping(false);
    }, 1200);
  };

  return (
    <div className="animate-fade-in" style={{ padding: '30px 40px 30px 20px', marginLeft: 'calc(var(--sidebar-width) + 40px)', height: '100vh', display: 'flex', flexDirection: 'column' }}>
      
      {/* Top Header */}
      <div style={{ marginBottom: '20px' }}>
        <h1 style={{ fontSize: '2rem', fontWeight: '800', marginBottom: '6px' }}>SalaryShield GenAI Copilot</h1>
        <p style={{ color: 'var(--text-secondary)' }}>Ask natural language questions about your compensation, cost-of-living indices, and career progression.</p>
      </div>

      {/* Main chat window container */}
      <div className="glass-panel" style={{ 
        flex: 1, 
        display: 'flex', 
        flexDirection: 'column', 
        overflow: 'hidden',
        marginBottom: '20px',
        border: '1px solid var(--border-color)',
        backgroundColor: 'var(--bg-card)'
      }}>
        
        {/* Chat Header */}
        <div style={{ 
          padding: '16px 20px', 
          borderBottom: '1px solid var(--border-color)', 
          backgroundColor: 'var(--bg-inner-dark-light)',
          display: 'flex',
          alignItems: 'center',
          gap: '10px'
        }}>
          <div style={{
            width: '10px',
            height: '10px',
            borderRadius: '50%',
            backgroundColor: 'var(--secondary)',
            boxShadow: '0 0 8px var(--secondary)'
          }} />
          <BrainCircuit size={18} color="var(--primary)" />
          <span style={{ fontSize: '0.9rem', fontWeight: '600' }}>Azure OpenAI GPT-4o RAG Pipeline</span>
        </div>

        {/* Message area */}
        <div style={{ 
          flex: 1, 
          padding: '24px', 
          overflowY: 'auto',
          display: 'flex',
          flexDirection: 'column',
          gap: '20px'
        }}>
          {messages.map((msg, index) => {
            const isAi = msg.sender === 'ai';
            return (
              <div 
                key={index}
                style={{
                  display: 'flex',
                  gap: '12px',
                  alignSelf: isAi ? 'flex-start' : 'flex-end',
                  maxWidth: '75%',
                  flexDirection: isAi ? 'row' : 'row-reverse'
                }}
              >
                {/* Avatar */}
                <div style={{
                  width: '32px',
                  height: '32px',
                  borderRadius: '50%',
                  backgroundColor: isAi ? 'var(--primary)' : '#4b5563',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  flexShrink: 0,
                  boxShadow: isAi ? '0 0 10px var(--primary-glow)' : 'none'
                }}>
                  {isAi ? <Bot size={16} color="white" /> : <User size={16} color="white" />}
                </div>

                {/* Bubble */}
                <div>
                  <div style={{
                    backgroundColor: isAi ? 'var(--bg-secondary)' : 'var(--primary)',
                    color: isAi ? 'var(--text-primary)' : 'white',
                    padding: '14px 18px',
                    borderRadius: isAi ? '0px 16px 16px 16px' : '16px 0px 16px 16px',
                    border: isAi ? '1px solid var(--border-color)' : 'none',
                    fontSize: '0.9rem',
                    lineHeight: '1.5',
                    whiteSpace: 'pre-wrap'
                  }}>
                    {isAi ? (
                      // Parse basic markdown in mock responses for beautiful presentation
                      msg.text.split('\n').map((line, lIdx) => {
                        if (line.startsWith('**') || line.includes('**')) {
                          // Simple bold replacement
                          const parts = line.split('**');
                          return (
                            <p key={lIdx} style={{ margin: '4px 0' }}>
                              {parts.map((p, pIdx) => pIdx % 2 === 1 ? <strong key={pIdx} style={{ color: 'var(--primary)', textShadow: '0 0 10px var(--primary-glow)' }}>{p}</strong> : p)}
                            </p>
                          );
                        }
                        if (line.startsWith('*') || line.startsWith('-')) {
                          return <li key={lIdx} style={{ marginLeft: '12px', margin: '4px 0' }}>{line.substring(2)}</li>;
                        }
                        return <p key={lIdx} style={{ margin: '4px 0' }}>{line}</p>;
                      })
                    ) : (
                      msg.text
                    )}
                  </div>
                  <span style={{ 
                    fontSize: '0.7rem', 
                    color: 'var(--text-muted)', 
                    marginTop: '4px', 
                    display: 'block',
                    textAlign: isAi ? 'left' : 'right'
                  }}>
                    {msg.time}
                  </span>
                </div>
              </div>
            );
          })}

          {/* Typing Indicator */}
          {isTyping && (
            <div style={{ display: 'flex', gap: '12px', alignSelf: 'flex-start' }}>
              <div style={{
                width: '32px',
                height: '32px',
                borderRadius: '50%',
                backgroundColor: 'var(--primary)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}>
                <Bot size={16} color="white" />
              </div>
              <div style={{
                backgroundColor: 'var(--bg-secondary)',
                border: '1px solid var(--border-color)',
                padding: '12px 18px',
                borderRadius: '0px 16px 16px 16px',
                display: 'flex',
                alignItems: 'center',
                gap: '4px'
              }}>
                <span style={{ width: '6px', height: '6px', backgroundColor: 'var(--text-secondary)', borderRadius: '50%', display: 'inline-block', animation: 'pulse-ring 1s infinite' }} />
                <span style={{ width: '6px', height: '6px', backgroundColor: 'var(--text-secondary)', borderRadius: '50%', display: 'inline-block', animation: 'pulse-ring 1s infinite 0.2s' }} />
                <span style={{ width: '6px', height: '6px', backgroundColor: 'var(--text-secondary)', borderRadius: '50%', display: 'inline-block', animation: 'pulse-ring 1s infinite 0.4s' }} />
              </div>
            </div>
          )}
          <div ref={chatEndRef} />
        </div>

        {/* Quick query recommendation bar */}
        <div style={{ 
          padding: '12px 20px', 
          borderTop: '1px solid var(--border-color)', 
          backgroundColor: 'var(--bg-inner-dark-superlight)',
          display: 'flex',
          flexWrap: 'wrap',
          gap: '8px'
        }}>
          <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '4px', width: '100%', marginBottom: '4px' }}>
            <Sparkles size={12} color="var(--accent)" /> Recommended Queries:
          </span>
          {quickQuestions.map((q, idx) => (
            <button
              key={idx}
              onClick={() => handleSend(q.text, q.value)}
              style={{
                background: 'var(--bg-inner-white-03)',
                border: '1px solid var(--border-color)',
                borderRadius: '20px',
                padding: '6px 12px',
                fontSize: '0.78rem',
                color: 'var(--text-secondary)',
                cursor: 'pointer',
                transition: 'all 0.2s ease',
                display: 'flex',
                alignItems: 'center',
                gap: '4px'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.borderColor = 'var(--primary)';
                e.currentTarget.style.color = 'var(--text-primary)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.borderColor = 'var(--border-color)';
                e.currentTarget.style.color = 'var(--text-secondary)';
              }}
            >
              {q.text}
              <ArrowRight size={12} />
            </button>
          ))}
        </div>

        {/* Input Bar */}
        <form 
          onSubmit={(e) => {
            e.preventDefault();
            handleSend(input);
          }}
          style={{ 
            padding: '16px 20px', 
            borderTop: '1px solid var(--border-color)', 
            backgroundColor: 'var(--bg-inner-dark)',
            display: 'flex',
            gap: '12px'
          }}
        >
          <input 
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Type your compensation or inflation query here..."
            style={{
              flex: 1,
              backgroundColor: 'var(--bg-secondary)',
              border: '1px solid var(--border-color)',
              borderRadius: '8px',
              padding: '12px 16px',
              color: 'var(--text-primary)',
              fontSize: '0.9rem',
              outline: 'none',
              transition: 'border-color 0.2s ease'
            }}
            onFocus={(e) => e.target.style.borderColor = 'var(--primary)'}
            onBlur={(e) => e.target.style.borderColor = 'var(--border-color)'}
          />
          <button 
            type="submit"
            className="btn btn-primary"
            style={{ padding: '0 20px' }}
          >
            <Send size={16} />
          </button>
        </form>

      </div>
    </div>
  );
}
