import React, { useEffect, useState } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { Search as SearchIcon } from 'lucide-react';
import { productService } from '../../services/productService';
import { ProductCard } from '../../components/customer/ProductCard';
import { Product } from '../../types';

export const SearchPage: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const query = searchParams.get('q') || '';
  const [searchTerm, setSearchTerm] = useState(query);
  const [results, setResults] = useState<Product[]>([]);
  const [loading, setLoading] = useState<boolean>(false);

  useEffect(() => {
    if (query.trim()) {
      setLoading(true);
      productService.getProducts({ search: query.trim() }).then(res => {
        setResults(res.products);
        setLoading(false);
      });
    } else {
      setResults([]);
    }
  }, [query]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchTerm.trim()) {
      setSearchParams({ q: searchTerm.trim() });
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-8">
      <div className="max-w-2xl mx-auto text-center space-y-4">
        <h1 className="text-3xl font-bold tracking-tight text-neutral-900 dark:text-white font-display">
          Search the Store
        </h1>
        <form onSubmit={handleSubmit} className="flex gap-2">
          <div className="relative flex-1">
            <input
              type="text"
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              placeholder="Search by product name, category, brand, or SKU..."
              className="w-full pl-10 pr-4 py-3 text-xs sm:text-sm rounded-xl border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-800 text-neutral-900 dark:text-white focus:outline-none shadow-xs"
            />
            <SearchIcon className="w-4 h-4 text-neutral-400 absolute left-3.5 top-3.5" />
          </div>
          <button
            type="submit"
            className="px-6 py-3 text-xs font-semibold rounded-xl bg-neutral-900 text-white dark:bg-white dark:text-neutral-900 hover:opacity-90"
          >
            Search
          </button>
        </form>
      </div>

      <div>
        {query && (
          <div className="mb-6 flex items-center justify-between text-xs text-neutral-500">
            <span>Results for "{query}": {results.length} found</span>
            <Link to="/shop" className="underline hover:text-neutral-900 dark:hover:text-white">
              Browse full catalog
            </Link>
          </div>
        )}

        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {[1, 2, 3, 4].map(n => (
              <div key={n} className="h-72 rounded-xl bg-neutral-200 dark:bg-neutral-800 animate-pulse" />
            ))}
          </div>
        ) : results.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {results.map(p => (
              <ProductCard key={p.id} product={p} />
            ))}
          </div>
        ) : query ? (
          <div className="p-12 text-center border border-dashed border-neutral-300 dark:border-neutral-700 rounded-2xl">
            <p className="text-sm font-semibold text-neutral-800 dark:text-neutral-200">No items found</p>
            <p className="text-xs text-neutral-500 mt-1">Try another keyword or search term.</p>
          </div>
        ) : null}
      </div>
    </div>
  );
};
