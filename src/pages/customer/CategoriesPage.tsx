import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { categoryService } from '../../services/categoryService';
import { Category } from '../../types';

export const CategoriesPage: React.FC = () => {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    categoryService.getCategories(true).then(cats => {
      setCategories(cats);
      setLoading(false);
    });
  }, []);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="mb-10 text-center max-w-2xl mx-auto">
        <span className="text-xs uppercase tracking-wider text-neutral-500 font-medium">Departments</span>
        <h1 className="text-3xl font-bold tracking-tight text-neutral-900 dark:text-white font-display mt-1">
          Explore by Category
        </h1>
        <p className="text-xs sm:text-sm text-neutral-500 dark:text-neutral-400 mt-2">
          From audiophile acoustic hardware to luxury Italian leather and architectural living, explore our specialized departments.
        </p>
      </div>

      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
          {[1, 2, 3, 4, 5].map(n => (
            <div key={n} className="h-64 rounded-xl bg-neutral-200 dark:bg-neutral-800 animate-pulse" />
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
          {categories.map(cat => (
            <Link
              key={cat.id}
              to={`/category/${cat.slug}`}
              className="group relative flex flex-col rounded-xl overflow-hidden border border-neutral-200/80 dark:border-neutral-800 bg-white dark:bg-neutral-900 hover:shadow-md transition-all duration-200"
            >
              <div className="aspect-[16/10] w-full overflow-hidden bg-neutral-100 dark:bg-neutral-800">
                <img
                  src={cat.image_url || '/src/assets/images/hero_ali_store_showcase_1790526590148.jpg'}
                  alt={cat.name}
                  referrerPolicy="no-referrer"
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                />
              </div>
              <div className="p-5 flex-1 flex flex-col justify-between">
                <div>
                  <h3 className="text-base font-bold text-neutral-900 dark:text-white group-hover:underline">
                    {cat.name}
                  </h3>
                  <p className="text-xs text-neutral-500 dark:text-neutral-400 mt-1 line-clamp-2">
                    {cat.description}
                  </p>
                </div>
                <div className="mt-4 pt-3 border-t border-neutral-100 dark:border-neutral-800 flex items-center justify-between text-xs font-semibold text-neutral-900 dark:text-white">
                  <span>Browse Products</span>
                  <span>→</span>
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
};
