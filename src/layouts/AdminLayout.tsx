import React, { useState, useEffect } from 'react';
import { Outlet, Link, useLocation, useNavigate } from 'react-router-dom';
import {
  LayoutDashboard,
  ShoppingBag,
  Package,
  Layers,
  Archive,
  Users,
  Tag,
  Star,
  Bell,
  Settings,
  Store,
  LogOut,
  Sun,
  Moon,
  Menu,
  X,
  ExternalLink,
  ShieldAlert,
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { useTheme } from '../contexts/ThemeContext';
import { notificationService } from '../services/notificationService';
import { StoreNotification } from '../types';

export const AdminLayout: React.FC = () => {
  const { user, profile, isAdmin, loading, logout } = useAuth();
  const { theme, setTheme } = useTheme();
  const location = useLocation();
  const navigate = useNavigate();

  const [notifications, setNotifications] = useState<StoreNotification[]>([]);
  const [unreadCount, setUnreadCount] = useState<number>(0);
  const [showNotifMenu, setShowNotifMenu] = useState<boolean>(false);
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState<boolean>(false);

  // Check admin authorization
  useEffect(() => {
    if (!loading && (!user || !isAdmin)) {
      navigate('/admin/login', { replace: true, state: { from: location.pathname } });
    }
  }, [user, isAdmin, loading, navigate, location.pathname]);

  // Load and subscribe to notifications
  useEffect(() => {
    if (!isAdmin) return;

    const loadNotifications = async () => {
      try {
        const notifs = await notificationService.getNotifications(undefined, true);
        setNotifications(notifs);
        setUnreadCount(notifs.filter(n => !n.is_read).length);
      } catch (err) {
        console.error('Failed to load admin notifications', err);
      }
    };

    loadNotifications();

    const unsubscribe = notificationService.subscribeToNotifications((newNotif) => {
      setNotifications(prev => [newNotif, ...prev]);
      setUnreadCount(prev => prev + 1);
    });

    return () => {
      unsubscribe();
    };
  }, [isAdmin]);

  const handleMarkAllRead = async () => {
    await notificationService.markAllAsRead(undefined, true);
    setNotifications(prev => prev.map(n => ({ ...n, is_read: true })));
    setUnreadCount(0);
  };

  const navLinks = [
    { label: 'Dashboard', path: '/admin', icon: LayoutDashboard },
    { label: 'Orders', path: '/admin/orders', icon: ShoppingBag },
    { label: 'Products', path: '/admin/products', icon: Package },
    { label: 'Categories', path: '/admin/categories', icon: Layers },
    { label: 'Inventory', path: '/admin/inventory', icon: Archive },
    { label: 'Customers', path: '/admin/customers', icon: Users },
    { label: 'Coupons', path: '/admin/coupons', icon: Tag },
    { label: 'Reviews', path: '/admin/reviews', icon: Star },
    { label: 'Notifications', path: '/admin/notifications', icon: Bell, badge: unreadCount },
    { label: 'Settings', path: '/admin/settings', icon: Settings },
  ];

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-neutral-100 dark:bg-neutral-900">
        <div className="flex flex-col items-center gap-3">
          <div className="w-8 h-8 border-2 border-neutral-900 dark:border-white border-t-transparent rounded-full animate-spin" />
          <span className="text-xs text-neutral-500 font-medium">Verifying administrator authorization...</span>
        </div>
      </div>
    );
  }

  if (!isAdmin) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-neutral-100 dark:bg-neutral-900 p-4">
        <div className="max-w-md w-full p-8 bg-white dark:bg-neutral-800 rounded-2xl shadow-xl text-center border border-neutral-200 dark:border-neutral-700">
          <ShieldAlert className="w-12 h-12 text-rose-500 mx-auto mb-4" />
          <h2 className="text-lg font-bold text-neutral-900 dark:text-white">Admin Access Restricted</h2>
          <p className="text-xs text-neutral-500 dark:text-neutral-400 mt-2">
            You must be authenticated with verified store administrator privileges to view this portal.
          </p>
          <div className="mt-6 flex flex-col gap-2">
            <Link
              to="/admin/login"
              className="w-full py-2.5 px-4 bg-neutral-900 dark:bg-white text-white dark:text-neutral-900 text-xs font-semibold rounded-xl"
            >
              Sign In as Administrator
            </Link>
            <Link
              to="/"
              className="w-full py-2.5 px-4 text-xs font-semibold text-neutral-600 dark:text-neutral-300 hover:underline"
            >
              Return to Customer Store
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex bg-neutral-100 dark:bg-neutral-950 text-neutral-900 dark:text-neutral-100 font-sans">
      
      {/* Mobile Sidebar Overlay */}
      {mobileSidebarOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/50 md:hidden backdrop-blur-xs"
          onClick={() => setMobileSidebarOpen(false)}
        />
      )}

      {/* Admin Sidebar */}
      <aside
        className={`fixed md:sticky top-0 z-50 h-screen w-64 bg-white dark:bg-neutral-900 border-r border-neutral-200 dark:border-neutral-800 flex flex-col transition-transform duration-200 ${
          mobileSidebarOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'
        }`}
      >
        {/* Brand Header */}
        <div className="h-16 px-6 border-b border-neutral-200 dark:border-neutral-800 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-neutral-900 dark:bg-white text-white dark:text-neutral-900 flex items-center justify-center font-bold text-xs">
              A
            </div>
            <div>
              <span className="text-sm font-bold tracking-tight text-neutral-900 dark:text-white">Ali Admin</span>
              <span className="block text-[10px] text-neutral-500 font-medium">Store Management</span>
            </div>
          </div>
          <button
            onClick={() => setMobileSidebarOpen(false)}
            className="md:hidden p-1 text-neutral-400 hover:text-neutral-600 dark:hover:text-neutral-200"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Navigation Items */}
        <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
          {navLinks.map(link => {
            const Icon = link.icon;
            const isActive = location.pathname === link.path || (link.path !== '/admin' && location.pathname.startsWith(link.path));
            return (
              <Link
                key={link.path}
                to={link.path}
                onClick={() => setMobileSidebarOpen(false)}
                className={`flex items-center justify-between px-3 py-2 text-xs font-medium rounded-lg transition-colors ${
                  isActive
                    ? 'bg-neutral-900 text-white dark:bg-white dark:text-neutral-900'
                    : 'text-neutral-600 dark:text-neutral-400 hover:bg-neutral-100 dark:hover:bg-neutral-800/60 hover:text-neutral-900 dark:hover:text-white'
                }`}
              >
                <div className="flex items-center gap-3">
                  <Icon className="w-4 h-4 shrink-0" />
                  <span>{link.label}</span>
                </div>
                {Boolean(link.badge && link.badge > 0) && (
                  <span
                    className={`px-1.5 py-0.5 text-[10px] font-bold rounded-full ${
                      isActive
                        ? 'bg-amber-400 text-neutral-900'
                        : 'bg-amber-100 text-amber-900 dark:bg-amber-950 dark:text-amber-300'
                    }`}
                  >
                    {link.badge}
                  </span>
                )}
              </Link>
            );
          })}
        </nav>

        {/* Sidebar Footer Links */}
        <div className="p-3 border-t border-neutral-200 dark:border-neutral-800 space-y-1">
          <Link
            to="/"
            target="_blank"
            className="flex items-center justify-between px-3 py-2 text-xs font-medium text-neutral-600 dark:text-neutral-400 hover:bg-neutral-100 dark:hover:bg-neutral-800 rounded-lg transition-colors"
          >
            <div className="flex items-center gap-3">
              <Store className="w-4 h-4" />
              <span>Customer Store</span>
            </div>
            <ExternalLink className="w-3.5 h-3.5 text-neutral-400" />
          </Link>

          <button
            onClick={() => {
              logout();
              navigate('/admin/login');
            }}
            className="w-full flex items-center gap-3 px-3 py-2 text-xs font-medium text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/40 rounded-lg transition-colors"
          >
            <LogOut className="w-4 h-4" />
            <span>Sign Out Admin</span>
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0">
        
        {/* Top Header */}
        <header className="sticky top-0 z-30 h-16 bg-white dark:bg-neutral-900 border-b border-neutral-200 dark:border-neutral-800 px-4 sm:px-8 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setMobileSidebarOpen(true)}
              className="md:hidden p-2 text-neutral-600 dark:text-neutral-300 hover:text-neutral-900 dark:hover:text-white"
            >
              <Menu className="w-5 h-5" />
            </button>
            <div className="hidden sm:block">
              <span className="text-xs font-medium text-neutral-400">Store Management Console</span>
            </div>
          </div>

          <div className="flex items-center gap-3">
            {/* Realtime Notification Bell */}
            <div className="relative">
              <button
                type="button"
                onClick={() => setShowNotifMenu(!showNotifMenu)}
                className="relative p-2 text-neutral-600 dark:text-neutral-300 hover:text-neutral-900 dark:hover:text-white rounded-lg hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors"
                aria-label="Admin Notifications"
              >
                <Bell className="w-5 h-5" />
                {unreadCount > 0 && (
                  <span className="absolute top-1 right-1 w-4 h-4 text-[10px] font-bold bg-amber-500 text-neutral-950 rounded-full flex items-center justify-center animate-pulse">
                    {unreadCount}
                  </span>
                )}
              </button>

              {/* Notification Dropdown */}
              {showNotifMenu && (
                <div className="absolute right-0 mt-2 w-80 sm:w-96 bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-xl shadow-xl z-50 overflow-hidden animate-in fade-in-50 zoom-in-95">
                  <div className="p-3 border-b border-neutral-100 dark:border-neutral-800 flex items-center justify-between">
                    <span className="text-xs font-semibold text-neutral-900 dark:text-white">
                      Notifications ({unreadCount} new)
                    </span>
                    {unreadCount > 0 && (
                      <button
                        onClick={handleMarkAllRead}
                        className="text-[11px] text-neutral-500 hover:text-neutral-900 dark:hover:text-white font-medium"
                      >
                        Mark all as read
                      </button>
                    )}
                  </div>

                  <div className="max-h-72 overflow-y-auto divide-y divide-neutral-100 dark:divide-neutral-800/60">
                    {notifications.length === 0 ? (
                      <div className="p-6 text-center text-xs text-neutral-400">
                        No notifications yet.
                      </div>
                    ) : (
                      notifications.slice(0, 6).map(n => (
                        <div
                          key={n.id}
                          className={`p-3 text-xs transition-colors ${
                            !n.is_read ? 'bg-amber-50/50 dark:bg-amber-950/20' : ''
                          }`}
                        >
                          <div className="flex items-center justify-between font-semibold text-neutral-900 dark:text-white">
                            <span>{n.title}</span>
                            <span className="text-[10px] text-neutral-400 font-normal">
                              {new Date(n.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                            </span>
                          </div>
                          <p className="text-neutral-500 dark:text-neutral-400 mt-1">{n.message}</p>
                        </div>
                      ))
                    )}
                  </div>

                  <div className="p-2 border-t border-neutral-100 dark:border-neutral-800 text-center">
                    <Link
                      to="/admin/notifications"
                      onClick={() => setShowNotifMenu(false)}
                      className="text-xs text-neutral-700 dark:text-neutral-300 hover:underline font-medium"
                    >
                      View all notifications
                    </Link>
                  </div>
                </div>
              )}
            </div>

            {/* Theme switcher */}
            <button
              onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
              className="p-2 text-neutral-600 dark:text-neutral-300 hover:text-neutral-900 dark:hover:text-white rounded-lg hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors"
              aria-label="Toggle theme"
            >
              {theme === 'dark' ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
            </button>

            {/* Admin identity pill */}
            <div className="flex items-center gap-2 pl-2 border-l border-neutral-200 dark:border-neutral-800">
              <div className="w-8 h-8 rounded-full bg-neutral-900 dark:bg-white text-white dark:text-neutral-900 flex items-center justify-center font-bold text-xs">
                {profile?.full_name?.charAt(0) || 'A'}
              </div>
              <div className="hidden lg:block text-left">
                <span className="block text-xs font-semibold text-neutral-900 dark:text-white">
                  {profile?.full_name || 'Admin'}
                </span>
                <span className="block text-[10px] text-emerald-600 dark:text-emerald-400 font-medium">
                  Verified Store Admin
                </span>
              </div>
            </div>
          </div>
        </header>

        {/* Content Body */}
        <main className="flex-1 p-4 sm:p-8 overflow-y-auto">
          <Outlet />
        </main>

      </div>
    </div>
  );
};
