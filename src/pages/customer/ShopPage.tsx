import React, { useState, useEffect, useMemo } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Filter, X, SlidersHorizontal } from 'lucide-react';
import { ProductCard } from '../../components/customer/ProductCard';
import { productService } from '../../services/productService';
import { categoryService } from '../../services/categoryService';
import { Product, Category } from '../../types';

export const ShopPage: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [mobileFilterOpen, setMobileFilterOpen] = useState<boolean>(false);

  // Filter params from URL or state
  const currentCategorySlug = searchParams.get('category') || '';
  const currentSearch = searchParams.get('search') || '';
  const currentSort = (searchParams.get('sort') as any) || 'featured';
  const inStockOnly = searchParams.get('inStock') === 'true';
  const onSaleOnly = searchParams.get('onSale') === 'true';
  const minPriceParam = searchParams.get('minPrice');
  const maxPriceParam = searchParams.get('maxPrice');

  const [minPrice, setMinPrice] = useState<string>(minPriceParam || '');
  const [maxPrice, setMaxPrice] = useState<string>(maxPriceParam || '');

  useEffect(() => {
    categoryService.getCategories(true).then(setCategories);
  }, []);

  useEffect(() => {
    async function fetchProducts() {
      setLoading(true);
      try {
        const res = await productService.getProducts({
          categorySlug: currentCategorySlug || undefined,
          search: currentSearch || undefined,
          sortBy: currentSort,
          inStockOnly,
          onSaleOnly,
          minPrice: minPriceParam ? Number(minPriceParam) : undefined,
          maxPrice: maxPriceParam ? Number(maxPriceParam) : undefined,
        });
        setProducts(res.products);
      } catch (err) {
        console.error('Failed to query products', err);
      } finally {
        setLoading(false);
      }
    }
    fetchProducts();
  }, [currentCategorySlug, currentSearch, currentSort, inStockOnly, onSaleOnly, minPriceParam, maxPriceParam]);

  const updateParam = (key: string, value: string | null) => {
    const next = new URLSearchParams(searchParams);
    if (value === null || value === '') {
      next.delete(key);
    } else {
      next.set(key, value);
    }
    setSearchParams(next);
  };

  const handlePriceApply = (e: React.FormEvent) => {
    e.preventDefault();
    const next = new URLSearchParams(searchParams);
    if (minPrice) next.set('minPrice', minPrice);
    else next.delete('minPrice');
    if (maxPrice) next.set('maxPrice', maxPrice);
    else next.delete('maxPrice');
    setSearchParams(next);
  };

  const resetFilters = () => {
    setSearchParams(new URLSearchParams());
    setMinPrice('');
    setMaxPrice('');
  };

  const activeFiltersCount = useMemo(() => {
    let count = 0;
    if (currentCategorySlug) count++;
    if (currentSearch) count++;
    if (inStockOnly) count++;
    if (onSaleOnly) count++;
    if (minPriceParam || maxPriceParam) count++;
    return count;
  }, [currentCategorySlug, currentSearch, inStockOnly, onSaleOnly, minPriceParam, maxPriceParam]);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
      
      {/* Page Title & Sort Bar */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 pb-6 border-b border-neutral-200 dark:border-neutral-800">
        <div>
          <span className="text-xs uppercase tracking-wider text-neutral-500 font-medium">Store Catalog</span>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-neutral-900 dark:text-white font-display mt-1">
            {currentSearch ? `Search results for "${currentSearch}"` : 'All Products'}
          </h1>
          <p className="text-xs text-neutral-500 dark:text-neutral-400 mt-1">
            Showing {products.length} {products.length === 1 ? 'item' : 'items'}
          </p>
        </div>

        {/* Controls */}
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => setMobileFilterOpen(true)}
            className="md:hidden px-3.5 py-2 text-xs font-medium rounded-lg border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-800 text-neutral-900 dark:text-white flex items-center gap-2"
          >
            <SlidersHorizontal className="w-4 h-4" />
            <span>Filters {activeFiltersCount > 0 ? `(${activeFiltersCount})` : ''}</span>
          </button>

          {/* Sort dropdown */}
          <div className="flex items-center gap-2">
            <label htmlFor="shop-sort" className="text-xs text-neutral-500 shrink-0 hidden sm:inline">
              Sort by:
            </label>
            <select
              id="shop-sort"
              value={currentSort}
              onChange={e => updateParam('sort', e.target.value)}
              className="px-3 py-2 text-xs font-medium rounded-lg border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-800 text-neutral-900 dark:text-white focus:outline-none"
            >
              <option value="featured">Featured First</option>
              <option value="newest">Newest Arrivals</option>
              <option value="price-asc">Price: Low to High</option>
              <option value="price-desc">Price: High to Low</option>
              <option value="popular">Most Popular</option>
              <option value="rating">Highest Rated</option>
            </select>
          </div>
        </div>
      </div>

      {/* Main Grid + Sidebar Container */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-8 pt-8">
        
        {/* Desktop Sidebar Filters */}
        <aside className="hidden md:block space-y-6">
          <div className="flex items-center justify-between pb-3 border-b border-neutral-200 dark:border-neutral-800">
            <span className="text-xs font-bold uppercase tracking-wider text-neutral-900 dark:text-white">Filters</span>
            {activeFiltersCount > 0 && (
              <button
                type="button"
                onClick={resetFilters}
                className="text-xs text-neutral-500 hover:text-neutral-900 dark:hover:text-white underline"
              >
                Clear all ({activeFiltersCount})
              </button>
            )}
          </div>

          {/* Categories Filter */}
          <div>
            <h4 className="text-xs font-semibold text-neutral-900 dark:text-white mb-3">Categories</h4>
            <div className="space-y-1 text-xs">
              <button
                type="button"
                onClick={() => updateParam('category', null)}
                className={`block w-full text-left py-1.5 px-2 rounded-md transition-colors ${
                  !currentCategorySlug
                    ? 'font-bold bg-neutral-100 dark:bg-neutral-800 text-neutral-900 dark:text-white'
                    : 'text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-white'
                }`}
              >
                All Departments
              </button>
              {categories.map(c => (
                <button
                  key={c.id}
                  type="button"
                  onClick={() => updateParam('category', c.slug)}
                  className={`block w-full text-left py-1.5 px-2 rounded-md transition-colors ${
                    currentCategorySlug === c.slug
                      ? 'font-bold bg-neutral-100 dark:bg-neutral-800 text-neutral-900 dark:text-white'
                      : 'text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-white'
                  }`}
                >
                  {c.name}
                </button>
              ))}
            </div>
          </div>

          {/* Availability & Deals */}
          <div className="pt-4 border-t border-neutral-200 dark:border-neutral-800 space-y-2">
            <h4 className="text-xs font-semibold text-neutral-900 dark:text-white mb-2">Availability & Offers</h4>
            <label className="flex items-center gap-2 text-xs text-neutral-700 dark:text-neutral-300 cursor-pointer">
              <input
                type="checkbox"
                checked={inStockOnly}
                onChange={e => updateParam('inStock', e.target.checked ? 'true' : null)}
                className="rounded border-neutral-300 dark:border-neutral-700 text-neutral-900 focus:ring-0"
              />
              <span>In Stock Only</span>
            </label>
            <label className="flex items-center gap-2 text-xs text-neutral-700 dark:text-neutral-300 cursor-pointer">
              <input
                type="checkbox"
                checked={onSaleOnly}
                onChange={e => updateParam('onSale', e.target.checked ? 'true' : null)}
                className="rounded border-neutral-300 dark:border-neutral-700 text-neutral-900 focus:ring-0"
              />
              <span>Discounted Items Only</span>
            </label>
          </div>

          {/* Price Range */}
          <div className="pt-4 border-t border-neutral-200 dark:border-neutral-800">
            <h4 className="text-xs font-semibold text-neutral-900 dark:text-white mb-3">Price Range (Rs.)</h4>
            <form onSubmit={handlePriceApply} className="space-y-2">
              <div className="grid grid-cols-2 gap-2">
                <input
                  type="number"
                  placeholder="Min"
                  value={minPrice}
                  onChange={e => setMinPrice(e.target.value)}
                  className="w-full px-2 py-1.5 text-xs rounded border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-800 font-mono"
                />
                <input
                  type="number"
                  placeholder="Max"
                  value={maxPrice}
                  onChange={e => setMaxPrice(e.target.value)}
                  className="w-full px-2 py-1.5 text-xs rounded border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-800 font-mono"
                />
              </div>
              <button
                type="submit"
                className="w-full py-1.5 text-xs font-medium bg-neutral-900 dark:bg-white text-white dark:text-neutral-900 rounded hover:opacity-90 transition-opacity"
              >
                Apply Price
              </button>
            </form>
          </div>
        </aside>

        {/* Product Grid Area */}
        <div className="md:col-span-3">
          {loading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {[1, 2, 3, 4, 5, 6].map(n => (
                <div key={n} className="h-80 rounded-xl bg-neutral-200 dark:bg-neutral-800 animate-pulse" />
              ))}
            </div>
          ) : products.length === 0 ? (
            <div className="p-12 text-center border border-dashed border-neutral-300 dark:border-neutral-700 rounded-xl">
              <p className="text-sm font-semibold text-neutral-800 dark:text-neutral-200">No products match your criteria</p>
              <p className="text-xs text-neutral-500 mt-1">Try modifying your category or price filters.</p>
              <button
                type="button"
                onClick={resetFilters}
                className="mt-4 px-4 py-2 text-xs font-medium rounded-lg bg-neutral-900 text-white dark:bg-white dark:text-neutral-900"
              >
                Reset All Filters
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {products.map(p => (
                <ProductCard key={p.id} product={p} />
              ))}
            </div>
          )}
        </div>

      </div>

      {/* Mobile Filter Modal */}
      {mobileFilterOpen && (
        <div className="fixed inset-0 z-50 bg-black/50 md:hidden flex justify-end">
          <div className="w-80 bg-white dark:bg-neutral-900 h-full p-6 overflow-y-auto space-y-6">
            <div className="flex items-center justify-between pb-4 border-b border-neutral-200 dark:border-neutral-800">
              <span className="text-sm font-bold text-neutral-900 dark:text-white">Filters</span>
              <button onClick={() => setMobileFilterOpen(false)} className="p-1 text-neutral-500">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div>
              <h4 className="text-xs font-semibold text-neutral-900 dark:text-white mb-2">Categories</h4>
              <div className="space-y-1 text-xs">
                <button
                  type="button"
                  onClick={() => {
                    updateParam('category', null);
                    setMobileFilterOpen(false);
                  }}
                  className="block w-full text-left py-1 text-neutral-600 dark:text-neutral-400"
                >
                  All
                </button>
                {categories.map(c => (
                  <button
                    key={c.id}
                    type="button"
                    onClick={() => {
                      updateParam('category', c.slug);
                      setMobileFilterOpen(false);
                    }}
                    className={`block w-full text-left py-1 ${
                      currentCategorySlug === c.slug ? 'font-bold text-neutral-900 dark:text-white' : 'text-neutral-600 dark:text-neutral-400'
                    }`}
                  >
                    {c.name}
                  </button>
                ))}
              </div>
            </div>

            <button
              onClick={() => {
                resetFilters();
                setMobileFilterOpen(false);
              }}
              className="w-full py-2 text-xs font-medium border border-neutral-300 dark:border-neutral-700 rounded-lg"
            >
              Reset Filters
            </button>
          </div>
        </div>
      )}

    </div>
  );
};
