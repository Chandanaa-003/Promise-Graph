import React, { useState } from 'react';
import {
  Share2,
  Lock,
  Mail,
  Eye,
  EyeOff,
  ArrowRight,
  Sparkles,
  AlertCircle,
  HelpCircle,
  X,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';

interface LoginPageProps {
  onSuccess: () => void;
  onGoToRegister: () => void;
  onGoToLanding: () => void;
}

export const LoginPage: React.FC<LoginPageProps> = ({
  onSuccess,
  onGoToRegister,
  onGoToLanding,
}) => {
  const { login } = useAuth();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [showForgotModal, setShowForgotModal] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    if (!email.trim() || !password) {
      setErrorMessage('Please enter both your email address and password.');
      return;
    }

    setLoading(true);
    try {
      await login({
        email: email.trim(),
        password,
        remember_me: rememberMe,
      });
      onSuccess();
    } catch (err: any) {
      setErrorMessage(err?.message || 'Invalid email or password.');
    } finally {
      setLoading(false);
    }
  };

  const handleFillDemo = () => {
    setEmail('alex@promisegraph.ai');
    setPassword('Password123!');
    setErrorMessage(null);
  };

  return (
    <div className="min-h-screen bg-[#F5F7FF] flex flex-col justify-center py-12 sm:px-6 lg:px-8 selection:bg-[#5146E5] selection:text-white">
      {/* Top Brand Link */}
      <div className="sm:mx-auto sm:w-full sm:max-w-md text-center">
        <button
          onClick={onGoToLanding}
          className="inline-flex items-center space-x-3 group focus:outline-none"
        >
          <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-[#5146E5] shadow-md shadow-[#5146E5]/20 group-hover:bg-[#4338CA] transition-all">
            <Share2 className="h-6 w-6 text-white" />
          </div>
          <span className="text-2xl font-bold tracking-tight text-[#172044]">
            Promise<span className="text-[#5146E5]">Graph</span>
          </span>
        </button>

        <h2 className="mt-6 text-2xl sm:text-3xl font-extrabold text-[#172044] tracking-tight">
          Welcome back
        </h2>
        <p className="mt-2 text-sm text-[#64708B]">
          Sign in to access your communication intelligence workspace
        </p>
      </div>

      {/* Main Form Card */}
      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md px-4 sm:px-0">
        <div className="rounded-2xl border border-[#E8EAF3] bg-white p-6 sm:p-8 shadow-card space-y-6">
          
          {/* Quick Demo Credentials Pill */}
          <div className="rounded-xl border border-[#EEF0FD] bg-[#F5F7FF] p-3.5 flex items-center justify-between text-xs">
            <div className="flex items-center space-x-2 text-[#5146E5] font-medium">
              <Sparkles className="h-4 w-4 flex-shrink-0" />
              <span>Demo: alex@promisegraph.ai</span>
            </div>
            <button
              type="button"
              onClick={handleFillDemo}
              className="text-xs font-bold text-[#5146E5] hover:text-[#4338CA] underline ml-2 flex-shrink-0"
            >
              One-click Fill
            </button>
          </div>

          {/* Error Banner */}
          {errorMessage && (
            <div className="rounded-xl border border-[#E66D68]/30 bg-[#FEF2F2] p-3.5 flex items-start space-x-2.5 text-xs text-[#E66D68] animate-in fade-in duration-150">
              <AlertCircle className="h-4 w-4 flex-shrink-0 mt-0.5" />
              <div className="flex-1 font-medium">{errorMessage}</div>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Email Field */}
            <div>
              <label className="block text-xs font-bold text-[#172044] uppercase tracking-wider mb-1.5">
                Email Address
              </label>
              <div className="relative rounded-xl shadow-sm">
                <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3.5 text-[#64708B]">
                  <Mail className="h-4 w-4" />
                </div>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="name@company.com"
                  required
                  autoFocus
                  className="block w-full rounded-xl border border-[#E8EAF3] bg-[#F5F7FF]/50 py-2.5 pl-10 pr-3.5 text-sm text-[#172044] placeholder-[#64708B]/60 focus:border-[#5146E5] focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#5146E5]/15 transition-all"
                />
              </div>
            </div>

            {/* Password Field */}
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="block text-xs font-bold text-[#172044] uppercase tracking-wider">
                  Password
                </label>
                <button
                  type="button"
                  onClick={() => setShowForgotModal(true)}
                  className="text-xs font-medium text-[#5146E5] hover:text-[#4338CA]"
                >
                  Forgot password?
                </button>
              </div>
              <div className="relative rounded-xl shadow-sm">
                <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3.5 text-[#64708B]">
                  <Lock className="h-4 w-4" />
                </div>
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••••••"
                  required
                  className="block w-full rounded-xl border border-[#E8EAF3] bg-[#F5F7FF]/50 py-2.5 pl-10 pr-10 text-sm text-[#172044] placeholder-[#64708B]/60 focus:border-[#5146E5] focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#5146E5]/15 transition-all"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 flex items-center pr-3.5 text-[#64708B] hover:text-[#172044] focus:outline-none"
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                >
                  {showPassword ? (
                    <EyeOff className="h-4 w-4" />
                  ) : (
                    <Eye className="h-4 w-4" />
                  )}
                </button>
              </div>
            </div>

            {/* Remember Me Checkbox */}
            <div className="flex items-center justify-between pt-1">
              <label className="flex items-center space-x-2.5 cursor-pointer">
                <input
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  className="h-4 w-4 rounded border-[#E8EAF3] text-[#5146E5] focus:ring-[#5146E5]/20 focus:ring-offset-0"
                />
                <span className="text-xs text-[#64708B] select-none">
                  Remember me on this device (30 days)
                </span>
              </label>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading}
              className="w-full flex items-center justify-center space-x-2 rounded-xl bg-[#5146E5] py-2.5 text-sm font-bold text-white shadow-md shadow-[#5146E5]/20 hover:bg-[#4338CA] focus:outline-none focus:ring-2 focus:ring-[#5146E5] focus:ring-offset-2 transition-all disabled:opacity-50 disabled:cursor-not-allowed mt-2"
            >
              {loading ? (
                <>
                  <div className="h-4 w-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  <span>Signing in...</span>
                </>
              ) : (
                <>
                  <span>Sign In</span>
                  <ArrowRight className="h-4 w-4" />
                </>
              )}
            </button>
          </form>

          {/* Switch to Register */}
          <div className="pt-4 border-t border-[#E8EAF3] text-center">
            <p className="text-xs text-[#64708B]">
              Don&apos;t have an account yet?{' '}
              <button
                type="button"
                onClick={onGoToRegister}
                className="font-bold text-[#5146E5] hover:text-[#4338CA] transition-colors"
              >
                Create an account
              </button>
            </p>
          </div>

        </div>

        {/* Back to Landing Link */}
        <div className="mt-6 text-center">
          <button
            onClick={onGoToLanding}
            className="text-xs font-medium text-[#64708B] hover:text-[#172044] transition-colors"
          >
            ← Back to PromiseGraph overview
          </button>
        </div>
      </div>

      {/* Forgot Password Modal Placeholder */}
      {showForgotModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="relative w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl border border-[#E8EAF3]">
            <div className="flex items-center justify-between pb-4 border-b border-[#E8EAF3]">
              <div className="flex items-center space-x-2.5 text-[#5146E5]">
                <HelpCircle className="h-5 w-5" />
                <h3 className="text-base font-bold text-[#172044]">
                  Password Recovery
                </h3>
              </div>
              <button
                onClick={() => setShowForgotModal(false)}
                className="rounded-lg p-1 text-[#64708B] hover:bg-[#F5F7FF] hover:text-[#172044]"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
            
            <div className="py-4 space-y-3 text-xs text-[#64708B] leading-relaxed">
              <p>
                Automated password recovery via SMTP email will be unlocked alongside the official Gmail channel integration.
              </p>
              <div className="rounded-xl border border-[#EEF0FD] bg-[#F5F7FF] p-3 text-xs text-[#172044]">
                <p className="font-semibold text-[#5146E5] mb-1">Standard Demo Access:</p>
                <p className="font-mono text-[11px]">Email: alex@promisegraph.ai</p>
                <p className="font-mono text-[11px]">Password: Password123!</p>
              </div>
              <p>
                You can also create a brand-new testing account in seconds via the registration page.
              </p>
            </div>

            <div className="flex justify-end pt-3 border-t border-[#E8EAF3]">
              <button
                onClick={() => setShowForgotModal(false)}
                className="rounded-xl bg-[#5146E5] px-4 py-2 text-xs font-bold text-white hover:bg-[#4338CA] transition-all"
              >
                Got it
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
