import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import { categoryService } from '../../services/categoryService';
import { productService } from '../../services/productService';
import { ProductCard } from '../../components/customer/ProductCard';
import { Category, Product } from '../../types';

export const CategoryDetailPage: React.FC = () => {
  const { slug } = useParams<{ slug: string }>();
  const [category, setCategory] = useState<Category | null>(null);
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    async function loadCategoryProducts() {
      if (!slug) return;
      setLoading(true);
      try {
        const cat = await categoryService.getCategoryBySlug(slug);
        setCategory(cat);
        if (cat) {
          const res = await productService.getProducts({ categoryId: cat.id });
          setProducts(res.products);
        }
      } catch (err) {
        console.error('Failed to load category', err);
      } finally {
        setLoading(false);
      }
    }
    loadCategoryProducts();
  }, [slug]);

  if (!loading && !category) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-16 text-center">
        <h1 className="text-xl font-bold">Category not found</h1>
        <p className="text-xs text-neutral-500 mt-2">The category you are looking for does not exist.</p>
        <Link to="/categories" className="mt-4 inline-block text-xs font-semibold underline">
          Back to all categories
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <Link
        to="/categories"
        className="inline-flex items-center gap-1.5 text-xs text-neutral-500 hover:text-neutral-900 dark:hover:text-white transition-colors mb-6"
      >
        <ArrowLeft className="w-3.5 h-3.5" />
        <span>All Categories</span>
      </Link>

      <div className="mb-8">
        <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-neutral-900 dark:text-white font-display">
          {category?.name}
        </h1>
        {category?.description && (
          <p className="text-xs sm:text-sm text-neutral-500 dark:text-neutral-400 mt-1.5 max-w-2xl">
            {category.description}
          </p>
        )}
      </div>

      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {[1, 2, 3, 4].map(n => (
            <div key={n} className="h-72 rounded-xl bg-neutral-200 dark:bg-neutral-800 animate-pulse" />
          ))}
        </div>
      ) : products.length === 0 ? (
        <div className="p-12 text-center border border-dashed border-neutral-300 dark:border-neutral-700 rounded-xl">
          <p className="text-sm font-semibold text-neutral-800 dark:text-neutral-200">No products in this category yet</p>
          <Link
            to="/shop"
            className="mt-4 inline-block px-4 py-2 text-xs font-medium rounded-lg bg-neutral-900 text-white dark:bg-white dark:text-neutral-900"
          >
            Explore Other Products
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {products.map(p => (
            <ProductCard key={p.id} product={p} />
          ))}
        </div>
      )}
    </div>
  );
};
