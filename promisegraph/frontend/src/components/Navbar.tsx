import React, { useEffect, useState, useRef } from 'react';
import {
  Share2,
  Bell,
  ChevronDown,
  LayoutDashboard,
  Compass,
  LogOut,
  Settings as SettingsIcon,
  LogIn,
  UserPlus
} from 'lucide-react';
import { fetchHealth } from '../services/api';
import { HealthResponse } from '../types';
import { useAuth } from '../context/AuthContext';

interface NavbarProps {
  currentView: 'landing' | 'dashboard' | 'login' | 'register';
  setCurrentView: (view: 'landing' | 'dashboard' | 'login' | 'register') => void;
  activeTab?: string;
  setActiveTab?: (tab: string) => void;
  onGoToLogin: () => void;
  onGoToRegister: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  currentView,
  setCurrentView,
  setActiveTab,
  onGoToLogin,
  onGoToRegister,
}) => {
  const { user, isAuthenticated, logout } = useAuth();
  const [health, setHealth] = useState<HealthResponse | null>(null);
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    fetchHealth().then(setHealth);
    const interval = setInterval(() => {
      fetchHealth().then(setHealth);
    }, 15000);
    return () => clearInterval(interval);
  }, []);

  // Close profile dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setShowProfileMenu(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const getInitials = () => {
    if (user?.full_name) {
      return user.full_name
        .split(' ')
        .map((n) => n[0])
        .join('')
        .slice(0, 2)
        .toUpperCase();
    }
    if (user?.email) {
      return user.email.slice(0, 2).toUpperCase();
    }
    return 'PG';
  };

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
                  Phase 3
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
              onClick={() => {
                if (isAuthenticated) {
                  setCurrentView('dashboard');
                } else {
                  onGoToLogin();
                }
              }}
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

        {/* Right: Health Badge & Profile / Auth Controls */}
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

          {/* Unauthenticated Actions */}
          {!isAuthenticated ? (
            <div className="flex items-center space-x-2">
              <button
                onClick={onGoToLogin}
                className="inline-flex items-center space-x-1.5 px-3.5 py-2 rounded-xl text-xs font-semibold text-[#172044] hover:text-[#5146E5] hover:bg-[#F5F7FF] transition-all"
              >
                <LogIn className="h-3.5 w-3.5" />
                <span>Sign In</span>
              </button>
              <button
                onClick={onGoToRegister}
                className="inline-flex items-center space-x-1.5 rounded-xl bg-[#5146E5] px-4 py-2 text-xs font-semibold text-white shadow-sm shadow-[#5146E5]/25 hover:bg-[#4338CA] transition-all transform hover:-translate-y-0.5"
              >
                <UserPlus className="h-3.5 w-3.5" />
                <span>Get Started</span>
              </button>
            </div>
          ) : (
            /* Authenticated Actions */
            <>
              {/* Notification button placeholder */}
              <button
                aria-label="Notifications"
                className="relative rounded-xl p-2 text-[#64708B] hover:bg-[#F5F7FF] hover:text-[#172044] transition-colors"
              >
                <Bell className="h-5 w-5" />
                <span className="absolute top-1.5 right-1.5 h-2 w-2 rounded-full bg-[#5146E5]" />
              </button>

              {/* Profile Dropdown */}
              <div className="relative" ref={menuRef}>
                <button
                  onClick={() => setShowProfileMenu(!showProfileMenu)}
                  className="flex items-center space-x-2.5 rounded-full border border-[#E8EAF3] bg-white p-1 pr-3 hover:border-[#D6D9EB] focus:outline-none transition-all shadow-subtle"
                >
                  <div className="flex h-7 w-7 items-center justify-center rounded-full bg-[#5146E5] text-xs font-bold text-white shadow-sm">
                    {getInitials()}
                  </div>
                  <div className="text-left hidden md:block">
                    <p className="text-xs font-semibold text-[#172044] leading-tight">
                      {user?.full_name || user?.email.split('@')[0]}
                    </p>
                    <p className="text-[10px] text-[#64708B] leading-none truncate max-w-[110px]">
                      {user?.email}
                    </p>
                  </div>
                  <ChevronDown className="h-3 w-3 text-[#64708B]" />
                </button>

                {/* Profile Menu Dropdown */}
                {showProfileMenu && (
                  <div className="absolute right-0 mt-2 w-60 rounded-2xl border border-[#E8EAF3] bg-white p-2 shadow-xl animate-in fade-in-50 duration-150 z-50">
                    <div className="border-b border-[#E8EAF3] px-3 py-2.5">
                      <p className="text-xs font-bold text-[#172044]">
                        {user?.full_name || 'PromiseGraph User'}
                      </p>
                      <p className="text-[11px] text-[#64708B] truncate">{user?.email}</p>
                      <div className="mt-2 inline-flex items-center rounded-md bg-[#E6F8F5] px-2 py-0.5 text-[10px] font-semibold text-[#24B8A5] border border-[#24B8A5]/20">
                        Authenticated Session
                      </div>
                    </div>

                    <div className="py-1 text-xs text-[#172044]">
                      <button
                        onClick={() => {
                          setCurrentView('dashboard');
                          if (setActiveTab) setActiveTab('overview');
                          setShowProfileMenu(false);
                        }}
                        className="flex w-full items-center space-x-2 px-3 py-2 rounded-xl font-medium hover:bg-[#F5F7FF] text-[#172044] transition-colors"
                      >
                        <LayoutDashboard className="h-4 w-4 text-[#5146E5]" />
                        <span>Dashboard</span>
                      </button>

                      <button
                        onClick={() => {
                          setCurrentView('dashboard');
                          if (setActiveTab) setActiveTab('settings');
                          setShowProfileMenu(false);
                        }}
                        className="flex w-full items-center space-x-2 px-3 py-2 rounded-xl font-medium hover:bg-[#F5F7FF] text-[#172044] transition-colors"
                      >
                        <SettingsIcon className="h-4 w-4 text-[#64708B]" />
                        <span>Account & Settings</span>
                      </button>
                    </div>

                    <div className="pt-1 border-t border-[#E8EAF3]">
                      <button
                        onClick={async () => {
                          setShowProfileMenu(false);
                          await logout();
                          setCurrentView('landing');
                        }}
                        className="flex w-full items-center space-x-2 px-3 py-2 rounded-xl font-medium text-[#E66D68] hover:bg-[#FEF2F2] transition-colors text-xs"
                      >
                        <LogOut className="h-4 w-4" />
                        <span>Sign Out</span>
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </>
          )}

        </div>

      </div>
    </header>
  );
};
