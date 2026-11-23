import React from 'react';
import {
  FileCheck,
  Clock,
  AlertTriangle,
  Users,
  CheckCircle2,
  Calendar,
  ArrowRight,
  Mail,
  MessageSquare,
  Github,
  Activity,
  Plus
} from 'lucide-react';
import { Commitment, Person } from '../types';

interface DashboardProps {
  commitments: Commitment[];
  people: Person[];
  loading: boolean;
  onNavigate: (tab: string) => void;
  onOpenAddModal: () => void;
  onSelectCommitment: (comm: Commitment) => void;
}

export const Dashboard: React.FC<DashboardProps> = ({
  commitments,
  people,
  loading,
  onNavigate,
  onOpenAddModal,
  onSelectCommitment,
}) => {
  const now = new Date();

  // Dynamic calculations from actual available data
  const activeCount = commitments.filter(
    (c) => c.status === 'pending' || c.status === 'in_progress'
  ).length;

  const completedCount = commitments.filter(
    (c) => c.status === 'fulfilled'
  ).length;

  const overdueCount = commitments.filter((c) => {
    if (c.status === 'overdue') return true;
    if (c.due_date && new Date(c.due_date) < now && c.status !== 'fulfilled' && c.status !== 'cancelled') {
      return true;
    }
    return false;
  }).length;

  const peopleCount = people.length;

  // Upcoming deadlines (commitments due in the future, sorted by due_date ascending)
  const upcomingDeadlines = commitments
    .filter((c) => c.due_date && c.status !== 'fulfilled' && c.status !== 'cancelled')
    .sort((a, b) => new Date(a.due_date!).getTime() - new Date(b.due_date!).getTime())
    .slice(0, 5);

  // Recent commitments (sorted by created_at descending)
  const recentCommitments = [...commitments]
    .sort((a, b) => new Date(b.created_at || '').getTime() - new Date(a.created_at || '').getTime())
    .slice(0, 5);

  const getChannelIcon = (channel?: string) => {
    switch (channel) {
      case 'whatsapp':
        return <MessageSquare className="h-3.5 w-3.5 text-[#24B8A5]" />;
      case 'github':
        return <Github className="h-3.5 w-3.5 text-[#172044]" />;
      case 'email':
      default:
        return <Mail className="h-3.5 w-3.5 text-[#E66D68]" />;
    }
  };

  const getStatusChip = (status: string) => {
    switch (status) {
      case 'fulfilled':
        return (
          <span className="inline-flex items-center space-x-1 rounded-md bg-[#E6F8F5] px-2 py-0.5 text-[11px] font-semibold text-[#24B8A5] border border-[#24B8A5]/25">
            <CheckCircle2 className="h-3 w-3" />
            <span>Completed</span>
          </span>
        );
      case 'in_progress':
        return (
          <span className="inline-flex items-center space-x-1 rounded-md bg-[#EEF0FD] px-2 py-0.5 text-[11px] font-semibold text-[#5146E5] border border-[#5146E5]/25">
            <Clock className="h-3 w-3" />
            <span>In Progress</span>
          </span>
        );
      case 'overdue':
        return (
          <span className="inline-flex items-center space-x-1 rounded-md bg-[#FDF1F0] px-2 py-0.5 text-[11px] font-semibold text-[#E66D68] border border-[#E66D68]/30">
            <AlertTriangle className="h-3 w-3" />
            <span>Overdue</span>
          </span>
        );
      case 'pending':
      default:
        return (
          <span className="inline-flex items-center space-x-1 rounded-md bg-[#FEF7EC] px-2 py-0.5 text-[11px] font-semibold text-[#D99A2B] border border-[#F2B84B]/30">
            <Clock className="h-3 w-3" />
            <span>Pending</span>
          </span>
        );
    }
  };

  return (
    <div className="flex-1 space-y-8 p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto">
      
      {/* Dashboard Top Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-6 border-b border-[#E8EAF3]">
        <div>
          <div className="flex items-center space-x-2.5">
            <h1 className="text-2xl sm:text-3xl font-extrabold text-[#172044] tracking-tight">
              Intelligence Dashboard
            </h1>
            <span className="rounded-full bg-[#EEF0FD] px-2.5 py-0.5 text-xs font-bold text-[#5146E5] border border-[#5146E5]/20">
              Live Data
            </span>
          </div>
          <p className="mt-1 text-sm text-[#64708B]">
            Real-time analytics and tracking for active commitments, upcoming deadlines, and relationship nodes.
          </p>
        </div>

        <div className="flex items-center space-x-3">
          <button
            onClick={onOpenAddModal}
            className="inline-flex items-center space-x-2 rounded-xl bg-[#5146E5] px-4 py-2.5 text-xs font-bold text-white shadow-sm shadow-[#5146E5]/25 hover:bg-[#4338CA] transition-all transform hover:-translate-y-0.5"
          >
            <Plus className="h-4 w-4" />
            <span>Add Commitment</span>
          </button>
        </div>
      </div>

      {/* 4 Stat Overview Metric Cards (Calculated dynamically) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        
        {/* Card 1: Active Commitments */}
        <div
          onClick={() => onNavigate('commitments')}
          className="rounded-2xl border border-[#E8EAF3] bg-white p-5 shadow-card hover:shadow-card-hover hover:border-[#D6D9EB] transition-all cursor-pointer group"
        >
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold uppercase tracking-wider text-[#64708B]">
              Active Commitments
            </span>
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#EEF0FD] text-[#5146E5] group-hover:scale-105 transition-transform">
              <FileCheck className="h-4.5 w-4.5" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline space-x-2">
            <span className="text-3xl font-extrabold text-[#172044]">
              {loading ? '-' : activeCount}
            </span>
            <span className="rounded-full bg-[#EEF0FD] px-2 py-0.5 text-xs font-bold text-[#5146E5]">
              In progress
            </span>
          </div>
          <div className="mt-2 text-xs text-[#64708B] font-medium flex items-center justify-between">
            <span>Pending resolution</span>
            <ArrowRight className="h-3.5 w-3.5 text-[#5146E5] group-hover:translate-x-1 transition-transform" />
          </div>
        </div>

        {/* Card 2: Completed Commitments */}
        <div
          onClick={() => onNavigate('commitments')}
          className="rounded-2xl border border-[#E8EAF3] bg-white p-5 shadow-card hover:shadow-card-hover hover:border-[#D6D9EB] transition-all cursor-pointer group"
        >
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold uppercase tracking-wider text-[#64708B]">
              Completed
            </span>
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#E6F8F5] text-[#24B8A5] group-hover:scale-105 transition-transform">
              <CheckCircle2 className="h-4.5 w-4.5" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline space-x-2">
            <span className="text-3xl font-extrabold text-[#172044]">
              {loading ? '-' : completedCount}
            </span>
            <span className="rounded-full bg-[#E6F8F5] px-2 py-0.5 text-xs font-bold text-[#24B8A5]">
              Fulfilled
            </span>
          </div>
          <div className="mt-2 text-xs text-[#64708B] font-medium flex items-center justify-between">
            <span>Promises kept</span>
            <ArrowRight className="h-3.5 w-3.5 text-[#24B8A5] group-hover:translate-x-1 transition-transform" />
          </div>
        </div>

        {/* Card 3: Overdue Commitments */}
        <div
          onClick={() => onNavigate('commitments')}
          className="rounded-2xl border border-[#E8EAF3] bg-white p-5 shadow-card hover:shadow-card-hover hover:border-[#D6D9EB] transition-all cursor-pointer group"
        >
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold uppercase tracking-wider text-[#64708B]">
              Overdue
            </span>
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#FDF1F0] text-[#E66D68] group-hover:scale-105 transition-transform">
              <AlertTriangle className="h-4.5 w-4.5" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline space-x-2">
            <span className="text-3xl font-extrabold text-[#E66D68]">
              {loading ? '-' : overdueCount}
            </span>
            <span className="rounded-full bg-[#FDF1F0] px-2 py-0.5 text-xs font-bold text-[#E66D68]">
              Needs attention
            </span>
          </div>
          <div className="mt-2 text-xs text-[#64708B] font-medium flex items-center justify-between">
            <span>Past agreed deadline</span>
            <ArrowRight className="h-3.5 w-3.5 text-[#E66D68] group-hover:translate-x-1 transition-transform" />
          </div>
        </div>

        {/* Card 4: People Connected */}
        <div
          onClick={() => onNavigate('people')}
          className="rounded-2xl border border-[#E8EAF3] bg-white p-5 shadow-card hover:shadow-card-hover hover:border-[#D6D9EB] transition-all cursor-pointer group"
        >
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold uppercase tracking-wider text-[#64708B]">
              People Connected
            </span>
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#EEF0FD] text-[#5146E5] group-hover:scale-105 transition-transform">
              <Users className="h-4.5 w-4.5" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline space-x-2">
            <span className="text-3xl font-extrabold text-[#172044]">
              {loading ? '-' : peopleCount}
            </span>
            <span className="rounded-full bg-[#EEF0FD] px-2 py-0.5 text-xs font-bold text-[#5146E5]">
              Active network
            </span>
          </div>
          <div className="mt-2 text-xs text-[#64708B] font-medium flex items-center justify-between">
            <span>Graph stakeholders</span>
            <ArrowRight className="h-3.5 w-3.5 text-[#5146E5] group-hover:translate-x-1 transition-transform" />
          </div>
        </div>

      </div>

      {/* Main Grid: Recent Commitments & Upcoming Deadlines */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Left 2 Columns: Recent Commitments */}
        <div className="lg:col-span-2 space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-lg font-bold text-[#172044]">Recent Commitments</h2>
              <p className="text-xs text-[#64708B]">Extracted and synchronized from communication sources</p>
            </div>
            <button
              onClick={() => onNavigate('commitments')}
              className="text-xs font-semibold text-[#5146E5] hover:text-[#4338CA] flex items-center space-x-1"
            >
              <span>View All ({commitments.length})</span>
              <ArrowRight className="h-3.5 w-3.5" />
            </button>
          </div>

          <div className="space-y-3">
            {loading ? (
              <div className="rounded-2xl border border-[#E8EAF3] bg-white p-8 text-center text-xs text-[#64708B]">
                Loading commitments...
              </div>
            ) : recentCommitments.length === 0 ? (
              <div className="rounded-2xl border border-[#E8EAF3] bg-white p-8 text-center text-xs text-[#64708B]">
                No commitments recorded yet. Click "Add Commitment" to begin.
              </div>
            ) : (
              recentCommitments.map((item) => (
                <div
                  key={item.id}
                  onClick={() => onSelectCommitment(item)}
                  className="rounded-2xl border border-[#E8EAF3] bg-white p-4.5 shadow-card hover:shadow-card-hover hover:border-[#D6D9EB] transition-all cursor-pointer group"
                >
                  <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
                    <div className="space-y-1.5 flex-1">
                      <div className="flex items-center flex-wrap gap-2">
                        {getStatusChip(item.status)}
                        <span className="flex items-center space-x-1.5 rounded-lg bg-[#F5F7FF] border border-[#E8EAF3] px-2 py-0.5 text-xs font-medium text-[#64708B]">
                          {getChannelIcon(item.channel)}
                          <span className="capitalize text-[#172044]">{item.channel || 'email'}</span>
                        </span>
                        <span className="text-xs text-[#64708B]">
                          {item.commitment_type === 'promise_made' ? '• Made by you' : '• Promised to you'}
                        </span>
                      </div>
                      <h3 className="text-sm font-bold text-[#172044] group-hover:text-[#5146E5] transition-colors">
                        {item.title}
                      </h3>
                      {item.description && (
                        <p className="text-xs text-[#64708B] line-clamp-1">
                          {item.description}
                        </p>
                      )}
                    </div>

                    <div className="text-right text-xs space-y-1 flex-shrink-0">
                      <div className="font-semibold text-[#172044]">
                        {item.person_name || 'Stakeholder'}
                      </div>
                      <div className="text-[11px] text-[#64708B]">
                        {item.due_date
                          ? new Date(item.due_date).toLocaleDateString('en-US', {
                              month: 'short',
                              day: 'numeric',
                            })
                          : 'No deadline'}
                      </div>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Right Column: Upcoming Deadlines & Recent Activity Timeline */}
        <div className="space-y-6">
          
          {/* Upcoming Deadlines Widget */}
          <div className="rounded-2xl border border-[#E8EAF3] bg-white p-5 shadow-card">
            <div className="flex items-center justify-between pb-3.5 border-b border-[#E8EAF3]">
              <div className="flex items-center space-x-2">
                <Calendar className="h-4 w-4 text-[#5146E5]" />
                <h3 className="text-sm font-bold text-[#172044]">Upcoming Deadlines</h3>
              </div>
              <span className="text-xs font-bold text-[#5146E5] bg-[#EEF0FD] px-2 py-0.5 rounded-md">
                {upcomingDeadlines.length}
              </span>
            </div>

            <div className="mt-4 space-y-3">
              {upcomingDeadlines.length === 0 ? (
                <p className="text-xs text-[#64708B] py-3 text-center">No upcoming deadlines.</p>
              ) : (
                upcomingDeadlines.map((item) => {
                  const dueDate = new Date(item.due_date!);
                  const isClose = dueDate.getTime() - now.getTime() < 86400000 * 2;
                  return (
                    <div
                      key={item.id}
                      onClick={() => onSelectCommitment(item)}
                      className="rounded-xl border border-[#E8EAF3] bg-[#F5F7FF] p-3 hover:border-[#D6D9EB] transition-all cursor-pointer"
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div className="space-y-1 flex-1">
                          <p className="text-xs font-bold text-[#172044] line-clamp-1">
                            {item.title}
                          </p>
                          <p className="text-[11px] text-[#64708B]">
                            {item.person_name || 'Assigned'}
                          </p>
                        </div>
                        <span
                          className={`text-[10px] font-bold px-2 py-0.5 rounded-md whitespace-nowrap ${
                            isClose
                              ? 'bg-[#FEF7EC] text-[#D99A2B] border border-[#F2B84B]/30'
                              : 'bg-white text-[#5146E5] border border-[#E8EAF3]'
                          }`}
                        >
                          {dueDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                        </span>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>

          {/* Recent Activity Timeline Widget */}
          <div className="rounded-2xl border border-[#E8EAF3] bg-white p-5 shadow-card">
            <div className="flex items-center justify-between pb-3.5 border-b border-[#E8EAF3]">
              <div className="flex items-center space-x-2">
                <Activity className="h-4 w-4 text-[#24B8A5]" />
                <h3 className="text-sm font-bold text-[#172044]">Recent Activity</h3>
              </div>
              <span className="text-[11px] text-[#64708B]">Audit log</span>
            </div>

            <div className="mt-4 space-y-4">
              <div className="relative pl-6 space-y-4 before:absolute before:left-2 before:top-2 before:bottom-2 before:w-0.5 before:bg-[#E8EAF3]">
                {commitments.slice(0, 4).map((c, i) => (
                  <div key={i} className="relative">
                    <span className="absolute -left-6 top-1 h-3 w-3 rounded-full border-2 border-white bg-[#5146E5]" />
                    <p className="text-xs font-semibold text-[#172044]">
                      {c.commitment_type === 'promise_made' ? 'You committed to' : 'Commitment received:'}{' '}
                      <span className="text-[#5146E5]">{c.title}</span>
                    </p>
                    <p className="text-[11px] text-[#64708B] mt-0.5">
                      {c.person_name} • {c.channel || 'email'}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </div>

        </div>

      </div>

    </div>
  );
};
