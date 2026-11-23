import React, { useState, useEffect } from 'react';
import {
  FileCheck,
  CheckCircle,
  Clock,
  AlertTriangle,
  XCircle,
  User,
  Search,
  MessageSquare,
  Mail,
  Github,
  Radio,
  Sparkles,
  GitFork,
  Database,
  RefreshCw
} from 'lucide-react';
import { Commitment, Person, CommitmentStatus, HealthResponse } from '../types';
import { fetchHealth } from '../services/api';

export const Dashboard: React.FC = () => {
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [health, setHealth] = useState<HealthResponse | null>(null);
  const [isRefreshing, setIsRefreshing] = useState(false);

  // Representative initial foundational commitments for Phase 1 demonstration
  const [commitments] = useState<Commitment[]>([
    {
      id: 'c-101',
      user_id: 'u-1',
      title: 'Deliver Phase 1 Architecture & PostgreSQL Models',
      description: 'Establish foundational schema, FastAPI health endpoints, and React frontend shell.',
      status: 'fulfilled',
      commitment_type: 'promise_made',
      channel: 'email',
      person_name: 'Alex Mercer',
      due_date: '2026-11-23T12:00:00Z',
      confidence_score: 0.98,
      evidence_snippets: ['"I will complete Phase 1 by Monday noon with full schema and health checks."'],
      created_at: '2026-11-20T10:00:00Z',
      updated_at: '2026-11-23T02:30:00Z',
    },
    {
      id: 'c-102',
      user_id: 'u-1',
      title: 'Review Gmail OAuth Scopes and Webhook specifications',
      description: 'Prepare Gmail channel integration roadmap for Phase 2.',
      status: 'pending',
      commitment_type: 'promise_made',
      channel: 'email',
      person_name: 'Sarah Chen (Lead Engineer)',
      due_date: '2026-11-25T17:00:00Z',
      confidence_score: 0.94,
      evidence_snippets: ['"I promise to send over the OAuth scope requirements by Wednesday 5 PM."'],
      created_at: '2026-11-22T14:15:00Z',
      updated_at: '2026-11-22T14:15:00Z',
    },
    {
      id: 'c-103',
      user_id: 'u-1',
      title: 'Provide WhatsApp Business API sandbox credentials',
      description: 'Awaiting official sandbox tokens from partner team for testing.',
      status: 'pending',
      commitment_type: 'promise_received',
      channel: 'whatsapp',
      person_name: 'David Patel (Integrations)',
      due_date: '2026-11-26T18:00:00Z',
      confidence_score: 0.91,
      evidence_snippets: ['"Will share the sandbox credentials with you before Thursday end of day."'],
      created_at: '2026-11-21T09:30:00Z',
      updated_at: '2026-11-21T09:30:00Z',
    },
    {
      id: 'c-104',
      user_id: 'u-1',
      title: 'Merge GitHub Webhook Dispatcher PR',
      description: 'Verify commit signatures and webhook dispatch payload schema.',
      status: 'in_progress',
      commitment_type: 'promise_made',
      channel: 'github',
      person_name: 'Marcus Brody',
      due_date: '2026-11-24T15:00:00Z',
      confidence_score: 0.95,
      evidence_snippets: ['"I will merge the webhook PR tomorrow once CI tests pass."'],
      created_at: '2026-11-22T16:45:00Z',
      updated_at: '2026-11-23T01:10:00Z',
    },
    {
      id: 'c-105',
      user_id: 'u-1',
      title: 'Send relationship graph ontology design doc',
      description: 'Detailed RDF / edge graph specification for people interactions.',
      status: 'overdue',
      commitment_type: 'promise_received',
      channel: 'email',
      person_name: 'Elena Rostova (Data Scientist)',
      due_date: '2026-11-21T18:00:00Z',
      confidence_score: 0.88,
      evidence_snippets: ['"Expect the ontology document in your inbox by Friday evening."'],
      created_at: '2026-11-18T11:20:00Z',
      updated_at: '2026-11-21T19:00:00Z',
    },
  ]);

  const peopleSample: Person[] = [
    {
      id: 'p-1',
      user_id: 'u-1',
      display_name: 'Sarah Chen',
      email: 'sarah.chen@techcorp.io',
      organization: 'TechCorp Engineering',
      relationship_score: 0.92,
      created_at: '2026-11-01T00:00:00Z',
    },
    {
      id: 'p-2',
      user_id: 'u-1',
      display_name: 'David Patel',
      email: 'david.patel@integrations.dev',
      organization: 'WhatsApp Partner Ops',
      relationship_score: 0.84,
      created_at: '2026-11-05T00:00:00Z',
    },
    {
      id: 'p-3',
      user_id: 'u-1',
      display_name: 'Marcus Brody',
      email: 'mbrody@github-team.org',
      organization: 'OpenSource Labs',
      relationship_score: 0.78,
      created_at: '2026-11-10T00:00:00Z',
    },
    {
      id: 'p-4',
      user_id: 'u-1',
      display_name: 'Elena Rostova',
      email: 'elena@graph-research.ai',
      organization: 'AI Knowledge Graph Institute',
      relationship_score: 0.89,
      created_at: '2026-11-12T00:00:00Z',
    },
  ];

  const handleRefresh = async () => {
    setIsRefreshing(true);
    const h = await fetchHealth();
    setHealth(h);
    setTimeout(() => setIsRefreshing(false), 500);
  };

  useEffect(() => {
    handleRefresh();
  }, []);

  const filteredCommitments = commitments.filter((item) => {
    const matchesFilter =
      filterStatus === 'all'
        ? true
        : filterStatus === 'made'
        ? item.commitment_type === 'promise_made'
        : filterStatus === 'received'
        ? item.commitment_type === 'promise_received'
        : item.status === filterStatus;

    const matchesSearch =
      item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (item.person_name && item.person_name.toLowerCase().includes(searchQuery.toLowerCase()));

    return matchesFilter && matchesSearch;
  });

  const getStatusBadge = (status: CommitmentStatus) => {
    switch (status) {
      case 'fulfilled':
        return (
          <span className="inline-flex items-center space-x-1 rounded-md bg-emerald-500/10 px-2 py-0.5 text-xs font-medium text-emerald-400 border border-emerald-500/20">
            <CheckCircle className="h-3 w-3" />
            <span>Fulfilled</span>
          </span>
        );
      case 'in_progress':
        return (
          <span className="inline-flex items-center space-x-1 rounded-md bg-blue-500/10 px-2 py-0.5 text-xs font-medium text-blue-400 border border-blue-500/20">
            <Clock className="h-3 w-3" />
            <span>In Progress</span>
          </span>
        );
      case 'overdue':
        return (
          <span className="inline-flex items-center space-x-1 rounded-md bg-red-500/10 px-2 py-0.5 text-xs font-medium text-red-400 border border-red-500/20">
            <AlertTriangle className="h-3 w-3" />
            <span>Overdue</span>
          </span>
        );
      case 'cancelled':
        return (
          <span className="inline-flex items-center space-x-1 rounded-md bg-slate-500/10 px-2 py-0.5 text-xs font-medium text-slate-400 border border-slate-500/20">
            <XCircle className="h-3 w-3" />
            <span>Cancelled</span>
          </span>
        );
      case 'pending':
      default:
        return (
          <span className="inline-flex items-center space-x-1 rounded-md bg-amber-500/10 px-2 py-0.5 text-xs font-medium text-amber-400 border border-amber-500/20">
            <Clock className="h-3 w-3" />
            <span>Pending</span>
          </span>
        );
    }
  };

  const getChannelIcon = (channel?: string) => {
    switch (channel) {
      case 'whatsapp':
        return <MessageSquare className="h-3.5 w-3.5 text-emerald-400" />;
      case 'github':
        return <Github className="h-3.5 w-3.5 text-slate-300" />;
      case 'email':
      default:
        return <Mail className="h-3.5 w-3.5 text-red-400" />;
    }
  };

  return (
    <div className="flex-1 space-y-8 p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto">
      
      {/* Dashboard Top Title Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-6 border-b border-slate-800">
        <div>
          <div className="flex items-center space-x-2">
            <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
              Intelligence Dashboard
            </h1>
            <span className="rounded-full bg-indigo-500/10 px-2.5 py-0.5 text-xs font-semibold text-indigo-400 border border-indigo-500/20">
              Phase 1
            </span>
          </div>
          <p className="mt-1 text-sm text-slate-400">
            Monitoring active commitments, stakeholder relationships, and communication channels.
          </p>
        </div>

        <div className="flex items-center space-x-3">
          <button
            onClick={handleRefresh}
            className={`inline-flex items-center space-x-2 rounded-xl border border-slate-800 bg-slate-900/80 px-3 py-2 text-xs font-medium text-slate-300 hover:text-white hover:border-slate-700 transition-colors ${
              isRefreshing ? 'animate-spin' : ''
            }`}
          >
            <RefreshCw className="h-3.5 w-3.5" />
            <span>Sync</span>
          </button>
        </div>
      </div>

      {/* 4 Stat Overview Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        
        <div className="rounded-2xl border border-slate-800 bg-slate-900/40 p-5 shadow-sm hover:border-slate-700 transition-all">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-xs font-medium uppercase tracking-wider">Active Commitments</span>
            <FileCheck className="h-4 w-4 text-indigo-400" />
          </div>
          <div className="mt-3 flex items-baseline space-x-2">
            <span className="text-3xl font-bold text-white">14</span>
            <span className="text-xs text-emerald-400 font-medium">+3 this week</span>
          </div>
          <div className="mt-2 text-xs text-slate-400">
            4 pending • 8 fulfilled • 2 overdue
          </div>
        </div>

        <div className="rounded-2xl border border-slate-800 bg-slate-900/40 p-5 shadow-sm hover:border-slate-700 transition-all">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-xs font-medium uppercase tracking-wider">People Graph</span>
            <GitFork className="h-4 w-4 text-purple-400" />
          </div>
          <div className="mt-3 flex items-baseline space-x-2">
            <span className="text-3xl font-bold text-white">28</span>
            <span className="text-xs text-purple-400 font-medium">Mapped nodes</span>
          </div>
          <div className="mt-2 text-xs text-slate-400">
            Average relationship score: 86%
          </div>
        </div>

        <div className="rounded-2xl border border-slate-800 bg-slate-900/40 p-5 shadow-sm hover:border-slate-700 transition-all">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-xs font-medium uppercase tracking-wider">Monitored Channels</span>
            <Radio className="h-4 w-4 text-emerald-400" />
          </div>
          <div className="mt-3 flex items-baseline space-x-2">
            <span className="text-3xl font-bold text-white">3</span>
            <span className="text-xs text-slate-400 font-medium">Ready in Roadmap</span>
          </div>
          <div className="mt-2 text-xs text-slate-400 flex items-center space-x-1.5">
            <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
            <span>Gmail • WhatsApp • GitHub</span>
          </div>
        </div>

        <div className="rounded-2xl border border-slate-800 bg-slate-900/40 p-5 shadow-sm hover:border-slate-700 transition-all">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-xs font-medium uppercase tracking-wider">Backend API Health</span>
            <Database className="h-4 w-4 text-emerald-400" />
          </div>
          <div className="mt-3 flex items-baseline space-x-2">
            <span className="text-2xl font-bold text-emerald-400">
              {health?.status === 'ok' ? 'Online' : 'Degraded'}
            </span>
            <span className="text-xs text-slate-400 font-mono">v0.1.0</span>
          </div>
          <div className="mt-2 text-xs text-slate-400 truncate">
            DB: {health?.database_connected ? 'Connected' : 'Degraded'}
          </div>
        </div>

      </div>

      {/* Main Grid: Commitments Feed & Side Panels */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Left 2 Columns: Commitments Table/List */}
        <div className="lg:col-span-2 space-y-4">
          
          {/* Filter Bar */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
            
            {/* Search Input */}
            <div className="relative flex-1">
              <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
              <input
                type="text"
                placeholder="Search commitments or people..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full rounded-xl border border-slate-800 bg-slate-900/60 pl-9 pr-4 py-2 text-xs text-white placeholder-slate-500 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
              />
            </div>

            {/* Filter Tabs */}
            <div className="flex items-center space-x-1 rounded-xl border border-slate-800 bg-slate-900/40 p-1">
              {[
                { id: 'all', label: 'All' },
                { id: 'made', label: 'I Promised' },
                { id: 'received', label: 'Promised to Me' },
                { id: 'overdue', label: 'Overdue' },
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setFilterStatus(tab.id)}
                  className={`rounded-lg px-2.5 py-1 text-xs font-medium transition-colors ${
                    filterStatus === tab.id
                      ? 'bg-indigo-600 text-white'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>

          </div>

          {/* Commitments Card List */}
          <div className="space-y-3">
            {filteredCommitments.length === 0 ? (
              <div className="rounded-2xl border border-slate-800 bg-slate-900/30 p-8 text-center">
                <p className="text-sm text-slate-400">No commitments found matching criteria.</p>
              </div>
            ) : (
              filteredCommitments.map((item) => (
                <div
                  key={item.id}
                  className="rounded-2xl border border-slate-800 bg-slate-900/40 p-4 hover:border-slate-700 hover:bg-slate-900/70 transition-all duration-200"
                >
                  <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
                    
                    <div className="space-y-1.5 flex-1">
                      <div className="flex items-center space-x-2">
                        {getStatusBadge(item.status)}
                        <span className="flex items-center space-x-1 rounded-md bg-slate-800 px-2 py-0.5 text-xs text-slate-300">
                          {getChannelIcon(item.channel)}
                          <span className="capitalize">{item.channel}</span>
                        </span>
                        <span className="text-xs text-slate-500">
                          {item.commitment_type === 'promise_made' ? 'Made by you' : 'Made to you'}
                        </span>
                      </div>

                      <h3 className="text-sm font-semibold text-white leading-snug">
                        {item.title}
                      </h3>

                      {item.description && (
                        <p className="text-xs text-slate-400 leading-relaxed">
                          {item.description}
                        </p>
                      )}

                      {/* Evidence Snippet */}
                      {item.evidence_snippets && item.evidence_snippets.length > 0 && (
                        <div className="mt-2 rounded-lg border border-slate-800/80 bg-slate-950/60 p-2 text-xs font-mono text-slate-300">
                          <span className="text-indigo-400 font-semibold mr-1">Evidence:</span>
                          {item.evidence_snippets[0]}
                        </div>
                      )}
                    </div>

                    {/* Metadata column */}
                    <div className="flex sm:flex-col items-center sm:items-end justify-between sm:justify-start gap-1 text-right text-xs">
                      <div className="flex items-center space-x-1 text-slate-300 font-medium">
                        <User className="h-3 w-3 text-slate-400" />
                        <span>{item.person_name}</span>
                      </div>
                      <div className="text-[11px] text-slate-500">
                        Due: {new Date(item.due_date || '').toLocaleDateString()}
                      </div>
                      <div className="inline-flex items-center space-x-1 text-[10px] text-indigo-400 bg-indigo-500/10 px-1.5 py-0.5 rounded border border-indigo-500/20">
                        <Sparkles className="h-2.5 w-2.5" />
                        <span>{Math.round(item.confidence_score * 100)}% Conf.</span>
                      </div>
                    </div>

                  </div>
                </div>
              ))
            )}
          </div>

        </div>

        {/* Right Column: People Relationship Graph & Channels Status */}
        <div className="space-y-6">
          
          {/* People in Graph Card */}
          <div className="rounded-2xl border border-slate-800 bg-slate-900/40 p-5">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <div className="flex items-center space-x-2">
                <GitFork className="h-4 w-4 text-indigo-400" />
                <h3 className="text-sm font-semibold text-white">Relationship Graph</h3>
              </div>
              <span className="text-xs text-slate-500 font-medium">4 Key Contacts</span>
            </div>

            <div className="mt-4 space-y-3">
              {peopleSample.map((person) => (
                <div
                  key={person.id}
                  className="flex items-center justify-between rounded-xl border border-slate-800/60 bg-slate-950/50 p-3"
                >
                  <div className="flex items-center space-x-3">
                    <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-tr from-indigo-500/20 to-purple-500/20 text-indigo-300 font-bold text-xs border border-indigo-500/30">
                      {person.display_name.slice(0, 2).toUpperCase()}
                    </div>
                    <div>
                      <div className="text-xs font-semibold text-slate-200">
                        {person.display_name}
                      </div>
                      <div className="text-[11px] text-slate-400">
                        {person.organization}
                      </div>
                    </div>
                  </div>

                  <div className="text-right">
                    <div className="text-xs font-semibold text-emerald-400">
                      {Math.round(person.relationship_score * 100)}%
                    </div>
                    <div className="text-[10px] text-slate-500">Affinity</div>
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-4 pt-3 border-t border-slate-800/80 text-center">
              <span className="text-[11px] text-slate-500">
                Full dynamic Graph visualizer scheduled for Phase 3
              </span>
            </div>
          </div>

          {/* Connected Channels Status Card */}
          <div className="rounded-2xl border border-slate-800 bg-slate-900/40 p-5">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <div className="flex items-center space-x-2">
                <Radio className="h-4 w-4 text-emerald-400" />
                <h3 className="text-sm font-semibold text-white">Ingestion Channels</h3>
              </div>
              <span className="text-xs text-slate-500">Phase Roadmap</span>
            </div>

            <div className="mt-4 space-y-2.5">
              
              <div className="flex items-center justify-between rounded-xl border border-slate-800/60 bg-slate-950/50 p-3">
                <div className="flex items-center space-x-2.5">
                  <Mail className="h-4 w-4 text-red-400" />
                  <div>
                    <div className="text-xs font-medium text-white">Gmail Integration</div>
                    <div className="text-[10px] text-slate-400">OAuth 2.0 & thread sync</div>
                  </div>
                </div>
                <span className="rounded bg-indigo-500/10 px-2 py-0.5 text-[10px] font-medium text-indigo-400 border border-indigo-500/20">
                  Phase 2 Ready
                </span>
              </div>

              <div className="flex items-center justify-between rounded-xl border border-slate-800/60 bg-slate-950/50 p-3">
                <div className="flex items-center space-x-2.5">
                  <MessageSquare className="h-4 w-4 text-emerald-400" />
                  <div>
                    <div className="text-xs font-medium text-white">WhatsApp Chat Sync</div>
                    <div className="text-[10px] text-slate-400">Chat import & Cloud API</div>
                  </div>
                </div>
                <span className="rounded bg-slate-800 px-2 py-0.5 text-[10px] font-medium text-slate-400">
                  Phase 3 Planned
                </span>
              </div>

              <div className="flex items-center justify-between rounded-xl border border-slate-800/60 bg-slate-950/50 p-3">
                <div className="flex items-center space-x-2.5">
                  <Github className="h-4 w-4 text-slate-300" />
                  <div>
                    <div className="text-xs font-medium text-white">GitHub Integration</div>
                    <div className="text-[10px] text-slate-400">Issues, PR comments & reviews</div>
                  </div>
                </div>
                <span className="rounded bg-slate-800 px-2 py-0.5 text-[10px] font-medium text-slate-400">
                  Phase 4 Planned
                </span>
              </div>

            </div>
          </div>

        </div>

      </div>

    </div>
  );
};
