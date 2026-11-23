import React, { useState } from 'react';
import { Navbar } from './components/Navbar';
import { Sidebar } from './components/Sidebar';
import { LandingPage } from './components/LandingPage';
import { Dashboard } from './components/Dashboard';

export const App: React.FC = () => {
  const [currentView, setCurrentView] = useState<'landing' | 'dashboard'>('landing');
  const [activeTab, setActiveTab] = useState<string>('overview');
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="min-h-screen bg-[#F5F7FF] text-[#172044] flex flex-col font-sans selection:bg-[#5146E5] selection:text-white">
      {/* Top Header / Navbar */}
      <Navbar
        currentView={currentView}
        setCurrentView={setCurrentView}
        activeTab={activeTab}
        setActiveTab={setActiveTab}
      />

      {/* Main Body Layout */}
      {currentView === 'landing' ? (
        <main className="flex-1">
          <LandingPage onEnterDashboard={() => setCurrentView('dashboard')} />
        </main>
      ) : (
        <div className="flex flex-1 overflow-hidden">
          {/* Collapsible Sidebar Navigation */}
          <Sidebar
            activeTab={activeTab}
            setActiveTab={setActiveTab}
            isOpen={sidebarOpen}
            toggleSidebar={() => setSidebarOpen(!sidebarOpen)}
          />

          {/* Dashboard Area */}
          <main className="flex-1 overflow-y-auto bg-[#F5F7FF]">
            <Dashboard />
          </main>
        </div>
      )}
    </div>
  );
};

export default App;
