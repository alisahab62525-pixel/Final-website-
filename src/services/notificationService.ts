import { isSupabaseConfigured, supabase } from '../lib/supabase';
import { inMemoryDb } from './dbStore';
import { StoreNotification } from '../types';

export const notificationService = {
  // Get notifications for current user or admin
  async getNotifications(userId?: string, isAdmin = false): Promise<StoreNotification[]> {
    if (isSupabaseConfigured()) {
      let query = supabase.from('notifications').select('*').order('created_at', { ascending: false });

      if (isAdmin) {
        query = query.is('user_id', null);
      } else if (userId) {
        query = query.eq('user_id', userId);
      } else {
        return [];
      }

      const { data, error } = await query;
      if (error) throw new Error(error.message);
      return data || [];
    } else {
      if (isAdmin) {
        return inMemoryDb.notifications
          .filter(n => !n.user_id)
          .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
      } else if (userId) {
        return inMemoryDb.notifications
          .filter(n => n.user_id === userId)
          .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
      }
      return [];
    }
  },

  // Mark single notification as read
  async markAsRead(id: string): Promise<void> {
    if (isSupabaseConfigured()) {
      await supabase.from('notifications').update({ is_read: true }).eq('id', id);
    } else {
      const notif = inMemoryDb.notifications.find(n => n.id === id);
      if (notif) {
        notif.is_read = true;
        inMemoryDb.notify();
      }
    }
  },

  // Mark all as read
  async markAllAsRead(userId?: string, isAdmin = false): Promise<void> {
    if (isSupabaseConfigured()) {
      if (isAdmin) {
        await supabase.from('notifications').update({ is_read: true }).is('user_id', null);
      } else if (userId) {
        await supabase.from('notifications').update({ is_read: true }).eq('user_id', userId);
      }
    } else {
      inMemoryDb.notifications.forEach(n => {
        if (isAdmin && !n.user_id) n.is_read = true;
        if (!isAdmin && userId && n.user_id === userId) n.is_read = true;
      });
      inMemoryDb.notify();
    }
  },

  // Create notification
  async createNotification(notification: Omit<StoreNotification, 'id' | 'is_read' | 'created_at'>): Promise<StoreNotification> {
    const id = 'notif-' + Math.random().toString(36).substring(2, 9);
    const now = new Date().toISOString();

    if (isSupabaseConfigured()) {
      const { data, error } = await supabase
        .from('notifications')
        .insert({
          ...notification,
          is_read: false,
        })
        .select()
        .single();
      if (error || !data) throw new Error(error?.message || 'Failed to dispatch notification');
      return data;
    } else {
      const newNotif: StoreNotification = {
        ...notification,
        id,
        is_read: false,
        created_at: now,
      };
      inMemoryDb.notifications.unshift(newNotif);
      inMemoryDb.notify();
      return newNotif;
    }
  },

  // Subscribe to realtime notification updates
  subscribeToNotifications(onNotification: (notif: StoreNotification) => void): () => void {
    if (isSupabaseConfigured()) {
      const channel = supabase
        .channel('public:notifications')
        .on(
          'postgres_changes',
          { event: 'INSERT', schema: 'public', table: 'notifications' },
          payload => {
            onNotification(payload.new as StoreNotification);
          }
        )
        .subscribe();

      return () => {
        supabase.removeChannel(channel);
      };
    } else {
      return inMemoryDb.subscribe(() => {
        // Look at latest notification
        if (inMemoryDb.notifications.length > 0) {
          onNotification(inMemoryDb.notifications[0]);
        }
      });
    }
  },
};
