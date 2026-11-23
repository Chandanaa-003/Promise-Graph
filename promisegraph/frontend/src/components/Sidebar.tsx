import React from 'react';
import {
  LayoutDashboard,
  FileCheck2,
  GitFork,
  Radio,
  Settings,
  Shield,
  Sparkles
} from 'lucide-react';

interface SidebarProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  isOpen: boolean;
  toggleSidebar: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  activeTab,
  setActiveTab,
  isOpen,
}) => {
  const navItems = [
    {
      id: 'overview',
      label: 'Overview',
      icon: LayoutDashboard,
      badge: null,
      desc: 'Platform summary and metrics'
    },
    {
      id: 'commitments',
      label: 'Commitments',
      icon: FileCheck2,
      badge: '14 Active',
      desc: 'Extracted promises & deadlines'
    },
    {
      id: 'graph',
      label: 'Relationship Graph',
      icon: GitFork,
      badge: '28 Nodes',
      desc: 'Stakeholder commitment graph'
    },
    {
      id: 'channels',
      label: 'Channel Sources',
      icon: Radio,
      badge: 'Phase 2+',
      desc: 'Email, WhatsApp, GitHub'
    },
    {
      id: 'approvals',
      label: 'Approvals & Follow-ups',
      icon: Shield,
      badge: 'Review',
      desc: 'Human-in-the-loop actions'
    },
    {
      id: 'settings',
      label: 'Settings & Config',
      icon: Settings,
      badge: null,
      desc: 'API keys & preferences'
    },
  ];

  return (
    <aside
      className={`fixed inset-y-0 left-0 z-40 flex flex-col border-r border-slate-800 bg-slate-950/95 pt-16 transition-all duration-300 backdrop-blur-xl md:static md:translate-x-0 ${
        isOpen ? 'w-64 translate-x-0' : '-translate-x-full md:w-20 lg:w-64'
      }`}
    >
      <div className="flex flex-1 flex-col justify-between p-4">
        
        {/* Navigation list */}
        <div className="space-y-6">
          <div>
            <div className="px-3 pb-2 text-[11px] font-semibold tracking-wider text-slate-500 uppercase hidden lg:block">
              Intelligence Hub
            </div>
            <nav className="space-y-1">
              {navItems.map((item) => {
                const Icon = item.icon;
                const isActive = activeTab === item.id;
                return (
                  <button
                    key={item.id}
                    onClick={() => setActiveTab(item.id)}
                    className={`group flex w-full items-center justify-between rounded-xl px-3 py-2.5 text-sm font-medium transition-all ${
                      isActive
                        ? 'bg-indigo-600/15 text-indigo-300 border border-indigo-500/30 shadow-sm shadow-indigo-500/10'
                        : 'text-slate-400 hover:bg-slate-900 hover:text-slate-200'
                    }`}
                  >
                    <div className="flex items-center space-x-3">
                      <Icon
                        className={`h-5 w-5 flex-shrink-0 transition-colors ${
                          isActive
                            ? 'text-indigo-400'
                            : 'text-slate-400 group-hover:text-slate-200'
                        }`}
                      />
                      <span className="hidden lg:block truncate">{item.label}</span>
                    </div>

                    {item.badge && (
                      <span
                        className={`hidden lg:inline-flex rounded-full px-2 py-0.5 text-[10px] font-semibold ${
                          isActive
                            ? 'bg-indigo-500/20 text-indigo-300 border border-indigo-500/30'
                            : 'bg-slate-800 text-slate-400'
                        }`}
                      >
                        {item.badge}
                      </span>
                    )}
                  </button>
                );
              })}
            </nav>
          </div>

          {/* Architecture Status Box */}
          <div className="rounded-xl border border-slate-800/80 bg-slate-900/40 p-3.5 hidden lg:block">
            <div className="flex items-center space-x-2 text-indigo-400 text-xs font-semibold">
              <Sparkles className="h-4 w-4" />
              <span>Foundation Phase 1</span>
            </div>
            <p className="mt-1 text-[11px] text-slate-400 leading-relaxed">
              FastAPI backend, PostgreSQL models, and React UI ready for channel ingestion pipelines.
            </p>
            <div className="mt-3 flex items-center justify-between text-[10px] text-slate-500">
              <span className="flex items-center space-x-1">
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
                <span>SQLAlchemy 2.0</span>
              </span>
              <span>FastAPI 0.115</span>
            </div>
          </div>
        </div>

        {/* Footer info in sidebar */}
        <div className="border-t border-slate-800/80 pt-4 hidden lg:block">
          <div className="flex items-center justify-between text-[11px] text-slate-500">
            <span>PromiseGraph v0.1.0</span>
            <span className="text-emerald-400 font-mono">Phase 1 Done</span>
          </div>
        </div>

      </div>
    </aside>
  );
};
