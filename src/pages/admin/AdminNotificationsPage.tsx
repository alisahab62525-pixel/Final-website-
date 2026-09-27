import React, { useEffect, useState } from 'react';
import { Bell, Check, ShoppingBag, AlertTriangle, Star, CheckCheck } from 'lucide-react';
import { notificationService } from '../../services/notificationService';
import { StoreNotification } from '../../types';

export const AdminNotificationsPage: React.FC = () => {
  const [notifications, setNotifications] = useState<StoreNotification[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  const loadNotifications = async () => {
    setLoading(true);
    try {
      const data = await notificationService.getNotifications(undefined, true);
      setNotifications(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadNotifications();

    const unsubscribe = notificationService.subscribeToNotifications(newNotif => {
      setNotifications(prev => [newNotif, ...prev]);
    });

    return () => unsubscribe();
  }, []);

  const handleMarkAsRead = async (id: string) => {
    await notificationService.markAsRead(id);
    setNotifications(prev => prev.map(n => n.id === id ? { ...n, is_read: true } : n));
  };

  const handleMarkAllRead = async () => {
    await notificationService.markAllAsRead(undefined, true);
    setNotifications(prev => prev.map(n => ({ ...n, is_read: true })));
  };

  return (
    <div className="space-y-6">
      
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-neutral-200 dark:border-neutral-800">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-neutral-900 dark:text-white font-display">
            Realtime Store Activity & Alerts
          </h1>
          <p className="text-xs text-neutral-500 mt-1">
            Instant event notifications for incoming orders, low inventory levels, and customer reviews.
          </p>
        </div>

        {notifications.some(n => !n.is_read) && (
          <button
            type="button"
            onClick={handleMarkAllRead}
            className="px-3.5 py-2 text-xs font-semibold rounded-xl border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-800 hover:bg-neutral-100 dark:hover:bg-neutral-700 inline-flex items-center gap-1.5 self-start sm:self-auto"
          >
            <CheckCheck className="w-4 h-4" />
            <span>Mark All as Read</span>
          </button>
        )}
      </div>

      <div className="p-6 rounded-2xl bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 space-y-3">
        {loading ? (
          <div className="p-8 text-center text-xs text-neutral-500">Loading notifications...</div>
        ) : notifications.length === 0 ? (
          <div className="p-12 text-center text-xs text-neutral-500">No activity alerts logged.</div>
        ) : (
          notifications.map(n => (
            <div
              key={n.id}
              className={`p-4 rounded-xl border transition-all flex items-start justify-between gap-4 ${
                !n.is_read
                  ? 'bg-amber-50/60 dark:bg-amber-950/20 border-amber-200 dark:border-amber-900'
                  : 'bg-neutral-50/50 dark:bg-neutral-800/40 border-neutral-200/80 dark:border-neutral-800'
              }`}
            >
              <div className="flex items-start gap-3">
                <div className={`p-2 rounded-lg shrink-0 ${
                  n.type === 'new_order'
                    ? 'bg-amber-100 text-amber-900 dark:bg-amber-900 dark:text-amber-100'
                    : n.type === 'low_stock'
                    ? 'bg-rose-100 text-rose-900 dark:bg-rose-900 dark:text-rose-100'
                    : 'bg-neutral-200 dark:bg-neutral-700 text-neutral-800 dark:text-neutral-200'
                }`}>
                  {n.type === 'new_order' ? <ShoppingBag className="w-4 h-4" /> : <AlertTriangle className="w-4 h-4" />}
                </div>

                <div className="space-y-0.5 text-xs">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-neutral-900 dark:text-white">{n.title}</span>
                    {!n.is_read && (
                      <span className="w-2 h-2 rounded-full bg-amber-500" />
                    )}
                  </div>
                  <p className="text-neutral-600 dark:text-neutral-300">{n.message}</p>
                  <span className="text-[10px] text-neutral-400 block pt-1">
                    {new Date(n.created_at).toLocaleString()}
                  </span>
                </div>
              </div>

              {!n.is_read && (
                <button
                  type="button"
                  onClick={() => handleMarkAsRead(n.id)}
                  className="p-1.5 text-neutral-400 hover:text-neutral-900 dark:hover:text-white text-xs font-semibold rounded hover:bg-neutral-200 dark:hover:bg-neutral-700 shrink-0"
                  title="Mark as read"
                >
                  <Check className="w-4 h-4" />
                </button>
              )}
            </div>
          ))
        )}
      </div>

    </div>
  );
};
