import React from 'react';
import {
  Mail,
  MessageSquare,
  Github,
  Lock,
  Info,
  CheckCircle2
} from 'lucide-react';

export const SourcesView: React.FC = () => {
  const sources = [
    {
      id: 'gmail',
      name: 'Google Workspace / Gmail',
      description:
        'Continuous ingestion of email threads, extracting explicit commitments made in correspondence.',
      icon: Mail,
      iconColor: 'text-[#E66D68]',
      iconBg: 'bg-[#FDF1F0]',
      status: 'Coming soon',
      statusType: 'coming_soon' as const,
      phase: 'Phase 2 Integration Roadmap',
      authMethod: 'OAuth 2.0 (Google Workspace API)',
      capabilities: [
        'Automatic thread message polling',
        'Commitment detection in outbound & inbound emails',
        'Direct link to original email message thread',
      ],
      notice:
        'Official Gmail OAuth integration will be implemented in subsequent phases. No active email connection is established yet.',
    },
    {
      id: 'whatsapp',
      name: 'WhatsApp Business API & Chat Import',
      description:
        'Import exported chat histories (.txt/.zip) or connect live via Meta WhatsApp Cloud API webhooks.',
      icon: MessageSquare,
      iconColor: 'text-[#24B8A5]',
      iconBg: 'bg-[#E6F8F5]',
      status: 'Coming soon',
      statusType: 'coming_soon' as const,
      phase: 'Phase 3 Integration Roadmap',
      authMethod: 'Meta Cloud API Token / Manual Chat Parser',
      capabilities: [
        'Group & direct conversation transcript parsing',
        'Sender and recipient phone mapping to Person entities',
        'Timestamp alignment for commitment promises',
      ],
      notice:
        'WhatsApp chat import and webhook receiver are scheduled for Phase 3. No live Meta API credentials are currently stored.',
    },
    {
      id: 'github',
      name: 'GitHub Issues & Pull Requests',
      description:
        'Monitor repository issues, PR descriptions, and code review discussions for promised deliverables.',
      icon: Github,
      iconColor: 'text-[#172044]',
      iconBg: 'bg-[#F5F7FF]',
      status: 'Not connected',
      statusType: 'not_connected' as const,
      phase: 'Phase 4 Integration Roadmap',
      authMethod: 'GitHub App / Personal Access Token',
      capabilities: [
        'Issue comments commitment scanning',
        'PR review change-request tracking',
        'Author association with GitHub handles',
      ],
      notice:
        'GitHub webhook dispatcher and repository app are planned for Phase 4. Integrations will be activated in later releases.',
    },
  ];

  return (
    <div className="flex-1 space-y-8 p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-6 border-b border-[#E8EAF3]">
        <div>
          <div className="flex items-center space-x-2.5">
            <h1 className="text-2xl sm:text-3xl font-extrabold text-[#172044] tracking-tight">
              Communication Sources
            </h1>
            <span className="rounded-full bg-[#FEF7EC] px-2.5 py-0.5 text-xs font-bold text-[#D99A2B] border border-[#F2B84B]/30">
              Integrations Roadmap
            </span>
          </div>
          <p className="mt-1 text-sm text-[#64708B]">
            Configure external channel ingestion connectors. All integration statuses are displayed honestly below.
          </p>
        </div>
      </div>

      {/* Honest Transparency Notice Banner */}
      <div className="rounded-2xl border border-[#5146E5]/20 bg-[#EEF0FD]/60 p-4 sm:p-5 flex items-start space-x-3.5">
        <Info className="h-5 w-5 text-[#5146E5] flex-shrink-0 mt-0.5" />
        <div className="space-y-1 text-xs">
          <p className="font-bold text-[#172044]">
            Integration Status Notice
          </p>
          <p className="text-[#64708B] leading-relaxed">
            PromiseGraph is currently on <strong>Phase 2 (Functional Frontend Foundation)</strong>. We do not use simulated or fake OAuth flows. Live integration connectors for Gmail, WhatsApp, and GitHub will be rolled out in Phases 3 and 4 with complete security audits.
          </p>
        </div>
      </div>

      {/* Sources Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {sources.map((src) => {
          const Icon = src.icon;
          return (
            <div
              key={src.id}
              className="rounded-2xl border border-[#E8EAF3] bg-white p-6 shadow-card hover:shadow-card-hover hover:border-[#D6D9EB] transition-all flex flex-col justify-between space-y-6"
            >
              <div className="space-y-4">
                <div className="flex items-start justify-between">
                  <div className={`flex h-12 w-12 items-center justify-center rounded-2xl ${src.iconBg} ${src.iconColor}`}>
                    <Icon className="h-6 w-6" />
                  </div>
                  <span className="rounded-full bg-[#F5F7FF] border border-[#E8EAF3] px-2.5 py-1 text-[11px] font-bold text-[#64708B]">
                    {src.status}
                  </span>
                </div>

                <div>
                  <h3 className="text-base font-bold text-[#172044]">
                    {src.name}
                  </h3>
                  <p className="mt-1 text-xs text-[#64708B] leading-relaxed">
                    {src.description}
                  </p>
                </div>

                <div className="space-y-2 pt-2 border-t border-[#E8EAF3]">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-[#64708B]">
                    Planned Capabilities
                  </span>
                  <ul className="space-y-1.5 text-xs text-[#172044]">
                    {src.capabilities.map((cap, i) => (
                      <li key={i} className="flex items-start space-x-2">
                        <CheckCircle2 className="h-3.5 w-3.5 text-[#24B8A5] flex-shrink-0 mt-0.5" />
                        <span className="text-[11px] leading-snug">{cap}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="rounded-xl border border-[#E8EAF3] bg-[#F5F7FF] p-3 text-[11px] text-[#64708B] space-y-1">
                  <p className="font-semibold text-[#172044]">Auth Architecture:</p>
                  <p>{src.authMethod}</p>
                </div>
              </div>

              {/* Action Button */}
              <div className="pt-4 border-t border-[#E8EAF3]">
                <button
                  disabled
                  className="w-full flex items-center justify-center space-x-2 rounded-xl border border-[#E8EAF3] bg-[#F5F7FF] py-2.5 text-xs font-semibold text-[#64708B] cursor-not-allowed"
                >
                  <Lock className="h-3.5 w-3.5" />
                  <span>{src.phase}</span>
                </button>
              </div>

            </div>
          );
        })}
      </div>

    </div>
  );
};
