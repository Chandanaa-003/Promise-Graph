import React from 'react';
import {
  LayoutDashboard,
  FileCheck2,
  Users,
  GitFork,
  Radio,
  FileSearch,
  Settings,
  Sparkles
} from 'lucide-react';

interface SidebarProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  isOpen: boolean;
  toggleSidebar: () => void;
  commitmentsCount?: number;
  peopleCount?: number;
}

export const Sidebar: React.FC<SidebarProps> = ({
  activeTab,
  setActiveTab,
  isOpen,
  commitmentsCount = 0,
  peopleCount = 0,
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
      badge: commitmentsCount > 0 ? `${commitmentsCount}` : null,
      desc: 'Extracted promises & deadlines'
    },
    {
      id: 'people',
      label: 'People',
      icon: Users,
      badge: peopleCount > 0 ? `${peopleCount}` : null,
      desc: 'Stakeholders directory'
    },
    {
      id: 'graph',
      label: 'Relationship Graph',
      icon: GitFork,
      badge: null,
      desc: 'Visual knowledge graph'
    },
    {
      id: 'channels',
      label: 'Sources',
      icon: Radio,
      badge: 'Roadmap',
      desc: 'Gmail, WhatsApp, GitHub'
    },
    {
      id: 'evidence',
      label: 'Evidence & Audit',
      icon: FileSearch,
      badge: 'Audit',
      desc: 'Context proof records'
    },
    {
      id: 'settings',
      label: 'Settings',
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
              <span>Phase 2 Functional</span>
            </div>
            <p className="mt-1.5 text-[11px] text-[#64708B] leading-relaxed">
              Active React frontend synced with FastAPI & SQLite/PostgreSQL models with full CRUD.
            </p>
            <div className="mt-3 flex items-center justify-between text-[10px] text-[#64708B] pt-2 border-t border-[#E8EAF3]/70">
              <span className="flex items-center space-x-1.5">
                <span className="h-1.5 w-1.5 rounded-full bg-[#24B8A5]" />
                <span className="font-medium text-[#172044]">Live Connected</span>
              </span>
              <span className="font-medium">REST API v1</span>
            </div>
          </div>
        </div>

        {/* Footer info in sidebar */}
        <div className="border-t border-[#E8EAF3] pt-4 hidden lg:block">
          <div className="flex items-center justify-between text-[11px]">
            <span className="text-[#64708B]">PromiseGraph v0.2.0</span>
            <span className="text-[#24B8A5] font-semibold">Phase 2 Active</span>
          </div>
        </div>

      </div>
    </aside>
  );
};
