import { isSupabaseConfigured, supabase } from '../lib/supabase';
import { inMemoryDb } from './dbStore';
import { Category } from '../types';

export const categoryService = {
  async getCategories(onlyActive = true): Promise<Category[]> {
    if (isSupabaseConfigured()) {
      let query = supabase.from('categories').select('*').order('name');
      if (onlyActive) {
        query = query.eq('is_active', true);
      }
      const { data, error } = await query;
      if (error) throw new Error(error.message);
      return data || [];
    } else {
      if (onlyActive) {
        return inMemoryDb.categories.filter(c => c.is_active);
      }
      return [...inMemoryDb.categories];
    }
  },

  async getCategoryBySlug(slug: string): Promise<Category | null> {
    if (isSupabaseConfigured()) {
      const { data, error } = await supabase
        .from('categories')
        .select('*')
        .eq('slug', slug)
        .single();
      if (error || !data) return null;
      return data;
    } else {
      return inMemoryDb.categories.find(c => c.slug === slug) || null;
    }
  },

  async createCategory(categoryData: Omit<Category, 'id' | 'created_at' | 'updated_at'>): Promise<Category> {
    const id = 'cat-' + Math.random().toString(36).substring(2, 9);
    const now = new Date().toISOString();

    if (isSupabaseConfigured()) {
      const { data, error } = await supabase
        .from('categories')
        .insert({
          ...categoryData,
        })
        .select()
        .single();

      if (error || !data) throw new Error(error?.message || 'Failed to create category');
      return data;
    } else {
      const newCat: Category = {
        ...categoryData,
        id,
        created_at: now,
        updated_at: now,
      };
      inMemoryDb.categories.push(newCat);
      inMemoryDb.notify();
      return newCat;
    }
  },

  async updateCategory(id: string, updates: Partial<Category>): Promise<Category> {
    const now = new Date().toISOString();

    if (isSupabaseConfigured()) {
      const { data, error } = await supabase
        .from('categories')
        .update({
          ...updates,
          updated_at: now,
        })
        .eq('id', id)
        .select()
        .single();

      if (error || !data) throw new Error(error?.message || 'Failed to update category');
      return data;
    } else {
      const index = inMemoryDb.categories.findIndex(c => c.id === id);
      if (index === -1) throw new Error('Category not found');

      inMemoryDb.categories[index] = {
        ...inMemoryDb.categories[index],
        ...updates,
        updated_at: now,
      };
      inMemoryDb.notify();
      return inMemoryDb.categories[index];
    }
  },

  async deleteCategory(id: string): Promise<void> {
    if (isSupabaseConfigured()) {
      const { error } = await supabase.from('categories').delete().eq('id', id);
      if (error) throw new Error(error.message);
    } else {
      inMemoryDb.categories = inMemoryDb.categories.filter(c => c.id !== id);
      inMemoryDb.notify();
    }
  },
};
