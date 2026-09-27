import { isSupabaseConfigured, supabase } from '../lib/supabase';
import { inMemoryDb } from './dbStore';
import { Coupon } from '../types';

export interface CouponValidationResult {
  isValid: boolean;
  message?: string;
  coupon?: Coupon;
  calculatedDiscount: number;
}

export const couponService = {
  // Validate coupon against subtotal
  async validateCoupon(code: string, subtotal: number): Promise<CouponValidationResult> {
    const cleanCode = code.trim().toUpperCase();
    if (!cleanCode) {
      return { isValid: false, message: 'Please enter a coupon code.', calculatedDiscount: 0 };
    }

    let coupon: Coupon | undefined;

    if (isSupabaseConfigured()) {
      const { data, error } = await supabase
        .from('coupons')
        .select('*')
        .ilike('code', cleanCode)
        .eq('is_active', true)
        .single();

      if (error || !data) {
        return { isValid: false, message: 'Invalid or expired coupon code.', calculatedDiscount: 0 };
      }
      coupon = data;
    } else {
      coupon = inMemoryDb.coupons.find(c => c.code.toUpperCase() === cleanCode && c.is_active);
    }

    if (!coupon) {
      return { isValid: false, message: 'Coupon code not found.', calculatedDiscount: 0 };
    }

    // Check expiry
    if (new Date(coupon.expires_at).getTime() < Date.now()) {
      return { isValid: false, message: 'This coupon has expired.', calculatedDiscount: 0 };
    }

    // Check usage limit
    if (coupon.used_count >= coupon.usage_limit) {
      return { isValid: false, message: 'This coupon usage limit has been reached.', calculatedDiscount: 0 };
    }

    // Check minimum order amount
    if (subtotal < coupon.minimum_order_amount) {
      return {
        isValid: false,
        message: `Minimum order amount of Rs. ${coupon.minimum_order_amount.toLocaleString()} required for this coupon.`,
        calculatedDiscount: 0,
      };
    }

    // Calculate secure discount
    let discount = 0;
    if (coupon.discount_type === 'percentage') {
      discount = Math.round((subtotal * coupon.discount_value) / 100);
      if (coupon.maximum_discount && discount > coupon.maximum_discount) {
        discount = coupon.maximum_discount;
      }
    } else {
      discount = Math.min(coupon.discount_value, subtotal);
    }

    return {
      isValid: true,
      message: `Coupon applied: Rs. ${discount.toLocaleString()} savings!`,
      coupon,
      calculatedDiscount: discount,
    };
  },

  // Admin: Get all coupons
  async getCoupons(): Promise<Coupon[]> {
    if (isSupabaseConfigured()) {
      const { data, error } = await supabase.from('coupons').select('*').order('created_at', { ascending: false });
      if (error) throw new Error(error.message);
      return data || [];
    } else {
      return [...inMemoryDb.coupons];
    }
  },

  // Admin: Create coupon
  async createCoupon(data: Omit<Coupon, 'id' | 'used_count' | 'created_at' | 'updated_at'>): Promise<Coupon> {
    const id = 'coup-' + Math.random().toString(36).substring(2, 9);
    const now = new Date().toISOString();

    const payload = {
      ...data,
      code: data.code.trim().toUpperCase(),
      used_count: 0,
    };

    if (isSupabaseConfigured()) {
      const { data: newCoupon, error } = await supabase.from('coupons').insert(payload).select().single();
      if (error || !newCoupon) throw new Error(error?.message || 'Failed to create coupon');
      return newCoupon;
    } else {
      const existing = inMemoryDb.coupons.find(c => c.code === payload.code);
      if (existing) throw new Error('A coupon with this code already exists.');

      const newCoupon: Coupon = {
        ...payload,
        id,
        created_at: now,
        updated_at: now,
      };
      inMemoryDb.coupons.unshift(newCoupon);
      inMemoryDb.notify();
      return newCoupon;
    }
  },

  // Admin: Update coupon
  async updateCoupon(id: string, updates: Partial<Coupon>): Promise<Coupon> {
    const now = new Date().toISOString();
    if (updates.code) {
      updates.code = updates.code.trim().toUpperCase();
    }

    if (isSupabaseConfigured()) {
      const { data, error } = await supabase.from('coupons').update({ ...updates, updated_at: now }).eq('id', id).select().single();
      if (error || !data) throw new Error(error?.message || 'Failed to update coupon');
      return data;
    } else {
      const idx = inMemoryDb.coupons.findIndex(c => c.id === id);
      if (idx === -1) throw new Error('Coupon not found');
      inMemoryDb.coupons[idx] = {
        ...inMemoryDb.coupons[idx],
        ...updates,
        updated_at: now,
      };
      inMemoryDb.notify();
      return inMemoryDb.coupons[idx];
    }
  },

  // Admin: Delete coupon
  async deleteCoupon(id: string): Promise<void> {
    if (isSupabaseConfigured()) {
      const { error } = await supabase.from('coupons').delete().eq('id', id);
      if (error) throw new Error(error.message);
    } else {
      inMemoryDb.coupons = inMemoryDb.coupons.filter(c => c.id !== id);
      inMemoryDb.notify();
    }
  },
};
