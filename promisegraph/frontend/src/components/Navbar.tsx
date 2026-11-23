import React, { useEffect, useState } from 'react';
import {
  Share2,
  Bell,
  ChevronDown,
  LayoutDashboard,
  Compass
} from 'lucide-react';
import { fetchHealth } from '../services/api';
import { HealthResponse } from '../types';

interface NavbarProps {
  currentView: 'landing' | 'dashboard';
  setCurrentView: (view: 'landing' | 'dashboard') => void;
  activeTab?: string;
  setActiveTab?: (tab: string) => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  currentView,
  setCurrentView,
}) => {
  const [health, setHealth] = useState<HealthResponse | null>(null);
  const [showProfileMenu, setShowProfileMenu] = useState(false);

  useEffect(() => {
    fetchHealth().then(setHealth);
    const interval = setInterval(() => {
      fetchHealth().then(setHealth);
    }, 15000);
    return () => clearInterval(interval);
  }, []);

  return (
    <header className="sticky top-0 z-50 w-full border-b border-[#E8EAF3] bg-white/95 backdrop-blur-md shadow-nav">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        
        {/* Left: Brand Identity */}
        <div className="flex items-center space-x-6">
          <button
            onClick={() => setCurrentView('landing')}
            className="flex items-center space-x-3 text-left focus:outline-none group"
          >
            <div className="relative flex h-10 w-10 items-center justify-center rounded-xl bg-[#5146E5] shadow-md shadow-[#5146E5]/20 group-hover:bg-[#4338CA] transition-all">
              <Share2 className="h-5 w-5 text-white" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <span className="text-lg font-bold tracking-tight text-[#172044]">
                  Promise<span className="text-[#5146E5]">Graph</span>
                </span>
                <span className="rounded-full bg-[#EEF0FD] px-2 py-0.5 text-[10px] font-semibold text-[#5146E5] border border-[#5146E5]/15">
                  Phase 1
                </span>
              </div>
              <p className="text-[11px] text-[#64708B] font-medium hidden sm:block">
                Communication Intelligence
              </p>
            </div>
          </button>

          {/* Navigation links */}
          <nav className="hidden md:flex items-center space-x-1 pl-4 border-l border-[#E8EAF3]">
            <button
              onClick={() => setCurrentView('landing')}
              className={`flex items-center space-x-2 px-3.5 py-1.5 rounded-xl text-sm font-medium transition-all ${
                currentView === 'landing'
                  ? 'bg-[#EEF0FD] text-[#5146E5] font-semibold'
                  : 'text-[#64708B] hover:text-[#172044] hover:bg-[#F5F7FF]'
              }`}
            >
              <Compass className="h-4 w-4" />
              <span>Platform</span>
            </button>
            <button
              onClick={() => setCurrentView('dashboard')}
              className={`flex items-center space-x-2 px-3.5 py-1.5 rounded-xl text-sm font-medium transition-all ${
                currentView === 'dashboard'
                  ? 'bg-[#EEF0FD] text-[#5146E5] font-semibold'
                  : 'text-[#64708B] hover:text-[#172044] hover:bg-[#F5F7FF]'
              }`}
            >
              <LayoutDashboard className="h-4 w-4" />
              <span>Dashboard</span>
            </button>
          </nav>
        </div>

        {/* Right: Health Badge & Profile Placeholder */}
        <div className="flex items-center space-x-3.5">
          
          {/* Live Backend Health Status Pill */}
          <div
            title={`API Health: ${health?.status || 'connecting...'} | DB: ${
              health?.database_connected ? 'Connected' : 'Degraded'
            }`}
            className="hidden sm:flex items-center space-x-2 rounded-full border border-[#E8EAF3] bg-[#F5F7FF] px-3.5 py-1 text-xs text-[#172044]"
          >
            <span className="relative flex h-2 w-2">
              <span
                className={`animate-ping absolute inline-flex h-full w-full rounded-full opacity-75 ${
                  health?.database_connected ? 'bg-[#24B8A5]' : 'bg-[#F2B84B]'
                }`}
              />
              <span
                className={`relative inline-flex rounded-full h-2 w-2 ${
                  health?.database_connected ? 'bg-[#24B8A5]' : 'bg-[#F2B84B]'
                }`}
              />
            </span>
            <span className="font-medium text-[#64708B]">API:</span>
            <span className="font-semibold text-[#172044]">
              {health?.status === 'ok' ? 'Online' : 'Degraded'}
            </span>
          </div>

          {/* Quick CTA if on landing */}
          {currentView === 'landing' ? (
            <button
              onClick={() => setCurrentView('dashboard')}
              className="inline-flex items-center space-x-2 rounded-xl bg-[#5146E5] px-4 py-2 text-xs font-semibold text-white shadow-sm shadow-[#5146E5]/25 hover:bg-[#4338CA] transition-all transform hover:-translate-y-0.5"
            >
              <span>Launch App</span>
            </button>
          ) : (
            <button
              onClick={() => setCurrentView('landing')}
              className="text-xs text-[#64708B] hover:text-[#172044] font-medium hidden lg:block"
            >
              Overview
            </button>
          )}

          {/* Notification placeholder */}
          <button
            aria-label="Notifications"
            className="relative rounded-xl p-2 text-[#64708B] hover:bg-[#F5F7FF] hover:text-[#172044] transition-colors"
          >
            <Bell className="h-5 w-5" />
            <span className="absolute top-1.5 right-1.5 h-2 w-2 rounded-full bg-[#5146E5]" />
          </button>

          {/* Profile Placeholder */}
          <div className="relative">
            <button
              onClick={() => setShowProfileMenu(!showProfileMenu)}
              className="flex items-center space-x-2.5 rounded-full border border-[#E8EAF3] bg-white p-1 pr-3 hover:border-[#D6D9EB] focus:outline-none transition-all shadow-subtle"
            >
              <div className="flex h-7 w-7 items-center justify-center rounded-full bg-[#5146E5] text-xs font-bold text-white shadow-sm">
                AM
              </div>
              <div className="text-left hidden md:block">
                <p className="text-xs font-semibold text-[#172044] leading-tight">Alex Mercer</p>
                <p className="text-[10px] text-[#64708B] leading-none">Architect</p>
              </div>
              <ChevronDown className="h-3 w-3 text-[#64708B]" />
            </button>

            {/* Profile Menu Dropdown */}
            {showProfileMenu && (
              <div className="absolute right-0 mt-2 w-56 rounded-2xl border border-[#E8EAF3] bg-white p-2 shadow-xl animate-in fade-in-50 duration-150">
                <div className="border-b border-[#E8EAF3] px-3 py-2.5">
                  <p className="text-xs font-bold text-[#172044]">Alex Mercer</p>
                  <p className="text-[11px] text-[#64708B]">alex.mercer@promisegraph.ai</p>
                  <div className="mt-2 inline-flex items-center rounded-md bg-[#E6F8F5] px-2 py-0.5 text-[10px] font-semibold text-[#24B8A5] border border-[#24B8A5]/20">
                    Phase 1 Architect Session
                  </div>
                </div>
                <div className="py-1 text-xs text-[#172044]">
                  <button
                    onClick={() => {
                      setCurrentView('dashboard');
                      setShowProfileMenu(false);
                    }}
                    className="flex w-full items-center px-3 py-2 rounded-xl font-medium hover:bg-[#F5F7FF] text-[#5146E5] transition-colors"
                  >
                    Dashboard View
                  </button>
                  <div className="px-3 py-1.5 text-[11px] text-[#64708B]">
                    Role: Senior Software Architect
                  </div>
                </div>
              </div>
            )}
          </div>

        </div>

      </div>
    </header>
  );
};
