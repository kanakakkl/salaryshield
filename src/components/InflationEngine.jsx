import React, { useState } from 'react';
import { 
  BarChart, 
  Map, 
  HelpCircle, 
  DollarSign, 
  AlertTriangle,
  Info,
  Layers,
  Activity
} from 'lucide-react';

export default function InflationEngine() {
  const [selectedCity, setSelectedCity] = useState('Hyderabad');

  const cliiData = {
    Hyderabad: {
      total: 8.4,
      housing: 12.2,
      food: 7.8,
      transport: 6.5,
      utilities: 5.2,
      desc: 'Driven by massive IT-corridor rental surges (Gachibowli, Madhapur) and transport costs.'
    },
    Bengaluru: {
      total: 7.9,
      housing: 10.5,
      food: 8.2,
      transport: 6.8,
      utilities: 4.8,
      desc: 'Triggered by high demand for gated communities near tech parks and local logistics overheads.'
    },
    Mumbai: {
      total: 9.1,
      housing: 14.8,
      food: 7.1,
      transport: 5.4,
      utilities: 6.2,
      desc: 'Real estate cost adjustments in urban centers coupled with utility hikes across suburbs.'
    },
    Pune: {
      total: 6.8,
      housing: 7.5,
      food: 6.9,
      transport: 6.2,
      utilities: 5.0,
      desc: 'Moderate housing growth with steady food and consumer price indices.'
    }
  };

  const activeData = cliiData[selectedCity];

  // Helper for generating custom SVG charts
  const renderMockChartPoints = (city) => {
    // Return SVG path coordinates representing a 12-month trend
    const trends = {
      Hyderabad: 'M 10,120 L 50,110 L 90,115 L 130,95 L 170,90 L 210,75 L 250,60 L 290,65 L 330,45 L 370,48 L 410,32 L 450,22',
      Bengaluru: 'M 10,110 L 50,112 L 90,100 L 130,105 L 170,85 L 210,80 L 250,72 L 290,58 L 330,62 L 370,50 L 410,42 L 450,30',
      Mumbai: 'M 10,130 L 50,115 L 90,120 L 130,90 L 170,92 L 210,68 L 250,72 L 290,52 L 330,40 L 370,38 L 410,25 L 450,12',
      Pune: 'M 10,125 L 50,120 L 90,122 L 130,110 L 170,115 L 210,105 L 250,92 L 290,95 L 330,85 L 370,88 L 410,78 L 450,62'
    };
    return trends[city];
  };

  return (
    <div className="animate-fade-in" style={{ padding: '30px 40px 30px 20px', marginLeft: 'calc(var(--sidebar-width) + 40px)', minHeight: '100vh' }}>
      
      {/* Top Header */}
      <div className="flex-between" style={{ marginBottom: '32px' }}>
        <div>
          <h1 style={{ fontSize: '2rem', fontWeight: '800', marginBottom: '6px' }}>City-Level Inflation Index (CLII) Engine</h1>
          <p style={{ color: 'var(--text-secondary)' }}>Real-time microeconomic intelligence. We ingest direct rental prices, consumer basket indices, and travel expenses.</p>
        </div>
        <div style={{
          backgroundColor: 'var(--accent-glow)',
          border: '1px solid var(--border-color)',
          borderRadius: '10px',
          padding: '8px 16px',
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
          fontSize: '0.88rem',
          color: 'var(--accent)'
        }}>
          <Activity size={16} className="text-glow-primary" />
          <span>Real-Time Stream Feed: Synced 4m ago</span>
        </div>
      </div>

      {/* Intro info box */}
      <div className="glass-panel-accent" style={{ padding: '20px', marginBottom: '32px', display: 'flex', gap: '16px', alignItems: 'center', backgroundColor: 'var(--bg-inner-white-03)' }}>
        <Layers size={36} color="var(--secondary)" style={{ flexShrink: 0 }} />
        <div>
          <h4 style={{ fontSize: '1.05rem', color: 'var(--text-primary)', marginBottom: '4px' }}>Why CLII matters over traditional Consumer Price Index (CPI)?</h4>
          <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
            Traditional national indices (like MOSPI CPI) place low weighting on urban tech housing and IT worker basket metrics (like transport, dining, gadgets).
            SalaryShield's <strong>CLII</strong> fuses real-time APIs to calculate regional adjustments tailored exactly to where corporate office structures exist.
          </p>
        </div>
      </div>

      {/* Grid: City Selector & Visualizations */}
      <div style={{ display: 'grid', gridTemplateColumns: '4fr 8fr', gap: '30px', marginBottom: '32px' }}>
        
        {/* City Select Column */}
        <div className="glass-panel" style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
          <h3 style={{ fontSize: '1.15rem', marginBottom: '8px' }}>Select Hub Location</h3>
          
          {Object.keys(cliiData).map((city) => {
            const isSelected = selectedCity === city;
            return (
              <div 
                key={city}
                onClick={() => setSelectedCity(city)}
                style={{
                  padding: '16px',
                  borderRadius: '12px',
                  backgroundColor: isSelected ? 'var(--bg-secondary)' : 'var(--bg-inner-white-01)',
                  border: isSelected ? '1px solid var(--primary)' : '1px solid var(--border-color)',
                  cursor: 'pointer',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  transition: 'all 0.2s ease'
                }}
              >
                <div>
                  <h4 style={{ fontSize: '1.05rem', fontWeight: '700' }}>{city}</h4>
                  <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>Basket Inflation Index</span>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <span style={{ fontSize: '1.25rem', fontWeight: '800', color: cliiData[city].total > 8.0 ? 'var(--danger)' : 'var(--accent)' }}>
                    {cliiData[city].total}%
                  </span>
                </div>
              </div>
            );
          })}
        </div>

        {/* Dynamic Detail Card with SVG line chart and category bars */}
        <div className="glass-panel" style={{ padding: '28px' }}>
          <div className="flex-between" style={{ marginBottom: '12px' }}>
            <h3 style={{ fontSize: '1.35rem' }}>{selectedCity} CLII Internal Composition</h3>
            <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', fontStyle: 'italic' }}>
              Base Metric: FY26-Q1 Report
            </span>
          </div>
          <p style={{ fontSize: '0.88rem', color: 'var(--text-secondary)', marginBottom: '24px' }}>
            {activeData.desc}
          </p>

          {/* Core breakdown bar graph */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '18px', marginBottom: '32px' }}>
            <div>
              <div className="flex-between" style={{ fontSize: '0.82rem', marginBottom: '4px' }}>
                <span style={{ color: 'var(--text-primary)', fontWeight: '500' }}>Rent & Housing Cost Premium (Weight: 35%)</span>
                <span style={{ color: 'var(--danger)', fontWeight: '600' }}>{activeData.housing}% Inflation</span>
              </div>
              <div style={{ height: '8px', backgroundColor: 'var(--bg-inner-white-05)', borderRadius: '4px', overflow: 'hidden' }}>
                <div style={{ width: `${(activeData.housing / 15) * 100}%`, height: '100%', backgroundColor: 'var(--danger)' }}></div>
              </div>
            </div>

            <div>
              <div className="flex-between" style={{ fontSize: '0.82rem', marginBottom: '4px' }}>
                <span style={{ color: 'var(--text-primary)', fontWeight: '500' }}>Food, Retail & FMCG Basket (Weight: 25%)</span>
                <span style={{ color: 'var(--accent)', fontWeight: '600' }}>{activeData.food}% Inflation</span>
              </div>
              <div style={{ height: '8px', backgroundColor: 'var(--bg-inner-white-05)', borderRadius: '4px', overflow: 'hidden' }}>
                <div style={{ width: `${(activeData.food / 15) * 100}%`, height: '100%', backgroundColor: 'var(--accent)' }}></div>
              </div>
            </div>

            <div>
              <div className="flex-between" style={{ fontSize: '0.82rem', marginBottom: '4px' }}>
                <span style={{ color: 'var(--text-primary)', fontWeight: '500' }}>Fuel, Logistics & Commute (Weight: 20%)</span>
                <span style={{ color: 'var(--primary)', fontWeight: '600' }}>{activeData.transport}% Inflation</span>
              </div>
              <div style={{ height: '8px', backgroundColor: 'var(--bg-inner-white-05)', borderRadius: '4px', overflow: 'hidden' }}>
                <div style={{ width: `${(activeData.transport / 15) * 100}%`, height: '100%', backgroundColor: 'var(--primary)' }}></div>
              </div>
            </div>

            <div>
              <div className="flex-between" style={{ fontSize: '0.82rem', marginBottom: '4px' }}>
                <span style={{ color: 'var(--text-primary)', fontWeight: '500' }}>Healthcare & Shared Utilities (Weight: 20%)</span>
                <span style={{ color: '#3b82f6', fontWeight: '600' }}>{activeData.utilities}% Inflation</span>
              </div>
              <div style={{ height: '8px', backgroundColor: 'var(--bg-inner-white-05)', borderRadius: '4px', overflow: 'hidden' }}>
                <div style={{ width: `${(activeData.utilities / 15) * 100}%`, height: '100%', backgroundColor: '#3b82f6' }}></div>
              </div>
            </div>
          </div>

          {/* SVG Trend Line */}
          <div>
            <h4 style={{ fontSize: '0.92rem', color: 'var(--text-secondary)', marginBottom: '12px' }}>12-Month CLII Trend Progression</h4>
            <div style={{ 
              height: '140px', 
              backgroundColor: 'var(--bg-inner-dark-light)', 
              border: '1px solid var(--border-color)',
              borderRadius: '8px',
              position: 'relative',
              overflow: 'hidden'
            }}>
              <svg width="100%" height="100%" viewBox="0 0 460 140" preserveAspectRatio="none" style={{ position: 'absolute', top: 0, left: 0 }}>
                {/* Grid Lines */}
                <line x1="0" y1="35" x2="460" y2="35" stroke="var(--border-white-05)" strokeWidth="1" />
                <line x1="0" y1="70" x2="460" y2="70" stroke="var(--border-white-05)" strokeWidth="1" />
                <line x1="0" y1="105" x2="460" y2="105" stroke="var(--border-white-05)" strokeWidth="1" />

                {/* Trend line path */}
                <path 
                  d={renderMockChartPoints(selectedCity)} 
                  fill="none" 
                  stroke={activeData.total > 8.0 ? 'var(--danger)' : 'var(--accent)'} 
                  strokeWidth="3" 
                  strokeLinecap="round"
                  style={{
                    filter: 'drop-shadow(0 4px 10px var(--primary-glow))'
                  }}
                />
              </svg>
              <div style={{ position: 'absolute', bottom: '8px', left: '10px', fontSize: '0.65rem', color: 'var(--text-muted)' }}>Jul 2025</div>
              <div style={{ position: 'absolute', bottom: '8px', right: '10px', fontSize: '0.65rem', color: 'var(--text-muted)' }}>Jun 2026 (Now)</div>
              <div style={{ position: 'absolute', top: '8px', right: '10px', fontSize: '0.75rem', fontWeight: 'bold', color: 'var(--text-primary)' }}>
                Peak: {selectedCity === 'Mumbai' ? '9.1%' : selectedCity === 'Hyderabad' ? '8.4%' : '8.0%'}
              </div>
            </div>
          </div>

        </div>
      </div>

      {/* Stream API References */}
      <div className="glass-panel" style={{ padding: '24px' }}>
        <h3 style={{ fontSize: '1.1rem', marginBottom: '12px' }}>Fused Stream Data Sources</h3>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '16px' }}>
          <div style={{ padding: '12px', border: '1px solid var(--border-color)', borderRadius: '8px', backgroundColor: 'var(--bg-inner-dark-superlight)' }}>
            <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)', display: 'block', fontWeight: '600' }}>MOSPI API Feed</span>
            <span style={{ fontSize: '0.85rem', color: 'var(--secondary)', display: 'block', margin: '4px 0', fontWeight: '700' }}>Active (200 OK)</span>
            <span style={{ fontSize: '0.65rem', color: 'var(--text-secondary)' }}>National Consumer Price Index stream</span>
          </div>

          <div style={{ padding: '12px', border: '1px solid var(--border-color)', borderRadius: '8px', backgroundColor: 'var(--bg-inner-dark-superlight)' }}>
            <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)', display: 'block', fontWeight: '600' }}>RBI API Portal</span>
            <span style={{ fontSize: '0.85rem', color: 'var(--secondary)', display: 'block', margin: '4px 0', fontWeight: '700' }}>Active (200 OK)</span>
            <span style={{ fontSize: '0.65rem', color: 'var(--text-secondary)' }}>Quarterly repo rates & core forecasts</span>
          </div>

          <div style={{ padding: '12px', border: '1px solid var(--border-color)', borderRadius: '8px', backgroundColor: 'var(--bg-inner-dark-superlight)' }}>
            <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)', display: 'block', fontWeight: '600' }}>MagicBricks / 99Acres API</span>
            <span style={{ fontSize: '0.85rem', color: 'var(--secondary)', display: 'block', margin: '4px 0', fontWeight: '700' }}>Active (200 OK)</span>
            <span style={{ fontSize: '0.65rem', color: 'var(--text-secondary)' }}>Rental price tracking (IT Corridors)</span>
          </div>

          <div style={{ padding: '12px', border: '1px solid var(--border-color)', borderRadius: '8px', backgroundColor: 'var(--bg-inner-dark-superlight)' }}>
            <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)', display: 'block', fontWeight: '600' }}>Zomato / Swiggy Consumer Basket</span>
            <span style={{ fontSize: '0.85rem', color: 'var(--secondary)', display: 'block', margin: '4px 0', fontWeight: '700' }}>Active (200 OK)</span>
            <span style={{ fontSize: '0.65rem', color: 'var(--text-secondary)' }}>FMCG / Food delivery pricing surges</span>
          </div>
        </div>
      </div>

    </div>
  );
}
