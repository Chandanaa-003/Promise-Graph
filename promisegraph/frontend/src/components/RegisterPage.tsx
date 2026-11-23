import React, { useState } from 'react';
import {
  Share2,
  Lock,
  Mail,
  User as UserIcon,
  Eye,
  EyeOff,
  ArrowRight,
  AlertCircle,
  CheckCircle2,
  ShieldCheck,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';

interface RegisterPageProps {
  onSuccess: () => void;
  onGoToLogin: () => void;
  onGoToLanding: () => void;
}

export const RegisterPage: React.FC<RegisterPageProps> = ({
  onSuccess,
  onGoToLogin,
  onGoToLanding,
}) => {
  const { register } = useAuth();

  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Password validation calculation
  const hasMinLength = password.length >= 8;
  const hasLetter = /[A-Za-z]/.test(password);
  const hasNumber = /\d/.test(password);
  const passwordsMatch = password.length > 0 && password === confirmPassword;

  // Strength score: 0 to 3
  const strengthScore = (hasMinLength ? 1 : 0) + (hasLetter ? 1 : 0) + (hasNumber ? 1 : 0);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    // Validation
    if (!email.trim() || !password || !confirmPassword) {
      setErrorMessage('Please complete all required fields.');
      return;
    }

    if (!hasMinLength || !hasLetter || !hasNumber) {
      setErrorMessage(
        'Password must be at least 8 characters long and contain both letters and numbers.'
      );
      return;
    }

    if (password !== confirmPassword) {
      setErrorMessage('Passwords do not match. Please verify your entries.');
      return;
    }

    setLoading(true);
    try {
      await register({
        email: email.trim(),
        password,
        full_name: fullName.trim() || undefined,
      });
      onSuccess();
    } catch (err: any) {
      setErrorMessage(
        err?.message || 'Registration could not be completed. Please try again.'
      );
    } finally {
      setLoading(false);
    }
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
          Create your account
        </h2>
        <p className="mt-2 text-sm text-[#64708B]">
          Start tracking promises and building relationship graphs
        </p>
      </div>

      {/* Main Form Card */}
      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md px-4 sm:px-0">
        <div className="rounded-2xl border border-[#E8EAF3] bg-white p-6 sm:p-8 shadow-card space-y-6">
          
          {/* Error Banner */}
          {errorMessage && (
            <div className="rounded-xl border border-[#E66D68]/30 bg-[#FEF2F2] p-3.5 flex items-start space-x-2.5 text-xs text-[#E66D68] animate-in fade-in duration-150">
              <AlertCircle className="h-4 w-4 flex-shrink-0 mt-0.5" />
              <div className="flex-1 font-medium">{errorMessage}</div>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Full Name Field */}
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
                  placeholder="e.g. Jordan Hayes"
                  className="block w-full rounded-xl border border-[#E8EAF3] bg-[#F5F7FF]/50 py-2.5 pl-10 pr-3.5 text-sm text-[#172044] placeholder-[#64708B]/60 focus:border-[#5146E5] focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#5146E5]/15 transition-all"
                />
              </div>
            </div>

            {/* Email Field */}
            <div>
              <label className="block text-xs font-bold text-[#172044] uppercase tracking-wider mb-1.5">
                Email Address <span className="text-[#E66D68]">*</span>
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
                  className="block w-full rounded-xl border border-[#E8EAF3] bg-[#F5F7FF]/50 py-2.5 pl-10 pr-3.5 text-sm text-[#172044] placeholder-[#64708B]/60 focus:border-[#5146E5] focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#5146E5]/15 transition-all"
                />
              </div>
            </div>

            {/* Password Field */}
            <div>
              <label className="block text-xs font-bold text-[#172044] uppercase tracking-wider mb-1.5">
                Password <span className="text-[#E66D68]">*</span>
              </label>
              <div className="relative rounded-xl shadow-sm">
                <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3.5 text-[#64708B]">
                  <Lock className="h-4 w-4" />
                </div>
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Min. 8 chars with letters & numbers"
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

              {/* Password Strength Indicator */}
              {password.length > 0 && (
                <div className="mt-2 space-y-1.5">
                  <div className="flex h-1.5 w-full overflow-hidden rounded-full bg-[#E8EAF3]">
                    <div
                      className={`h-full transition-all duration-300 ${
                        strengthScore === 1
                          ? 'w-1/3 bg-[#E66D68]'
                          : strengthScore === 2
                          ? 'w-2/3 bg-[#F2B84B]'
                          : 'w-full bg-[#24B8A5]'
                      }`}
                    />
                  </div>
                  <div className="flex justify-between text-[11px] text-[#64708B]">
                    <span>
                      Strength:{' '}
                      <strong
                        className={
                          strengthScore === 1
                            ? 'text-[#E66D68]'
                            : strengthScore === 2
                            ? 'text-[#F2B84B]'
                            : 'text-[#24B8A5]'
                        }
                      >
                        {strengthScore === 1
                          ? 'Weak'
                          : strengthScore === 2
                          ? 'Moderate'
                          : 'Strong'}
                      </strong>
                    </span>
                    <span>Min 8 chars, letters & numbers</span>
                  </div>
                </div>
              )}
            </div>

            {/* Confirm Password Field */}
            <div>
              <label className="block text-xs font-bold text-[#172044] uppercase tracking-wider mb-1.5">
                Confirm Password <span className="text-[#E66D68]">*</span>
              </label>
              <div className="relative rounded-xl shadow-sm">
                <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3.5 text-[#64708B]">
                  <ShieldCheck className="h-4 w-4" />
                </div>
                <input
                  type={showConfirmPassword ? 'text' : 'password'}
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Repeat your password"
                  required
                  className={`block w-full rounded-xl border py-2.5 pl-10 pr-10 text-sm text-[#172044] placeholder-[#64708B]/60 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#5146E5]/15 transition-all ${
                    confirmPassword && !passwordsMatch
                      ? 'border-[#E66D68] bg-[#FEF2F2]/30'
                      : confirmPassword && passwordsMatch
                      ? 'border-[#24B8A5] bg-[#E6F8F5]/30'
                      : 'border-[#E8EAF3] bg-[#F5F7FF]/50 focus:border-[#5146E5]'
                  }`}
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute inset-y-0 right-0 flex items-center pr-3.5 text-[#64708B] hover:text-[#172044] focus:outline-none"
                  aria-label={showConfirmPassword ? 'Hide password' : 'Show password'}
                >
                  {showConfirmPassword ? (
                    <EyeOff className="h-4 w-4" />
                  ) : (
                    <Eye className="h-4 w-4" />
                  )}
                </button>
              </div>

              {/* Password match feedback */}
              {confirmPassword.length > 0 && (
                <div className="mt-1 flex items-center space-x-1.5 text-[11px]">
                  {passwordsMatch ? (
                    <span className="flex items-center space-x-1 text-[#24B8A5] font-semibold">
                      <CheckCircle2 className="h-3 w-3" />
                      <span>Passwords match</span>
                    </span>
                  ) : (
                    <span className="flex items-center space-x-1 text-[#E66D68] font-medium">
                      <AlertCircle className="h-3 w-3" />
                      <span>Passwords do not match</span>
                    </span>
                  )}
                </div>
              )}
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading}
              className="w-full flex items-center justify-center space-x-2 rounded-xl bg-[#5146E5] py-2.5 text-sm font-bold text-white shadow-md shadow-[#5146E5]/20 hover:bg-[#4338CA] focus:outline-none focus:ring-2 focus:ring-[#5146E5] focus:ring-offset-2 transition-all disabled:opacity-50 disabled:cursor-not-allowed mt-4"
            >
              {loading ? (
                <>
                  <div className="h-4 w-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  <span>Creating Account...</span>
                </>
              ) : (
                <>
                  <span>Create Account</span>
                  <ArrowRight className="h-4 w-4" />
                </>
              )}
            </button>
          </form>

          {/* Switch to Login */}
          <div className="pt-4 border-t border-[#E8EAF3] text-center">
            <p className="text-xs text-[#64708B]">
              Already have an account?{' '}
              <button
                type="button"
                onClick={onGoToLogin}
                className="font-bold text-[#5146E5] hover:text-[#4338CA] transition-colors"
              >
                Sign in
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
    </div>
  );
};
