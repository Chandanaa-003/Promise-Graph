import React, { useState } from 'react';
import {
  Search,
  Plus,
  CheckCircle,
  Clock,
  AlertTriangle,
  XCircle,
  Trash2,
  Edit2,
  User,
  ArrowUpDown,
  Mail,
  MessageSquare,
  Github,
  X
} from 'lucide-react';
import { Commitment, Person, CommitmentStatus } from '../types';

interface CommitmentsViewProps {
  commitments: Commitment[];
  people: Person[];
  loading: boolean;
  onCreateCommitment: (data: any) => Promise<void>;
  onUpdateCommitment: (id: string, data: any) => Promise<void>;
  onDeleteCommitment: (id: string) => Promise<void>;
  selectedCommitment: Commitment | null;
  setSelectedCommitment: (c: Commitment | null) => void;
  isAddModalOpen: boolean;
  setIsAddModalOpen: (open: boolean) => void;
}

export const CommitmentsView: React.FC<CommitmentsViewProps> = ({
  commitments,
  people,
  loading,
  onCreateCommitment,
  onUpdateCommitment,
  onDeleteCommitment,
  selectedCommitment,
  setSelectedCommitment,
  isAddModalOpen,
  setIsAddModalOpen,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [deadlineFilter, setDeadlineFilter] = useState<string>('all');
  const [sortOrder, setSortOrder] = useState<'newest' | 'oldest'>('newest');

  // Edit State
  const [editingCommitment, setEditingCommitment] = useState<Commitment | null>(null);

  // Delete Confirmation State
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  // Form State for Add / Edit
  const [formTitle, setFormTitle] = useState('');
  const [formDescription, setFormDescription] = useState('');
  const [formPersonId, setFormPersonId] = useState('');
  const [formStatus, setFormStatus] = useState<CommitmentStatus>('pending');
  const [formType, setFormType] = useState<'promise_made' | 'promise_received'>('promise_made');
  const [formDueDate, setFormDueDate] = useState('');
  const [formSubmitting, setFormSubmitting] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  const resetForm = () => {
    setFormTitle('');
    setFormDescription('');
    setFormPersonId(people.length > 0 ? people[0].id : '');
    setFormStatus('pending');
    setFormType('promise_made');
    setFormDueDate('');
    setFormError(null);
  };

  const handleOpenAdd = () => {
    resetForm();
    setIsAddModalOpen(true);
  };

  const handleOpenEdit = (c: Commitment, e: React.MouseEvent) => {
    e.stopPropagation();
    setEditingCommitment(c);
    setFormTitle(c.title);
    setFormDescription(c.description || '');
    setFormPersonId(c.person_id || '');
    setFormStatus(c.status);
    setFormType(c.commitment_type);
    setFormDueDate(c.due_date ? c.due_date.substring(0, 10) : '');
    setFormError(null);
  };

  const handleOpenDelete = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setDeletingId(id);
  };

  const handleConfirmDelete = async () => {
    if (!deletingId) return;
    setIsDeleting(true);
    try {
      await onDeleteCommitment(deletingId);
      setDeletingId(null);
      if (selectedCommitment?.id === deletingId) {
        setSelectedCommitment(null);
      }
    } catch (err: any) {
      alert(err.message || 'Failed to delete');
    } finally {
      setIsDeleting(false);
    }
  };

  const handleAddSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formTitle.trim()) {
      setFormError('Please enter a commitment title.');
      return;
    }
    setFormSubmitting(true);
    setFormError(null);
    try {
      await onCreateCommitment({
        title: formTitle.trim(),
        description: formDescription.trim() || undefined,
        person_id: formPersonId || undefined,
        status: formStatus,
        commitment_type: formType,
        due_date: formDueDate ? new Date(formDueDate).toISOString() : undefined,
        confidence_score: 1.0,
      });
      setIsAddModalOpen(false);
      resetForm();
    } catch (err: any) {
      setFormError(err.message || 'Failed to save commitment');
    } finally {
      setFormSubmitting(false);
    }
  };

  const handleEditSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingCommitment || !formTitle.trim()) return;
    setFormSubmitting(true);
    setFormError(null);
    try {
      await onUpdateCommitment(editingCommitment.id, {
        title: formTitle.trim(),
        description: formDescription.trim() || undefined,
        person_id: formPersonId || undefined,
        status: formStatus,
        commitment_type: formType,
        due_date: formDueDate ? new Date(formDueDate).toISOString() : undefined,
      });
      setEditingCommitment(null);
      resetForm();
    } catch (err: any) {
      setFormError(err.message || 'Failed to update commitment');
    } finally {
      setFormSubmitting(false);
    }
  };

  // Filter & Search Logic
  const now = new Date();
  const filteredCommitments = commitments
    .filter((c) => {
      // Search
      const q = searchQuery.toLowerCase();
      const matchesSearch =
        c.title.toLowerCase().includes(q) ||
        (c.person_name && c.person_name.toLowerCase().includes(q)) ||
        (c.description && c.description.toLowerCase().includes(q));

      if (!matchesSearch) return false;

      // Status Filter
      if (statusFilter !== 'all') {
        if (statusFilter === 'overdue') {
          const isOverdue =
            c.status === 'overdue' ||
            (c.due_date && new Date(c.due_date) < now && c.status !== 'fulfilled' && c.status !== 'cancelled');
          if (!isOverdue) return false;
        } else if (c.status !== statusFilter) {
          return false;
        }
      }

      // Deadline Filter
      if (deadlineFilter !== 'all') {
        if (!c.due_date) return false;
        const dueDate = new Date(c.due_date);
        const diffDays = Math.ceil((dueDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));

        if (deadlineFilter === 'overdue' && dueDate >= now) return false;
        if (deadlineFilter === 'today' && (diffDays < 0 || diffDays > 1)) return false;
        if (deadlineFilter === 'this_week' && (diffDays < 0 || diffDays > 7)) return false;
        if (deadlineFilter === 'later' && diffDays <= 7) return false;
      }

      return true;
    })
    .sort((a, b) => {
      const timeA = new Date(a.created_at || 0).getTime();
      const timeB = new Date(b.created_at || 0).getTime();
      return sortOrder === 'newest' ? timeB - timeA : timeA - timeB;
    });

  const getStatusBadge = (status: CommitmentStatus) => {
    switch (status) {
      case 'fulfilled':
        return (
          <span className="inline-flex items-center space-x-1.5 rounded-lg bg-[#E6F8F5] px-2.5 py-1 text-xs font-semibold text-[#24B8A5] border border-[#24B8A5]/25">
            <CheckCircle className="h-3.5 w-3.5" />
            <span>Completed</span>
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
      
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-6 border-b border-[#E8EAF3]">
        <div>
          <div className="flex items-center space-x-2.5">
            <h1 className="text-2xl sm:text-3xl font-extrabold text-[#172044] tracking-tight">
              Commitments
            </h1>
            <span className="rounded-full bg-[#EEF0FD] px-2.5 py-0.5 text-xs font-bold text-[#5146E5] border border-[#5146E5]/20">
              {commitments.length} Total
            </span>
          </div>
          <p className="mt-1 text-sm text-[#64708B]">
            Browse, filter, edit, and track all promises made by you or received from colleagues.
          </p>
        </div>

        <button
          onClick={handleOpenAdd}
          className="inline-flex items-center space-x-2 rounded-xl bg-[#5146E5] px-4 py-2.5 text-xs font-bold text-white shadow-sm shadow-[#5146E5]/25 hover:bg-[#4338CA] transition-all transform hover:-translate-y-0.5"
        >
          <Plus className="h-4 w-4" />
          <span>Add Commitment</span>
        </button>
      </div>

      {/* Control Bar: Search, Filters & Sorting */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-3.5">
        
        {/* Search */}
        <div className="relative md:col-span-1">
          <Search className="absolute left-3.5 top-3 h-4 w-4 text-[#64708B]" />
          <input
            type="text"
            placeholder="Search title, person, notes..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full rounded-xl border border-[#E8EAF3] bg-white pl-10 pr-4 py-2.5 text-xs text-[#172044] placeholder-[#64708B] focus:border-[#5146E5] focus:outline-none focus:ring-2 focus:ring-[#5146E5]/10 shadow-subtle"
          />
        </div>

        {/* Status Filter */}
        <div className="relative">
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="w-full rounded-xl border border-[#E8EAF3] bg-white px-3.5 py-2.5 text-xs font-medium text-[#172044] focus:border-[#5146E5] focus:outline-none focus:ring-2 focus:ring-[#5146E5]/10 shadow-subtle appearance-none cursor-pointer"
          >
            <option value="all">Status: All Commitments</option>
            <option value="pending">Status: Pending</option>
            <option value="in_progress">Status: In Progress</option>
            <option value="fulfilled">Status: Completed (Fulfilled)</option>
            <option value="overdue">Status: Overdue</option>
          </select>
        </div>

        {/* Deadline Filter */}
        <div className="relative">
          <select
            value={deadlineFilter}
            onChange={(e) => setDeadlineFilter(e.target.value)}
            className="w-full rounded-xl border border-[#E8EAF3] bg-white px-3.5 py-2.5 text-xs font-medium text-[#172044] focus:border-[#5146E5] focus:outline-none focus:ring-2 focus:ring-[#5146E5]/10 shadow-subtle appearance-none cursor-pointer"
          >
            <option value="all">Deadline: Any Date</option>
            <option value="overdue">Deadline: Overdue Only</option>
            <option value="today">Deadline: Due Today</option>
            <option value="this_week">Deadline: Due This Week</option>
            <option value="later">Deadline: Later / Future</option>
          </select>
        </div>

        {/* Sorting */}
        <div className="flex items-center space-x-2">
          <button
            onClick={() => setSortOrder(sortOrder === 'newest' ? 'oldest' : 'newest')}
            className="w-full flex items-center justify-center space-x-2 rounded-xl border border-[#E8EAF3] bg-white px-3.5 py-2.5 text-xs font-semibold text-[#172044] hover:border-[#D6D9EB] shadow-subtle"
          >
            <ArrowUpDown className="h-3.5 w-3.5 text-[#5146E5]" />
            <span>Sort: {sortOrder === 'newest' ? 'Newest First' : 'Oldest First'}</span>
          </button>
        </div>

      </div>

      {/* Commitments List */}
      <div className="space-y-3.5">
        {loading ? (
          <div className="rounded-2xl border border-[#E8EAF3] bg-white p-12 text-center text-xs text-[#64708B] shadow-card">
            Loading commitments from database...
          </div>
        ) : filteredCommitments.length === 0 ? (
          <div className="rounded-2xl border border-[#E8EAF3] bg-white p-12 text-center text-xs text-[#64708B] shadow-card">
            No commitments found matching your filters.
          </div>
        ) : (
          filteredCommitments.map((item) => (
            <div
              key={item.id}
              onClick={() => setSelectedCommitment(item)}
              className="rounded-2xl border border-[#E8EAF3] bg-white p-5 shadow-card hover:shadow-card-hover hover:border-[#D6D9EB] transition-all duration-200 cursor-pointer group"
            >
              <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
                
                <div className="space-y-2 flex-1">
                  <div className="flex items-center flex-wrap gap-2">
                    {getStatusBadge(item.status)}
                    <span className="flex items-center space-x-1.5 rounded-lg bg-[#F5F7FF] border border-[#E8EAF3] px-2.5 py-1 text-xs font-medium text-[#64708B]">
                      {getChannelIcon(item.channel)}
                      <span className="capitalize text-[#172044]">{item.channel || 'email'}</span>
                    </span>
                    <span className="text-xs text-[#64708B] font-medium">
                      {item.commitment_type === 'promise_made' ? '• Made by you' : '• Promised to you'}
                    </span>
                  </div>

                  <h3 className="text-sm font-bold text-[#172044] group-hover:text-[#5146E5] transition-colors leading-snug">
                    {item.title}
                  </h3>

                  {item.description && (
                    <p className="text-xs text-[#64708B] leading-relaxed line-clamp-2">
                      {item.description}
                    </p>
                  )}

                  {/* Evidence pill preview */}
                  {item.evidence_snippets && item.evidence_snippets.length > 0 && (
                    <div className="mt-2 rounded-xl border border-[#E8EAF3] border-l-4 border-l-[#5146E5] bg-[#F5F7FF] p-2.5 text-xs font-mono text-[#172044]">
                      <span className="text-[#5146E5] font-bold mr-1">Proof:</span>
                      <span className="italic">{item.evidence_snippets[0]}</span>
                    </div>
                  )}
                </div>

                {/* Right Metadata & Action Buttons */}
                <div className="flex flex-col items-end justify-between self-stretch sm:self-auto gap-3 flex-shrink-0">
                  <div className="text-right text-xs space-y-1">
                    <div className="flex items-center justify-end space-x-1 text-[#172044] font-semibold">
                      <User className="h-3 w-3 text-[#64708B]" />
                      <span>{item.person_name || 'Assigned Stakeholder'}</span>
                    </div>
                    <div className="text-[11px] text-[#64708B]">
                      Due:{' '}
                      {item.due_date
                        ? new Date(item.due_date).toLocaleDateString('en-US', {
                            month: 'short',
                            day: 'numeric',
                            year: 'numeric',
                          })
                        : 'None'}
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div className="flex items-center space-x-1">
                    <button
                      onClick={(e) => handleOpenEdit(item, e)}
                      title="Edit commitment"
                      className="p-1.5 rounded-lg border border-[#E8EAF3] text-[#64708B] hover:text-[#5146E5] hover:bg-[#EEF0FD] transition-colors"
                    >
                      <Edit2 className="h-3.5 w-3.5" />
                    </button>
                    <button
                      onClick={(e) => handleOpenDelete(item.id, e)}
                      title="Delete commitment"
                      className="p-1.5 rounded-lg border border-[#E8EAF3] text-[#64708B] hover:text-[#E66D68] hover:bg-[#FDF1F0] transition-colors"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  </div>
                </div>

              </div>
            </div>
          ))
        )}
      </div>

      {/* ADD / EDIT COMMITMENT MODAL */}
      {(isAddModalOpen || editingCommitment) && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#172044]/40 p-4 backdrop-blur-sm">
          <div className="w-full max-w-lg rounded-2xl border border-[#E8EAF3] bg-white p-6 shadow-2xl animate-in fade-in-50">
            <div className="flex items-center justify-between pb-4 border-b border-[#E8EAF3]">
              <h3 className="text-base font-bold text-[#172044]">
                {editingCommitment ? 'Edit Commitment' : 'Add New Commitment'}
              </h3>
              <button
                onClick={() => {
                  setIsAddModalOpen(false);
                  setEditingCommitment(null);
                }}
                className="text-[#64708B] hover:text-[#172044]"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={editingCommitment ? handleEditSubmit : handleAddSubmit} className="mt-4 space-y-4">
              {formError && (
                <div className="rounded-xl border border-[#E66D68]/30 bg-[#FDF1F0] p-3 text-xs text-[#E66D68]">
                  {formError}
                </div>
              )}

              <div>
                <label className="block text-xs font-bold text-[#172044] mb-1">
                  Commitment Title *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g., Deliver Phase 2 Functional Frontend"
                  value={formTitle}
                  onChange={(e) => setFormTitle(e.target.value)}
                  className="w-full rounded-xl border border-[#E8EAF3] px-3.5 py-2 text-xs text-[#172044] focus:border-[#5146E5] focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-[#172044] mb-1">
                  Description / Context
                </label>
                <textarea
                  rows={3}
                  placeholder="Details, agreement context, or extracted notes..."
                  value={formDescription}
                  onChange={(e) => setFormDescription(e.target.value)}
                  className="w-full rounded-xl border border-[#E8EAF3] px-3.5 py-2 text-xs text-[#172044] focus:border-[#5146E5] focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-[#172044] mb-1">
                    Stakeholder (Person)
                  </label>
                  <select
                    value={formPersonId}
                    onChange={(e) => setFormPersonId(e.target.value)}
                    className="w-full rounded-xl border border-[#E8EAF3] bg-white px-3 py-2 text-xs text-[#172044] focus:border-[#5146E5] focus:outline-none"
                  >
                    <option value="">Unassigned</option>
                    {people.map((p) => (
                      <option key={p.id} value={p.id}>
                        {p.display_name} ({p.organization || 'General'})
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-[#172044] mb-1">
                    Commitment Type
                  </label>
                  <select
                    value={formType}
                    onChange={(e) => setFormType(e.target.value as any)}
                    className="w-full rounded-xl border border-[#E8EAF3] bg-white px-3 py-2 text-xs text-[#172044] focus:border-[#5146E5] focus:outline-none"
                  >
                    <option value="promise_made">I promised (Promise Made)</option>
                    <option value="promise_received">Promised to me (Promise Received)</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-[#172044] mb-1">
                    Status
                  </label>
                  <select
                    value={formStatus}
                    onChange={(e) => setFormStatus(e.target.value as any)}
                    className="w-full rounded-xl border border-[#E8EAF3] bg-white px-3 py-2 text-xs text-[#172044] focus:border-[#5146E5] focus:outline-none"
                  >
                    <option value="pending">Pending</option>
                    <option value="in_progress">In Progress</option>
                    <option value="fulfilled">Completed (Fulfilled)</option>
                    <option value="overdue">Overdue</option>
                    <option value="cancelled">Cancelled</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-[#172044] mb-1">
                    Due Date
                  </label>
                  <input
                    type="date"
                    value={formDueDate}
                    onChange={(e) => setFormDueDate(e.target.value)}
                    className="w-full rounded-xl border border-[#E8EAF3] px-3 py-2 text-xs text-[#172044] focus:border-[#5146E5] focus:outline-none"
                  />
                </div>
              </div>

              <div className="flex items-center justify-end space-x-3 pt-4 border-t border-[#E8EAF3]">
                <button
                  type="button"
                  onClick={() => {
                    setIsAddModalOpen(false);
                    setEditingCommitment(null);
                  }}
                  className="rounded-xl border border-[#E8EAF3] px-4 py-2 text-xs font-semibold text-[#64708B] hover:text-[#172044]"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={formSubmitting}
                  className="rounded-xl bg-[#5146E5] px-4 py-2 text-xs font-bold text-white shadow-sm shadow-[#5146E5]/25 hover:bg-[#4338CA] disabled:opacity-50"
                >
                  {formSubmitting ? 'Saving...' : editingCommitment ? 'Update Commitment' : 'Create Commitment'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* DELETE CONFIRMATION MODAL */}
      {deletingId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#172044]/40 p-4 backdrop-blur-sm">
          <div className="w-full max-w-sm rounded-2xl border border-[#E8EAF3] bg-white p-6 shadow-2xl animate-in fade-in-50">
            <h3 className="text-base font-bold text-[#172044]">Delete Commitment?</h3>
            <p className="mt-2 text-xs text-[#64708B] leading-relaxed">
              Are you sure you want to delete this commitment? This will permanently remove it and any associated evidence links.
            </p>
            <div className="mt-5 flex items-center justify-end space-x-3">
              <button
                onClick={() => setDeletingId(null)}
                className="rounded-xl border border-[#E8EAF3] px-4 py-2 text-xs font-semibold text-[#64708B] hover:text-[#172044]"
              >
                Cancel
              </button>
              <button
                onClick={handleConfirmDelete}
                disabled={isDeleting}
                className="rounded-xl bg-[#E66D68] px-4 py-2 text-xs font-bold text-white hover:bg-red-600 disabled:opacity-50"
              >
                {isDeleting ? 'Deleting...' : 'Delete'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* COMMITMENT DETAIL VIEW MODAL */}
      {selectedCommitment && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#172044]/40 p-4 backdrop-blur-sm">
          <div className="w-full max-w-xl rounded-2xl border border-[#E8EAF3] bg-white p-6 shadow-2xl animate-in fade-in-50 max-h-[90vh] overflow-y-auto">
            <div className="flex items-start justify-between pb-4 border-b border-[#E8EAF3]">
              <div>
                <div className="flex items-center space-x-2">
                  {getStatusBadge(selectedCommitment.status)}
                  <span className="text-xs text-[#64708B] font-semibold">
                    {selectedCommitment.commitment_type === 'promise_made' ? 'Made by you' : 'Promised to you'}
                  </span>
                </div>
                <h2 className="mt-2 text-lg font-bold text-[#172044]">
                  {selectedCommitment.title}
                </h2>
              </div>
              <button
                onClick={() => setSelectedCommitment(null)}
                className="text-[#64708B] hover:text-[#172044]"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="mt-4 space-y-4">
              <div>
                <h4 className="text-[11px] font-bold text-[#64708B] uppercase tracking-wider">
                  Description
                </h4>
                <p className="mt-1 text-xs text-[#172044] leading-relaxed">
                  {selectedCommitment.description || 'No detailed description provided.'}
                </p>
              </div>

              <div className="grid grid-cols-2 gap-4 rounded-xl border border-[#E8EAF3] bg-[#F5F7FF] p-4 text-xs">
                <div>
                  <span className="text-[#64708B]">Owner / Stakeholder:</span>
                  <p className="font-bold text-[#172044] mt-0.5">
                    {selectedCommitment.person_name || 'Unassigned'}
                  </p>
                </div>
                <div>
                  <span className="text-[#64708B]">Deadline:</span>
                  <p className="font-bold text-[#172044] mt-0.5">
                    {selectedCommitment.due_date
                      ? new Date(selectedCommitment.due_date).toLocaleDateString('en-US', {
                          weekday: 'short',
                          month: 'short',
                          day: 'numeric',
                          year: 'numeric',
                        })
                      : 'None set'}
                  </p>
                </div>
                <div>
                  <span className="text-[#64708B]">Source Channel:</span>
                  <p className="font-bold text-[#172044] mt-0.5 capitalize">
                    {selectedCommitment.channel || 'Email'}
                  </p>
                </div>
                <div>
                  <span className="text-[#64708B]">AI Confidence Score:</span>
                  <p className="font-bold text-[#5146E5] mt-0.5">
                    {Math.round(selectedCommitment.confidence_score * 100)}%
                  </p>
                </div>
              </div>

              {/* Evidence Snippet Section */}
              {selectedCommitment.evidence_snippets && selectedCommitment.evidence_snippets.length > 0 && (
                <div>
                  <h4 className="text-[11px] font-bold text-[#64708B] uppercase tracking-wider mb-2">
                    Verifiable Evidence Excerpts
                  </h4>
                  <div className="space-y-2">
                    {selectedCommitment.evidence_snippets.map((snip, idx) => (
                      <div
                        key={idx}
                        className="rounded-xl border border-[#E8EAF3] border-l-4 border-l-[#5146E5] bg-[#F5F7FF] p-3 text-xs font-mono text-[#172044]"
                      >
                        <span className="text-[#5146E5] font-bold mr-1">Proof #{idx + 1}:</span>
                        <span className="italic">{snip}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            <div className="mt-6 flex items-center justify-end space-x-3 pt-4 border-t border-[#E8EAF3]">
              <button
                onClick={() => setSelectedCommitment(null)}
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
