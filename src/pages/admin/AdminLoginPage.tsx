import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { ShieldCheck, Lock, Mail, ArrowRight, ShieldAlert } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { useToast } from '../../contexts/ToastContext';

export const AdminLoginPage: React.FC = () => {
  const [email, setEmail] = useState<string>('admin@alionlinestore.pk');
  const [password, setPassword] = useState<string>('admin123');
  const [submitting, setSubmitting] = useState<boolean>(false);

  const { loginAdmin } = useAuth();
  const { success, error } = useToast();
  const navigate = useNavigate();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      error('Please enter administrator credentials.');
      return;
    }

    setSubmitting(true);
    try {
      await loginAdmin(email.trim(), password);
      success('Authorized. Welcome to Ali Online Store Admin Console.');
      navigate('/admin', { replace: true });
    } catch (err: any) {
      error(err.message || 'Access denied. Invalid administrator credentials or role.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-neutral-900 text-white p-4">
      <div className="max-w-md w-full p-8 rounded-2xl bg-neutral-950 border border-neutral-800 shadow-2xl space-y-6">
        
        <div className="text-center space-y-2">
          <div className="w-12 h-12 rounded-xl bg-white text-neutral-950 flex items-center justify-center mx-auto font-bold text-lg">
            A
          </div>
          <span className="text-xs uppercase tracking-widest text-amber-400 font-semibold block">
            Authorized Personnel Only
          </span>
          <h1 className="text-2xl font-bold tracking-tight text-white font-display">
            Ali Online Store Admin
          </h1>
          <p className="text-xs text-neutral-400 max-w-xs mx-auto">
            This administrative portal requires verified database authorization with <code className="text-amber-400">role = 'admin'</code>.
          </p>
        </div>

        <form onSubmit={handleLogin} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-neutral-300 mb-1.5">
              Admin Email Address
            </label>
            <div className="relative">
              <input
                type="email"
                required
                value={email}
                onChange={e => setEmail(e.target.value)}
                className="w-full pl-9 pr-3 py-2.5 text-xs rounded-xl border border-neutral-800 bg-neutral-900 text-white focus:outline-none focus:ring-1 focus:ring-amber-400"
              />
              <Mail className="w-4 h-4 text-neutral-500 absolute left-3 top-3" />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-neutral-300 mb-1.5">
              Master Admin Password
            </label>
            <div className="relative">
              <input
                type="password"
                required
                value={password}
                onChange={e => setPassword(e.target.value)}
                className="w-full pl-9 pr-3 py-2.5 text-xs rounded-xl border border-neutral-800 bg-neutral-900 text-white focus:outline-none focus:ring-1 focus:ring-amber-400"
              />
              <Lock className="w-4 h-4 text-neutral-500 absolute left-3 top-3" />
            </div>
          </div>

          <button
            type="submit"
            disabled={submitting}
            className="w-full py-3 px-4 text-xs font-bold rounded-xl bg-amber-400 text-neutral-950 hover:bg-amber-300 transition-colors flex items-center justify-center gap-2 disabled:opacity-50 font-sans shadow-md"
          >
            <span>{submitting ? 'Verifying Admin Privileges...' : 'Sign In to Management Console'}</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </form>

        {/* Quick Credentials Info Box */}
        <div className="p-3.5 rounded-xl bg-neutral-900 border border-neutral-800 text-[11px] text-neutral-400 space-y-1">
          <p className="font-semibold text-neutral-200">Default Demo Administrator Credentials:</p>
          <p>Email: <span className="font-mono text-amber-400">admin@alionlinestore.pk</span></p>
          <p>Password: <span className="font-mono text-amber-400">admin123</span></p>
          <p className="text-[10px] text-neutral-500 pt-1">
            *Public customer accounts are strictly blocked from this portal via RLS role checking.
          </p>
        </div>

        <div className="pt-2 text-center">
          <Link
            to="/"
            className="text-xs text-neutral-400 hover:text-white underline"
          >
            ← Return to Customer Storefront
          </Link>
        </div>

      </div>
    </div>
  );
};
