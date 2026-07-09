import React from 'react';
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
  Wallet
} from 'lucide-react';

export default function Sidebar({ activeTab, setActiveTab }) {
  const menuItems = [
    { id: 'employer', label: 'Employer Console', icon: Building },
    { id: 'employee', label: 'Employee Portal', icon: UserCheck },
    { id: 'budget', label: 'My Budget & Inflation', icon: Wallet },
    { id: 'inflation', label: 'Inflation Index (CLII)', icon: TrendingUp },
    { id: 'copilot', label: 'GenAI Salary Copilot', icon: MessageSquareCode },
  ];

  return (
    <div style={{
      width: 'var(--sidebar-width)',
      height: '100vh',
      backgroundColor: 'var(--bg-secondary)',
      borderRight: '1px solid var(--border-color)',
      display: 'flex',
      flexDirection: 'column',
      position: 'fixed',
      left: 0,
      top: 0,
      zIndex: 10
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
          boxShadow: '0 0 15px var(--primary)'
        }}>
          <ShieldAlert size={20} color="white" />
        </div>
        <div>
          <h2 style={{
            fontSize: '1.25rem',
            fontWeight: '700',
            background: 'linear-gradient(to right, #ffffff, var(--primary))',
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
                boxShadow: isActive ? '0 4px 15px rgba(139, 92, 24px, 0.25)' : 'none'
              }}
              onMouseEnter={(e) => {
                if (!isActive) {
                  e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.03)';
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

      {/* Interactive Profile Widget - Linking to the Hackathon Storyline */}
      <div style={{
        padding: '16px',
        borderTop: '1px solid var(--border-color)',
        backgroundColor: 'rgba(0, 0, 0, 0.15)'
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
            fontSize: '0.85rem'
          }}>
            PS
          </div>
          <div>
            <h4 style={{ fontSize: '0.85rem', fontWeight: '600', color: 'var(--text-primary)' }}>Priya Sharma</h4>
            <span style={{ fontSize: '0.72rem', color: 'var(--text-secondary)' }}>Tech Lead</span>
          </div>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.72rem', color: 'var(--text-muted)' }}>
            <MapPin size={12} />
            <span>Hyderabad, India</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.72rem', color: 'var(--text-muted)' }}>
            <CreditCard size={12} />
            <span>Salary: ₹25.0 LPA</span>
          </div>
        </div>
      </div>
    </div>
  );
}
