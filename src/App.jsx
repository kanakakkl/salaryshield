import React, { useState, useEffect } from 'react';
import Sidebar from './components/Sidebar';
import EmployerDashboard from './components/EmployerDashboard';
import EmployeePortal from './components/EmployeePortal';
import InflationEngine from './components/InflationEngine';
import Copilot from './components/Copilot';
import BudgetPlanner from './components/BudgetPlanner';

function App() {
  const [activeTab, setActiveTab] = useState('employer');
  const [theme, setTheme] = useState(() => {
    return localStorage.getItem('salaryshield-theme') || 'dark';
  });

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem('salaryshield-theme', theme);
  }, [theme]);

  return (
    <div style={{ display: 'flex', minHeight: '100vh', backgroundColor: 'var(--bg-primary)' }}>
      {/* Navigation Sidebar */}
      <Sidebar 
        activeTab={activeTab} 
        setActiveTab={setActiveTab} 
        theme={theme} 
        setTheme={setTheme} 
      />
      
      {/* Main View Router */}
      <div style={{ flex: 1 }}>
        {activeTab === 'employer' && <EmployerDashboard />}
        {activeTab === 'employee' && <EmployeePortal />}
        {activeTab === 'budget' && <BudgetPlanner setActiveTab={setActiveTab} />}
        {activeTab === 'inflation' && <InflationEngine />}
        {activeTab === 'copilot' && <Copilot />}
      </div>
    </div>
  );
}

export default App;
