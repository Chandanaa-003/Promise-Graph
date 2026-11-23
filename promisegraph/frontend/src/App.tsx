import React, { useState, useEffect, useCallback } from 'react';
import { Navbar } from './components/Navbar';
import { Sidebar } from './components/Sidebar';
import { LandingPage } from './components/LandingPage';
import { LoginPage } from './components/LoginPage';
import { RegisterPage } from './components/RegisterPage';
import { Dashboard } from './components/Dashboard';
import { CommitmentsView } from './components/CommitmentsView';
import { PeopleView } from './components/PeopleView';
import { RelationshipGraphView } from './components/RelationshipGraphView';
import { SourcesView } from './components/SourcesView';
import { EvidenceView } from './components/EvidenceView';
import { SettingsView } from './components/SettingsView';
import { ReviewQueueView } from './components/ReviewQueueView';
import { AuthProvider, useAuth } from './context/AuthContext';

import {
  fetchHealth,
  fetchCommitments,
  fetchPeople,
  fetchEvidence,
  fetchReviewQueue,
  createCommitment,
  updateCommitment,
  deleteCommitment,
} from './services/api';
import { Commitment, Person, Evidence, HealthResponse } from './types';
import { Share2 } from 'lucide-react';

const AppContent: React.FC = () => {
  const { isAuthenticated, loading: authLoading } = useAuth();

  const [currentView, setCurrentView] = useState<'landing' | 'dashboard' | 'login' | 'register'>('landing');
  const [activeTab, setActiveTab] = useState<string>('overview');
  const [sidebarOpen, setSidebarOpen] = useState(false);

  // Core Data States
  const [commitments, setCommitments] = useState<Commitment[]>([]);
  const [people, setPeople] = useState<Person[]>([]);
  const [evidenceList, setEvidenceList] = useState<Evidence[]>([]);
  const [pendingReviewCount, setPendingReviewCount] = useState<number>(0);
  const [health, setHealth] = useState<HealthResponse | null>(null);
  const [loading, setLoading] = useState(false);

  // Global UI modal states
  const [selectedCommitment, setSelectedCommitment] = useState<Commitment | null>(null);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);

  // Fetch all live data for the authenticated user
  const loadData = useCallback(async () => {
    if (!isAuthenticated) {
      setCommitments([]);
      setPeople([]);
      setEvidenceList([]);
      return;
    }
    setLoading(true);
    try {
      const [h, comms, ppl, ev, q] = await Promise.all([
        fetchHealth(),
        fetchCommitments(),
        fetchPeople(),
        fetchEvidence(),
        fetchReviewQueue().catch(() => []),
      ]);
      setHealth(h);
      setCommitments(comms);
      setPeople(ppl);
      setEvidenceList(ev);
      setPendingReviewCount(q.length);
    } catch (err) {
      console.error('Error loading data for authenticated user:', err);
    } finally {
      setLoading(false);
    }
  }, [isAuthenticated]);

  useEffect(() => {
    fetchHealth().then(setHealth);
    const interval = setInterval(() => {
      fetchHealth().then(setHealth);
    }, 15000);
    return () => clearInterval(interval);
  }, []);

  // Reload data whenever user authentication state changes
  useEffect(() => {
    if (isAuthenticated) {
      loadData();
    } else {
      setCommitments([]);
      setPeople([]);
      setEvidenceList([]);
      setPendingReviewCount(0);
    }
  }, [isAuthenticated, loadData]);

  // CRUD Handlers
  const handleCreateCommitment = async (data: any) => {
    const created = await createCommitment(data);
    await loadData();
    return created as any;
  };

  const handleUpdateCommitment = async (id: string, data: any) => {
    await updateCommitment(id, data);
    await loadData();
  };

  const handleDeleteCommitment = async (id: string) => {
    await deleteCommitment(id);
    setCommitments((prev) => prev.filter((c) => c.id !== id));
  };

  // If auth is still checking initial token
  if (authLoading) {
    return (
      <div className="min-h-screen bg-[#F5F7FF] flex flex-col items-center justify-center space-y-4">
        <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[#5146E5] text-white shadow-lg shadow-[#5146E5]/25 animate-pulse">
          <Share2 className="h-6 w-6" />
        </div>
        <div className="flex items-center space-x-2 text-xs font-semibold text-[#64708B]">
          <div className="h-3 w-3 border-2 border-[#5146E5] border-t-transparent rounded-full animate-spin" />
          <span>Initializing PromiseGraph...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F5F7FF] text-[#172044] flex flex-col font-sans selection:bg-[#5146E5] selection:text-white">
      {/* Top Header / Navbar */}
      <Navbar
        currentView={currentView}
        setCurrentView={setCurrentView}
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        onGoToLogin={() => setCurrentView('login')}
        onGoToRegister={() => setCurrentView('register')}
      />

      {/* Main Body Router / View Switcher */}
      {currentView === 'landing' && (
        <main className="flex-1">
          <LandingPage
            onEnterDashboard={() => {
              if (isAuthenticated) {
                setCurrentView('dashboard');
              } else {
                setCurrentView('login');
              }
            }}
            onGoToLogin={() => setCurrentView('login')}
            onGoToRegister={() => setCurrentView('register')}
          />
        </main>
      )}

      {currentView === 'login' && (
        <main className="flex-1">
          <LoginPage
            onSuccess={() => setCurrentView('dashboard')}
            onGoToRegister={() => setCurrentView('register')}
            onGoToLanding={() => setCurrentView('landing')}
          />
        </main>
      )}

      {currentView === 'register' && (
        <main className="flex-1">
          <RegisterPage
            onSuccess={() => setCurrentView('dashboard')}
            onGoToLogin={() => setCurrentView('login')}
            onGoToLanding={() => setCurrentView('landing')}
          />
        </main>
      )}

      {currentView === 'dashboard' && (
        !isAuthenticated ? (
          <main className="flex-1">
            <LoginPage
              onSuccess={() => setCurrentView('dashboard')}
              onGoToRegister={() => setCurrentView('register')}
              onGoToLanding={() => setCurrentView('landing')}
            />
          </main>
        ) : (
          <div className="flex flex-1 overflow-hidden">
            {/* Collapsible Sidebar Navigation */}
            <Sidebar
              activeTab={activeTab}
              setActiveTab={setActiveTab}
              isOpen={sidebarOpen}
              toggleSidebar={() => setSidebarOpen(!sidebarOpen)}
              commitmentsCount={commitments.length}
              peopleCount={people.length}
              pendingReviewCount={pendingReviewCount}
            />

            {/* Dynamic Content Area based on Active Tab */}
            <main className="flex-1 overflow-y-auto bg-[#F5F7FF]">
              {activeTab === 'overview' && (
                <Dashboard
                  commitments={commitments}
                  people={people}
                  loading={loading}
                  onNavigate={(tab) => setActiveTab(tab)}
                  onOpenAddModal={() => {
                    setActiveTab('commitments');
                    setIsAddModalOpen(true);
                  }}
                  onSelectCommitment={(comm) => {
                    setSelectedCommitment(comm);
                    setActiveTab('commitments');
                  }}
                />
              )}

              {activeTab === 'review-queue' && (
                <ReviewQueueView
                  people={people}
                  onCommitmentApproved={loadData}
                />
              )}

              {activeTab === 'commitments' && (
                <CommitmentsView
                  commitments={commitments}
                  people={people}
                  loading={loading}
                  onCreateCommitment={handleCreateCommitment}
                  onUpdateCommitment={handleUpdateCommitment}
                  onDeleteCommitment={handleDeleteCommitment}
                  selectedCommitment={selectedCommitment}
                  setSelectedCommitment={setSelectedCommitment}
                  isAddModalOpen={isAddModalOpen}
                  setIsAddModalOpen={setIsAddModalOpen}
                />
              )}

              {activeTab === 'people' && (
                <PeopleView
                  people={people}
                  commitments={commitments}
                  loading={loading}
                  onSelectCommitment={(comm) => {
                    setSelectedCommitment(comm);
                    setActiveTab('commitments');
                  }}
                />
              )}

              {activeTab === 'graph' && (
                <RelationshipGraphView
                  people={people}
                  commitments={commitments}
                  loading={loading}
                  onSelectCommitment={(comm) => {
                    setSelectedCommitment(comm);
                    setActiveTab('commitments');
                  }}
                />
              )}

              {activeTab === 'channels' && <SourcesView />}

              {activeTab === 'evidence' && (
                <EvidenceView
                  evidenceList={evidenceList}
                  commitments={commitments}
                  loading={loading}
                  onSelectCommitment={(comm) => {
                    setSelectedCommitment(comm);
                    setActiveTab('commitments');
                  }}
                />
              )}

              {activeTab === 'settings' && (
                <SettingsView
                  health={health}
                  onRefreshData={loadData}
                />
              )}
            </main>
          </div>
        )
      )}
    </div>
  );
};

export const App: React.FC = () => {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
};

export default App;
