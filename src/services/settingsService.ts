import { isSupabaseConfigured, supabase } from '../lib/supabase';
import { inMemoryDb } from './dbStore';
import { StoreSettings } from '../types';

export const settingsService = {
  async getSettings(): Promise<StoreSettings> {
    if (isSupabaseConfigured()) {
      const { data, error } = await supabase.from('store_settings').select('*').limit(1).single();
      if (error || !data) {
        return inMemoryDb.settings;
      }
      return data;
    } else {
      return { ...inMemoryDb.settings };
    }
  },

  async updateSettings(updates: Partial<StoreSettings>): Promise<StoreSettings> {
    const now = new Date().toISOString();

    if (isSupabaseConfigured()) {
      const current = await this.getSettings();
      const { data, error } = await supabase
        .from('store_settings')
        .update({
          ...updates,
          updated_at: now,
        })
        .eq('id', current.id)
        .select()
        .single();

      if (error || !data) throw new Error(error?.message || 'Failed to update store settings');
      return data;
    } else {
      inMemoryDb.settings = {
        ...inMemoryDb.settings,
        ...updates,
        updated_at: now,
      };
      inMemoryDb.notify();
      return { ...inMemoryDb.settings };
    }
  },
};
