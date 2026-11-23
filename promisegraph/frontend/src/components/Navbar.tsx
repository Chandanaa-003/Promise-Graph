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
    <header className="sticky top-0 z-50 w-full border-b border-slate-800/80 bg-slate-950/80 backdrop-blur-md">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        
        {/* Left: Brand Identity */}
        <div className="flex items-center space-x-6">
          <button
            onClick={() => setCurrentView('landing')}
            className="flex items-center space-x-3 text-left focus:outline-none group"
          >
            <div className="relative flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-tr from-indigo-600 via-indigo-500 to-emerald-400 p-[1px] shadow-lg shadow-indigo-500/20 group-hover:scale-105 transition-all">
              <div className="flex h-full w-full items-center justify-center rounded-xl bg-slate-950">
                <Share2 className="h-5 w-5 text-indigo-400 group-hover:text-emerald-300 transition-colors" />
              </div>
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <span className="text-lg font-bold tracking-tight text-white group-hover:text-indigo-200 transition-colors">
                  Promise<span className="text-indigo-400">Graph</span>
                </span>
                <span className="rounded-full bg-indigo-500/10 px-2 py-0.5 text-[10px] font-semibold text-indigo-400 border border-indigo-500/20">
                  Phase 1
                </span>
              </div>
              <p className="text-[11px] text-slate-400 font-medium hidden sm:block">
                Communication Intelligence
              </p>
            </div>
          </button>

          {/* Navigation links */}
          <nav className="hidden md:flex items-center space-x-1 pl-4 border-l border-slate-800">
            <button
              onClick={() => setCurrentView('landing')}
              className={`flex items-center space-x-2 px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                currentView === 'landing'
                  ? 'bg-slate-800/80 text-white'
                  : 'text-slate-400 hover:text-white hover:bg-slate-800/40'
              }`}
            >
              <Compass className="h-4 w-4" />
              <span>Platform</span>
            </button>
            <button
              onClick={() => setCurrentView('dashboard')}
              className={`flex items-center space-x-2 px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                currentView === 'dashboard'
                  ? 'bg-indigo-600/20 text-indigo-300 border border-indigo-500/30'
                  : 'text-slate-400 hover:text-white hover:bg-slate-800/40'
              }`}
            >
              <LayoutDashboard className="h-4 w-4" />
              <span>Dashboard</span>
            </button>
          </nav>
        </div>

        {/* Right: Health Badge & Profile Placeholder */}
        <div className="flex items-center space-x-4">
          
          {/* Live Backend Health Status Pill */}
          <div
            title={`API Health: ${health?.status || 'connecting...'} | DB: ${
              health?.database_connected ? 'Connected' : 'Degraded'
            }`}
            className="hidden sm:flex items-center space-x-2 rounded-full border border-slate-800 bg-slate-900/80 px-3 py-1 text-xs text-slate-300 shadow-inner"
          >
            <span className="relative flex h-2 w-2">
              <span
                className={`animate-ping absolute inline-flex h-full w-full rounded-full opacity-75 ${
                  health?.database_connected ? 'bg-emerald-400' : 'bg-amber-400'
                }`}
              />
              <span
                className={`relative inline-flex rounded-full h-2 w-2 ${
                  health?.database_connected ? 'bg-emerald-500' : 'bg-amber-500'
                }`}
              />
            </span>
            <span className="font-medium text-slate-400">API:</span>
            <span className="font-semibold text-slate-200">
              {health?.status === 'ok' ? 'Online' : 'Degraded'}
            </span>
          </div>

          {/* Quick CTA if on landing */}
          {currentView === 'landing' ? (
            <button
              onClick={() => setCurrentView('dashboard')}
              className="inline-flex items-center space-x-2 rounded-lg bg-indigo-600 px-3.5 py-1.5 text-sm font-semibold text-white shadow-sm shadow-indigo-600/30 hover:bg-indigo-500 transition-colors"
            >
              <span>Launch App</span>
            </button>
          ) : (
            <button
              onClick={() => setCurrentView('landing')}
              className="text-xs text-slate-400 hover:text-slate-200 hidden lg:block"
            >
              Back to Overview
            </button>
          )}

          {/* Notification placeholder */}
          <button
            aria-label="Notifications"
            className="relative rounded-lg p-2 text-slate-400 hover:bg-slate-800/60 hover:text-white transition-colors"
          >
            <Bell className="h-5 w-5" />
            <span className="absolute top-1.5 right-1.5 h-2 w-2 rounded-full bg-indigo-500" />
          </button>

          {/* Profile Placeholder (Header with profile placeholder as requested) */}
          <div className="relative">
            <button
              onClick={() => setShowProfileMenu(!showProfileMenu)}
              className="flex items-center space-x-3 rounded-full border border-slate-800 bg-slate-900 p-1 pr-3 hover:border-slate-700 focus:outline-none transition-colors"
            >
              <div className="flex h-7 w-7 items-center justify-center rounded-full bg-gradient-to-tr from-indigo-500 to-purple-600 text-xs font-bold text-white shadow-sm">
                AM
              </div>
              <div className="text-left hidden md:block">
                <p className="text-xs font-medium text-slate-200 leading-tight">Alex Mercer</p>
                <p className="text-[10px] text-slate-400 leading-none">Architect</p>
              </div>
              <ChevronDown className="h-3 w-3 text-slate-400" />
            </button>

            {/* Profile Menu Dropdown */}
            {showProfileMenu && (
              <div className="absolute right-0 mt-2 w-56 rounded-xl border border-slate-800 bg-slate-900/95 p-2 shadow-2xl backdrop-blur-lg">
                <div className="border-b border-slate-800 px-3 py-2">
                  <p className="text-xs font-semibold text-white">Alex Mercer</p>
                  <p className="text-[11px] text-slate-400">alex.mercer@promisegraph.ai</p>
                  <div className="mt-2 inline-flex items-center rounded-md bg-emerald-500/10 px-2 py-0.5 text-[10px] font-medium text-emerald-400 border border-emerald-500/20">
                    Phase 1 Architect Session
                  </div>
                </div>
                <div className="py-1 text-xs text-slate-300">
                  <button
                    onClick={() => {
                      setCurrentView('dashboard');
                      setShowProfileMenu(false);
                    }}
                    className="flex w-full items-center px-3 py-2 rounded-lg hover:bg-slate-800/80 transition-colors"
                  >
                    Dashboard
                  </button>
                  <div className="px-3 py-1.5 text-[11px] text-slate-500">
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
