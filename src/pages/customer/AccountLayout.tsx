import React, { useEffect } from 'react';
import { Outlet, NavLink, useNavigate, useLocation } from 'react-router-dom';
import { User, Package, MapPin, LogOut } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';

export const AccountLayout: React.FC = () => {
  const { user, profile, loading, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    if (!loading && !user) {
      navigate('/login?redirect=/account', { replace: true });
    }
  }, [user, loading, navigate]);

  if (loading || !user) {
    return (
      <div className="min-h-[50vh] flex items-center justify-center">
        <span className="text-xs text-neutral-500">Loading your account details...</span>
      </div>
    );
  }

  const navItems = [
    { label: 'Overview', path: '/account', icon: User, end: true },
    { label: 'My Orders', path: '/account/orders', icon: Package, end: false },
    { label: 'Profile Settings', path: '/account/profile', icon: User, end: true },
    { label: 'Saved Addresses', path: '/account/addresses', icon: MapPin, end: true },
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      
      {/* Account Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-neutral-200 dark:border-neutral-800">
        <div>
          <span className="text-xs uppercase tracking-wider text-neutral-500 font-medium">Customer Area</span>
          <h1 className="text-2xl font-bold tracking-tight text-neutral-900 dark:text-white font-display mt-1">
            {profile?.full_name || 'My Account'}
          </h1>
          <p className="text-xs text-neutral-500 dark:text-neutral-400 mt-0.5">
            {user.email} · Customer ID: <span className="font-mono">{user.id}</span>
          </p>
        </div>

        <button
          type="button"
          onClick={() => {
            logout();
            navigate('/');
          }}
          className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/40 rounded-xl transition-colors border border-rose-200 dark:border-rose-900 self-start sm:self-auto"
        >
          <LogOut className="w-3.5 h-3.5" />
          <span>Sign Out</span>
        </button>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-2 border-b border-neutral-200 dark:border-neutral-800 overflow-x-auto pb-px">
        {navItems.map(item => {
          const Icon = item.icon;
          return (
            <NavLink
              key={item.path}
              to={item.path}
              end={item.end}
              className={({ isActive }) =>
                `flex items-center gap-2 px-4 py-2.5 text-xs font-semibold border-b-2 whitespace-nowrap transition-colors ${
                  isActive
                    ? 'border-neutral-900 text-neutral-900 dark:border-white dark:text-white'
                    : 'border-transparent text-neutral-500 hover:text-neutral-900 dark:hover:text-white'
                }`
              }
            >
              <Icon className="w-3.5 h-3.5" />
              <span>{item.label}</span>
            </NavLink>
          );
        })}
      </div>

      {/* Account Subview Content */}
      <div className="pt-2">
        <Outlet />
      </div>

    </div>
  );
};
