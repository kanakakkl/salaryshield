import React, { useState } from 'react';
import Sidebar from './components/Sidebar';
import EmployerDashboard from './components/EmployerDashboard';
import EmployeePortal from './components/EmployeePortal';
import InflationEngine from './components/InflationEngine';
import Copilot from './components/Copilot';
import BudgetPlanner from './components/BudgetPlanner';

function App() {
  const [activeTab, setActiveTab] = useState('employer');

  return (
    <div style={{ display: 'flex', minHeight: '100vh', backgroundColor: 'var(--bg-primary)' }}>
      {/* Navigation Sidebar */}
      <Sidebar activeTab={activeTab} setActiveTab={setActiveTab} />
      
      {/* Main View Router */}
      <div style={{ flex: 1 }}>
        {activeTab === 'employer' && <EmployerDashboard />}
        {activeTab === 'employee' && <EmployeePortal />}
        {activeTab === 'budget' && <BudgetPlanner />}
        {activeTab === 'inflation' && <InflationEngine />}
        {activeTab === 'copilot' && <Copilot />}
      </div>
    </div>
  );
}

export default App;
