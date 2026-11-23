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
      iconBg: 'bg-[#EEF0FD] text-[#5146E5]',
      badge: 'Phase 2-4 Roadmap',
    },
    {
      title: 'AI Commitment Extraction',
      desc: 'Automatically detect implicit and explicit promises made by you or to you across daily correspondence.',
      icon: Sparkles,
      iconBg: 'bg-[#EEF0FD] text-[#5146E5]',
      badge: 'Core Intelligence',
    },
    {
      title: 'People Relationship Graph',
      desc: 'Build an interactive knowledge graph mapping collaborators, commitment reliability scores, and interaction depth.',
      icon: Network,
      iconBg: 'bg-[#E6F8F5] text-[#24B8A5]',
      badge: 'Graph Intelligence',
    },
    {
      title: 'Verifiable Evidence Proofs',
      desc: 'Every commitment is backed by raw message snippets, timestamps, and conversation context for auditability.',
      icon: ShieldCheck,
      iconBg: 'bg-[#E6F8F5] text-[#24B8A5]',
      badge: 'Evidence System',
    },
    {
      title: 'MCP Server Integration',
      desc: 'Expose communication intelligence to external AI agents (Claude, Cursor, Antigravity) via Model Context Protocol.',
      icon: Cpu,
      iconBg: 'bg-[#FEF7EC] text-[#D99A2B]',
      badge: 'Phase 5 Planned',
    },
    {
      title: 'Human-Approved Follow-ups',
      desc: 'Never send robotic automated messages. Draft context-aware follow-ups requiring explicit one-click human approval.',
      icon: Lock,
      iconBg: 'bg-[#EEF0FD] text-[#5146E5]',
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
    <div className="relative overflow-hidden bg-[#F5F7FF] text-[#172044]">
      {/* Background Soft Glow Accents */}
      <div className="pointer-events-none absolute inset-x-0 -top-40 -z-10 transform-gpu overflow-hidden blur-3xl sm:-top-80">
        <div
          className="relative left-[calc(50%-11rem)] aspect-[1155/678] w-[36.125rem] -translate-x-1/2 rotate-[30deg] bg-gradient-to-tr from-[#5146E5] to-[#24B8A5] opacity-10 sm:left-[calc(50%-30rem)] sm:w-[72.1875rem]"
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
          <div className="inline-flex items-center space-x-2.5 rounded-full border border-[#E8EAF3] bg-white px-4 py-1.5 text-xs font-semibold text-[#172044] shadow-subtle">
            <div className="flex h-4 w-4 items-center justify-center rounded-full bg-[#EEF0FD] text-[#5146E5]">
              <Sparkles className="h-2.5 w-2.5" />
            </div>
            <span>Phase 1 Architecture Foundation Active</span>
            <span className="text-[#E8EAF3]">•</span>
            <span className="text-[#24B8A5] font-bold">Ready for Integrations</span>
          </div>

          {/* Main Headline */}
          <h1 className="mt-8 text-4xl font-extrabold tracking-tight text-[#172044] sm:text-6xl lg:text-7xl">
            Never Lose Track of a{' '}
            <span className="text-[#5146E5]">
              Promise Again
            </span>
          </h1>

          {/* Subtitle */}
          <p className="mt-6 text-lg sm:text-xl leading-relaxed text-[#64708B]">
            PromiseGraph is the communication intelligence platform that ingests your conversations across Email, WhatsApp, and GitHub to extract commitments, track deadlines, and map relationship intelligence.
          </p>

          {/* Call to Actions */}
          <div className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4">
            <button
              onClick={onEnterDashboard}
              className="inline-flex items-center space-x-2.5 rounded-xl bg-[#5146E5] px-6 py-3.5 text-sm sm:text-base font-bold text-white shadow-md shadow-[#5146E5]/25 hover:bg-[#4338CA] transition-all transform hover:-translate-y-0.5 focus:outline-none"
            >
              <span>Explore Dashboard</span>
              <ArrowRight className="h-4 w-4" />
            </button>

            <a
              href="#architecture"
              className="inline-flex items-center space-x-2 rounded-xl border border-[#E8EAF3] bg-white px-6 py-3.5 text-sm sm:text-base font-semibold text-[#172044] hover:bg-[#F8F9FD] hover:border-[#D6D9EB] shadow-subtle transition-all"
            >
              <Layers className="h-4 w-4 text-[#5146E5]" />
              <span>Architecture Specs</span>
            </a>
          </div>

          {/* Planned Channel Badges */}
          <div className="mt-12 flex flex-wrap items-center justify-center gap-3.5 text-xs text-[#64708B]">
            <span className="text-[#64708B] uppercase tracking-wider text-[10px] font-bold">
              Planned Channels:
            </span>
            <div className="flex items-center space-x-2 rounded-xl border border-[#E8EAF3] bg-white px-3.5 py-1.5 shadow-subtle font-medium text-[#172044]">
              <Mail className="h-3.5 w-3.5 text-[#E66D68]" />
              <span>Gmail API</span>
            </div>
            <div className="flex items-center space-x-2 rounded-xl border border-[#E8EAF3] bg-white px-3.5 py-1.5 shadow-subtle font-medium text-[#172044]">
              <MessageSquare className="h-3.5 w-3.5 text-[#24B8A5]" />
              <span>WhatsApp Integration</span>
            </div>
            <div className="flex items-center space-x-2 rounded-xl border border-[#E8EAF3] bg-white px-3.5 py-1.5 shadow-subtle font-medium text-[#172044]">
              <Github className="h-3.5 w-3.5 text-[#172044]" />
              <span>GitHub Issues & PRs</span>
            </div>
          </div>

        </div>

        {/* Dashboard Preview Mockup Card */}
        <div className="mt-16 sm:mt-20 rounded-3xl border border-[#E8EAF3] bg-white p-3 sm:p-5 shadow-xl shadow-[#172044]/5">
          <div className="rounded-2xl border border-[#E8EAF3] bg-[#F5F7FF] p-4 sm:p-6">
            
            {/* Window bar */}
            <div className="flex items-center justify-between pb-4 border-b border-[#E8EAF3]">
              <div className="flex items-center space-x-2">
                <span className="h-3 w-3 rounded-full bg-[#E66D68]" />
                <span className="h-3 w-3 rounded-full bg-[#F2B84B]" />
                <span className="h-3 w-3 rounded-full bg-[#24B8A5]" />
                <span className="ml-4 rounded-md bg-white border border-[#E8EAF3] px-3 py-0.5 text-xs font-mono text-[#64708B]">
                  promisegraph.ai/dashboard
                </span>
              </div>
              <div className="flex items-center space-x-1.5 text-xs text-[#24B8A5] font-semibold">
                <span className="h-2 w-2 rounded-full bg-[#24B8A5] animate-pulse" />
                <span>FastAPI /api/health: Online</span>
              </div>
            </div>

            {/* Mocked UI Content */}
            <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="rounded-2xl border border-[#E8EAF3] bg-white p-5 shadow-subtle">
                <div className="text-[11px] font-bold uppercase tracking-wider text-[#64708B]">Extracted Commitments</div>
                <div className="mt-2 text-2xl font-extrabold text-[#172044]">14 Active</div>
                <div className="mt-1 text-xs text-[#24B8A5] font-semibold">8 fulfilled • 4 pending • 2 overdue</div>
              </div>
              <div className="rounded-2xl border border-[#E8EAF3] bg-white p-5 shadow-subtle">
                <div className="text-[11px] font-bold uppercase tracking-wider text-[#64708B]">Relationship Network</div>
                <div className="mt-2 text-2xl font-extrabold text-[#172044]">28 People Mapped</div>
                <div className="mt-1 text-xs text-[#5146E5] font-semibold">Cross-channel relationship graph</div>
              </div>
              <div className="rounded-2xl border border-[#E8EAF3] bg-white p-5 shadow-subtle">
                <div className="text-[11px] font-bold uppercase tracking-wider text-[#64708B]">Confidence & Evidence</div>
                <div className="mt-2 text-2xl font-extrabold text-[#172044]">96.8% Accuracy</div>
                <div className="mt-1 text-xs text-[#64708B] font-semibold">Full context snippet verification</div>
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* Feature Grid Section */}
      <section className="relative mx-auto max-w-7xl px-4 py-20 sm:px-6 lg:px-8 border-t border-[#E8EAF3]">
        <div className="text-center max-w-2xl mx-auto mb-16">
          <h2 className="text-xs font-bold tracking-widest text-[#5146E5] uppercase">
            Comprehensive Capability Matrix
          </h2>
          <p className="mt-3 text-3xl font-extrabold text-[#172044] sm:text-4xl">
            Architected for Autonomous Intelligence
          </p>
          <p className="mt-4 text-base text-[#64708B]">
            A modular platform foundation separating ingestion channels, relational models, intelligence extraction, and client MCP access.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {features.map((feature, idx) => {
            const Icon = feature.icon;
            return (
              <div
                key={idx}
                className="group relative rounded-2xl border border-[#E8EAF3] bg-white p-6 shadow-card hover:shadow-card-hover hover:border-[#D6D9EB] transition-all duration-200"
              >
                <div className="flex items-center justify-between">
                  <div
                    className={`flex h-11 w-11 items-center justify-center rounded-xl ${feature.iconBg} shadow-sm`}
                  >
                    <Icon className="h-5 w-5" />
                  </div>
                  <span className="rounded-full bg-[#F5F7FF] border border-[#E8EAF3] px-2.5 py-1 text-[11px] font-semibold text-[#64708B]">
                    {feature.badge}
                  </span>
                </div>
                <h3 className="mt-5 text-base font-bold text-[#172044] group-hover:text-[#5146E5] transition-colors">
                  {feature.title}
                </h3>
                <p className="mt-2 text-xs leading-relaxed text-[#64708B]">
                  {feature.desc}
                </p>
              </div>
            );
          })}
        </div>
      </section>

      {/* Architecture Spec Section */}
      <section id="architecture" className="mx-auto max-w-7xl px-4 py-20 sm:px-6 lg:px-8 border-t border-[#E8EAF3]">
        <div className="rounded-3xl border border-[#E8EAF3] bg-white p-8 sm:p-12 shadow-card">
          <div className="max-w-2xl">
            <div className="inline-flex items-center space-x-2 text-xs font-bold text-[#5146E5] uppercase tracking-wider">
              <Zap className="h-4 w-4" />
              <span>Phase 1 Architecture Verification</span>
            </div>
            <h2 className="mt-3 text-3xl font-extrabold text-[#172044]">
              Industrial Foundation Standards
            </h2>
            <p className="mt-4 text-sm text-[#64708B] leading-relaxed">
              PromiseGraph Phase 1 delivers pure architectural clarity. All core models are established with clean foreign keys, indices, and data validation without polluting the codebase with premature mocks or fake data.
            </p>
          </div>

          <div className="mt-10 grid grid-cols-1 md:grid-cols-2 gap-4">
            {architectureHighlights.map((arch, i) => (
              <div key={i} className="flex items-start space-x-3 rounded-2xl border border-[#E8EAF3] bg-[#F5F7FF] p-4.5">
                <div className="flex h-6 w-6 items-center justify-center rounded-full bg-[#E6F8F5] text-[#24B8A5] flex-shrink-0 mt-0.5">
                  <CheckCircle2 className="h-4 w-4" />
                </div>
                <div>
                  <div className="text-[10px] font-bold text-[#64708B] uppercase tracking-wider">
                    {arch.label}
                  </div>
                  <div className="mt-1 text-sm font-semibold text-[#172044]">
                    {arch.value}
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div className="mt-8 pt-8 border-t border-[#E8EAF3] flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="text-xs text-[#64708B] font-medium">
              Database schema ready for User, ConnectedAccount, Conversation, Person, Commitment, and Evidence.
            </div>
            <button
              onClick={onEnterDashboard}
              className="inline-flex items-center space-x-2 rounded-xl bg-[#5146E5] px-4 py-2 text-xs font-bold text-white hover:bg-[#4338CA] shadow-sm shadow-[#5146E5]/20 transition-all"
            >
              <span>Launch Live Dashboard</span>
              <ChevronRight className="h-4 w-4" />
            </button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-[#E8EAF3] bg-white py-10 text-center text-xs text-[#64708B]">
        <div className="flex items-center justify-center space-x-2 mb-2">
          <Share2 className="h-4 w-4 text-[#5146E5]" />
          <span className="font-bold text-[#172044]">PromiseGraph</span>
          <span>• Communication Intelligence & Relationship Platform</span>
        </div>
        <p>© 2026 PromiseGraph. Phase 1 Architecture Foundation.</p>
      </footer>
    </div>
  );
};
