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
          <span className="inline-flex items-center space-x-1.5 rounded-lg bg-[#E6F8F5] px-2.5 py-1 text-xs font-semibold text-[#24B8A5] border border-[#24B8A5]/25">
            <CheckCircle className="h-3.5 w-3.5" />
            <span>Fulfilled</span>
          </span>
        );
      case 'in_progress':
        return (
          <span className="inline-flex items-center space-x-1.5 rounded-lg bg-[#EEF0FD] px-2.5 py-1 text-xs font-semibold text-[#5146E5] border border-[#5146E5]/25">
            <Clock className="h-3.5 w-3.5" />
            <span>In Progress</span>
          </span>
        );
      case 'overdue':
        return (
          <span className="inline-flex items-center space-x-1.5 rounded-lg bg-[#FDF1F0] px-2.5 py-1 text-xs font-semibold text-[#E66D68] border border-[#E66D68]/30">
            <AlertTriangle className="h-3.5 w-3.5" />
            <span>Overdue</span>
          </span>
        );
      case 'cancelled':
        return (
          <span className="inline-flex items-center space-x-1.5 rounded-lg bg-[#F5F7FF] px-2.5 py-1 text-xs font-semibold text-[#64708B] border border-[#E8EAF3]">
            <XCircle className="h-3.5 w-3.5" />
            <span>Cancelled</span>
          </span>
        );
      case 'pending':
      default:
        return (
          <span className="inline-flex items-center space-x-1.5 rounded-lg bg-[#FEF7EC] px-2.5 py-1 text-xs font-semibold text-[#D99A2B] border border-[#F2B84B]/30">
            <Clock className="h-3.5 w-3.5" />
            <span>Pending</span>
          </span>
        );
    }
  };

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

  return (
    <div className="flex-1 space-y-8 p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto">
      
      {/* Dashboard Top Title Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-6 border-b border-[#E8EAF3]">
        <div>
          <div className="flex items-center space-x-2.5">
            <h1 className="text-2xl sm:text-3xl font-extrabold text-[#172044] tracking-tight">
              Intelligence Dashboard
            </h1>
            <span className="rounded-full bg-[#EEF0FD] px-2.5 py-0.5 text-xs font-bold text-[#5146E5] border border-[#5146E5]/20">
              Phase 1
            </span>
          </div>
          <p className="mt-1 text-sm text-[#64708B]">
            Monitoring active commitments, stakeholder relationships, and communication channels.
          </p>
        </div>

        <div className="flex items-center space-x-3">
          <button
            onClick={handleRefresh}
            className={`inline-flex items-center space-x-2 rounded-xl border border-[#E8EAF3] bg-white px-3.5 py-2 text-xs font-semibold text-[#172044] hover:text-[#5146E5] hover:border-[#D6D9EB] shadow-subtle transition-all ${
              isRefreshing ? 'animate-spin' : ''
            }`}
          >
            <RefreshCw className="h-3.5 w-3.5" />
            <span>Sync</span>
          </button>
        </div>
      </div>

      {/* 4 Stat Overview Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        
        {/* Card 1: Active Commitments */}
        <div className="rounded-2xl border border-[#E8EAF3] bg-white p-5 shadow-card hover:shadow-card-hover transition-all duration-200">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold uppercase tracking-wider text-[#64708B]">
              Active Commitments
            </span>
            <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-[#EEF0FD] text-[#5146E5]">
              <FileCheck className="h-4 w-4" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline space-x-2">
            <span className="text-3xl font-extrabold text-[#172044]">14</span>
            <span className="rounded-full bg-[#E6F8F5] px-2 py-0.5 text-xs font-bold text-[#24B8A5]">
              +3 this week
            </span>
          </div>
          <div className="mt-2 text-xs text-[#64708B] font-medium">
            4 pending • 8 fulfilled • 2 overdue
          </div>
        </div>

        {/* Card 2: People Graph */}
        <div className="rounded-2xl border border-[#E8EAF3] bg-white p-5 shadow-card hover:shadow-card-hover transition-all duration-200">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold uppercase tracking-wider text-[#64708B]">
              People Graph
            </span>
            <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-[#EEF0FD] text-[#5146E5]">
              <GitFork className="h-4 w-4" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline space-x-2">
            <span className="text-3xl font-extrabold text-[#172044]">28</span>
            <span className="rounded-full bg-[#EEF0FD] px-2 py-0.5 text-xs font-bold text-[#5146E5]">
              Mapped nodes
            </span>
          </div>
          <div className="mt-2 text-xs text-[#64708B] font-medium">
            Average relationship score: 86%
          </div>
        </div>

        {/* Card 3: Monitored Channels */}
        <div className="rounded-2xl border border-[#E8EAF3] bg-white p-5 shadow-card hover:shadow-card-hover transition-all duration-200">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold uppercase tracking-wider text-[#64708B]">
              Monitored Channels
            </span>
            <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-[#E6F8F5] text-[#24B8A5]">
              <Radio className="h-4 w-4" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline space-x-2">
            <span className="text-3xl font-extrabold text-[#172044]">3</span>
            <span className="rounded-full bg-[#E6F8F5] px-2 py-0.5 text-xs font-bold text-[#24B8A5]">
              Roadmap
            </span>
          </div>
          <div className="mt-2 text-xs text-[#64708B] font-medium flex items-center space-x-1.5">
            <span className="h-1.5 w-1.5 rounded-full bg-[#24B8A5]" />
            <span>Gmail • WhatsApp • GitHub</span>
          </div>
        </div>

        {/* Card 4: Backend API Health */}
        <div className="rounded-2xl border border-[#E8EAF3] bg-white p-5 shadow-card hover:shadow-card-hover transition-all duration-200">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold uppercase tracking-wider text-[#64708B]">
              Backend Health
            </span>
            <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-[#E6F8F5] text-[#24B8A5]">
              <Database className="h-4 w-4" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline space-x-2">
            <span className="text-2xl font-extrabold text-[#24B8A5]">
              {health?.status === 'ok' ? 'Online' : 'Degraded'}
            </span>
            <span className="rounded-full bg-[#F5F7FF] border border-[#E8EAF3] px-2 py-0.5 text-xs font-mono font-medium text-[#64708B]">
              v0.1.0
            </span>
          </div>
          <div className="mt-2 text-xs text-[#64708B] font-medium truncate">
            Database: {health?.database_connected ? 'Connected' : 'Degraded'}
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
              <Search className="absolute left-3.5 top-3 h-4 w-4 text-[#64708B]" />
              <input
                type="text"
                placeholder="Search commitments or people..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full rounded-xl border border-[#E8EAF3] bg-white pl-10 pr-4 py-2.5 text-xs text-[#172044] placeholder-[#64708B] focus:border-[#5146E5] focus:outline-none focus:ring-2 focus:ring-[#5146E5]/10 shadow-subtle transition-all"
              />
            </div>

            {/* Filter Tabs */}
            <div className="flex items-center space-x-1 rounded-xl border border-[#E8EAF3] bg-white p-1 shadow-subtle">
              {[
                { id: 'all', label: 'All' },
                { id: 'made', label: 'I Promised' },
                { id: 'received', label: 'Promised to Me' },
                { id: 'overdue', label: 'Overdue' },
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setFilterStatus(tab.id)}
                  className={`rounded-lg px-3 py-1.5 text-xs font-semibold transition-all ${
                    filterStatus === tab.id
                      ? 'bg-[#5146E5] text-white shadow-sm shadow-[#5146E5]/20'
                      : 'text-[#64708B] hover:text-[#172044] hover:bg-[#F5F7FF]'
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>

          </div>

          {/* Commitments Card List */}
          <div className="space-y-3.5">
            {filteredCommitments.length === 0 ? (
              <div className="rounded-2xl border border-[#E8EAF3] bg-white p-12 text-center shadow-card">
                <p className="text-sm font-medium text-[#64708B]">No commitments found matching criteria.</p>
              </div>
            ) : (
              filteredCommitments.map((item) => (
                <div
                  key={item.id}
                  className="rounded-2xl border border-[#E8EAF3] bg-white p-5 shadow-card hover:shadow-card-hover hover:border-[#D6D9EB] transition-all duration-200"
                >
                  <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
                    
                    <div className="space-y-2 flex-1">
                      <div className="flex items-center flex-wrap gap-2">
                        {getStatusBadge(item.status)}
                        <span className="flex items-center space-x-1.5 rounded-lg bg-[#F5F7FF] border border-[#E8EAF3] px-2.5 py-1 text-xs font-medium text-[#64708B]">
                          {getChannelIcon(item.channel)}
                          <span className="capitalize text-[#172044]">{item.channel}</span>
                        </span>
                        <span className="text-xs text-[#64708B] font-medium">
                          {item.commitment_type === 'promise_made' ? '• Made by you' : '• Made to you'}
                        </span>
                      </div>

                      <h3 className="text-sm font-bold text-[#172044] leading-snug">
                        {item.title}
                      </h3>

                      {item.description && (
                        <p className="text-xs text-[#64708B] leading-relaxed">
                          {item.description}
                        </p>
                      )}

                      {/* Evidence Snippet */}
                      {item.evidence_snippets && item.evidence_snippets.length > 0 && (
                        <div className="mt-2.5 rounded-xl border border-[#E8EAF3] border-l-4 border-l-[#5146E5] bg-[#F5F7FF] p-3 text-xs font-mono text-[#172044]">
                          <span className="text-[#5146E5] font-bold mr-1.5">Evidence:</span>
                          <span className="italic">{item.evidence_snippets[0]}</span>
                        </div>
                      )}
                    </div>

                    {/* Metadata column */}
                    <div className="flex sm:flex-col items-center sm:items-end justify-between sm:justify-start gap-1.5 text-right text-xs pt-1 sm:pt-0 border-t sm:border-t-0 border-[#E8EAF3]">
                      <div className="flex items-center space-x-1.5 text-[#172044] font-semibold">
                        <User className="h-3.5 w-3.5 text-[#64708B]" />
                        <span>{item.person_name}</span>
                      </div>
                      <div className="text-[11px] text-[#64708B] font-medium">
                        Due: {new Date(item.due_date || '').toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                      </div>
                      <div className="inline-flex items-center space-x-1 text-[10px] font-bold text-[#5146E5] bg-[#EEF0FD] border border-[#5146E5]/20 px-2 py-0.5 rounded-md">
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
          <div className="rounded-2xl border border-[#E8EAF3] bg-white p-5 shadow-card">
            <div className="flex items-center justify-between pb-3.5 border-b border-[#E8EAF3]">
              <div className="flex items-center space-x-2">
                <GitFork className="h-4 w-4 text-[#5146E5]" />
                <h3 className="text-sm font-bold text-[#172044]">Relationship Graph</h3>
              </div>
              <span className="text-xs text-[#64708B] font-semibold">4 Contacts</span>
            </div>

            <div className="mt-4 space-y-3">
              {peopleSample.map((person) => (
                <div
                  key={person.id}
                  className="flex items-center justify-between rounded-xl border border-[#E8EAF3] bg-[#F5F7FF] p-3 hover:border-[#D6D9EB] transition-all"
                >
                  <div className="flex items-center space-x-3">
                    <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#EEF0FD] text-[#5146E5] font-bold text-xs border border-[#5146E5]/20">
                      {person.display_name.slice(0, 2).toUpperCase()}
                    </div>
                    <div>
                      <div className="text-xs font-bold text-[#172044]">
                        {person.display_name}
                      </div>
                      <div className="text-[11px] text-[#64708B]">
                        {person.organization}
                      </div>
                    </div>
                  </div>

                  <div className="text-right">
                    <div className="text-xs font-bold text-[#24B8A5]">
                      {Math.round(person.relationship_score * 100)}%
                    </div>
                    <div className="text-[10px] text-[#64708B] font-medium">Affinity</div>
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-4 pt-3 border-t border-[#E8EAF3] text-center">
              <span className="text-[11px] text-[#64708B] font-medium">
                Full dynamic Graph visualizer scheduled for Phase 3
              </span>
            </div>
          </div>

          {/* Connected Channels Status Card */}
          <div className="rounded-2xl border border-[#E8EAF3] bg-white p-5 shadow-card">
            <div className="flex items-center justify-between pb-3.5 border-b border-[#E8EAF3]">
              <div className="flex items-center space-x-2">
                <Radio className="h-4 w-4 text-[#24B8A5]" />
                <h3 className="text-sm font-bold text-[#172044]">Ingestion Channels</h3>
              </div>
              <span className="text-xs text-[#64708B] font-medium">Phase Roadmap</span>
            </div>

            <div className="mt-4 space-y-3">
              
              <div className="flex items-center justify-between rounded-xl border border-[#E8EAF3] bg-[#F5F7FF] p-3 hover:border-[#D6D9EB] transition-all">
                <div className="flex items-center space-x-3">
                  <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#FDF1F0] text-[#E66D68]">
                    <Mail className="h-4 w-4" />
                  </div>
                  <div>
                    <div className="text-xs font-bold text-[#172044]">Gmail Integration</div>
                    <div className="text-[10px] text-[#64708B]">OAuth 2.0 & thread sync</div>
                  </div>
                </div>
                <span className="rounded-lg bg-[#EEF0FD] px-2.5 py-1 text-[10px] font-bold text-[#5146E5] border border-[#5146E5]/20">
                  Phase 2 Ready
                </span>
              </div>

              <div className="flex items-center justify-between rounded-xl border border-[#E8EAF3] bg-[#F5F7FF] p-3 hover:border-[#D6D9EB] transition-all">
                <div className="flex items-center space-x-3">
                  <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#E6F8F5] text-[#24B8A5]">
                    <MessageSquare className="h-4 w-4" />
                  </div>
                  <div>
                    <div className="text-xs font-bold text-[#172044]">WhatsApp Chat Sync</div>
                    <div className="text-[10px] text-[#64708B]">Chat import & Cloud API</div>
                  </div>
                </div>
                <span className="rounded-lg bg-white border border-[#E8EAF3] px-2.5 py-1 text-[10px] font-semibold text-[#64708B]">
                  Phase 3 Planned
                </span>
              </div>

              <div className="flex items-center justify-between rounded-xl border border-[#E8EAF3] bg-[#F5F7FF] p-3 hover:border-[#D6D9EB] transition-all">
                <div className="flex items-center space-x-3">
                  <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-white border border-[#E8EAF3] text-[#172044]">
                    <Github className="h-4 w-4" />
                  </div>
                  <div>
                    <div className="text-xs font-bold text-[#172044]">GitHub Integration</div>
                    <div className="text-[10px] text-[#64708B]">Issues, PRs & code reviews</div>
                  </div>
                </div>
                <span className="rounded-lg bg-white border border-[#E8EAF3] px-2.5 py-1 text-[10px] font-semibold text-[#64708B]">
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
