import React, { useState, useRef, useEffect } from 'react';
import {
  Send,
  Bot,
  User,
  Sparkles,
  HelpCircle,
  ArrowRight,
  TrendingUp,
  BrainCircuit,
  AlertTriangle
} from 'lucide-react';
import { loadBudget, analyzeBudget, fmtINR } from '../lib/inflation';
import { callLLM } from '../lib/llm';

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

  // Build conversation history from messages (for multi-turn context)
  const getConversationHistory = () => {
    return messages
      .filter((_, idx) => idx > 0) // skip the initial greeting
      .map(msg => ({
        role: msg.sender === 'ai' ? 'assistant' : 'user',
        content: msg.text
      }));
  };

  const handleSend = async (text) => {
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

    try {
      // Call real LLM with conversation history + budget context
      const history = getConversationHistory();
      const responseText = await callLLM(text, history, budget);

      const aiMsg = {
        sender: 'ai',
        text: responseText,
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };
      setMessages(prev => [...prev, aiMsg]);
    } catch (error) {
      console.error('LLM call failed:', error);
      const errorMsg = {
        sender: 'ai',
        text: `⚠️ **Error contacting AI engine**: ${error.message}\n\nPlease check your Google Gemini configuration in the \`.env\` file and ensure your API key is correct.`,
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        isError: true
      };
      setMessages(prev => [...prev, errorMsg]);
    } finally {
      setIsTyping(false);
    }
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
          <span style={{ fontSize: '0.9rem', fontWeight: '600' }}>Google Gemini 2.0 Flash Agent</span>
          <span style={{
            fontSize: '0.65rem',
            color: 'var(--secondary)',
            marginLeft: 'auto',
            padding: '2px 8px',
            borderRadius: '10px',
            border: '1px solid var(--secondary)',
            opacity: 0.8
          }}>LIVE</span>
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
                  backgroundColor: msg.isError ? 'var(--danger)' : isAi ? 'var(--primary)' : '#4b5563',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  flexShrink: 0,
                  boxShadow: isAi ? '0 0 10px var(--primary-glow)' : 'none'
                }}>
                  {msg.isError ? <AlertTriangle size={16} color="white" /> : isAi ? <Bot size={16} color="white" /> : <User size={16} color="white" />}
                </div>

                {/* Bubble */}
                <div>
                  <div style={{
                    backgroundColor: msg.isError ? 'rgba(239, 68, 68, 0.1)' : isAi ? 'var(--bg-secondary)' : 'var(--primary)',
                    color: 'white',
                    padding: '14px 18px',
                    borderRadius: isAi ? '0px 16px 16px 16px' : '16px 0px 16px 16px',
                    border: msg.isError ? '1px solid var(--danger)' : isAi ? '1px solid var(--border-color)' : 'none',
                    fontSize: '0.9rem',
                    lineHeight: '1.5',
                    whiteSpace: 'pre-wrap'
                  }}>
                    {isAi ? (
                      // Parse basic markdown in responses for beautiful presentation
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
              onClick={() => handleSend(q.text)}
              disabled={isTyping}
              style={{
                background: 'var(--bg-inner-white-03)',
                border: '1px solid var(--border-color)',
                borderRadius: '20px',
                padding: '6px 12px',
                fontSize: '0.78rem',
                color: isTyping ? 'var(--text-muted)' : 'var(--text-secondary)',
                cursor: isTyping ? 'not-allowed' : 'pointer',
                transition: 'all 0.2s ease',
                display: 'flex',
                alignItems: 'center',
                gap: '4px',
                opacity: isTyping ? 0.5 : 1
              }}
              onMouseEnter={(e) => {
                if (!isTyping) {
                  e.currentTarget.style.borderColor = 'var(--primary)';
                  e.currentTarget.style.color = 'white';
                }
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
            disabled={isTyping}
            style={{
              flex: 1,
              backgroundColor: 'var(--bg-secondary)',
              border: '1px solid var(--border-color)',
              borderRadius: '8px',
              padding: '12px 16px',
              color: 'var(--text-primary)',
              fontSize: '0.9rem',
              outline: 'none',
              transition: 'border-color 0.2s ease',
              opacity: isTyping ? 0.6 : 1
            }}
            onFocus={(e) => e.target.style.borderColor = 'var(--primary)'}
            onBlur={(e) => e.target.style.borderColor = 'var(--border-color)'}
          />
          <button
            type="submit"
            className="btn btn-primary"
            disabled={isTyping || !input.trim()}
            style={{ padding: '0 20px', opacity: (isTyping || !input.trim()) ? 0.5 : 1 }}
          >
            <Send size={16} />
          </button>
        </form>

      </div>
    </div>
  );
}
