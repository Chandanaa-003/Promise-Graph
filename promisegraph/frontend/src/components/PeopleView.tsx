import React, { useState } from 'react';
import {
  Search,
  Mail,
  ArrowRight,
  X
} from 'lucide-react';
import { Person, Commitment } from '../types';

interface PeopleViewProps {
  people: Person[];
  commitments: Commitment[];
  loading: boolean;
  onSelectCommitment: (comm: Commitment) => void;
}

export const PeopleView: React.FC<PeopleViewProps> = ({
  people,
  commitments,
  loading,
  onSelectCommitment,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedPerson, setSelectedPerson] = useState<Person | null>(null);

  // Filter people
  const filteredPeople = people.filter((p) => {
    const q = searchQuery.toLowerCase();
    return (
      p.display_name.toLowerCase().includes(q) ||
      (p.email && p.email.toLowerCase().includes(q)) ||
      (p.organization && p.organization.toLowerCase().includes(q))
    );
  });

  // Calculate commitments count per person
  const getPersonCommitments = (personId: string) => {
    return commitments.filter((c) => c.person_id === personId);
  };

  const getPersonActiveCount = (personId: string) => {
    return commitments.filter(
      (c) => c.person_id === personId && (c.status === 'pending' || c.status === 'in_progress')
    ).length;
  };

  const getPersonCompletedCount = (personId: string) => {
    return commitments.filter(
      (c) => c.person_id === personId && c.status === 'fulfilled'
    ).length;
  };

  return (
    <div className="flex-1 space-y-8 p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-6 border-b border-[#E8EAF3]">
        <div>
          <div className="flex items-center space-x-2.5">
            <h1 className="text-2xl sm:text-3xl font-extrabold text-[#172044] tracking-tight">
              People Directory
            </h1>
            <span className="rounded-full bg-[#EEF0FD] px-2.5 py-0.5 text-xs font-bold text-[#5146E5] border border-[#5146E5]/20">
              {people.length} Contacts
            </span>
          </div>
          <p className="mt-1 text-sm text-[#64708B]">
            Stakeholders and collaborators identified across conversations with affinity and promise counts.
          </p>
        </div>

        {/* Search Bar */}
        <div className="relative w-full sm:w-72">
          <Search className="absolute left-3.5 top-3 h-4 w-4 text-[#64708B]" />
          <input
            type="text"
            placeholder="Search by name, email, org..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full rounded-xl border border-[#E8EAF3] bg-white pl-10 pr-4 py-2.5 text-xs text-[#172044] placeholder-[#64708B] focus:border-[#5146E5] focus:outline-none focus:ring-2 focus:ring-[#5146E5]/10 shadow-subtle"
          />
        </div>
      </div>

      {/* People Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {loading ? (
          <div className="col-span-full rounded-2xl border border-[#E8EAF3] bg-white p-12 text-center text-xs text-[#64708B] shadow-card">
            Loading people directory...
          </div>
        ) : filteredPeople.length === 0 ? (
          <div className="col-span-full rounded-2xl border border-[#E8EAF3] bg-white p-12 text-center text-xs text-[#64708B] shadow-card">
            No contacts found matching "{searchQuery}".
          </div>
        ) : (
          filteredPeople.map((person) => {
            const activeCount = getPersonActiveCount(person.id);
            const completedCount = getPersonCompletedCount(person.id);

            return (
              <div
                key={person.id}
                onClick={() => setSelectedPerson(person)}
                className="rounded-2xl border border-[#E8EAF3] bg-white p-5 shadow-card hover:shadow-card-hover hover:border-[#D6D9EB] transition-all cursor-pointer group flex flex-col justify-between space-y-4"
              >
                <div>
                  <div className="flex items-start justify-between">
                    <div className="flex items-center space-x-3">
                      <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-[#EEF0FD] text-[#5146E5] font-bold text-sm border border-[#5146E5]/20 group-hover:scale-105 transition-transform">
                        {person.display_name.slice(0, 2).toUpperCase()}
                      </div>
                      <div>
                        <h3 className="text-sm font-bold text-[#172044] group-hover:text-[#5146E5] transition-colors">
                          {person.display_name}
                        </h3>
                        <p className="text-[11px] text-[#64708B]">
                          {person.organization || 'Independent'}
                        </p>
                      </div>
                    </div>

                    <div className="text-right">
                      <span className="text-xs font-bold text-[#24B8A5]">
                        {Math.round(person.relationship_score * 100)}%
                      </span>
                      <p className="text-[10px] text-[#64708B] font-medium">Affinity</p>
                    </div>
                  </div>

                  {person.email && (
                    <div className="mt-4 flex items-center space-x-2 text-xs text-[#64708B]">
                      <Mail className="h-3.5 w-3.5 text-[#64708B]" />
                      <span className="truncate">{person.email}</span>
                    </div>
                  )}

                  {person.notes && (
                    <p className="mt-2 text-xs text-[#64708B] line-clamp-2 italic">
                      "{person.notes}"
                    </p>
                  )}
                </div>

                {/* Commitments Tally Footer */}
                <div className="pt-3 border-t border-[#E8EAF3] flex items-center justify-between text-xs">
                  <div className="flex items-center space-x-2">
                    <span className="inline-flex items-center space-x-1 rounded-md bg-[#EEF0FD] px-2 py-0.5 text-[10px] font-bold text-[#5146E5]">
                      <span>{activeCount} Active</span>
                    </span>
                    <span className="inline-flex items-center space-x-1 rounded-md bg-[#E6F8F5] px-2 py-0.5 text-[10px] font-bold text-[#24B8A5]">
                      <span>{completedCount} Done</span>
                    </span>
                  </div>
                  <span className="text-[11px] font-semibold text-[#5146E5] flex items-center space-x-1 group-hover:translate-x-1 transition-transform">
                    <span>View Profile</span>
                    <ArrowRight className="h-3 w-3" />
                  </span>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* PERSON PROFILE / DETAILS MODAL */}
      {selectedPerson && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#172044]/40 p-4 backdrop-blur-sm">
          <div className="w-full max-w-2xl rounded-2xl border border-[#E8EAF3] bg-white p-6 shadow-2xl animate-in fade-in-50 max-h-[90vh] overflow-y-auto">
            
            <div className="flex items-start justify-between pb-4 border-b border-[#E8EAF3]">
              <div className="flex items-center space-x-3.5">
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[#EEF0FD] text-[#5146E5] font-extrabold text-base border border-[#5146E5]/20">
                  {selectedPerson.display_name.slice(0, 2).toUpperCase()}
                </div>
                <div>
                  <h2 className="text-lg font-bold text-[#172044]">
                    {selectedPerson.display_name}
                  </h2>
                  <p className="text-xs text-[#64708B]">
                    {selectedPerson.organization || 'External Stakeholder'}
                  </p>
                </div>
              </div>
              <button
                onClick={() => setSelectedPerson(null)}
                className="text-[#64708B] hover:text-[#172044]"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Person Metrics */}
            <div className="mt-4 grid grid-cols-3 gap-3 rounded-xl border border-[#E8EAF3] bg-[#F5F7FF] p-4 text-center">
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-[#64708B]">
                  Affinity Score
                </span>
                <p className="text-lg font-extrabold text-[#24B8A5] mt-1">
                  {Math.round(selectedPerson.relationship_score * 100)}%
                </p>
              </div>
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-[#64708B]">
                  Active Promises
                </span>
                <p className="text-lg font-extrabold text-[#5146E5] mt-1">
                  {getPersonActiveCount(selectedPerson.id)}
                </p>
              </div>
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-[#64708B]">
                  Completed
                </span>
                <p className="text-lg font-extrabold text-[#24B8A5] mt-1">
                  {getPersonCompletedCount(selectedPerson.id)}
                </p>
              </div>
            </div>

            {/* Associated Commitments List */}
            <div className="mt-6">
              <div className="flex items-center justify-between mb-3">
                <h4 className="text-xs font-bold text-[#172044] uppercase tracking-wider">
                  Associated Commitments ({getPersonCommitments(selectedPerson.id).length})
                </h4>
              </div>

              <div className="space-y-2.5">
                {getPersonCommitments(selectedPerson.id).length === 0 ? (
                  <p className="text-xs text-[#64708B] py-4 text-center">
                    No commitments currently tracked with this person.
                  </p>
                ) : (
                  getPersonCommitments(selectedPerson.id).map((c) => (
                    <div
                      key={c.id}
                      onClick={() => {
                        setSelectedPerson(null);
                        onSelectCommitment(c);
                      }}
                      className="rounded-xl border border-[#E8EAF3] bg-white p-3.5 hover:border-[#5146E5] hover:bg-[#F8F9FD] transition-all cursor-pointer flex items-center justify-between"
                    >
                      <div className="space-y-1 pr-3">
                        <p className="text-xs font-bold text-[#172044] line-clamp-1">
                          {c.title}
                        </p>
                        <p className="text-[10px] text-[#64708B]">
                          {c.commitment_type === 'promise_made' ? 'You promised' : 'Promised to you'} • Due:{' '}
                          {c.due_date ? new Date(c.due_date).toLocaleDateString() : 'No date'}
                        </p>
                      </div>

                      <span
                        className={`text-[10px] font-bold px-2 py-0.5 rounded-md capitalize ${
                          c.status === 'fulfilled'
                            ? 'bg-[#E6F8F5] text-[#24B8A5]'
                            : c.status === 'overdue'
                            ? 'bg-[#FDF1F0] text-[#E66D68]'
                            : 'bg-[#EEF0FD] text-[#5146E5]'
                        }`}
                      >
                        {c.status}
                      </span>
                    </div>
                  ))
                )}
              </div>
            </div>

            <div className="mt-6 flex justify-end pt-4 border-t border-[#E8EAF3]">
              <button
                onClick={() => setSelectedPerson(null)}
                className="rounded-xl bg-[#5146E5] px-4 py-2 text-xs font-bold text-white hover:bg-[#4338CA]"
              >
                Close
              </button>
            </div>

          </div>
        </div>
      )}

    </div>
  );
};
