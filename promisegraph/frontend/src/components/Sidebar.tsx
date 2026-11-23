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
      className={`fixed inset-y-0 left-0 z-40 flex flex-col border-r border-[#E8EAF3] bg-white pt-16 transition-all duration-300 md:static md:translate-x-0 ${
        isOpen ? 'w-64 translate-x-0' : '-translate-x-full md:w-20 lg:w-64'
      }`}
    >
      <div className="flex flex-1 flex-col justify-between p-4">
        
        {/* Navigation list */}
        <div className="space-y-6">
          <div>
            <div className="px-3 pb-2 text-[11px] font-bold tracking-wider text-[#64708B] uppercase hidden lg:block">
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
                    className={`group flex w-full items-center justify-between rounded-xl px-3.5 py-2.5 text-sm font-medium transition-all ${
                      isActive
                        ? 'bg-[#5146E5] text-white shadow-sm shadow-[#5146E5]/25 font-semibold'
                        : 'text-[#64708B] hover:bg-[#F5F7FF] hover:text-[#172044]'
                    }`}
                  >
                    <div className="flex items-center space-x-3">
                      <Icon
                        className={`h-5 w-5 flex-shrink-0 transition-colors ${
                          isActive
                            ? 'text-white'
                            : 'text-[#64708B] group-hover:text-[#172044]'
                        }`}
                      />
                      <span className="hidden lg:block truncate">{item.label}</span>
                    </div>

                    {item.badge && (
                      <span
                        className={`hidden lg:inline-flex rounded-full px-2 py-0.5 text-[10px] font-semibold transition-all ${
                          isActive
                            ? 'bg-white/20 text-white'
                            : 'bg-[#F5F7FF] text-[#64708B] border border-[#E8EAF3]'
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
          <div className="rounded-2xl border border-[#E8EAF3] bg-[#F5F7FF] p-4 hidden lg:block">
            <div className="flex items-center space-x-2 text-[#5146E5] text-xs font-bold">
              <Sparkles className="h-4 w-4" />
              <span>Foundation Phase 1</span>
            </div>
            <p className="mt-1.5 text-[11px] text-[#64708B] leading-relaxed">
              FastAPI backend, PostgreSQL models, and React UI ready for channel ingestion pipelines.
            </p>
            <div className="mt-3 flex items-center justify-between text-[10px] text-[#64708B] pt-2 border-t border-[#E8EAF3]/70">
              <span className="flex items-center space-x-1.5">
                <span className="h-1.5 w-1.5 rounded-full bg-[#24B8A5]" />
                <span className="font-medium text-[#172044]">SQLAlchemy 2.0</span>
              </span>
              <span className="font-medium">FastAPI 0.115</span>
            </div>
          </div>
        </div>

        {/* Footer info in sidebar */}
        <div className="border-t border-[#E8EAF3] pt-4 hidden lg:block">
          <div className="flex items-center justify-between text-[11px]">
            <span className="text-[#64708B]">PromiseGraph v0.1.0</span>
            <span className="text-[#24B8A5] font-semibold">Phase 1 Done</span>
          </div>
        </div>

      </div>
    </aside>
  );
};
