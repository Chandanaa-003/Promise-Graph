import React, { useState } from 'react';
import {
  Database,
  RefreshCw,
  Server,
  User as UserIcon,
  Lock,
  Shield,
  CheckCircle2,
  AlertCircle,
  LogOut,
  Mail,
  KeyRound,
  Eye,
  EyeOff
} from 'lucide-react';
import { HealthResponse } from '../types';
import { triggerSeedData } from '../services/api';
import { useAuth } from '../context/AuthContext';

interface SettingsViewProps {
  health: HealthResponse | null;
  onRefreshData: () => Promise<void>;
}

export const SettingsView: React.FC<SettingsViewProps> = ({
  health,
  onRefreshData,
}) => {
  const { user, updateProfile, changePassword, logout } = useAuth();

  const [activeTab, setActiveTab] = useState<'account' | 'security' | 'system'>('account');

  // Profile Form State
  const [fullName, setFullName] = useState(user?.full_name || '');
  const [profileSaving, setProfileSaving] = useState(false);
  const [profileMessage, setProfileMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // Password Form State
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [passwordSaving, setPasswordSaving] = useState(false);
  const [passwordMessage, setPasswordMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // System Diagnostics / Seed State
  const [isSeeding, setIsSeeding] = useState(false);
  const [seedMessage, setSeedMessage] = useState<string | null>(null);

  // Handle Profile Update
  const handleProfileSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!fullName.trim()) return;
    setProfileSaving(true);
    setProfileMessage(null);
    try {
      await updateProfile(fullName.trim());
      setProfileMessage({ type: 'success', text: 'Profile updated successfully.' });
    } catch (err: any) {
      setProfileMessage({ type: 'error', text: err?.message || 'Failed to update profile.' });
    } finally {
      setProfileSaving(false);
    }
  };

  // Handle Password Change
  const handlePasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setPasswordMessage(null);

    if (!currentPassword || !newPassword || !confirmPassword) {
      setPasswordMessage({ type: 'error', text: 'All password fields are required.' });
      return;
    }

    if (newPassword.length < 8 || !/[A-Za-z]/.test(newPassword) || !/\d/.test(newPassword)) {
      setPasswordMessage({
        type: 'error',
        text: 'New password must be at least 8 characters with both letters and numbers.',
      });
      return;
    }

    if (newPassword !== confirmPassword) {
      setPasswordMessage({ type: 'error', text: 'New passwords do not match.' });
      return;
    }

    setPasswordSaving(true);
    try {
      await changePassword(currentPassword, newPassword);
      setPasswordMessage({ type: 'success', text: 'Password changed successfully.' });
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
    } catch (err: any) {
      setPasswordMessage({ type: 'error', text: err?.message || 'Failed to change password.' });
    } finally {
      setPasswordSaving(false);
    }
  };

  const handleSeed = async () => {
    setIsSeeding(true);
    setSeedMessage(null);
    try {
      const res = await triggerSeedData();
      await onRefreshData();
      setSeedMessage(res.message || 'Demo data re-seeded successfully.');
    } catch (err: any) {
      setSeedMessage(`Error: ${err.message}`);
    } finally {
      setIsSeeding(false);
    }
  };

  return (
    <div className="flex-1 space-y-6 p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto selection:bg-[#5146E5] selection:text-white">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-6 border-b border-[#E8EAF3]">
        <div>
          <div className="flex items-center space-x-2.5">
            <h1 className="text-2xl sm:text-3xl font-extrabold text-[#172044] tracking-tight">
              Settings & Account
            </h1>
            <span className="rounded-full bg-[#EEF0FD] px-2.5 py-0.5 text-xs font-bold text-[#5146E5] border border-[#5146E5]/20">
              Phase 3 Active
            </span>
          </div>
          <p className="mt-1 text-sm text-[#64708B]">
            Manage your personal profile, credentials, security policies, and system diagnostics.
          </p>
        </div>

        {/* Navigation Tabs */}
        <div className="flex items-center space-x-1.5 rounded-xl bg-white border border-[#E8EAF3] p-1 shadow-subtle self-start">
          <button
            onClick={() => setActiveTab('account')}
            className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
              activeTab === 'account'
                ? 'bg-[#5146E5] text-white shadow-sm'
                : 'text-[#64708B] hover:text-[#172044] hover:bg-[#F5F7FF]'
            }`}
          >
            <UserIcon className="h-3.5 w-3.5" />
            <span>Profile</span>
          </button>
          <button
            onClick={() => setActiveTab('security')}
            className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
              activeTab === 'security'
                ? 'bg-[#5146E5] text-white shadow-sm'
                : 'text-[#64708B] hover:text-[#172044] hover:bg-[#F5F7FF]'
            }`}
          >
            <Shield className="h-3.5 w-3.5" />
            <span>Security</span>
          </button>
          <button
            onClick={() => setActiveTab('system')}
            className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
              activeTab === 'system'
                ? 'bg-[#5146E5] text-white shadow-sm'
                : 'text-[#64708B] hover:text-[#172044] hover:bg-[#F5F7FF]'
            }`}
          >
            <Server className="h-3.5 w-3.5" />
            <span>System</span>
          </button>
        </div>
      </div>

      {/* Tab 1: Account & Profile */}
      {activeTab === 'account' && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 animate-in fade-in duration-200">
          
          {/* Left: User Overview Card */}
          <div className="rounded-2xl border border-[#E8EAF3] bg-white p-6 shadow-card space-y-5 md:col-span-1">
            <div className="flex flex-col items-center text-center pb-4 border-b border-[#E8EAF3]">
              <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-[#5146E5] text-xl font-bold text-white shadow-md shadow-[#5146E5]/20 mb-3">
                {user?.full_name
                  ? user.full_name.split(' ').map((n) => n[0]).join('').slice(0, 2).toUpperCase()
                  : user?.email.slice(0, 2).toUpperCase() || 'AM'}
              </div>
              <h2 className="text-base font-bold text-[#172044]">
                {user?.full_name || 'PromiseGraph User'}
              </h2>
              <p className="text-xs text-[#64708B] mt-0.5">{user?.email}</p>
              <div className="mt-2.5 inline-flex items-center rounded-full bg-[#E6F8F5] px-2.5 py-0.5 text-[10px] font-bold text-[#24B8A5] border border-[#24B8A5]/20">
                Active Account
              </div>
            </div>

            <div className="space-y-2.5 text-xs">
              <div className="flex justify-between py-1 border-b border-[#E8EAF3]/60">
                <span className="text-[#64708B]">User ID</span>
                <span className="font-mono text-[10px] text-[#172044] truncate max-w-[120px]" title={user?.id}>
                  {user?.id || '—'}
                </span>
              </div>
              <div className="flex justify-between py-1 border-b border-[#E8EAF3]/60">
                <span className="text-[#64708B]">Data Isolation</span>
                <span className="font-semibold text-[#24B8A5]">Enforced (Private)</span>
              </div>
              <div className="flex justify-between py-1">
                <span className="text-[#64708B]">Registered</span>
                <span className="text-[#172044]">
                  {user?.created_at ? new Date(user.created_at).toLocaleDateString() : 'Active session'}
                </span>
              </div>
            </div>

            <div className="pt-2">
              <button
                onClick={() => logout()}
                className="w-full flex items-center justify-center space-x-2 rounded-xl border border-[#E66D68]/30 bg-[#FEF2F2] py-2 text-xs font-bold text-[#E66D68] hover:bg-[#FEF2F2]/80 transition-all"
              >
                <LogOut className="h-3.5 w-3.5" />
                <span>Sign Out</span>
              </button>
            </div>
          </div>

          {/* Right: Edit Profile Information Form */}
          <div className="rounded-2xl border border-[#E8EAF3] bg-white p-6 shadow-card md:col-span-2 space-y-6">
            <div>
              <h3 className="text-sm font-bold text-[#172044]">Personal Details</h3>
              <p className="text-xs text-[#64708B] mt-0.5">
                Update your display name across your commitment dashboard.
              </p>
            </div>

            {profileMessage && (
              <div
                className={`rounded-xl p-3 text-xs flex items-center space-x-2 ${
                  profileMessage.type === 'success'
                    ? 'border border-[#24B8A5]/30 bg-[#E6F8F5] text-[#24B8A5]'
                    : 'border border-[#E66D68]/30 bg-[#FEF2F2] text-[#E66D68]'
                }`}
              >
                {profileMessage.type === 'success' ? (
                  <CheckCircle2 className="h-4 w-4 flex-shrink-0" />
                ) : (
                  <AlertCircle className="h-4 w-4 flex-shrink-0" />
                )}
                <span>{profileMessage.text}</span>
              </div>
            )}

            <form onSubmit={handleProfileSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-[#172044] uppercase tracking-wider mb-1.5">
                  Full Name
                </label>
                <div className="relative rounded-xl shadow-sm">
                  <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3.5 text-[#64708B]">
                    <UserIcon className="h-4 w-4" />
                  </div>
                  <input
                    type="text"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    required
                    placeholder="Your Full Name"
                    className="block w-full rounded-xl border border-[#E8EAF3] bg-[#F5F7FF]/50 py-2.5 pl-10 pr-3.5 text-sm text-[#172044] focus:border-[#5146E5] focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#5146E5]/15 transition-all"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-[#172044] uppercase tracking-wider mb-1.5">
                  Email Address
                </label>
                <div className="relative rounded-xl shadow-sm opacity-75">
                  <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3.5 text-[#64708B]">
                    <Mail className="h-4 w-4" />
                  </div>
                  <input
                    type="email"
                    value={user?.email || ''}
                    disabled
                    className="block w-full rounded-xl border border-[#E8EAF3] bg-[#F5F7FF] py-2.5 pl-10 pr-3.5 text-sm text-[#64708B] cursor-not-allowed"
                  />
                </div>
                <p className="mt-1 text-[11px] text-[#64708B]">
                  Your primary email address is used for authentication and data isolation.
                </p>
              </div>

              <div className="flex justify-end pt-2">
                <button
                  type="submit"
                  disabled={profileSaving}
                  className="flex items-center space-x-2 rounded-xl bg-[#5146E5] px-5 py-2.5 text-xs font-bold text-white shadow-sm shadow-[#5146E5]/20 hover:bg-[#4338CA] transition-all disabled:opacity-50"
                >
                  {profileSaving ? (
                    <>
                      <div className="h-3.5 w-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      <span>Saving...</span>
                    </>
                  ) : (
                    <span>Save Changes</span>
                  )}
                </button>
              </div>
            </form>
          </div>

        </div>
      )}

      {/* Tab 2: Security & Change Password */}
      {activeTab === 'security' && (
        <div className="max-w-2xl rounded-2xl border border-[#E8EAF3] bg-white p-6 shadow-card space-y-6 animate-in fade-in duration-200">
          <div>
            <div className="flex items-center space-x-2.5">
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#EEF0FD] text-[#5146E5]">
                <KeyRound className="h-4 w-4" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-[#172044]">Change Password</h3>
                <p className="text-xs text-[#64708B]">
                  Update your credentials using your current password for security verification.
                </p>
              </div>
            </div>
          </div>

          {passwordMessage && (
            <div
              className={`rounded-xl p-3 text-xs flex items-center space-x-2 ${
                passwordMessage.type === 'success'
                  ? 'border border-[#24B8A5]/30 bg-[#E6F8F5] text-[#24B8A5]'
                  : 'border border-[#E66D68]/30 bg-[#FEF2F2] text-[#E66D68]'
              }`}
            >
              {passwordMessage.type === 'success' ? (
                <CheckCircle2 className="h-4 w-4 flex-shrink-0" />
              ) : (
                <AlertCircle className="h-4 w-4 flex-shrink-0" />
              )}
              <span>{passwordMessage.text}</span>
            </div>
          )}

          <form onSubmit={handlePasswordSubmit} className="space-y-4">
            {/* Current Password */}
            <div>
              <label className="block text-xs font-bold text-[#172044] uppercase tracking-wider mb-1.5">
                Current Password <span className="text-[#E66D68]">*</span>
              </label>
              <div className="relative rounded-xl shadow-sm">
                <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3.5 text-[#64708B]">
                  <Lock className="h-4 w-4" />
                </div>
                <input
                  type={showCurrentPassword ? 'text' : 'password'}
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                  placeholder="Enter your current password"
                  required
                  className="block w-full rounded-xl border border-[#E8EAF3] bg-[#F5F7FF]/50 py-2.5 pl-10 pr-10 text-sm text-[#172044] focus:border-[#5146E5] focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#5146E5]/15 transition-all"
                />
                <button
                  type="button"
                  onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                  className="absolute inset-y-0 right-0 flex items-center pr-3.5 text-[#64708B] hover:text-[#172044]"
                >
                  {showCurrentPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>

            {/* New Password */}
            <div>
              <label className="block text-xs font-bold text-[#172044] uppercase tracking-wider mb-1.5">
                New Password <span className="text-[#E66D68]">*</span>
              </label>
              <div className="relative rounded-xl shadow-sm">
                <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3.5 text-[#64708B]">
                  <Lock className="h-4 w-4" />
                </div>
                <input
                  type={showNewPassword ? 'text' : 'password'}
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="Min 8 characters, letters & numbers"
                  required
                  className="block w-full rounded-xl border border-[#E8EAF3] bg-[#F5F7FF]/50 py-2.5 pl-10 pr-10 text-sm text-[#172044] focus:border-[#5146E5] focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#5146E5]/15 transition-all"
                />
                <button
                  type="button"
                  onClick={() => setShowNewPassword(!showNewPassword)}
                  className="absolute inset-y-0 right-0 flex items-center pr-3.5 text-[#64708B] hover:text-[#172044]"
                >
                  {showNewPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>

            {/* Confirm New Password */}
            <div>
              <label className="block text-xs font-bold text-[#172044] uppercase tracking-wider mb-1.5">
                Confirm New Password <span className="text-[#E66D68]">*</span>
              </label>
              <div className="relative rounded-xl shadow-sm">
                <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3.5 text-[#64708B]">
                  <Lock className="h-4 w-4" />
                </div>
                <input
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Repeat your new password"
                  required
                  className="block w-full rounded-xl border border-[#E8EAF3] bg-[#F5F7FF]/50 py-2.5 pl-10 pr-3.5 text-sm text-[#172044] focus:border-[#5146E5] focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#5146E5]/15 transition-all"
                />
              </div>
            </div>

            <div className="flex justify-end pt-2">
              <button
                type="submit"
                disabled={passwordSaving}
                className="flex items-center space-x-2 rounded-xl bg-[#5146E5] px-5 py-2.5 text-xs font-bold text-white shadow-sm shadow-[#5146E5]/20 hover:bg-[#4338CA] transition-all disabled:opacity-50"
              >
                {passwordSaving ? (
                  <>
                    <div className="h-3.5 w-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    <span>Updating Password...</span>
                  </>
                ) : (
                  <span>Update Password</span>
                )}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Tab 3: System Diagnostics & Re-seed */}
      {activeTab === 'system' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 animate-in fade-in duration-200">
          
          {/* Backend Diagnostics Card */}
          <div className="rounded-2xl border border-[#E8EAF3] bg-white p-6 shadow-card space-y-4">
            <div className="flex items-center space-x-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#EEF0FD] text-[#5146E5]">
                <Server className="h-5 w-5" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-[#172044]">
                  FastAPI Backend Diagnostics
                </h3>
                <p className="text-xs text-[#64708B]">Connected API service details</p>
              </div>
            </div>

            <div className="space-y-2.5 text-xs pt-2 border-t border-[#E8EAF3]">
              <div className="flex justify-between py-1 border-b border-[#E8EAF3]/60">
                <span className="text-[#64708B]">Service Name</span>
                <span className="font-bold text-[#172044]">{health?.app_name || 'PromiseGraph API'}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-[#E8EAF3]/60">
                <span className="text-[#64708B]">API Version</span>
                <span className="font-mono font-bold text-[#172044]">v{health?.version || '0.1.0'}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-[#E8EAF3]/60">
                <span className="text-[#64708B]">Environment</span>
                <span className="font-bold text-[#172044] capitalize">{health?.environment || 'development'}</span>
              </div>
              <div className="flex justify-between py-1">
                <span className="text-[#64708B]">Health Status</span>
                <span
                  className={`font-bold capitalize ${
                    health?.status === 'ok' ? 'text-[#24B8A5]' : 'text-[#F2B84B]'
                  }`}
                >
                  {health?.status === 'ok' ? 'Online (Healthy)' : 'Degraded'}
                </span>
              </div>
            </div>
          </div>

          {/* Database Management & Seed */}
          <div className="rounded-2xl border border-[#E8EAF3] bg-white p-6 shadow-card space-y-4">
            <div className="flex items-center space-x-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#E6F8F5] text-[#24B8A5]">
                <Database className="h-5 w-5" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-[#172044]">
                  Database Management
                </h3>
                <p className="text-xs text-[#64708B]">SQLAlchemy 2.0 ORM store</p>
              </div>
            </div>

            <div className="space-y-2.5 text-xs pt-2 border-t border-[#E8EAF3]">
              <div className="flex justify-between py-1 border-b border-[#E8EAF3]/60">
                <span className="text-[#64708B]">Connection State</span>
                <span className="font-bold text-[#24B8A5]">
                  {health?.database_connected ? 'Connected' : 'Degraded'}
                </span>
              </div>
              <div className="flex justify-between py-1 border-b border-[#E8EAF3]/60">
                <span className="text-[#64708B]">Engine Dialect</span>
                <span className="font-mono text-[#172044]">PostgreSQL / SQLite fallback</span>
              </div>
              <div className="flex justify-between py-1">
                <span className="text-[#64708B]">Authentication</span>
                <span className="font-bold text-[#5146E5]">Argon2 / Bcrypt & JWT Active</span>
              </div>
            </div>

            <div className="pt-2">
              <button
                onClick={handleSeed}
                disabled={isSeeding}
                className="w-full flex items-center justify-center space-x-2 rounded-xl border border-[#E8EAF3] bg-[#F5F7FF] py-2.5 text-xs font-bold text-[#5146E5] hover:bg-[#EEF0FD] hover:border-[#5146E5]/30 transition-all disabled:opacity-50"
              >
                <RefreshCw className={`h-3.5 w-3.5 ${isSeeding ? 'animate-spin' : ''}`} />
                <span>{isSeeding ? 'Populating Data...' : 'Reset & Re-seed Demo Data'}</span>
              </button>
              {seedMessage && (
                <p className="mt-2 text-center text-xs font-semibold text-[#24B8A5]">
                  {seedMessage}
                </p>
              )}
            </div>
          </div>

        </div>
      )}

    </div>
  );
};
