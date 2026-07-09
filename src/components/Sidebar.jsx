import React, { useState, useEffect } from 'react';
import { 
  LayoutDashboard, 
  User, 
  TrendingUp, 
  MessageSquareCode,
  ShieldAlert,
  MapPin,
  CreditCard,
  Building,
  UserCheck,
  Wallet,
  Sun,
  Moon
} from 'lucide-react';
import { loadBudget } from '../lib/inflation';

export default function Sidebar({ activeTab, setActiveTab, theme, setTheme }) {
  const menuItems = [
    { id: 'employer', label: 'Employer Console', icon: Building },
    { id: 'employee', label: 'Employee Portal', icon: UserCheck },
    { id: 'budget', label: 'My Budget & Inflation', icon: Wallet },
    { id: 'inflation', label: 'Inflation Index (CLII)', icon: TrendingUp },
    { id: 'copilot', label: 'GenAI Salary Copilot', icon: MessageSquareCode },
  ];

  // Pull the employee's salary dynamically from the loaded budget
  const [salaryLPA, setSalaryLPA] = useState(() => {
    const b = loadBudget();
    return (b.nominalSalary || 2500000) / 100000;
  });

  const [isEditingSalary, setIsEditingSalary] = useState(false);
  const [salaryInputVal, setSalaryInputVal] = useState(salaryLPA.toString());
  const [role, setRole] = useState(() => localStorage.getItem('salaryshield_user_role') || 'Tech Lead');

  useEffect(() => {
    const syncSalary = () => {
      const b = loadBudget();
      const currentVal = (b.nominalSalary || 2500000) / 100000;
      setSalaryLPA(currentVal);
      if (!isEditingSalary) {
        setSalaryInputVal(currentVal.toString());
      }
      const storedRole = localStorage.getItem('salaryshield_user_role') || 'Tech Lead';
      setRole(storedRole);
    };
    syncSalary();
    const id = setInterval(syncSalary, 1000);
    return () => clearInterval(id);
  }, [isEditingSalary]);

  const handleSalarySave = (newVal) => {
    const num = parseFloat(newVal);
    if (!isNaN(num) && num > 0) {
      const b = loadBudget();
      b.nominalSalary = num * 100000;
      localStorage.setItem('salaryshield_budget_v1', JSON.stringify(b));
      setSalaryLPA(num);
    }
    setIsEditingSalary(false);
  };

  return (
    <div style={{
      width: 'var(--sidebar-width)',
      height: 'calc(100vh - 40px)',
      backgroundColor: 'var(--bg-card)',
      backdropFilter: 'blur(20px)',
      WebkitBackdropFilter: 'blur(20px)',
      border: '1px solid var(--border-color)',
      borderRadius: '24px',
      boxShadow: '0 8px 32px var(--shadow-color)',
      display: 'flex',
      flexDirection: 'column',
      position: 'fixed',
      left: '20px',
      top: '20px',
      zIndex: 10,
      overflow: 'hidden'
    }}>
      {/* Brand Header */}
      <div style={{
        padding: '24px 20px',
        borderBottom: '1px solid var(--border-color)',
        display: 'flex',
        alignItems: 'center',
        gap: '12px'
      }}>
        <div style={{
          backgroundColor: 'var(--primary)',
          borderRadius: '8px',
          width: '36px',
          height: '36px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          boxShadow: '0 0 15px var(--primary-glow)'
        }}>
          <ShieldAlert size={20} color="white" />
        </div>
        <div>
          <h2 style={{
            fontSize: '1.25rem',
            fontWeight: '700',
            background: 'linear-gradient(to right, var(--text-primary), var(--primary))',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            letterSpacing: '0.02em'
          }}>SalaryShield</h2>
          <span style={{
            fontSize: '0.68rem',
            color: 'var(--text-muted)',
            textTransform: 'uppercase',
            fontWeight: '700',
            letterSpacing: '0.05em'
          }}>Compensation Intelligence</span>
        </div>
      </div>

      {/* Navigation List */}
      <nav style={{
        flex: 1,
        padding: '20px 12px',
        display: 'flex',
        flexDirection: 'column',
        gap: '8px'
      }}>
        {menuItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;
          return (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '12px',
                width: '100%',
                padding: '12px 16px',
                borderRadius: '10px',
                border: 'none',
                backgroundColor: isActive ? 'var(--primary)' : 'transparent',
                color: isActive ? '#fff' : 'var(--text-secondary)',
                cursor: 'pointer',
                fontFamily: "'Outfit', sans-serif",
                fontSize: '0.92rem',
                fontWeight: isActive ? '600' : '400',
                textAlign: 'left',
                transition: 'all 0.2s ease',
                boxShadow: isActive ? '0 4px 15px var(--primary-glow)' : 'none'
              }}
              onMouseEnter={(e) => {
                if (!isActive) {
                  e.currentTarget.style.backgroundColor = 'var(--bg-inner-white-03)';
                  e.currentTarget.style.color = 'var(--text-primary)';
                }
              }}
              onMouseLeave={(e) => {
                if (!isActive) {
                  e.currentTarget.style.backgroundColor = 'transparent';
                  e.currentTarget.style.color = 'var(--text-secondary)';
                }
              }}
            >
              <Icon size={18} style={{ opacity: isActive ? 1 : 0.8 }} />
              {item.label}
            </button>
          );
        })}
      </nav>

      {/* Theme Toggler Segmented Control */}
      <div style={{
        padding: '14px 16px',
        borderTop: '1px solid var(--border-color)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between'
      }}>
        <span style={{ fontSize: '0.85rem', fontWeight: '500', color: 'var(--text-secondary)' }}>Appearance</span>
        <div style={{
          display: 'flex',
          backgroundColor: 'var(--bg-primary)',
          borderRadius: '20px',
          padding: '2px',
          border: '1px solid var(--border-color)'
        }}>
          <button 
            onClick={() => setTheme('light')}
            style={{
              background: theme === 'light' ? 'var(--primary)' : 'transparent',
              border: 'none',
              cursor: 'pointer',
              padding: '6px 10px',
              borderRadius: '20px',
              color: theme === 'light' ? '#fff' : 'var(--text-muted)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              transition: 'all 0.2s ease'
            }}
            title="Light Theme"
          >
            <Sun size={14} />
          </button>
          <button 
            onClick={() => setTheme('dark')}
            style={{
              background: theme === 'dark' ? 'var(--primary)' : 'transparent',
              border: 'none',
              cursor: 'pointer',
              padding: '6px 10px',
              borderRadius: '20px',
              color: theme === 'dark' ? '#fff' : 'var(--text-muted)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              transition: 'all 0.2s ease'
            }}
            title="Dark Theme"
          >
            <Moon size={14} />
          </button>
        </div>
      </div>

      {/* Interactive Profile Widget - Linking to the Hackathon Storyline */}
      <div style={{
        padding: '16px',
        borderTop: '1px solid var(--border-color)',
        backgroundColor: 'var(--bg-inner-dark-light)'
      }}>
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '10px',
          marginBottom: '10px'
        }}>
          <div style={{
            width: '32px',
            height: '32px',
            borderRadius: '50%',
            backgroundColor: '#3b82f6',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontWeight: '600',
            fontSize: '0.85rem',
            color: 'white'
          }}>
            PS
          </div>
          <div>
            <h4 style={{ fontSize: '0.85rem', fontWeight: '600', color: 'var(--text-primary)' }}>Priya Sharma</h4>
            <span style={{ fontSize: '0.72rem', color: 'var(--text-secondary)' }}>{role}</span>
          </div>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.72rem', color: 'var(--text-muted)' }}>
            <MapPin size={12} />
            <span>Hyderabad, India</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.72rem', color: 'var(--text-muted)' }}>
            <CreditCard size={12} style={{ flexShrink: 0 }} />
            {isEditingSalary ? (
              <input
                type="number"
                step="0.5"
                min="1"
                value={salaryInputVal}
                onChange={(e) => setSalaryInputVal(e.target.value)}
                onBlur={() => handleSalarySave(salaryInputVal)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') handleSalarySave(salaryInputVal);
                  if (e.key === 'Escape') setIsEditingSalary(false);
                }}
                autoFocus
                style={{
                  width: '80px',
                  background: 'var(--bg-secondary)',
                  border: '1px solid var(--primary)',
                  borderRadius: '4px',
                  color: 'var(--text-primary)',
                  fontSize: '0.72rem',
                  padding: '2px 4px',
                  outline: 'none',
                  fontWeight: '600'
                }}
              />
            ) : (
              <span 
                onClick={() => {
                  setSalaryInputVal(salaryLPA.toString());
                  setIsEditingSalary(true);
                }}
                style={{ cursor: 'pointer', borderBottom: '1px dashed var(--text-muted)', display: 'inline-flex', alignItems: 'center', gap: '2px' }}
                title="Click to edit annual base salary"
              >
                Salary: ₹{salaryLPA.toFixed(1)} LPA ✏️
              </span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
