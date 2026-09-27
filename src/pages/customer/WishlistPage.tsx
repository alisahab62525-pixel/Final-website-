import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Heart, ShoppingBag, Trash2, ArrowRight } from 'lucide-react';
import { useWishlist } from '../../contexts/WishlistContext';
import { useCart } from '../../contexts/CartContext';
import { productService } from '../../services/productService';
import { Product } from '../../types';

export const WishlistPage: React.FC = () => {
  const { wishlistIds, toggleWishlist, clearWishlist } = useWishlist();
  const { addItem } = useCart();
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    async function loadWishlistProducts() {
      if (wishlistIds.length === 0) {
        setProducts([]);
        setLoading(false);
        return;
      }
      setLoading(true);
      try {
        const loaded = await Promise.all(
          wishlistIds.map(id => productService.getProductById(id))
        );
        setProducts(loaded.filter(Boolean) as Product[]);
      } catch (err) {
        console.error('Failed to load wishlist items', err);
      } finally {
        setLoading(false);
      }
    }
    loadWishlistProducts();
  }, [wishlistIds]);

  const handleMoveToCart = (product: Product) => {
    addItem(product, 1, product.variants?.[0]);
    toggleWishlist(product.id);
  };

  if (!loading && products.length === 0) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-20 text-center">
        <div className="w-16 h-16 rounded-full bg-neutral-100 dark:bg-neutral-800 flex items-center justify-center mx-auto text-neutral-400 mb-4">
          <Heart className="w-8 h-8" />
        </div>
        <h1 className="text-2xl font-bold tracking-tight text-neutral-900 dark:text-white font-display">
          Your Wishlist is Empty
        </h1>
        <p className="text-xs sm:text-sm text-neutral-500 dark:text-neutral-400 mt-2 max-w-sm mx-auto">
          Save your favorite products to keep track of their availability and seasonal promotions.
        </p>
        <Link
          to="/shop"
          className="mt-6 inline-flex items-center gap-2 px-6 py-3 text-xs font-semibold rounded-xl bg-neutral-900 text-white dark:bg-white dark:text-neutral-900 hover:opacity-90 transition-opacity"
        >
          <span>Explore Products</span>
          <ArrowRight className="w-4 h-4" />
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      
      <div className="flex items-center justify-between pb-6 border-b border-neutral-200 dark:border-neutral-800">
        <div>
          <span className="text-xs uppercase tracking-wider text-neutral-500 font-medium">Saved Items</span>
          <h1 className="text-2xl font-bold tracking-tight text-neutral-900 dark:text-white font-display mt-1">
            My Wishlist ({products.length})
          </h1>
        </div>
        {products.length > 0 && (
          <button
            type="button"
            onClick={clearWishlist}
            className="text-xs text-rose-500 hover:text-rose-600 transition-colors"
          >
            Clear Wishlist
          </button>
        )}
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {products.map(product => {
          const image = product.images?.[0]?.image_url || '/src/assets/images/hero_ali_store_showcase_1790526590148.jpg';
          const price = product.discount_price ?? product.price;

          return (
            <div
              key={product.id}
              className="group relative flex flex-col rounded-xl border border-neutral-200/80 dark:border-neutral-800 bg-white dark:bg-neutral-900 overflow-hidden"
            >
              <div className="relative aspect-[4/3] w-full overflow-hidden bg-neutral-100 dark:bg-neutral-800">
                <Link to={`/product/${product.slug}`}>
                  <img
                    src={image}
                    alt={product.name}
                    referrerPolicy="no-referrer"
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                </Link>
                <button
                  type="button"
                  onClick={() => toggleWishlist(product.id, product.name)}
                  className="absolute top-3 right-3 p-1.5 rounded-full bg-white/80 dark:bg-neutral-900/80 text-rose-500 hover:text-rose-600 shadow-xs"
                  aria-label="Remove from wishlist"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>

              <div className="p-4 flex-1 flex flex-col justify-between">
                <div>
                  <span className="text-[11px] text-neutral-500 uppercase">{product.brand}</span>
                  <Link
                    to={`/product/${product.slug}`}
                    className="block text-sm font-semibold text-neutral-900 dark:text-white hover:underline truncate"
                  >
                    {product.name}
                  </Link>
                  <div className="mt-1 font-mono tabular-nums text-xs font-bold text-neutral-900 dark:text-white">
                    Rs. {price.toLocaleString()}
                  </div>
                </div>

                <div className="mt-4 pt-3 border-t border-neutral-100 dark:border-neutral-800">
                  <button
                    type="button"
                    onClick={() => handleMoveToCart(product)}
                    className="w-full py-2 px-3 rounded-lg text-xs font-semibold bg-neutral-900 text-white dark:bg-white dark:text-neutral-900 hover:opacity-90 transition-opacity flex items-center justify-center gap-1.5"
                  >
                    <ShoppingBag className="w-3.5 h-3.5" />
                    <span>Move to Cart</span>
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>

    </div>
  );
};
