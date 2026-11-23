import React, { useState, useEffect, useCallback } from 'react';
import { Navbar } from './components/Navbar';
import { Sidebar } from './components/Sidebar';
import { LandingPage } from './components/LandingPage';
import { Dashboard } from './components/Dashboard';
import { CommitmentsView } from './components/CommitmentsView';
import { PeopleView } from './components/PeopleView';
import { RelationshipGraphView } from './components/RelationshipGraphView';
import { SourcesView } from './components/SourcesView';
import { EvidenceView } from './components/EvidenceView';
import { SettingsView } from './components/SettingsView';

import {
  fetchHealth,
  fetchCommitments,
  fetchPeople,
  fetchEvidence,
  createCommitment,
  updateCommitment,
  deleteCommitment,
} from './services/api';
import { Commitment, Person, Evidence, HealthResponse } from './types';

export const App: React.FC = () => {
  const [currentView, setCurrentView] = useState<'landing' | 'dashboard'>('landing');
  const [activeTab, setActiveTab] = useState<string>('overview');
  const [sidebarOpen, setSidebarOpen] = useState(false);

  // Core Data States
  const [commitments, setCommitments] = useState<Commitment[]>([]);
  const [people, setPeople] = useState<Person[]>([]);
  const [evidenceList, setEvidenceList] = useState<Evidence[]>([]);
  const [health, setHealth] = useState<HealthResponse | null>(null);
  const [loading, setLoading] = useState(true);

  // Global UI modal states
  const [selectedCommitment, setSelectedCommitment] = useState<Commitment | null>(null);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);

  // Fetch all live data from backend
  const loadData = useCallback(async () => {
    setLoading(true);
    try {
      const [h, comms, ppl, ev] = await Promise.all([
        fetchHealth(),
        fetchCommitments(),
        fetchPeople(),
        fetchEvidence(),
      ]);
      setHealth(h);
      setCommitments(comms);
      setPeople(pppl => (ppl.length > 0 ? ppl : pppl));
      setPeople(ppl);
      setEvidenceList(ev);
    } catch (err) {
      console.error('Error loading data:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadData();
    const interval = setInterval(() => {
      fetchHealth().then(setHealth);
    }, 15000);
    return () => clearInterval(interval);
  }, [loadData]);

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

  return (
    <div className="min-h-screen bg-[#F5F7FF] text-[#172044] flex flex-col font-sans selection:bg-[#5146E5] selection:text-white">
      {/* Top Header / Navbar */}
      <Navbar
        currentView={currentView}
        setCurrentView={setCurrentView}
        activeTab={activeTab}
        setActiveTab={setActiveTab}
      />

      {/* Main Body Layout */}
      {currentView === 'landing' ? (
        <main className="flex-1">
          <LandingPage onEnterDashboard={() => setCurrentView('dashboard')} />
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
      )}
    </div>
  );
};

export default App;
