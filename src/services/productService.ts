import { isSupabaseConfigured, supabase } from '../lib/supabase';
import { inMemoryDb } from './dbStore';
import { Product, ProductImage } from '../types';

export interface ProductFilterOptions {
  categorySlug?: string;
  categoryId?: string;
  search?: string;
  minPrice?: number;
  maxPrice?: number;
  rating?: number;
  inStockOnly?: boolean;
  onSaleOnly?: boolean;
  sortBy?: 'featured' | 'newest' | 'price-asc' | 'price-desc' | 'rating' | 'popular';
  includeInactive?: boolean;
  limit?: number;
  page?: number;
}

export const productService = {
  // Query products with rich filtering & sorting
  async getProducts(options: ProductFilterOptions = {}): Promise<{ products: Product[]; total: number }> {
    if (isSupabaseConfigured()) {
      let query = supabase.from('products').select('*, categories(*), product_images(*)', { count: 'exact' });

      if (!options.includeInactive) {
        query = query.eq('is_active', true);
      }
      if (options.categoryId) {
        query = query.eq('category_id', options.categoryId);
      }
      if (options.search) {
        query = query.ilike('name', `%${options.search}%`);
      }
      if (options.minPrice !== undefined) {
        query = query.gte('price', options.minPrice);
      }
      if (options.maxPrice !== undefined) {
        query = query.lte('price', options.maxPrice);
      }
      if (options.rating !== undefined) {
        query = query.gte('rating', options.rating);
      }
      if (options.inStockOnly) {
        query = query.gt('stock_quantity', 0);
      }
      if (options.onSaleOnly) {
        query = query.not('discount_price', 'is', null);
      }

      // Sort
      switch (options.sortBy) {
        case 'newest':
          query = query.order('created_at', { ascending: false });
          break;
        case 'price-asc':
          query = query.order('price', { ascending: true });
          break;
        case 'price-desc':
          query = query.order('price', { ascending: false });
          break;
        case 'rating':
          query = query.order('rating', { ascending: false });
          break;
        case 'popular':
          query = query.order('review_count', { ascending: false });
          break;
        case 'featured':
        default:
          query = query.order('is_featured', { ascending: false }).order('created_at', { ascending: false });
          break;
      }

      const page = options.page || 1;
      const limit = options.limit || 50;
      const from = (page - 1) * limit;
      const to = from + limit - 1;

      query = query.range(from, to);

      const { data, count, error } = await query;
      if (error) throw new Error(error.message);

      const formatted: Product[] = (data || []).map((row: any) => ({
        ...row,
        category: row.categories,
        images: row.product_images,
      }));

      return { products: formatted, total: count || formatted.length };
    } else {
      let filtered = [...inMemoryDb.products];

      if (!options.includeInactive) {
        filtered = filtered.filter(p => p.is_active);
      }
      if (options.categoryId) {
        filtered = filtered.filter(p => p.category_id === options.categoryId);
      }
      if (options.categorySlug) {
        const cat = inMemoryDb.categories.find(c => c.slug === options.categorySlug);
        if (cat) {
          filtered = filtered.filter(p => p.category_id === cat.id);
        }
      }
      if (options.search) {
        const q = options.search.toLowerCase();
        filtered = filtered.filter(p =>
          p.name.toLowerCase().includes(q) ||
          p.brand.toLowerCase().includes(q) ||
          p.short_description.toLowerCase().includes(q) ||
          p.sku.toLowerCase().includes(q)
        );
      }
      if (options.minPrice !== undefined) {
        filtered = filtered.filter(p => (p.discount_price ?? p.price) >= options.minPrice!);
      }
      if (options.maxPrice !== undefined) {
        filtered = filtered.filter(p => (p.discount_price ?? p.price) <= options.maxPrice!);
      }
      if (options.rating !== undefined) {
        filtered = filtered.filter(p => p.rating >= options.rating!);
      }
      if (options.inStockOnly) {
        filtered = filtered.filter(p => p.stock_quantity > 0);
      }
      if (options.onSaleOnly) {
        filtered = filtered.filter(p => p.discount_price && p.discount_price < p.price);
      }

      // Sort
      switch (options.sortBy) {
        case 'newest':
          filtered.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
          break;
        case 'price-asc':
          filtered.sort((a, b) => (a.discount_price ?? a.price) - (b.discount_price ?? b.price));
          break;
        case 'price-desc':
          filtered.sort((a, b) => (b.discount_price ?? b.price) - (a.discount_price ?? a.price));
          break;
        case 'rating':
          filtered.sort((a, b) => b.rating - a.rating);
          break;
        case 'popular':
          filtered.sort((a, b) => b.review_count - a.review_count);
          break;
        case 'featured':
        default:
          filtered.sort((a, b) => (b.is_featured ? 1 : 0) - (a.is_featured ? 1 : 0));
          break;
      }

      const total = filtered.length;
      const page = options.page || 1;
      const limit = options.limit || 50;
      const start = (page - 1) * limit;
      const paginated = filtered.slice(start, start + limit);

      const mapped = paginated.map(p => ({
        ...p,
        category: inMemoryDb.categories.find(c => c.id === p.category_id),
      }));

      return { products: mapped, total };
    }
  },

  // Get product by slug
  async getProductBySlug(slug: string): Promise<Product | null> {
    if (isSupabaseConfigured()) {
      const { data, error } = await supabase
        .from('products')
        .select('*, categories(*), product_images(*)')
        .eq('slug', slug)
        .single();

      if (error || !data) return null;
      return {
        ...data,
        category: (data as any).categories,
        images: (data as any).product_images,
      };
    } else {
      const found = inMemoryDb.products.find(p => p.slug === slug);
      if (!found) return null;
      return {
        ...found,
        category: inMemoryDb.categories.find(c => c.id === found.category_id),
      };
    }
  },

  // Get product by ID
  async getProductById(id: string): Promise<Product | null> {
    if (isSupabaseConfigured()) {
      const { data, error } = await supabase
        .from('products')
        .select('*, categories(*), product_images(*)')
        .eq('id', id)
        .single();

      if (error || !data) return null;
      return {
        ...data,
        category: (data as any).categories,
        images: (data as any).product_images,
      };
    } else {
      const found = inMemoryDb.products.find(p => p.id === id);
      if (!found) return null;
      return {
        ...found,
        category: inMemoryDb.categories.find(c => c.id === found.category_id),
      };
    }
  },

  // Admin: Create product
  async createProduct(productData: Omit<Product, 'id' | 'created_at' | 'updated_at'>, imageUrls: string[] = []): Promise<Product> {
    const id = 'prod-' + Math.random().toString(36).substring(2, 9);
    const now = new Date().toISOString();

    const productImages: ProductImage[] = imageUrls.map((url, idx) => ({
      id: 'img-' + Math.random().toString(36).substring(2, 9),
      product_id: id,
      image_url: url,
      alt_text: productData.name,
      sort_order: idx,
      created_at: now,
    }));

    if (isSupabaseConfigured()) {
      const { data: newProd, error } = await supabase
        .from('products')
        .insert({
          name: productData.name,
          slug: productData.slug,
          description: productData.description,
          short_description: productData.short_description,
          sku: productData.sku,
          brand: productData.brand,
          price: productData.price,
          discount_price: productData.discount_price,
          category_id: productData.category_id,
          stock_quantity: productData.stock_quantity,
          low_stock_threshold: productData.low_stock_threshold,
          is_active: productData.is_active,
          is_featured: productData.is_featured,
          is_best_seller: productData.is_best_seller,
          is_new_arrival: productData.is_new_arrival,
          variants: productData.variants || [],
          specifications: productData.specifications || {},
        })
        .select()
        .single();

      if (error || !newProd) throw new Error(error?.message || 'Failed to create product in Supabase');

      if (imageUrls.length > 0) {
        await supabase.from('product_images').insert(
          imageUrls.map((url, i) => ({
            product_id: newProd.id,
            image_url: url,
            alt_text: productData.name,
            sort_order: i,
          }))
        );
      }

      return newProd;
    } else {
      const newProduct: Product = {
        ...productData,
        id,
        images: productImages.length > 0 ? productImages : [
          {
            id: 'img-' + id,
            product_id: id,
            image_url: '/src/assets/images/hero_ali_store_showcase_1790526590148.jpg',
            alt_text: productData.name,
            sort_order: 0,
            created_at: now,
          }
        ],
        created_at: now,
        updated_at: now,
      };

      inMemoryDb.products.unshift(newProduct);
      inMemoryDb.notify();
      return newProduct;
    }
  },

  // Admin: Update product
  async updateProduct(id: string, updates: Partial<Product>, newImages?: string[]): Promise<Product> {
    const now = new Date().toISOString();

    if (isSupabaseConfigured()) {
      const { data, error } = await supabase
        .from('products')
        .update({
          ...updates,
          updated_at: now,
        })
        .eq('id', id)
        .select()
        .single();

      if (error || !data) throw new Error(error?.message || 'Failed to update product');

      if (newImages && newImages.length > 0) {
        await supabase.from('product_images').delete().eq('product_id', id);
        await supabase.from('product_images').insert(
          newImages.map((url, i) => ({
            product_id: id,
            image_url: url,
            alt_text: updates.name || 'Product Image',
            sort_order: i,
          }))
        );
      }

      return data;
    } else {
      const index = inMemoryDb.products.findIndex(p => p.id === id);
      if (index === -1) throw new Error('Product not found');

      const existing = inMemoryDb.products[index];
      const updated: Product = {
        ...existing,
        ...updates,
        updated_at: now,
      };

      if (newImages && newImages.length > 0) {
        updated.images = newImages.map((url, i) => ({
          id: 'img-' + Math.random().toString(36).substring(2, 9),
          product_id: id,
          image_url: url,
          alt_text: updated.name,
          sort_order: i,
          created_at: now,
        }));
      }

      inMemoryDb.products[index] = updated;
      inMemoryDb.notify();
      return updated;
    }
  },

  // Admin: Delete product
  async deleteProduct(id: string): Promise<void> {
    if (isSupabaseConfigured()) {
      const { error } = await supabase.from('products').delete().eq('id', id);
      if (error) throw new Error(error.message);
    } else {
      inMemoryDb.products = inMemoryDb.products.filter(p => p.id !== id);
      inMemoryDb.notify();
    }
  },

  // Featured products
  async getFeaturedProducts(limit = 4): Promise<Product[]> {
    const res = await this.getProducts({ sortBy: 'featured', limit });
    return res.products;
  },

  // New arrivals
  async getNewArrivals(limit = 4): Promise<Product[]> {
    const res = await this.getProducts({ sortBy: 'newest', limit });
    return res.products;
  },

  // Best sellers
  async getBestSellers(limit = 4): Promise<Product[]> {
    const res = await this.getProducts({ sortBy: 'popular', limit });
    return res.products;
  },

  // Related products
  async getRelatedProducts(productId: string, categoryId: string, limit = 4): Promise<Product[]> {
    const res = await this.getProducts({ categoryId, limit: limit + 1 });
    return res.products.filter(p => p.id !== productId).slice(0, limit);
  },
};
