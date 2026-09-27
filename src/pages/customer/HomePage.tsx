import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, Sparkles, ShieldCheck, Truck, CreditCard } from 'lucide-react';
import { ProductCard } from '../../components/customer/ProductCard';
import { productService } from '../../services/productService';
import { categoryService } from '../../services/categoryService';
import { Product, Category } from '../../types';

export const HomePage: React.FC = () => {
  const [featuredProducts, setFeaturedProducts] = useState<Product[]>([]);
  const [newArrivals, setNewArrivals] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    async function loadHomeData() {
      try {
        const [featured, newest, cats] = await Promise.all([
          productService.getFeaturedProducts(4),
          productService.getNewArrivals(4),
          categoryService.getCategories(true),
        ]);
        setFeaturedProducts(featured);
        setNewArrivals(newest);
        setCategories(cats);
      } catch (err) {
        console.error('Failed to load homepage data', err);
      } finally {
        setLoading(false);
      }
    }
    loadHomeData();
  }, []);

  return (
    <div className="space-y-16 sm:space-y-24 pb-16">
      
      {/* 1. Storefront Hero Section */}
      <section className="relative overflow-hidden bg-neutral-900 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 sm:py-24 lg:py-32">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
            
            <div className="lg:col-span-7 space-y-6">
              <span className="text-xs uppercase tracking-widest text-neutral-400 font-medium">
                Curated Luxury & Essentials · Direct to Consumer
              </span>
              
              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight text-white font-display text-balance leading-tight">
                Refined Essentials for Modern Living
              </h1>
              
              <p className="text-sm sm:text-base text-neutral-300 max-w-xl leading-relaxed">
                Discover audiophile sound systems, handcrafted apparel, precision timepieces, and architectural homeware engineered without compromise.
              </p>

              <div className="flex flex-wrap items-center gap-4 pt-2">
                <Link
                  to="/shop"
                  className="px-6 py-3 text-xs font-semibold text-neutral-900 bg-white hover:bg-neutral-100 rounded-xl transition-colors inline-flex items-center gap-2"
                >
                  <span>Explore Catalog</span>
                  <ArrowRight className="w-4 h-4" />
                </Link>
                <Link
                  to="/categories"
                  className="px-6 py-3 text-xs font-semibold text-white bg-neutral-800 hover:bg-neutral-700 border border-neutral-700 rounded-xl transition-colors"
                >
                  View Collections
                </Link>
              </div>

              {/* Delivery Assurance */}
              <div className="pt-6 border-t border-neutral-800 flex flex-wrap items-center gap-6 text-xs text-neutral-400">
                <div className="flex items-center gap-2">
                  <Truck className="w-4 h-4 text-emerald-400" />
                  <span>Insured TCS Delivery Across Pakistan</span>
                </div>
                <div className="flex items-center gap-2">
                  <CreditCard className="w-4 h-4 text-emerald-400" />
                  <span>Cash on Delivery / EasyPaisa / Bank</span>
                </div>
              </div>
            </div>

            <div className="lg:col-span-5 relative">
              <div className="relative aspect-[4/3] rounded-2xl overflow-hidden shadow-2xl border border-neutral-800 bg-neutral-800">
                <img
                  src="/src/assets/images/hero_ali_store_showcase_1790526590148.jpg"
                  alt="Ali Online Store signature showcase"
                  referrerPolicy="no-referrer"
                  className="w-full h-full object-cover object-center"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent flex items-end p-6">
                  <div>
                    <span className="text-[11px] uppercase tracking-wider text-neutral-300">Editor's Choice</span>
                    <h3 className="text-base font-bold text-white">Apex Studio Collection & Horology</h3>
                  </div>
                </div>
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* 2. Featured Categories Grid */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-end justify-between mb-8">
          <div>
            <span className="text-xs uppercase tracking-wider text-neutral-500 font-medium">Departments</span>
            <h2 className="text-2xl font-bold tracking-tight text-neutral-900 dark:text-white font-display mt-1">
              Curated Collections
            </h2>
          </div>
          <Link
            to="/categories"
            className="text-xs font-semibold text-neutral-600 dark:text-neutral-300 hover:text-neutral-900 dark:hover:text-white transition-colors inline-flex items-center gap-1"
          >
            <span>All Categories</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
          {categories.slice(0, 5).map(cat => (
            <Link
              key={cat.id}
              to={`/category/${cat.slug}`}
              className="group relative flex flex-col overflow-hidden rounded-xl bg-neutral-100 dark:bg-neutral-800 border border-neutral-200/80 dark:border-neutral-800 hover:border-neutral-300 dark:hover:border-neutral-700 transition-all duration-200"
            >
              <div className="aspect-[4/3] w-full overflow-hidden bg-neutral-200 dark:bg-neutral-700">
                <img
                  src={cat.image_url || '/src/assets/images/hero_ali_store_showcase_1790526590148.jpg'}
                  alt={cat.name}
                  referrerPolicy="no-referrer"
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                />
              </div>
              <div className="p-3">
                <h3 className="text-xs font-semibold text-neutral-900 dark:text-white group-hover:underline truncate">
                  {cat.name}
                </h3>
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* 3. Featured Products */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-end justify-between mb-8">
          <div>
            <span className="text-xs uppercase tracking-wider text-neutral-500 font-medium">Spotlight</span>
            <h2 className="text-2xl font-bold tracking-tight text-neutral-900 dark:text-white font-display mt-1">
              Featured Selections
            </h2>
          </div>
          <Link
            to="/shop"
            className="text-xs font-semibold text-neutral-600 dark:text-neutral-300 hover:text-neutral-900 dark:hover:text-white transition-colors inline-flex items-center gap-1"
          >
            <span>Shop All Products</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {[1, 2, 3, 4].map(n => (
              <div key={n} className="h-72 rounded-xl bg-neutral-200 dark:bg-neutral-800 animate-pulse" />
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {featuredProducts.map(p => (
              <ProductCard key={p.id} product={p} />
            ))}
          </div>
        )}
      </section>

      {/* 4. Promotional Banner - Limited Campaign */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="relative rounded-2xl bg-neutral-900 dark:bg-neutral-900 text-white overflow-hidden p-8 sm:p-12 border border-neutral-800">
          <div className="max-w-xl space-y-4">
            <span className="text-xs uppercase tracking-widest text-amber-400 font-semibold inline-flex items-center gap-1.5">
              <Sparkles className="w-4 h-4" />
              Special Ramadan & Spring Promo
            </span>
            <h2 className="text-2xl sm:text-3xl font-bold font-display">
              Use Coupon <span className="font-mono text-amber-400">ALI10</span> for 10% Off
            </h2>
            <p className="text-xs sm:text-sm text-neutral-300 leading-relaxed">
              Apply code at checkout on eligible orders above Rs. 3,000. Enjoy prompt insured dispatch and hassle-free COD nationwide.
            </p>
            <div className="pt-2">
              <Link
                to="/shop"
                className="px-5 py-2.5 text-xs font-semibold text-neutral-900 bg-white hover:bg-neutral-100 rounded-lg transition-colors inline-flex items-center gap-2"
              >
                <span>Shop Promotional Catalog</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* 5. New Arrivals */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-end justify-between mb-8">
          <div>
            <span className="text-xs uppercase tracking-wider text-neutral-500 font-medium">Recently Cataloged</span>
            <h2 className="text-2xl font-bold tracking-tight text-neutral-900 dark:text-white font-display mt-1">
              New Arrivals
            </h2>
          </div>
          <Link
            to="/shop?sort=newest"
            className="text-xs font-semibold text-neutral-600 dark:text-neutral-300 hover:text-neutral-900 dark:hover:text-white transition-colors inline-flex items-center gap-1"
          >
            <span>View All New Arrivals</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {newArrivals.map(p => (
            <ProductCard key={p.id} product={p} />
          ))}
        </div>
      </section>

    </div>
  );
};
