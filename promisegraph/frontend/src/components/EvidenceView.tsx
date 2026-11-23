import React, { useState } from 'react';
import {
  CheckCircle2,
  ShieldCheck,
  Mail,
  MessageSquare,
  Github,
  ExternalLink,
  Search
} from 'lucide-react';
import { Evidence, Commitment } from '../types';

interface EvidenceViewProps {
  evidenceList: Evidence[];
  commitments: Commitment[];
  loading: boolean;
  onSelectCommitment: (comm: Commitment) => void;
}

export const EvidenceView: React.FC<EvidenceViewProps> = ({
  evidenceList,
  commitments,
  loading,
  onSelectCommitment,
}) => {
  const [searchQuery, setSearchQuery] = useState('');

  const filteredEvidence = evidenceList.filter((ev) => {
    const q = searchQuery.toLowerCase();
    return (
      ev.snippet_text.toLowerCase().includes(q) ||
      (ev.commitment_title && ev.commitment_title.toLowerCase().includes(q)) ||
      (ev.source_message_id && ev.source_message_id.toLowerCase().includes(q))
    );
  });

  const getChannelBadge = (channel?: string) => {
    switch (channel) {
      case 'whatsapp':
        return (
          <span className="inline-flex items-center space-x-1 rounded-md bg-[#E6F8F5] px-2 py-0.5 text-[10px] font-bold text-[#24B8A5]">
            <MessageSquare className="h-3 w-3" />
            <span>WhatsApp</span>
          </span>
        );
      case 'github':
        return (
          <span className="inline-flex items-center space-x-1 rounded-md bg-[#F5F7FF] px-2 py-0.5 text-[10px] font-bold text-[#172044] border border-[#E8EAF3]">
            <Github className="h-3 w-3" />
            <span>GitHub</span>
          </span>
        );
      case 'email':
      default:
        return (
          <span className="inline-flex items-center space-x-1 rounded-md bg-[#FDF1F0] px-2 py-0.5 text-[10px] font-bold text-[#E66D68]">
            <Mail className="h-3 w-3" />
            <span>Email</span>
          </span>
        );
    }
  };

  return (
    <div className="flex-1 space-y-8 p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-6 border-b border-[#E8EAF3]">
        <div>
          <div className="flex items-center space-x-2.5">
            <h1 className="text-2xl sm:text-3xl font-extrabold text-[#172044] tracking-tight">
              Evidence & Verification
            </h1>
            <span className="rounded-full bg-[#EEF0FD] px-2.5 py-0.5 text-xs font-bold text-[#5146E5] border border-[#5146E5]/20">
              Audit Proofs
            </span>
          </div>
          <p className="mt-1 text-sm text-[#64708B]">
            Verifiable transcript excerpts, message timestamps, and conversation context establishing proof of commitment.
          </p>
        </div>

        {/* Search */}
        <div className="relative w-full sm:w-72">
          <Search className="absolute left-3.5 top-3 h-4 w-4 text-[#64708B]" />
          <input
            type="text"
            placeholder="Search snippet or message ID..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full rounded-xl border border-[#E8EAF3] bg-white pl-10 pr-4 py-2.5 text-xs text-[#172044] placeholder-[#64708B] focus:border-[#5146E5] focus:outline-none focus:ring-2 focus:ring-[#5146E5]/10 shadow-subtle"
          />
        </div>
      </div>

      {/* Honest Verification Notice Banner */}
      <div className="rounded-2xl border border-[#E8EAF3] bg-white p-4.5 shadow-card flex items-start space-x-3.5">
        <ShieldCheck className="h-5 w-5 text-[#24B8A5] flex-shrink-0 mt-0.5" />
        <div className="space-y-1 text-xs">
          <p className="font-bold text-[#172044]">
            Audit Evidence Architecture
          </p>
          <p className="text-[#64708B] leading-relaxed">
            Every commitment in PromiseGraph links to immutable textual proof from the underlying conversation.
            <strong> Note:</strong> Automated LLM verification pipelines and human-in-the-loop follow-up verification will be active in later phases.
          </p>
        </div>
      </div>

      {/* Evidence Cards List */}
      <div className="space-y-4">
        {loading ? (
          <div className="rounded-2xl border border-[#E8EAF3] bg-white p-12 text-center text-xs text-[#64708B] shadow-card">
            Loading evidence records...
          </div>
        ) : filteredEvidence.length === 0 ? (
          <div className="rounded-2xl border border-[#E8EAF3] bg-white p-12 text-center text-xs text-[#64708B] shadow-card">
            No evidence records found matching "{searchQuery}".
          </div>
        ) : (
          filteredEvidence.map((ev) => {
            const linkedCommitment = commitments.find((c) => c.id === ev.commitment_id);

            return (
              <div
                key={ev.id}
                className="rounded-2xl border border-[#E8EAF3] bg-white p-5 shadow-card hover:shadow-card-hover transition-all space-y-4"
              >
                {/* Top Bar */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-[#E8EAF3]">
                  <div className="flex items-center space-x-2.5">
                    {getChannelBadge(ev.channel)}
                    <span className="text-xs font-mono font-semibold text-[#172044]">
                      {ev.source_message_id || `rec-${ev.id.slice(0, 8)}`}
                    </span>
                    <span className="text-[11px] text-[#64708B]">
                      {ev.timestamp ? new Date(ev.timestamp).toLocaleString() : 'Recent transcript'}
                    </span>
                  </div>

                  <div className="flex items-center space-x-2">
                    <span className="inline-flex items-center space-x-1 rounded-md bg-[#EEF0FD] px-2.5 py-1 text-[10px] font-bold text-[#5146E5] border border-[#5146E5]/20">
                      <CheckCircle2 className="h-3 w-3" />
                      <span>Transcript Recorded</span>
                    </span>
                  </div>
                </div>

                {/* Evidence Snippet Monospace Quote */}
                <div className="rounded-xl border border-[#E8EAF3] border-l-4 border-l-[#5146E5] bg-[#F5F7FF] p-4 text-xs font-mono text-[#172044] leading-relaxed">
                  <span className="text-[#5146E5] font-bold block mb-1">
                    Direct Quotation / Proof:
                  </span>
                  <p className="italic">"{ev.snippet_text}"</p>
                </div>

                {/* Surrounding Context (Context Before / After) */}
                {(ev.context_before || ev.context_after) && (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                    {ev.context_before && (
                      <div className="rounded-lg border border-[#E8EAF3] bg-[#F8F9FD] p-2.5 text-[#64708B]">
                        <span className="font-semibold text-[#172044] block mb-0.5">Preceding Context:</span>
                        <p className="line-clamp-2">{ev.context_before}</p>
                      </div>
                    )}
                    {ev.context_after && (
                      <div className="rounded-lg border border-[#E8EAF3] bg-[#F8F9FD] p-2.5 text-[#64708B]">
                        <span className="font-semibold text-[#172044] block mb-0.5">Subsequent Context:</span>
                        <p className="line-clamp-2">{ev.context_after}</p>
                      </div>
                    )}
                  </div>
                )}

                {/* Linked Commitment Footer */}
                {linkedCommitment && (
                  <div className="pt-2 flex items-center justify-between text-xs">
                    <div className="flex items-center space-x-2">
                      <span className="text-[#64708B]">Linked Commitment:</span>
                      <span className="font-bold text-[#172044]">{linkedCommitment.title}</span>
                    </div>

                    <button
                      onClick={() => onSelectCommitment(linkedCommitment)}
                      className="text-xs font-semibold text-[#5146E5] hover:text-[#4338CA] flex items-center space-x-1"
                    >
                      <span>View Commitment</span>
                      <ExternalLink className="h-3 w-3" />
                    </button>
                  </div>
                )}

              </div>
            );
          })
        )}
      </div>

    </div>
  );
};
