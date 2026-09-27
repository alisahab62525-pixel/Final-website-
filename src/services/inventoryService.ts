import { isSupabaseConfigured, supabase } from '../lib/supabase';
import { inMemoryDb } from './dbStore';
import { Product } from '../types';
import { notificationService } from './notificationService';

export interface InventoryItem extends Product {
  status: 'in_stock' | 'low_stock' | 'out_of_stock';
}

export const inventoryService = {
  // Get inventory status for all products
  async getInventory(): Promise<InventoryItem[]> {
    let products: Product[] = [];

    if (isSupabaseConfigured()) {
      const { data, error } = await supabase.from('products').select('*').order('name');
      if (error) throw new Error(error.message);
      products = data || [];
    } else {
      products = [...inMemoryDb.products];
    }

    return products.map(p => {
      let status: 'in_stock' | 'low_stock' | 'out_of_stock' = 'in_stock';
      if (p.stock_quantity <= 0) {
        status = 'out_of_stock';
      } else if (p.stock_quantity <= p.low_stock_threshold) {
        status = 'low_stock';
      }
      return {
        ...p,
        status,
      };
    });
  },

  // Update product stock quantity
  async updateStock(productId: string, quantity: number, threshold?: number): Promise<Product> {
    const validQty = Math.max(0, quantity);
    const now = new Date().toISOString();

    if (isSupabaseConfigured()) {
      const updates: any = { stock_quantity: validQty, updated_at: now };
      if (threshold !== undefined) updates.low_stock_threshold = threshold;

      const { data, error } = await supabase
        .from('products')
        .update(updates)
        .eq('id', productId)
        .select()
        .single();

      if (error || !data) throw new Error(error?.message || 'Failed to update inventory');
      return data;
    } else {
      const prod = inMemoryDb.products.find(p => p.id === productId);
      if (!prod) throw new Error('Product not found');

      prod.stock_quantity = validQty;
      if (threshold !== undefined) prod.low_stock_threshold = threshold;
      prod.updated_at = now;

      if (prod.stock_quantity <= prod.low_stock_threshold && prod.stock_quantity > 0) {
        notificationService.createNotification({
          type: 'low_stock',
          title: 'Low Stock Alert',
          message: `Product "${prod.name}" has only ${prod.stock_quantity} left in stock.`,
        });
      }

      inMemoryDb.notify();
      return prod;
    }
  },

  // Adjust stock delta (+ or -)
  async adjustStockDelta(productId: string, delta: number): Promise<Product> {
    const prod = inMemoryDb.products.find(p => p.id === productId);
    const currentQty = prod ? prod.stock_quantity : 0;
    return this.updateStock(productId, currentQty + delta);
  },
};
