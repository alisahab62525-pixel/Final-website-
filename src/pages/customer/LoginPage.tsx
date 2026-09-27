import React, { useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { Lock, Mail, ArrowRight, ShieldCheck } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { useToast } from '../../contexts/ToastContext';

export const LoginPage: React.FC = () => {
  const [email, setEmail] = useState<string>('');
  const [password, setPassword] = useState<string>('');
  const [submitting, setSubmitting] = useState<boolean>(false);
  const [searchParams] = useSearchParams();
  const redirectTarget = searchParams.get('redirect') || '/account';

  const { loginCustomer } = useAuth();
  const { success, error } = useToast();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      error('Please enter your email and password.');
      return;
    }

    setSubmitting(true);
    try {
      await loginCustomer(email.trim(), password);
      success('Welcome back! You are now signed in.');
      navigate(redirectTarget, { replace: true });
    } catch (err: any) {
      error(err.message || 'Failed to sign in. Please verify your credentials.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-[75vh] flex items-center justify-center px-4 py-12">
      <div className="max-w-md w-full p-8 rounded-2xl bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 shadow-xl space-y-6">
        
        <div className="text-center space-y-1.5">
          <span className="text-xs uppercase tracking-wider text-neutral-500 font-medium">Customer Portal</span>
          <h1 className="text-2xl font-bold tracking-tight text-neutral-900 dark:text-white font-display">
            Sign In to Ali Store
          </h1>
          {redirectTarget.includes('checkout') ? (
            <p className="text-xs text-amber-600 dark:text-amber-400 font-medium">
              Please sign in or create an account to finalize your order.
            </p>
          ) : (
            <p className="text-xs text-neutral-500 dark:text-neutral-400">
              Access your order history, saved addresses, and active shipments.
            </p>
          )}
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-neutral-700 dark:text-neutral-300 mb-1.5">
              Email Address
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
            <div className="flex items-center justify-between mb-1.5">
              <label className="text-xs font-semibold text-neutral-700 dark:text-neutral-300">
                Password
              </label>
            </div>
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

          <button
            type="submit"
            disabled={submitting}
            className="w-full py-3 px-4 text-xs font-bold rounded-xl bg-neutral-900 text-white dark:bg-white dark:text-neutral-900 hover:opacity-90 transition-opacity flex items-center justify-center gap-2 disabled:opacity-50 shadow-md"
          >
            <span>{submitting ? 'Authenticating...' : 'Sign In'}</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </form>

        {/* Demo Quick Account Helper */}
        <div className="p-3 bg-neutral-50 dark:bg-neutral-800/60 rounded-xl border border-neutral-200 dark:border-neutral-800 text-[11px] text-neutral-600 dark:text-neutral-400">
          <p className="font-semibold text-neutral-900 dark:text-white mb-1">Demo Customer Account:</p>
          <p>Email: <span className="font-mono text-neutral-900 dark:text-white">farhan.siddiqui@gmail.com</span></p>
          <p>Password: <span className="font-mono text-neutral-900 dark:text-white">password123</span></p>
          <button
            type="button"
            onClick={() => {
              setEmail('farhan.siddiqui@gmail.com');
              setPassword('password123');
            }}
            className="mt-1 text-xs text-neutral-900 dark:text-white font-semibold underline"
          >
            Fill Demo Customer
          </button>
        </div>

        <div className="pt-4 border-t border-neutral-100 dark:border-neutral-800 text-center text-xs text-neutral-500">
          <span>Don't have an account yet? </span>
          <Link
            to={`/register?redirect=${encodeURIComponent(redirectTarget)}`}
            className="font-semibold text-neutral-900 dark:text-white underline"
          >
            Create Customer Account
          </Link>
        </div>

        <div className="flex items-center justify-center gap-2 text-[11px] text-neutral-400">
          <ShieldCheck className="w-3.5 h-3.5 text-emerald-500" />
          <span>Encrypted Session · Real Supabase Authentication</span>
        </div>

      </div>
    </div>
  );
};
