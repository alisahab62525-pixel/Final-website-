import { isSupabaseConfigured, supabase } from '../lib/supabase';
import { inMemoryDb } from './dbStore';
import { Review } from '../types';

export const reviewService = {
  // Get approved reviews for a product
  async getProductReviews(productId: string): Promise<Review[]> {
    if (isSupabaseConfigured()) {
      const { data, error } = await supabase
        .from('reviews')
        .select('*, profiles(full_name)')
        .eq('product_id', productId)
        .eq('is_approved', true)
        .order('created_at', { ascending: false });

      if (error) throw new Error(error.message);
      return (data || []).map((r: any) => ({
        ...r,
        customer_name: r.profiles?.full_name || 'Customer',
      }));
    } else {
      return inMemoryDb.reviews.filter(r => r.product_id === productId && r.is_approved);
    }
  },

  // Submit a customer review
  async submitReview(data: {
    productId: string;
    customerId: string;
    customerName: string;
    rating: number;
    comment: string;
  }): Promise<Review> {
    const id = 'rev-' + Math.random().toString(36).substring(2, 9);
    const now = new Date().toISOString();

    if (isSupabaseConfigured()) {
      const { data: inserted, error } = await supabase
        .from('reviews')
        .insert({
          product_id: data.productId,
          customer_id: data.customerId,
          rating: data.rating,
          comment: data.comment,
          is_approved: true, // auto approve or admin moderation
        })
        .select()
        .single();

      if (error || !inserted) throw new Error(error?.message || 'Failed to submit review');
      return { ...inserted, customer_name: data.customerName };
    } else {
      const newReview: Review = {
        id,
        product_id: data.productId,
        customer_id: data.customerId,
        customer_name: data.customerName,
        rating: data.rating,
        comment: data.comment,
        is_approved: true,
        created_at: now,
        updated_at: now,
      };

      inMemoryDb.reviews.unshift(newReview);

      // Update product rating and review_count
      const prod = inMemoryDb.products.find(p => p.id === data.productId);
      if (prod) {
        const prodReviews = inMemoryDb.reviews.filter(r => r.product_id === data.productId && r.is_approved);
        const sum = prodReviews.reduce((acc, r) => acc + r.rating, 0);
        prod.review_count = prodReviews.length;
        prod.rating = Number((sum / prodReviews.length).toFixed(1));
      }

      inMemoryDb.notify();
      return newReview;
    }
  },

  // Admin: Get all reviews (including pending / hidden)
  async getAllReviews(): Promise<Review[]> {
    if (isSupabaseConfigured()) {
      const { data, error } = await supabase
        .from('reviews')
        .select('*, profiles(full_name), products(name)')
        .order('created_at', { ascending: false });

      if (error) throw new Error(error.message);
      return (data || []).map((r: any) => ({
        ...r,
        customer_name: r.profiles?.full_name || 'Customer',
      }));
    } else {
      return [...inMemoryDb.reviews];
    }
  },

  // Admin: Toggle approval status
  async toggleApproval(id: string, isApproved: boolean): Promise<void> {
    if (isSupabaseConfigured()) {
      await supabase.from('reviews').update({ is_approved: isApproved }).eq('id', id);
    } else {
      const r = inMemoryDb.reviews.find(item => item.id === id);
      if (r) {
        r.is_approved = isApproved;
        inMemoryDb.notify();
      }
    }
  },

  // Admin: Delete review
  async deleteReview(id: string): Promise<void> {
    if (isSupabaseConfigured()) {
      await supabase.from('reviews').delete().eq('id', id);
    } else {
      inMemoryDb.reviews = inMemoryDb.reviews.filter(r => r.id !== id);
      inMemoryDb.notify();
    }
  },
};
