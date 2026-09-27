import React, { useState } from 'react';
import { User, Phone, Mail, ShieldCheck } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { useToast } from '../../contexts/ToastContext';

export const AccountProfilePage: React.FC = () => {
  const { user, profile, updateProfile } = useAuth();
  const { success, error } = useToast();

  const [fullName, setFullName] = useState<string>(profile?.full_name || '');
  const [phone, setPhone] = useState<string>(profile?.phone || '');
  const [saving, setSaving] = useState<boolean>(false);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!fullName.trim()) {
      error('Full name is required.');
      return;
    }
    setSaving(true);
    try {
      await updateProfile({
        full_name: fullName.trim(),
        phone: phone.trim(),
      });
      success('Profile details updated successfully.');
    } catch (err: any) {
      error(err.message || 'Failed to update profile');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="max-w-xl p-6 rounded-2xl bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 space-y-6">
      <div>
        <h2 className="text-sm font-bold uppercase tracking-wider text-neutral-900 dark:text-white">
          Personal Information
        </h2>
        <p className="text-xs text-neutral-500 mt-1">Manage your customer profile and contact credentials.</p>
      </div>

      <form onSubmit={handleSave} className="space-y-4">
        <div>
          <label className="block text-xs font-semibold text-neutral-700 dark:text-neutral-300 mb-1">
            Email Address (Read-only)
          </label>
          <div className="relative">
            <input
              type="email"
              disabled
              value={user?.email || ''}
              className="w-full pl-9 pr-3 py-2 text-xs rounded-xl border border-neutral-200 dark:border-neutral-800 bg-neutral-100 dark:bg-neutral-800 text-neutral-500 cursor-not-allowed"
            />
            <Mail className="w-4 h-4 text-neutral-400 absolute left-3 top-2.5" />
          </div>
        </div>

        <div>
          <label className="block text-xs font-semibold text-neutral-700 dark:text-neutral-300 mb-1">
            Full Name *
          </label>
          <div className="relative">
            <input
              type="text"
              required
              value={fullName}
              onChange={e => setFullName(e.target.value)}
              className="w-full pl-9 pr-3 py-2 text-xs rounded-xl border border-neutral-300 dark:border-neutral-700 bg-neutral-50 dark:bg-neutral-800 text-neutral-900 dark:text-white focus:outline-none"
            />
            <User className="w-4 h-4 text-neutral-400 absolute left-3 top-2.5" />
          </div>
        </div>

        <div>
          <label className="block text-xs font-semibold text-neutral-700 dark:text-neutral-300 mb-1">
            Phone Number *
          </label>
          <div className="relative">
            <input
              type="tel"
              required
              value={phone}
              onChange={e => setPhone(e.target.value)}
              className="w-full pl-9 pr-3 py-2 text-xs rounded-xl border border-neutral-300 dark:border-neutral-700 bg-neutral-50 dark:bg-neutral-800 text-neutral-900 dark:text-white focus:outline-none"
            />
            <Phone className="w-4 h-4 text-neutral-400 absolute left-3 top-2.5" />
          </div>
        </div>

        <button
          type="submit"
          disabled={saving}
          className="px-5 py-2.5 text-xs font-semibold rounded-xl bg-neutral-900 text-white dark:bg-white dark:text-neutral-900 hover:opacity-90 disabled:opacity-50"
        >
          {saving ? 'Saving changes...' : 'Save Profile'}
        </button>
      </form>

      <div className="pt-4 border-t border-neutral-100 dark:border-neutral-800 flex items-center gap-2 text-[11px] text-neutral-400">
        <ShieldCheck className="w-4 h-4 text-emerald-500" />
        <span>Profile information is securely maintained via Supabase profiles table</span>
      </div>
    </div>
  );
};
