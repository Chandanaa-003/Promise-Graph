import React, { useState } from 'react';
import {
  Database,
  RefreshCw,
  Server
} from 'lucide-react';
import { HealthResponse } from '../types';
import { triggerSeedData } from '../services/api';

interface SettingsViewProps {
  health: HealthResponse | null;
  onRefreshData: () => Promise<void>;
}

export const SettingsView: React.FC<SettingsViewProps> = ({
  health,
  onRefreshData,
}) => {
  const [isSeeding, setIsSeeding] = useState(false);
  const [seedMessage, setSeedMessage] = useState<string | null>(null);

  const handleSeed = async () => {
    setIsSeeding(true);
    setSeedMessage(null);
    try {
      const res = await triggerSeedData();
      await onRefreshData();
      setSeedMessage(res.message || 'Demo data re-seeded successfully.');
    } catch (err: any) {
      setSeedMessage(`Error: ${err.message}`);
    } finally {
      setIsSeeding(false);
    }
  };

  return (
    <div className="flex-1 space-y-8 p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-6 border-b border-[#E8EAF3]">
        <div>
          <div className="flex items-center space-x-2.5">
            <h1 className="text-2xl sm:text-3xl font-extrabold text-[#172044] tracking-tight">
              Settings & Configuration
            </h1>
            <span className="rounded-full bg-[#EEF0FD] px-2.5 py-0.5 text-xs font-bold text-[#5146E5] border border-[#5146E5]/20">
              System
            </span>
          </div>
          <p className="mt-1 text-sm text-[#64708B]">
            Platform diagnostics, environment parameters, and database state management.
          </p>
        </div>
      </div>

      {/* Grid of Settings Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        
        {/* Backend Connectivity Status */}
        <div className="rounded-2xl border border-[#E8EAF3] bg-white p-6 shadow-card space-y-4">
          <div className="flex items-center space-x-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#EEF0FD] text-[#5146E5]">
              <Server className="h-5 w-5" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-[#172044]">
                FastAPI Backend Diagnostics
              </h3>
              <p className="text-xs text-[#64708B]">Connected API service details</p>
            </div>
          </div>

          <div className="space-y-2.5 text-xs pt-2 border-t border-[#E8EAF3]">
            <div className="flex justify-between py-1 border-b border-[#E8EAF3]/60">
              <span className="text-[#64708B]">Service Name</span>
              <span className="font-bold text-[#172044]">{health?.app_name || 'PromiseGraph API'}</span>
            </div>
            <div className="flex justify-between py-1 border-b border-[#E8EAF3]/60">
              <span className="text-[#64708B]">API Version</span>
              <span className="font-mono font-bold text-[#172044]">v{health?.version || '0.1.0'}</span>
            </div>
            <div className="flex justify-between py-1 border-b border-[#E8EAF3]/60">
              <span className="text-[#64708B]">Environment</span>
              <span className="font-bold text-[#172044] capitalize">{health?.environment || 'development'}</span>
            </div>
            <div className="flex justify-between py-1">
              <span className="text-[#64708B]">Health Status</span>
              <span
                className={`font-bold capitalize ${
                  health?.status === 'ok' ? 'text-[#24B8A5]' : 'text-[#F2B84B]'
                }`}
              >
                {health?.status === 'ok' ? 'Online (Healthy)' : 'Degraded'}
              </span>
            </div>
          </div>
        </div>

        {/* Database Management & Seed */}
        <div className="rounded-2xl border border-[#E8EAF3] bg-white p-6 shadow-card space-y-4">
          <div className="flex items-center space-x-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#E6F8F5] text-[#24B8A5]">
              <Database className="h-5 w-5" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-[#172044]">
                Database Management
              </h3>
              <p className="text-xs text-[#64708B]">SQLAlchemy 2.0 ORM store</p>
            </div>
          </div>

          <div className="space-y-2.5 text-xs pt-2 border-t border-[#E8EAF3]">
            <div className="flex justify-between py-1 border-b border-[#E8EAF3]/60">
              <span className="text-[#64708B]">Connection State</span>
              <span className="font-bold text-[#24B8A5]">
                {health?.database_connected ? 'Connected' : 'Degraded'}
              </span>
            </div>
            <div className="flex justify-between py-1 border-b border-[#E8EAF3]/60">
              <span className="text-[#64708B]">Engine Dialect</span>
              <span className="font-mono text-[#172044]">PostgreSQL / SQLite fallback</span>
            </div>
            <div className="flex justify-between py-1">
              <span className="text-[#64708B]">Models Active</span>
              <span className="font-bold text-[#172044]">User, Person, Commitment, Evidence</span>
            </div>
          </div>

          <div className="pt-2">
            <button
              onClick={handleSeed}
              disabled={isSeeding}
              className="w-full flex items-center justify-center space-x-2 rounded-xl border border-[#E8EAF3] bg-[#F5F7FF] py-2.5 text-xs font-bold text-[#5146E5] hover:bg-[#EEF0FD] hover:border-[#5146E5]/30 transition-all disabled:opacity-50"
            >
              <RefreshCw className={`h-3.5 w-3.5 ${isSeeding ? 'animate-spin' : ''}`} />
              <span>{isSeeding ? 'Populating Data...' : 'Reset & Re-seed Demo Data'}</span>
            </button>
            {seedMessage && (
              <p className="mt-2 text-center text-xs font-semibold text-[#24B8A5]">
                {seedMessage}
              </p>
            )}
          </div>
        </div>

      </div>

    </div>
  );
};
