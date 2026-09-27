import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Plus, Search, Edit2, Trash2, CheckCircle2, XCircle, Package } from 'lucide-react';
import { productService } from '../../services/productService';
import { useToast } from '../../contexts/ToastContext';
import { Product } from '../../types';

export const AdminProductsPage: React.FC = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [search, setSearch] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(true);
  const { success, error } = useToast();

  const loadProducts = async () => {
    setLoading(true);
    try {
      const res = await productService.getProducts({
        includeInactive: true,
        search: search || undefined,
        limit: 100,
      });
      setProducts(res.products);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadProducts();
  }, [search]);

  const handleDelete = async (id: string, name: string) => {
    if (!window.confirm(`Are you sure you want to permanently delete "${name}"?`)) return;
    try {
      await productService.deleteProduct(id);
      success(`Product "${name}" deleted.`);
      loadProducts();
    } catch (err: any) {
      error(err.message || 'Failed to delete product');
    }
  };

  const handleToggleActive = async (product: Product) => {
    try {
      await productService.updateProduct(product.id, { is_active: !product.is_active });
      success(`Product "${product.name}" is now ${!product.is_active ? 'active' : 'inactive'}.`);
      loadProducts();
    } catch (err: any) {
      error(err.message || 'Failed to update product state');
    }
  };

  return (
    <div className="space-y-6">
      
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-neutral-200 dark:border-neutral-800">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-neutral-900 dark:text-white font-display">
            Product Catalog Management
          </h1>
          <p className="text-xs text-neutral-500 mt-1">
            Maintain catalog items, pricing, discounts, stock levels, and flags.
          </p>
        </div>

        <Link
          to="/admin/products/new"
          className="px-4 py-2 text-xs font-semibold rounded-xl bg-neutral-900 text-white dark:bg-white dark:text-neutral-900 hover:opacity-90 inline-flex items-center gap-1.5 self-start sm:self-auto shadow-sm"
        >
          <Plus className="w-3.5 h-3.5" />
          <span>Create Product</span>
        </Link>
      </div>

      {/* Search Bar */}
      <div className="flex items-center justify-between gap-4">
        <div className="relative w-full sm:w-80">
          <input
            type="text"
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Search by title, SKU, brand..."
            className="w-full pl-9 pr-3 py-2 text-xs rounded-xl border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-800 text-neutral-900 dark:text-white focus:outline-none"
          />
          <Search className="w-4 h-4 text-neutral-400 absolute left-3 top-2.5" />
        </div>
        <span className="text-xs text-neutral-500">
          {products.length} products listed
        </span>
      </div>

      {/* Table */}
      <div className="p-6 rounded-2xl bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 overflow-x-auto">
        {loading ? (
          <div className="p-8 text-center text-xs text-neutral-500">Loading products...</div>
        ) : products.length === 0 ? (
          <div className="p-12 text-center text-xs text-neutral-500">No products found.</div>
        ) : (
          <table className="w-full text-left text-xs">
            <thead className="border-b border-neutral-200 dark:border-neutral-800 text-neutral-400 uppercase text-[10px] tracking-wider">
              <tr>
                <th className="py-3 px-3">Product</th>
                <th className="py-3 px-3">SKU & Category</th>
                <th className="py-3 px-3">Price & Promo</th>
                <th className="py-3 px-3">Stock</th>
                <th className="py-3 px-3">Badges</th>
                <th className="py-3 px-3">Status</th>
                <th className="py-3 px-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-100 dark:divide-neutral-800 font-sans">
              {products.map(p => {
                const img = p.images?.[0]?.image_url || '/src/assets/images/hero_ali_store_showcase_1790526590148.jpg';
                return (
                  <tr key={p.id} className="hover:bg-neutral-50 dark:hover:bg-neutral-850/40 transition-colors">
                    <td className="py-3 px-3">
                      <div className="flex items-center gap-3">
                        <img src={img} alt="" className="w-10 h-10 rounded-lg object-cover bg-neutral-100 shrink-0" />
                        <div>
                          <p className="font-semibold text-neutral-900 dark:text-white line-clamp-1">{p.name}</p>
                          <p className="text-[11px] text-neutral-500">{p.brand}</p>
                        </div>
                      </div>
                    </td>

                    <td className="py-3 px-3">
                      <p className="font-mono text-xs">{p.sku}</p>
                      <p className="text-[11px] text-neutral-500">{p.category?.name || '-'}</p>
                    </td>

                    <td className="py-3 px-3 font-mono">
                      <p className="font-bold text-neutral-900 dark:text-white tabular-nums">
                        Rs. {(p.discount_price ?? p.price).toLocaleString()}
                      </p>
                      {p.discount_price && (
                        <p className="text-[10px] text-neutral-400 line-through tabular-nums">
                          Rs. {p.price.toLocaleString()}
                        </p>
                      )}
                    </td>

                    <td className="py-3 px-3 font-mono">
                      <span className={`font-semibold ${p.stock_quantity <= p.low_stock_threshold ? 'text-amber-500' : 'text-neutral-900 dark:text-white'}`}>
                        {p.stock_quantity} units
                      </span>
                    </td>

                    <td className="py-3 px-3 space-x-1">
                      {p.is_featured && <span className="text-[9px] px-1.5 py-0.5 rounded bg-neutral-100 dark:bg-neutral-800 font-bold uppercase">Featured</span>}
                      {p.is_best_seller && <span className="text-[9px] px-1.5 py-0.5 rounded bg-neutral-100 dark:bg-neutral-800 font-bold uppercase">Best</span>}
                    </td>

                    <td className="py-3 px-3">
                      <button
                        type="button"
                        onClick={() => handleToggleActive(p)}
                        className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase ${
                          p.is_active
                            ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300'
                            : 'bg-neutral-200 text-neutral-600 dark:bg-neutral-800 dark:text-neutral-400'
                        }`}
                      >
                        {p.is_active ? 'Active' : 'Hidden'}
                      </button>
                    </td>

                    <td className="py-3 px-3 text-right space-x-1">
                      <Link
                        to={`/admin/products/${p.id}/edit`}
                        className="p-1.5 text-neutral-500 hover:text-neutral-900 dark:hover:text-white inline-block rounded hover:bg-neutral-100 dark:hover:bg-neutral-800"
                        title="Edit product"
                      >
                        <Edit2 className="w-4 h-4" />
                      </Link>
                      <button
                        type="button"
                        onClick={() => handleDelete(p.id, p.name)}
                        className="p-1.5 text-neutral-400 hover:text-rose-500 inline-block rounded hover:bg-neutral-100 dark:hover:bg-neutral-800"
                        title="Delete product"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </div>

    </div>
  );
};
