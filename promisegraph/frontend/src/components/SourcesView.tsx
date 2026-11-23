import React, { useState, useEffect, useCallback } from 'react';
import {
  Mail,
  MessageSquare,
  Github,
  CheckCircle2,
  AlertCircle,
  RefreshCw,
  Trash2,
  ExternalLink,
  Upload,
  Key,
  Shield,
  FileText,
  Clock,
  Sparkles,
  Search,
  Filter,
  Check,
  X,
  Radio,
} from 'lucide-react';
import {
  fetchConnectedAccounts,
  fetchGmailAuthUrl,
  syncGmailEmails,
  disconnectGmail,
  importWhatsAppChat,
  fetchWhatsAppChats,
  deleteWhatsAppChat,
  fetchGitHubAuthUrl,
  connectGitHubPat,
  fetchGitHubRepositories,
  syncGitHubIssues,
  disconnectGitHub,
  fetchUnifiedMessages,
} from '../services/api';
import { ConnectedAccount, WhatsAppChat, GitHubRepo, UnifiedMessage } from '../types';

export const SourcesView: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'connectors' | 'messages'>('connectors');

  // Live Connected Accounts
  const [accounts, setAccounts] = useState<ConnectedAccount[]>([]);
  const [loadingAccounts, setLoadingAccounts] = useState(true);

  // Status & Notification Banners
  const [banner, setBanner] = useState<{ type: 'success' | 'error' | 'info'; text: string } | null>(null);

  // Gmail State
  const [gmailSyncing, setGmailSyncing] = useState(false);

  // WhatsApp State
  const [whatsappChats, setWhatsappChats] = useState<WhatsAppChat[]>([]);
  const [uploadingChat, setUploadingChat] = useState(false);
  const [chatFile, setChatFile] = useState<File | null>(null);
  const [chatTitle, setChatTitle] = useState('');

  // GitHub State
  const [githubRepos, setGithubRepos] = useState<GitHubRepo[]>([]);
  const [selectedRepo, setSelectedRepo] = useState<string>('');
  const [githubPatInput, setGithubPatInput] = useState('');
  const [showPatModal, setShowPatModal] = useState(false);
  const [connectingPat, setConnectingPat] = useState(false);
  const [githubSyncing, setGithubSyncing] = useState(false);

  // Unified Messages State
  const [messages, setMessages] = useState<UnifiedMessage[]>([]);
  const [messagesLoading, setMessagesLoading] = useState(false);
  const [channelFilter, setChannelFilter] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');

  // Load all accounts, chats, and messages
  const loadData = useCallback(async () => {
    setLoadingAccounts(true);
    try {
      const [accs, chats] = await Promise.all([
        fetchConnectedAccounts(),
        fetchWhatsAppChats(),
      ]);
      setAccounts(accs);
      setWhatsappChats(chats);

      // If GitHub is connected, fetch repositories
      const ghAcc = accs.find((a) => a.provider === 'github' && a.is_active);
      if (ghAcc) {
        try {
          const repos = await fetchGitHubRepositories();
          setGithubRepos(repos);
          if (repos.length > 0 && !selectedRepo) {
            setSelectedRepo(repos[0].full_name);
          }
        } catch {
          // PAT may need re-auth or repo scope
        }
      }
    } catch (err) {
      console.warn('Error loading sources data:', err);
    } finally {
      setLoadingAccounts(false);
    }
  }, [selectedRepo]);

  const loadMessages = useCallback(async () => {
    setMessagesLoading(true);
    try {
      const ch = channelFilter !== 'all' ? channelFilter : undefined;
      const msgs = await fetchUnifiedMessages({ channel: ch, limit: 100 });
      setMessages(msgs);
    } catch (err) {
      console.warn('Error loading messages:', err);
    } finally {
      setMessagesLoading(false);
    }
  }, [channelFilter]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  useEffect(() => {
    if (activeTab === 'messages') {
      loadMessages();
    }
  }, [activeTab, loadMessages]);

  const gmailAccount = accounts.find((a) => a.provider === 'gmail' && a.is_active);
  const githubAccount = accounts.find((a) => a.provider === 'github' && a.is_active);

  // -----------------------------------------------------------------
  // Gmail Handlers
  // -----------------------------------------------------------------
  const handleConnectGmail = async () => {
    try {
      const data = await fetchGmailAuthUrl();
      if (data.configured) {
        window.location.href = data.url;
      } else {
        setBanner({
          type: 'info',
          text: 'Google OAuth Client ID & Secret must be added to backend .env (GOOGLE_CLIENT_ID, GOOGLE_CLIENT_SECRET) to open Google consent dialog.',
        });
      }
    } catch (err: any) {
      setBanner({ type: 'error', text: err?.message || 'Failed to initiate Gmail OAuth.' });
    }
  };

  const handleSyncGmail = async () => {
    setGmailSyncing(true);
    setBanner(null);
    try {
      const res = await syncGmailEmails(20);
      setBanner({
        type: 'success',
        text: `Gmail sync completed. Ingested ${res.synced_count} emails into unified communication model.`,
      });
      await loadData();
      if (activeTab === 'messages') await loadMessages();
    } catch (err: any) {
      setBanner({ type: 'error', text: err?.message || 'Gmail sync failed.' });
    } finally {
      setGmailSyncing(false);
    }
  };

  const handleDisconnectGmail = async () => {
    if (!window.confirm('Disconnect Gmail account and revoke access?')) return;
    try {
      await disconnectGmail();
      setBanner({ type: 'success', text: 'Gmail disconnected successfully.' });
      await loadData();
    } catch (err: any) {
      setBanner({ type: 'error', text: err?.message || 'Failed to disconnect Gmail.' });
    }
  };

  // -----------------------------------------------------------------
  // WhatsApp Handlers
  // -----------------------------------------------------------------
  const handleUploadWhatsApp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!chatFile) {
      setBanner({ type: 'error', text: 'Please select a WhatsApp exported .txt file.' });
      return;
    }

    setUploadingChat(true);
    setBanner(null);
    try {
      const res = await importWhatsAppChat(chatFile, chatTitle || undefined);
      setBanner({
        type: 'success',
        text: `WhatsApp chat "${res.title}" imported! Ingested ${res.total_messages} messages across ${res.participants.length} participants.`,
      });
      setChatFile(null);
      setChatTitle('');
      await loadData();
      if (activeTab === 'messages') await loadMessages();
    } catch (err: any) {
      setBanner({ type: 'error', text: err?.message || 'WhatsApp chat import failed.' });
    } finally {
      setUploadingChat(false);
    }
  };

  const handleLoadSampleWhatsApp = async () => {
    const sample = `10/14/23, 09:30 AM - Messages and calls are end-to-end encrypted. No one outside of this chat can read or listen to them.
10/14/23, 09:31 AM - Sarah Chen: Hey Alex, checking in on the PromiseGraph architecture specs.
I will complete the schema review and send you the finalized document by tomorrow morning.
10/14/23, 09:35 AM - Alex Mercer: Thanks Sarah! Looking forward to reviewing the database entities.
10/14/23, 09:40 AM - Sarah Chen: Perfect. I'll make sure the relationships are indexed cleanly.
10/14/23, 10:15 AM - David Patel: Joining the chat. I promise to deliver the WhatsApp Business sandbox tokens before Friday 5 PM.
10/14/23, 10:20 AM - Alex Mercer: Received David, let's target Friday afternoon for test ingestion.`;

    const blob = new Blob([sample], { type: 'text/plain' });
    const file = new File([blob], 'PromiseGraph_Architecture_Sync.txt', { type: 'text/plain' });
    setChatFile(file);
    setChatTitle('PromiseGraph Architecture Sync');
    setBanner({
      type: 'info',
      text: 'Loaded sample WhatsApp transcript. Click "Upload & Ingest Chat" below to test the parser!',
    });
  };

  const handleDeleteChat = async (id: string, title: string) => {
    if (!window.confirm(`Delete imported chat "${title}" and all its messages?`)) return;
    try {
      await deleteWhatsAppChat(id);
      setBanner({ type: 'success', text: `Chat "${title}" deleted.` });
      await loadData();
      if (activeTab === 'messages') await loadMessages();
    } catch (err: any) {
      setBanner({ type: 'error', text: err?.message || 'Failed to delete chat.' });
    }
  };

  // -----------------------------------------------------------------
  // GitHub Handlers
  // -----------------------------------------------------------------
  const handleConnectGitHubOAuth = async () => {
    try {
      const data = await fetchGitHubAuthUrl();
      if (data.configured) {
        window.location.href = data.url;
      } else {
        setShowPatModal(true);
      }
    } catch (err: any) {
      setBanner({ type: 'error', text: err?.message || 'Failed to initiate GitHub OAuth.' });
    }
  };

  const handleConnectPatSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!githubPatInput.trim()) return;

    setConnectingPat(true);
    try {
      await connectGitHubPat(githubPatInput.trim());
      setBanner({ type: 'success', text: 'GitHub Personal Access Token connected successfully!' });
      setShowPatModal(false);
      setGithubPatInput('');
      await loadData();
    } catch (err: any) {
      setBanner({ type: 'error', text: err?.message || 'Failed to validate GitHub token.' });
    } finally {
      setConnectingPat(false);
    }
  };

  const handleSyncGitHubIssues = async () => {
    if (!selectedRepo) {
      setBanner({ type: 'error', text: 'Please select a repository to sync.' });
      return;
    }
    setGithubSyncing(true);
    setBanner(null);
    try {
      const res = await syncGitHubIssues(selectedRepo, 1);
      setBanner({
        type: 'success',
        text: `Ingested ${res.synced_count} issues & PRs from repository ${selectedRepo}.`,
      });
      await loadData();
      if (activeTab === 'messages') await loadMessages();
    } catch (err: any) {
      setBanner({ type: 'error', text: err?.message || 'Failed to sync GitHub issues.' });
    } finally {
      setGithubSyncing(false);
    }
  };

  const handleDisconnectGitHub = async () => {
    if (!window.confirm('Disconnect GitHub account?')) return;
    try {
      await disconnectGitHub();
      setBanner({ type: 'success', text: 'GitHub account disconnected.' });
      setGithubRepos([]);
      setSelectedRepo('');
      await loadData();
    } catch (err: any) {
      setBanner({ type: 'error', text: err?.message || 'Failed to disconnect GitHub.' });
    }
  };

  // Filter messages
  const filteredMessages = messages.filter((m) => {
    if (!searchQuery) return true;
    const q = searchQuery.toLowerCase();
    return (
      (m.sender_name && m.sender_name.toLowerCase().includes(q)) ||
      (m.subject && m.subject.toLowerCase().includes(q)) ||
      (m.content && m.content.toLowerCase().includes(q))
    );
  });

  return (
    <div className="flex-1 space-y-6 p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto selection:bg-[#5146E5] selection:text-white">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-6 border-b border-[#E8EAF3]">
        <div>
          <div className="flex items-center space-x-2.5">
            <h1 className="text-2xl sm:text-3xl font-extrabold text-[#172044] tracking-tight">
              Communication Sources
            </h1>
            <span className="rounded-full bg-[#E6F8F5] px-2.5 py-0.5 text-xs font-bold text-[#24B8A5] border border-[#24B8A5]/20">
              Phase 4 Active
            </span>
          </div>
          <p className="mt-1 text-sm text-[#64708B]">
            Ingest correspondence across Gmail, WhatsApp chat transcripts, and GitHub repositories into a unified intelligence data model.
          </p>
        </div>

        {/* View Toggle */}
        <div className="flex items-center space-x-1.5 rounded-xl bg-white border border-[#E8EAF3] p-1 shadow-subtle self-start">
          <button
            onClick={() => setActiveTab('connectors')}
            className={`flex items-center space-x-1.5 px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all ${
              activeTab === 'connectors'
                ? 'bg-[#5146E5] text-white shadow-sm'
                : 'text-[#64708B] hover:text-[#172044] hover:bg-[#F5F7FF]'
            }`}
          >
            <Radio className="h-3.5 w-3.5" />
            <span>Connectors</span>
          </button>
          <button
            onClick={() => setActiveTab('messages')}
            className={`flex items-center space-x-1.5 px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all ${
              activeTab === 'messages'
                ? 'bg-[#5146E5] text-white shadow-sm'
                : 'text-[#64708B] hover:text-[#172044] hover:bg-[#F5F7FF]'
            }`}
          >
            <FileText className="h-3.5 w-3.5" />
            <span>Unified Stream</span>
          </button>
        </div>
      </div>

      {/* Notification Banner */}
      {banner && (
        <div
          className={`rounded-2xl p-4 text-xs flex items-start justify-between shadow-subtle animate-in fade-in duration-150 ${
            banner.type === 'success'
              ? 'border border-[#24B8A5]/30 bg-[#E6F8F5] text-[#172044]'
              : banner.type === 'error'
              ? 'border border-[#E66D68]/30 bg-[#FEF2F2] text-[#E66D68]'
              : 'border border-[#5146E5]/20 bg-[#EEF0FD] text-[#172044]'
          }`}
        >
          <div className="flex items-start space-x-2.5">
            {banner.type === 'success' && <CheckCircle2 className="h-4 w-4 text-[#24B8A5] flex-shrink-0 mt-0.5" />}
            {banner.type === 'error' && <AlertCircle className="h-4 w-4 text-[#E66D68] flex-shrink-0 mt-0.5" />}
            {banner.type === 'info' && <Shield className="h-4 w-4 text-[#5146E5] flex-shrink-0 mt-0.5" />}
            <span className="font-medium">{banner.text}</span>
          </div>
          <button onClick={() => setBanner(null)} className="text-[#64708B] hover:text-[#172044] ml-4">
            <X className="h-4 w-4" />
          </button>
        </div>
      )}

      {/* TAB 1: CONNECTORS */}
      {activeTab === 'connectors' && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 animate-in fade-in duration-200">
          
          {/* CARD 1: GMAIL OAUTH */}
          <div className="rounded-2xl border border-[#E8EAF3] bg-white p-6 shadow-card hover:shadow-card-hover transition-all flex flex-col justify-between space-y-5">
            <div className="space-y-4">
              <div className="flex items-start justify-between">
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[#FDF1F0] text-[#E66D68] shadow-sm">
                  <Mail className="h-6 w-6" />
                </div>
                {gmailAccount ? (
                  <span className="rounded-full bg-[#E6F8F5] border border-[#24B8A5]/25 px-2.5 py-0.5 text-[10px] font-bold text-[#24B8A5] flex items-center space-x-1">
                    <Check className="h-3 w-3" />
                    <span>Connected</span>
                  </span>
                ) : (
                  <span className="rounded-full bg-[#F5F7FF] border border-[#E8EAF3] px-2.5 py-0.5 text-[10px] font-bold text-[#64708B]">
                    Not Connected
                  </span>
                )}
              </div>

              <div>
                <h3 className="text-base font-bold text-[#172044]">Google Gmail</h3>
                <p className="mt-1 text-xs text-[#64708B] leading-relaxed">
                  Official Google OAuth 2.0 with minimal read-only permissions (<code className="bg-[#F5F7FF] px-1 py-0.5 rounded text-[10px] font-mono">gmail.readonly</code>).
                </p>
              </div>

              {gmailAccount ? (
                <div className="rounded-xl border border-[#E8EAF3] bg-[#F5F7FF] p-3 text-xs space-y-1.5">
                  <div className="flex justify-between text-[11px]">
                    <span className="text-[#64708B]">Account:</span>
                    <span className="font-semibold text-[#172044]">{gmailAccount.account_identifier}</span>
                  </div>
                  <div className="flex justify-between text-[11px]">
                    <span className="text-[#64708B]">Token Storage:</span>
                    <span className="font-semibold text-[#24B8A5]">Encrypted at Rest</span>
                  </div>
                </div>
              ) : (
                <div className="rounded-xl border border-[#E8EAF3] bg-[#F5F7FF] p-3 text-xs space-y-1">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-[#64708B]">
                    Capabilities
                  </span>
                  <p className="text-[11px] text-[#64708B]">
                    • Ingest email threads & message headers<br />
                    • Automatic access token refresh<br />
                    • Complete token revocation on disconnect
                  </p>
                </div>
              )}
            </div>

            {/* Action Buttons */}
            <div className="pt-4 border-t border-[#E8EAF3] space-y-2">
              {gmailAccount ? (
                <div className="flex items-center space-x-2">
                  <button
                    onClick={handleSyncGmail}
                    disabled={gmailSyncing}
                    className="flex-1 flex items-center justify-center space-x-1.5 rounded-xl bg-[#5146E5] py-2 text-xs font-bold text-white shadow-sm shadow-[#5146E5]/20 hover:bg-[#4338CA] transition-all disabled:opacity-50"
                  >
                    <RefreshCw className={`h-3.5 w-3.5 ${gmailSyncing ? 'animate-spin' : ''}`} />
                    <span>{gmailSyncing ? 'Syncing...' : 'Sync Emails'}</span>
                  </button>
                  <button
                    onClick={handleDisconnectGmail}
                    className="px-3 py-2 rounded-xl border border-[#E66D68]/30 bg-[#FEF2F2] text-xs font-bold text-[#E66D68] hover:bg-[#FEF2F2]/80 transition-all"
                  >
                    Disconnect
                  </button>
                </div>
              ) : (
                <button
                  onClick={handleConnectGmail}
                  disabled={loadingAccounts}
                  className="w-full flex items-center justify-center space-x-2 rounded-xl bg-[#5146E5] py-2.5 text-xs font-bold text-white shadow-md shadow-[#5146E5]/20 hover:bg-[#4338CA] transition-all"
                >
                  <Mail className="h-3.5 w-3.5" />
                  <span>Connect Gmail (OAuth 2.0)</span>
                </button>
              )}
            </div>
          </div>

          {/* CARD 2: WHATSAPP TRANSCRIPT IMPORT */}
          <div className="rounded-2xl border border-[#E8EAF3] bg-white p-6 shadow-card hover:shadow-card-hover transition-all flex flex-col justify-between space-y-5">
            <div className="space-y-4">
              <div className="flex items-start justify-between">
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[#E6F8F5] text-[#24B8A5] shadow-sm">
                  <MessageSquare className="h-6 w-6" />
                </div>
                <span className="rounded-full bg-[#E6F8F5] border border-[#24B8A5]/25 px-2.5 py-0.5 text-[10px] font-bold text-[#24B8A5]">
                  {whatsappChats.length} Chats Ingested
                </span>
              </div>

              <div>
                <h3 className="text-base font-bold text-[#172044]">WhatsApp Chat Import</h3>
                <p className="mt-1 text-xs text-[#64708B] leading-relaxed">
                  Upload exported WhatsApp <code className="bg-[#F5F7FF] px-1 py-0.5 rounded text-[10px] font-mono">.txt</code> chat transcripts. Supports Android & iOS formats.
                </p>
              </div>

              {/* Upload Form */}
              <form onSubmit={handleUploadWhatsApp} className="space-y-2.5">
                <div>
                  <input
                    type="text"
                    value={chatTitle}
                    onChange={(e) => setChatTitle(e.target.value)}
                    placeholder="Chat Title (optional)"
                    className="w-full rounded-xl border border-[#E8EAF3] bg-[#F5F7FF]/50 px-3 py-1.5 text-xs text-[#172044] focus:bg-white focus:outline-none focus:border-[#5146E5]"
                  />
                </div>

                <div className="relative rounded-xl border-2 border-dashed border-[#E8EAF3] p-3 text-center hover:border-[#5146E5]/50 transition-colors bg-[#F5F7FF]/30">
                  <input
                    type="file"
                    accept=".txt"
                    onChange={(e) => {
                      if (e.target.files?.[0]) setChatFile(e.target.files[0]);
                    }}
                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                  />
                  <div className="flex flex-col items-center justify-center space-y-1 text-xs text-[#64708B]">
                    <Upload className="h-4 w-4 text-[#5146E5]" />
                    <span className="text-[11px] font-medium text-[#172044]">
                      {chatFile ? chatFile.name : 'Choose exported .txt file'}
                    </span>
                    <span className="text-[10px] text-[#64708B]">Max 10MB plain text</span>
                  </div>
                </div>

                <div className="flex items-center space-x-2 pt-1">
                  <button
                    type="submit"
                    disabled={uploadingChat || !chatFile}
                    className="flex-1 flex items-center justify-center space-x-1.5 rounded-xl bg-[#24B8A5] py-2 text-xs font-bold text-white shadow-sm shadow-[#24B8A5]/20 hover:bg-[#1fa08f] transition-all disabled:opacity-50"
                  >
                    <Upload className={`h-3.5 w-3.5 ${uploadingChat ? 'animate-bounce' : ''}`} />
                    <span>{uploadingChat ? 'Parsing...' : 'Upload & Ingest'}</span>
                  </button>

                  <button
                    type="button"
                    onClick={handleLoadSampleWhatsApp}
                    title="Load sample WhatsApp transcript for testing"
                    className="px-2.5 py-2 rounded-xl border border-[#EEF0FD] bg-[#F5F7FF] text-xs font-semibold text-[#5146E5] hover:bg-[#EEF0FD]"
                  >
                    <Sparkles className="h-3.5 w-3.5" />
                  </button>
                </div>
              </form>
            </div>

            {/* Imported Chats List */}
            {whatsappChats.length > 0 && (
              <div className="pt-3 border-t border-[#E8EAF3] space-y-2 max-h-36 overflow-y-auto">
                <span className="text-[10px] font-bold uppercase tracking-wider text-[#64708B]">
                  Imported WhatsApp History
                </span>
                {whatsappChats.slice(0, 3).map((chat) => (
                  <div
                    key={chat.id}
                    className="flex items-center justify-between rounded-xl border border-[#E8EAF3] bg-[#F5F7FF] p-2 text-xs"
                  >
                    <div className="truncate mr-2">
                      <p className="font-semibold text-[#172044] truncate text-[11px]">{chat.title}</p>
                      <p className="text-[10px] text-[#64708B]">{chat.message_count} msgs</p>
                    </div>
                    <button
                      onClick={() => handleDeleteChat(chat.id, chat.title)}
                      className="p-1 text-[#64708B] hover:text-[#E66D68] transition-colors"
                      title="Delete imported chat"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* CARD 3: GITHUB INTEGRATION */}
          <div className="rounded-2xl border border-[#E8EAF3] bg-white p-6 shadow-card hover:shadow-card-hover transition-all flex flex-col justify-between space-y-5">
            <div className="space-y-4">
              <div className="flex items-start justify-between">
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[#F5F7FF] text-[#172044] shadow-sm">
                  <Github className="h-6 w-6" />
                </div>
                {githubAccount ? (
                  <span className="rounded-full bg-[#E6F8F5] border border-[#24B8A5]/25 px-2.5 py-0.5 text-[10px] font-bold text-[#24B8A5] flex items-center space-x-1">
                    <Check className="h-3 w-3" />
                    <span>@{githubAccount.account_identifier}</span>
                  </span>
                ) : (
                  <span className="rounded-full bg-[#F5F7FF] border border-[#E8EAF3] px-2.5 py-0.5 text-[10px] font-bold text-[#64708B]">
                    Not Connected
                  </span>
                )}
              </div>

              <div>
                <h3 className="text-base font-bold text-[#172044]">GitHub Issues & PRs</h3>
                <p className="mt-1 text-xs text-[#64708B] leading-relaxed">
                  Monitor repository issues and PR discussions for commitments and promised dates.
                </p>
              </div>

              {githubAccount ? (
                <div className="space-y-2.5">
                  <label className="block text-[11px] font-bold text-[#172044]">
                    Select Repository
                  </label>
                  {githubRepos.length > 0 ? (
                    <select
                      value={selectedRepo}
                      onChange={(e) => setSelectedRepo(e.target.value)}
                      className="w-full rounded-xl border border-[#E8EAF3] bg-[#F5F7FF] px-3 py-2 text-xs font-semibold text-[#172044] focus:outline-none focus:border-[#5146E5]"
                    >
                      {githubRepos.map((r) => (
                        <option key={r.id} value={r.full_name}>
                          {r.full_name} ({r.open_issues_count} open)
                        </option>
                      ))}
                    </select>
                  ) : (
                    <input
                      type="text"
                      value={selectedRepo}
                      onChange={(e) => setSelectedRepo(e.target.value)}
                      placeholder="owner/repo (e.g. facebook/react)"
                      className="w-full rounded-xl border border-[#E8EAF3] bg-[#F5F7FF] px-3 py-2 text-xs text-[#172044] focus:outline-none focus:border-[#5146E5]"
                    />
                  )}
                </div>
              ) : (
                <div className="rounded-xl border border-[#E8EAF3] bg-[#F5F7FF] p-3 text-xs space-y-1">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-[#64708B]">
                    Supported Flows
                  </span>
                  <p className="text-[11px] text-[#64708B]">
                    • Official GitHub OAuth 2.0 Web Flow<br />
                    • Personal Access Token (PAT) for local dev<br />
                    • Read-only repository & issue permissions
                  </p>
                </div>
              )}
            </div>

            {/* Action Buttons */}
            <div className="pt-4 border-t border-[#E8EAF3] space-y-2">
              {githubAccount ? (
                <div className="flex items-center space-x-2">
                  <button
                    onClick={handleSyncGitHubIssues}
                    disabled={githubSyncing || !selectedRepo}
                    className="flex-1 flex items-center justify-center space-x-1.5 rounded-xl bg-[#172044] py-2 text-xs font-bold text-white hover:bg-black transition-all disabled:opacity-50"
                  >
                    <RefreshCw className={`h-3.5 w-3.5 ${githubSyncing ? 'animate-spin' : ''}`} />
                    <span>{githubSyncing ? 'Syncing...' : 'Sync Issues & PRs'}</span>
                  </button>
                  <button
                    onClick={handleDisconnectGitHub}
                    className="px-3 py-2 rounded-xl border border-[#E66D68]/30 bg-[#FEF2F2] text-xs font-bold text-[#E66D68] hover:bg-[#FEF2F2]/80 transition-all"
                  >
                    Disconnect
                  </button>
                </div>
              ) : (
                <div className="flex flex-col space-y-2">
                  <button
                    onClick={handleConnectGitHubOAuth}
                    className="w-full flex items-center justify-center space-x-2 rounded-xl bg-[#172044] py-2 text-xs font-bold text-white hover:bg-black transition-all"
                  >
                    <Github className="h-3.5 w-3.5" />
                    <span>Connect with GitHub</span>
                  </button>
                  <button
                    onClick={() => setShowPatModal(true)}
                    className="w-full flex items-center justify-center space-x-1.5 rounded-xl border border-[#E8EAF3] bg-[#F5F7FF] py-1.5 text-[11px] font-semibold text-[#5146E5] hover:bg-[#EEF0FD] transition-all"
                  >
                    <Key className="h-3 w-3" />
                    <span>Connect via Personal Access Token</span>
                  </button>
                </div>
              )}
            </div>
          </div>

        </div>
      )}

      {/* TAB 2: UNIFIED COMMUNICATION MESSAGES STREAM */}
      {activeTab === 'messages' && (
        <div className="space-y-4 animate-in fade-in duration-200">
          
          {/* Controls Bar */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 bg-white border border-[#E8EAF3] rounded-2xl p-4 shadow-subtle">
            <div className="relative flex-1 max-w-md">
              <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3 text-[#64708B]">
                <Search className="h-4 w-4" />
              </div>
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search across all ingested messages..."
                className="w-full rounded-xl border border-[#E8EAF3] bg-[#F5F7FF] pl-9 pr-3 py-2 text-xs text-[#172044] focus:bg-white focus:outline-none focus:border-[#5146E5]"
              />
            </div>

            <div className="flex items-center space-x-2">
              <div className="flex items-center space-x-1 rounded-xl bg-[#F5F7FF] border border-[#E8EAF3] p-1 text-xs">
                <Filter className="h-3.5 w-3.5 text-[#64708B] ml-1.5" />
                {['all', 'email', 'whatsapp', 'github'].map((ch) => (
                  <button
                    key={ch}
                    onClick={() => setChannelFilter(ch)}
                    className={`px-2.5 py-1 rounded-lg text-xs font-semibold capitalize transition-all ${
                      channelFilter === ch
                        ? 'bg-[#5146E5] text-white'
                        : 'text-[#64708B] hover:text-[#172044]'
                    }`}
                  >
                    {ch}
                  </button>
                ))}
              </div>

              <button
                onClick={loadMessages}
                disabled={messagesLoading}
                className="p-2 rounded-xl border border-[#E8EAF3] bg-white text-[#64708B] hover:text-[#5146E5] transition-colors"
                title="Refresh messages"
              >
                <RefreshCw className={`h-4 w-4 ${messagesLoading ? 'animate-spin' : ''}`} />
              </button>
            </div>
          </div>

          {/* Messages Stream List */}
          {messagesLoading ? (
            <div className="rounded-2xl border border-[#E8EAF3] bg-white p-12 text-center text-xs text-[#64708B]">
              <div className="h-6 w-6 border-2 border-[#5146E5] border-t-transparent rounded-full animate-spin mx-auto mb-3" />
              Loading unified communications...
            </div>
          ) : filteredMessages.length === 0 ? (
            <div className="rounded-2xl border border-[#E8EAF3] bg-white p-12 text-center space-y-3">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[#EEF0FD] text-[#5146E5] mx-auto">
                <FileText className="h-6 w-6" />
              </div>
              <h3 className="text-sm font-bold text-[#172044]">No communication messages found</h3>
              <p className="text-xs text-[#64708B] max-w-md mx-auto">
                Upload a WhatsApp chat transcript, sync a connected GitHub repository, or sync authorized Gmail threads to view ingested communications.
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {filteredMessages.map((msg) => (
                <div
                  key={msg.id}
                  className="rounded-2xl border border-[#E8EAF3] bg-white p-5 shadow-card hover:border-[#D6D9EB] transition-all space-y-3"
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex items-center space-x-2.5">
                      <span
                        className={`rounded-full px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider ${
                          msg.content_type === 'markdown' || msg.source_url?.includes('github')
                            ? 'bg-[#F5F7FF] text-[#172044] border border-[#E8EAF3]'
                            : msg.source_url?.includes('mail.google')
                            ? 'bg-[#FDF1F0] text-[#E66D68] border border-[#E66D68]/20'
                            : 'bg-[#E6F8F5] text-[#24B8A5] border border-[#24B8A5]/20'
                        }`}
                      >
                        {msg.source_url?.includes('github')
                          ? 'GitHub'
                          : msg.source_url?.includes('mail.google')
                          ? 'Gmail'
                          : 'WhatsApp'}
                      </span>
                      <span className="text-xs font-bold text-[#172044]">{msg.sender_name}</span>
                      {msg.sender_address && msg.sender_address !== msg.sender_name && (
                        <span className="text-[11px] text-[#64708B] hidden sm:inline">
                          &lt;{msg.sender_address}&gt;
                        </span>
                      )}
                    </div>

                    <div className="flex items-center space-x-3 text-xs text-[#64708B]">
                      <span className="flex items-center space-x-1">
                        <Clock className="h-3 w-3" />
                        <span>{new Date(msg.timestamp).toLocaleString()}</span>
                      </span>
                      {msg.source_url && (
                        <a
                          href={msg.source_url}
                          target="_blank"
                          rel="noreferrer"
                          className="inline-flex items-center space-x-1 text-[#5146E5] hover:underline text-xs font-semibold"
                        >
                          <span>Source</span>
                          <ExternalLink className="h-3 w-3" />
                        </a>
                      )}
                    </div>
                  </div>

                  {msg.subject && (
                    <h4 className="text-xs font-bold text-[#172044] border-b border-[#E8EAF3]/60 pb-1.5">
                      {msg.subject}
                    </h4>
                  )}

                  <p className="text-xs text-[#172044] whitespace-pre-wrap leading-relaxed font-sans bg-[#F5F7FF]/50 p-3 rounded-xl border border-[#E8EAF3]/50">
                    {msg.content}
                  </p>
                </div>
              ))}
            </div>
          )}

        </div>
      )}

      {/* GitHub Personal Access Token Modal */}
      {showPatModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm animate-in fade-in duration-150">
          <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl border border-[#E8EAF3] space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-[#E8EAF3]">
              <div className="flex items-center space-x-2 text-[#172044]">
                <Key className="h-5 w-5 text-[#5146E5]" />
                <h3 className="text-base font-bold">Connect GitHub via Token</h3>
              </div>
              <button
                onClick={() => setShowPatModal(false)}
                className="rounded-lg p-1 text-[#64708B] hover:bg-[#F5F7FF]"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <p className="text-xs text-[#64708B] leading-relaxed">
              For local testing and evaluation, supply a GitHub Personal Access Token with read-only scopes (<code className="bg-[#F5F7FF] px-1 py-0.5 rounded font-mono text-[10px]">read:user</code>, <code className="bg-[#F5F7FF] px-1 py-0.5 rounded font-mono text-[10px]">repo</code>). Your token is encrypted with Fernet symmetric encryption at rest.
            </p>

            <form onSubmit={handleConnectPatSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-[#172044] uppercase tracking-wider mb-1.5">
                  Personal Access Token
                </label>
                <input
                  type="password"
                  value={githubPatInput}
                  onChange={(e) => setGithubPatInput(e.target.value)}
                  placeholder="ghp_xxxxxxxxxxxxxxxxxxxx"
                  required
                  className="w-full rounded-xl border border-[#E8EAF3] bg-[#F5F7FF] px-3.5 py-2.5 text-xs font-mono text-[#172044] focus:bg-white focus:outline-none focus:border-[#5146E5]"
                />
              </div>

              <div className="flex justify-end space-x-2 pt-2 border-t border-[#E8EAF3]">
                <button
                  type="button"
                  onClick={() => setShowPatModal(false)}
                  className="px-4 py-2 rounded-xl text-xs font-semibold text-[#64708B] hover:bg-[#F5F7FF]"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={connectingPat || !githubPatInput.trim()}
                  className="px-4 py-2 rounded-xl bg-[#5146E5] text-xs font-bold text-white hover:bg-[#4338CA] transition-all disabled:opacity-50"
                >
                  {connectingPat ? 'Validating Token...' : 'Connect Token'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};
