import { isSupabaseConfigured, supabase } from '../lib/supabase';
import { inMemoryDb } from './dbStore';
import { Address, Profile, Order } from '../types';

export interface CustomerSummary extends Profile {
  orders_count: number;
  total_spent: number;
  last_order_date?: string;
}

export const customerService = {
  // Get addresses for authenticated customer
  async getAddresses(userId: string): Promise<Address[]> {
    if (isSupabaseConfigured()) {
      const { data, error } = await supabase
        .from('addresses')
        .select('*')
        .eq('user_id', userId)
        .order('is_default', { ascending: false });

      if (error) throw new Error(error.message);
      return data || [];
    } else {
      return inMemoryDb.addresses.filter(a => a.user_id === userId);
    }
  },

  // Add address
  async addAddress(userId: string, addressData: Omit<Address, 'id' | 'user_id' | 'created_at' | 'updated_at'>): Promise<Address> {
    const id = 'addr-' + Math.random().toString(36).substring(2, 9);
    const now = new Date().toISOString();

    if (isSupabaseConfigured()) {
      if (addressData.is_default) {
        await supabase.from('addresses').update({ is_default: false }).eq('user_id', userId);
      }
      const { data, error } = await supabase
        .from('addresses')
        .insert({
          ...addressData,
          user_id: userId,
        })
        .select()
        .single();

      if (error || !data) throw new Error(error?.message || 'Failed to save address');
      return data;
    } else {
      if (addressData.is_default) {
        inMemoryDb.addresses.forEach(a => {
          if (a.user_id === userId) a.is_default = false;
        });
      }
      const newAddress: Address = {
        ...addressData,
        id,
        user_id: userId,
        created_at: now,
        updated_at: now,
      };
      inMemoryDb.addresses.unshift(newAddress);
      inMemoryDb.notify();
      return newAddress;
    }
  },

  // Update address
  async updateAddress(id: string, userId: string, updates: Partial<Address>): Promise<Address> {
    const now = new Date().toISOString();

    if (isSupabaseConfigured()) {
      if (updates.is_default) {
        await supabase.from('addresses').update({ is_default: false }).eq('user_id', userId);
      }
      const { data, error } = await supabase
        .from('addresses')
        .update({
          ...updates,
          updated_at: now,
        })
        .eq('id', id)
        .eq('user_id', userId)
        .select()
        .single();

      if (error || !data) throw new Error(error?.message || 'Failed to update address');
      return data;
    } else {
      const idx = inMemoryDb.addresses.findIndex(a => a.id === id && a.user_id === userId);
      if (idx === -1) throw new Error('Address not found');

      if (updates.is_default) {
        inMemoryDb.addresses.forEach(a => {
          if (a.user_id === userId) a.is_default = false;
        });
      }

      inMemoryDb.addresses[idx] = {
        ...inMemoryDb.addresses[idx],
        ...updates,
        updated_at: now,
      };
      inMemoryDb.notify();
      return inMemoryDb.addresses[idx];
    }
  },

  // Delete address
  async deleteAddress(id: string, userId: string): Promise<void> {
    if (isSupabaseConfigured()) {
      const { error } = await supabase.from('addresses').delete().eq('id', id).eq('user_id', userId);
      if (error) throw new Error(error.message);
    } else {
      inMemoryDb.addresses = inMemoryDb.addresses.filter(a => !(a.id === id && a.user_id === userId));
      inMemoryDb.notify();
    }
  },

  // Admin: Get all customers with spending & order metrics
  async getCustomers(): Promise<CustomerSummary[]> {
    if (isSupabaseConfigured()) {
      const { data: profiles, error } = await supabase.from('profiles').select('*').eq('role', 'customer');
      if (error) throw new Error(error.message);

      const { data: orders } = await supabase.from('orders').select('customer_id, total, created_at');

      return (profiles || []).map(p => {
        const customerOrders = (orders || []).filter(o => o.customer_id === p.id);
        const total_spent = customerOrders.reduce((acc, curr) => acc + Number(curr.total || 0), 0);
        return {
          ...p,
          orders_count: customerOrders.length,
          total_spent,
          last_order_date: customerOrders[0]?.created_at,
        };
      });
    } else {
      const customerProfiles = inMemoryDb.profiles.filter(p => p.role === 'customer');
      return customerProfiles.map(p => {
        const customerOrders = inMemoryDb.orders.filter(o => o.customer_id === p.id);
        const total_spent = customerOrders.reduce((acc, curr) => acc + curr.total, 0);
        return {
          ...p,
          orders_count: customerOrders.length,
          total_spent,
          last_order_date: customerOrders[0]?.created_at,
        };
      });
    }
  },

  // Admin: Get single customer details with order history
  async getCustomerDetails(customerId: string): Promise<{ profile: Profile; orders: Order[] }> {
    if (isSupabaseConfigured()) {
      const { data: profile, error } = await supabase.from('profiles').select('*').eq('id', customerId).single();
      if (error || !profile) throw new Error('Customer not found');

      const { data: orders } = await supabase
        .from('orders')
        .select('*, order_items(*)')
        .eq('customer_id', customerId)
        .order('created_at', { ascending: false });

      return {
        profile,
        orders: (orders || []).map((o: any) => ({ ...o, items: o.order_items })),
      };
    } else {
      const profile = inMemoryDb.profiles.find(p => p.id === customerId);
      if (!profile) throw new Error('Customer not found');
      const orders = inMemoryDb.orders.filter(o => o.customer_id === customerId);
      return { profile, orders };
    }
  },
};
