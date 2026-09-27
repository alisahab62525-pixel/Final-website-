import React, { useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { Lock, Mail, User, Phone, ArrowRight, ShieldCheck } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { useToast } from '../../contexts/ToastContext';

export const RegisterPage: React.FC = () => {
  const [fullName, setFullName] = useState<string>('');
  const [email, setEmail] = useState<string>('');
  const [phone, setPhone] = useState<string>('');
  const [password, setPassword] = useState<string>('');
  const [confirmPassword, setConfirmPassword] = useState<string>('');
  const [submitting, setSubmitting] = useState<boolean>(false);

  const [searchParams] = useSearchParams();
  const redirectTarget = searchParams.get('redirect') || '/account';

  const { registerCustomer } = useAuth();
  const { success, error } = useToast();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!fullName.trim() || !email.trim() || !password) {
      error('Please fill in all mandatory fields.');
      return;
    }
    if (password.length < 6) {
      error('Password must be at least 6 characters long.');
      return;
    }
    if (password !== confirmPassword) {
      error('Passwords do not match.');
      return;
    }

    setSubmitting(true);
    try {
      await registerCustomer({
        fullName: fullName.trim(),
        email: email.trim().toLowerCase(),
        phone: phone.trim(),
        password,
      });
      success('Account created successfully! Welcome to Ali Online Store.');
      navigate(redirectTarget, { replace: true });
    } catch (err: any) {
      error(err.message || 'Failed to create customer account.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center px-4 py-12">
      <div className="max-w-md w-full p-8 rounded-2xl bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 shadow-xl space-y-6">
        
        <div className="text-center space-y-1.5">
          <span className="text-xs uppercase tracking-wider text-neutral-500 font-medium">New Shopper</span>
          <h1 className="text-2xl font-bold tracking-tight text-neutral-900 dark:text-white font-display">
            Create Customer Account
          </h1>
          <p className="text-xs text-neutral-500 dark:text-neutral-400">
            Join Ali Online Store to track orders, manage addresses, and checkout seamlessly.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-neutral-700 dark:text-neutral-300 mb-1.5">
              Full Name *
            </label>
            <div className="relative">
              <input
                type="text"
                required
                value={fullName}
                onChange={e => setFullName(e.target.value)}
                placeholder="e.g. Farhan Siddiqui"
                className="w-full pl-9 pr-3 py-2.5 text-xs rounded-xl border border-neutral-300 dark:border-neutral-700 bg-neutral-50 dark:bg-neutral-800 text-neutral-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-neutral-900 dark:focus:ring-white"
              />
              <User className="w-4 h-4 text-neutral-400 absolute left-3 top-3" />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-neutral-700 dark:text-neutral-300 mb-1.5">
              Email Address *
            </label>
            <div className="relative">
              <input
                type="email"
                required
                value={email}
                onChange={e => setEmail(e.target.value)}
                placeholder="name@domain.com"
                className="w-full pl-9 pr-3 py-2.5 text-xs rounded-xl border border-neutral-300 dark:border-neutral-700 bg-neutral-50 dark:bg-neutral-800 text-neutral-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-neutral-900 dark:focus:ring-white"
              />
              <Mail className="w-4 h-4 text-neutral-400 absolute left-3 top-3" />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-neutral-700 dark:text-neutral-300 mb-1.5">
              Phone Number (For Delivery SMS / Call) *
            </label>
            <div className="relative">
              <input
                type="tel"
                required
                value={phone}
                onChange={e => setPhone(e.target.value)}
                placeholder="+92 300 1234567"
                className="w-full pl-9 pr-3 py-2.5 text-xs rounded-xl border border-neutral-300 dark:border-neutral-700 bg-neutral-50 dark:bg-neutral-800 text-neutral-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-neutral-900 dark:focus:ring-white"
              />
              <Phone className="w-4 h-4 text-neutral-400 absolute left-3 top-3" />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-neutral-700 dark:text-neutral-300 mb-1.5">
              Password (Min. 6 characters) *
            </label>
            <div className="relative">
              <input
                type="password"
                required
                value={password}
                onChange={e => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full pl-9 pr-3 py-2.5 text-xs rounded-xl border border-neutral-300 dark:border-neutral-700 bg-neutral-50 dark:bg-neutral-800 text-neutral-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-neutral-900 dark:focus:ring-white"
              />
              <Lock className="w-4 h-4 text-neutral-400 absolute left-3 top-3" />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-neutral-700 dark:text-neutral-300 mb-1.5">
              Confirm Password *
            </label>
            <div className="relative">
              <input
                type="password"
                required
                value={confirmPassword}
                onChange={e => setConfirmPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full pl-9 pr-3 py-2.5 text-xs rounded-xl border border-neutral-300 dark:border-neutral-700 bg-neutral-50 dark:bg-neutral-800 text-neutral-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-neutral-900 dark:focus:ring-white"
              />
              <Lock className="w-4 h-4 text-neutral-400 absolute left-3 top-3" />
            </div>
          </div>

          <button
            type="submit"
            disabled={submitting}
            className="w-full py-3 px-4 text-xs font-bold rounded-xl bg-neutral-900 text-white dark:bg-white dark:text-neutral-900 hover:opacity-90 transition-opacity flex items-center justify-center gap-2 disabled:opacity-50 shadow-md"
          >
            <span>{submitting ? 'Creating Account...' : 'Complete Registration'}</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </form>

        <div className="pt-4 border-t border-neutral-100 dark:border-neutral-800 text-center text-xs text-neutral-500">
          <span>Already registered? </span>
          <Link
            to={`/login?redirect=${encodeURIComponent(redirectTarget)}`}
            className="font-semibold text-neutral-900 dark:text-white underline"
          >
            Sign In Here
          </Link>
        </div>

        <div className="flex items-center justify-center gap-2 text-[11px] text-neutral-400">
          <ShieldCheck className="w-3.5 h-3.5 text-emerald-500" />
          <span>Customer data protected by Row Level Security (RLS)</span>
        </div>

      </div>
    </div>
  );
};
