import React from 'react';
import {
  Share2,
  ArrowRight,
  ShieldCheck,
  CheckCircle2,
  Sparkles,
  Zap,
  Network,
  Cpu,
  Mail,
  MessageSquare,
  Github,
  Lock,
  Layers,
  ChevronRight
} from 'lucide-react';

interface LandingPageProps {
  onEnterDashboard: () => void;
}

export const LandingPage: React.FC<LandingPageProps> = ({ onEnterDashboard }) => {
  const features = [
    {
      title: 'Cross-Channel Ingestion',
      desc: 'Seamless ingestion pipeline planned for Gmail, WhatsApp chats, and GitHub issues/PR discussions.',
      icon: MessageSquare,
      color: 'from-blue-500 to-indigo-600',
      badge: 'Phase 2-4 Roadmap',
    },
    {
      title: 'AI Commitment Extraction',
      desc: 'Automatically detect implicit and explicit promises made by you or to you across daily correspondence.',
      icon: Sparkles,
      color: 'from-indigo-500 to-purple-600',
      badge: 'Core Intelligence',
    },
    {
      title: 'People Relationship Graph',
      desc: 'Build an interactive knowledge graph mapping collaborators, commitment reliability scores, and interaction depth.',
      icon: Network,
      color: 'from-purple-500 to-pink-600',
      badge: 'Graph Intelligence',
    },
    {
      title: 'Verifiable Evidence Proofs',
      desc: 'Every commitment is backed by raw message snippets, timestamps, and conversation context for auditability.',
      icon: ShieldCheck,
      color: 'from-emerald-500 to-teal-600',
      badge: 'Evidence System',
    },
    {
      title: 'MCP Server Integration',
      desc: 'Expose communication intelligence to external AI agents (Claude, Cursor, Antigravity) via Model Context Protocol.',
      icon: Cpu,
      color: 'from-amber-500 to-orange-600',
      badge: 'Phase 5 Planned',
    },
    {
      title: 'Human-Approved Follow-ups',
      desc: 'Never send robotic automated messages. Draft context-aware follow-ups requiring explicit one-click human approval.',
      icon: Lock,
      color: 'from-cyan-500 to-blue-600',
      badge: 'Human in the Loop',
    },
  ];

  const architectureHighlights = [
    { label: 'Frontend', value: 'React 18 • TypeScript • Vite • Tailwind CSS' },
    { label: 'Backend API', value: 'FastAPI • Pydantic v2 • Uvicorn' },
    { label: 'Database & ORM', value: 'PostgreSQL • SQLAlchemy 2.0' },
    { label: 'Infrastructure', value: 'Docker Compose • Modular Clean Architecture' },
  ];

  return (
    <div className="relative overflow-hidden bg-slate-950 text-slate-100 selection:bg-indigo-500 selection:text-white">
      {/* Background Glow Accents */}
      <div className="pointer-events-none absolute inset-x-0 -top-40 -z-10 transform-gpu overflow-hidden blur-3xl sm:-top-80">
        <div
          className="relative left-[calc(50%-11rem)] aspect-[1155/678] w-[36.125rem] -translate-x-1/2 rotate-[30deg] bg-gradient-to-tr from-indigo-500 to-emerald-400 opacity-20 sm:left-[calc(50%-30rem)] sm:w-[72.1875rem]"
          style={{
            clipPath:
              'polygon(74.1% 44.1%, 100% 61.6%, 97.5% 26.9%, 85.5% 0.1%, 80.7% 2%, 72.5% 32.5%, 60.2% 62.4%, 52.4% 68.1%, 47.5% 58.3%, 45.2% 34.5%, 27.5% 76.7%, 0.1% 64.9%, 17.9% 100%, 27.6% 76.8%, 76.1% 97.7%, 74.1% 44.1%)',
          }}
        />
      </div>

      {/* Hero Section */}
      <section className="relative mx-auto max-w-7xl px-4 pt-16 pb-20 sm:px-6 lg:px-8 lg:pt-24 lg:pb-32">
        <div className="mx-auto max-w-3xl text-center">
          
          {/* Phase 1 Badge */}
          <div className="inline-flex items-center space-x-2 rounded-full border border-indigo-500/30 bg-indigo-500/10 px-4 py-1.5 text-xs font-semibold text-indigo-300 shadow-sm backdrop-blur-sm">
            <Sparkles className="h-3.5 w-3.5 text-indigo-400" />
            <span>Phase 1 Architecture Foundation Active</span>
            <span className="text-slate-500">•</span>
            <span className="text-emerald-400">Ready for Integrations</span>
          </div>

          {/* Main Headline */}
          <h1 className="mt-8 text-4xl font-extrabold tracking-tight text-white sm:text-6xl lg:text-7xl">
            Never Lose Track of a{' '}
            <span className="bg-gradient-to-r from-indigo-400 via-purple-300 to-emerald-400 bg-clip-text text-transparent">
              Promise Again
            </span>
          </h1>

          {/* Subtitle */}
          <p className="mt-6 text-lg sm:text-xl leading-8 text-slate-300">
            PromiseGraph is the AI-powered communication intelligence platform that ingests your conversations across Email, WhatsApp, and GitHub to extract commitments, track deadlines, and map relationship intelligence.
          </p>

          {/* Call to Actions */}
          <div className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4">
            <button
              onClick={onEnterDashboard}
              className="inline-flex items-center space-x-3 rounded-xl bg-gradient-to-r from-indigo-600 to-indigo-500 px-6 py-3.5 text-base font-semibold text-white shadow-xl shadow-indigo-600/30 hover:from-indigo-500 hover:to-indigo-400 transition-all transform hover:-translate-y-0.5 focus:outline-none"
            >
              <span>Explore Dashboard</span>
              <ArrowRight className="h-5 w-5" />
            </button>

            <a
              href="#architecture"
              className="inline-flex items-center space-x-2 rounded-xl border border-slate-800 bg-slate-900/80 px-6 py-3.5 text-base font-medium text-slate-300 hover:bg-slate-800/80 hover:text-white transition-colors"
            >
              <Layers className="h-4 w-4 text-indigo-400" />
              <span>Architecture Specs</span>
            </a>
          </div>

          {/* Planned Channel Badges */}
          <div className="mt-12 flex flex-wrap items-center justify-center gap-4 text-xs text-slate-400">
            <span className="text-slate-500 uppercase tracking-wider text-[10px] font-semibold">
              Planned Ingestion Sources:
            </span>
            <div className="flex items-center space-x-1.5 rounded-lg border border-slate-800 bg-slate-900/60 px-3 py-1.5">
              <Mail className="h-3.5 w-3.5 text-red-400" />
              <span>Gmail API</span>
            </div>
            <div className="flex items-center space-x-1.5 rounded-lg border border-slate-800 bg-slate-900/60 px-3 py-1.5">
              <MessageSquare className="h-3.5 w-3.5 text-emerald-400" />
              <span>WhatsApp Integration</span>
            </div>
            <div className="flex items-center space-x-1.5 rounded-lg border border-slate-800 bg-slate-900/60 px-3 py-1.5">
              <Github className="h-3.5 w-3.5 text-slate-300" />
              <span>GitHub Issues & PRs</span>
            </div>
          </div>

        </div>

        {/* Dashboard Preview Mockup Card */}
        <div className="mt-16 sm:mt-20 rounded-2xl border border-slate-800 bg-slate-900/60 p-2 sm:p-4 shadow-2xl backdrop-blur-xl">
          <div className="rounded-xl border border-slate-800/80 bg-slate-950 p-4 sm:p-6">
            
            {/* Window bar */}
            <div className="flex items-center justify-between pb-4 border-b border-slate-800/80">
              <div className="flex items-center space-x-2">
                <span className="h-3 w-3 rounded-full bg-red-500/80" />
                <span className="h-3 w-3 rounded-full bg-amber-500/80" />
                <span className="h-3 w-3 rounded-full bg-emerald-500/80" />
                <span className="ml-4 text-xs font-mono text-slate-400">promisegraph-dashboard.local</span>
              </div>
              <div className="flex items-center space-x-2 text-xs text-emerald-400 font-mono">
                <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
                <span>FastAPI /api/health: OK</span>
              </div>
            </div>

            {/* Mocked UI Content */}
            <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="rounded-xl border border-slate-800 bg-slate-900/70 p-4">
                <div className="text-xs text-slate-400 font-medium">Extracted Commitments</div>
                <div className="mt-2 text-2xl font-bold text-white">14 Active</div>
                <div className="mt-1 text-xs text-emerald-400">8 fulfilled • 4 pending • 2 overdue</div>
              </div>
              <div className="rounded-xl border border-slate-800 bg-slate-900/70 p-4">
                <div className="text-xs text-slate-400 font-medium">Relationship Network</div>
                <div className="mt-2 text-2xl font-bold text-white">28 People Mapped</div>
                <div className="mt-1 text-xs text-indigo-400">Cross-channel relationship graph</div>
              </div>
              <div className="rounded-xl border border-slate-800 bg-slate-900/70 p-4">
                <div className="text-xs text-slate-400 font-medium">Confidence & Evidence</div>
                <div className="mt-2 text-2xl font-bold text-white">96.8% Accuracy</div>
                <div className="mt-1 text-xs text-purple-400">Full context snippet verification</div>
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* Feature Grid Section */}
      <section className="relative mx-auto max-w-7xl px-4 py-20 sm:px-6 lg:px-8 border-t border-slate-900">
        <div className="text-center max-w-2xl mx-auto mb-16">
          <h2 className="text-xs font-bold tracking-widest text-indigo-400 uppercase">
            Comprehensive Capability Matrix
          </h2>
          <p className="mt-3 text-3xl font-extrabold text-white sm:text-4xl">
            Architected for Autonomous Intelligence
          </p>
          <p className="mt-4 text-base text-slate-400">
            A modular platform foundation separating ingestion channels, relational models, intelligence extraction, and client MCP access.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {features.map((feature, idx) => {
            const Icon = feature.icon;
            return (
              <div
                key={idx}
                className="group relative rounded-2xl border border-slate-800/80 bg-slate-900/40 p-6 hover:bg-slate-900/80 hover:border-indigo-500/30 transition-all duration-300"
              >
                <div className="flex items-center justify-between">
                  <div
                    className={`flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-tr ${feature.color} text-white shadow-lg`}
                  >
                    <Icon className="h-6 w-6" />
                  </div>
                  <span className="rounded-full bg-slate-800 px-2.5 py-1 text-[11px] font-medium text-slate-300 border border-slate-700">
                    {feature.badge}
                  </span>
                </div>
                <h3 className="mt-5 text-lg font-semibold text-white group-hover:text-indigo-300 transition-colors">
                  {feature.title}
                </h3>
                <p className="mt-2 text-sm text-slate-400 leading-relaxed">
                  {feature.desc}
                </p>
              </div>
            );
          })}
        </div>
      </section>

      {/* Architecture Spec Section */}
      <section id="architecture" className="mx-auto max-w-7xl px-4 py-20 sm:px-6 lg:px-8 border-t border-slate-900">
        <div className="rounded-3xl border border-slate-800 bg-slate-900/30 p-8 sm:p-12">
          <div className="max-w-2xl">
            <div className="inline-flex items-center space-x-2 text-xs font-bold text-indigo-400 uppercase tracking-wider">
              <Zap className="h-4 w-4" />
              <span>Phase 1 Architecture Verification</span>
            </div>
            <h2 className="mt-3 text-3xl font-bold text-white">
              Industrial Foundation Standards
            </h2>
            <p className="mt-4 text-sm text-slate-400 leading-relaxed">
              PromiseGraph Phase 1 delivers pure architectural clarity. All core models are established with clean foreign keys, indices, and data validation without polluting the codebase with premature mocks or fake data.
            </p>
          </div>

          <div className="mt-10 grid grid-cols-1 md:grid-cols-2 gap-4">
            {architectureHighlights.map((arch, i) => (
              <div key={i} className="flex items-start space-x-3 rounded-xl border border-slate-800 bg-slate-950 p-4">
                <CheckCircle2 className="h-5 w-5 text-emerald-400 flex-shrink-0 mt-0.5" />
                <div>
                  <div className="text-xs font-semibold text-slate-400 uppercase tracking-wide">
                    {arch.label}
                  </div>
                  <div className="mt-1 text-sm font-medium text-slate-200">
                    {arch.value}
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div className="mt-8 pt-8 border-t border-slate-800/80 flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="text-xs text-slate-400">
              Database schema ready for User, ConnectedAccount, Conversation, Person, Commitment, and Evidence.
            </div>
            <button
              onClick={onEnterDashboard}
              className="inline-flex items-center space-x-2 rounded-lg bg-indigo-600 px-4 py-2 text-xs font-semibold text-white hover:bg-indigo-500 transition-colors"
            >
              <span>Launch Live Dashboard</span>
              <ChevronRight className="h-4 w-4" />
            </button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-slate-900 py-10 text-center text-xs text-slate-500">
        <div className="flex items-center justify-center space-x-2 mb-2">
          <Share2 className="h-4 w-4 text-indigo-400" />
          <span className="font-bold text-slate-300">PromiseGraph</span>
          <span>• Communication Intelligence & Relationship Platform</span>
        </div>
        <p>© 2026 PromiseGraph. Phase 1 Architecture Foundation.</p>
      </footer>
    </div>
  );
};
