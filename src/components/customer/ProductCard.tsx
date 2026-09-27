import React from 'react';
import { Link } from 'react-router-dom';
import { Heart, ShoppingBag } from 'lucide-react';
import { Product } from '../../types';
import { useCart } from '../../contexts/CartContext';
import { useWishlist } from '../../contexts/WishlistContext';

interface ProductCardProps {
  product: Product;
}

export const ProductCard: React.FC<ProductCardProps> = ({ product }) => {
  const { addItem } = useCart();
  const { isInWishlist, toggleWishlist } = useWishlist();

  const isFavorited = isInWishlist(product.id);
  const primaryImage = product.images?.[0]?.image_url || '/src/assets/images/hero_ali_store_showcase_1790526590148.jpg';
  const hasDiscount = product.discount_price && product.discount_price < product.price;
  const isOutOfStock = product.stock_quantity <= 0;
  const isLowStock = !isOutOfStock && product.stock_quantity <= product.low_stock_threshold;

  return (
    <div className="group relative flex flex-col h-full bg-white dark:bg-neutral-900 rounded-xl border border-neutral-200/80 dark:border-neutral-800 hover:border-neutral-300 dark:hover:border-neutral-700 transition-all duration-200">
      {/* Image Container */}
      <div className="relative aspect-[4/3] w-full overflow-hidden rounded-t-xl bg-neutral-100 dark:bg-neutral-800">
        <Link to={`/product/${product.slug}`} className="block w-full h-full">
          <img
            src={primaryImage}
            alt={product.name}
            referrerPolicy="no-referrer"
            className="w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-300"
            onError={(e) => {
              // Graceful fallback to avoid broken image frame
              (e.target as HTMLImageElement).src = '/src/assets/images/hero_ali_store_showcase_1790526590148.jpg';
            }}
          />
        </Link>

        {/* Wishlist Button */}
        <button
          type="button"
          onClick={() => toggleWishlist(product.id, product.name)}
          className={`absolute top-3 right-3 p-2 rounded-full backdrop-blur-md transition-colors ${
            isFavorited
              ? 'bg-rose-50 text-rose-600 dark:bg-rose-950 dark:text-rose-400'
              : 'bg-white/80 dark:bg-neutral-900/80 text-neutral-600 dark:text-neutral-300 hover:text-neutral-900 dark:hover:text-white'
          }`}
          aria-label={isFavorited ? 'Remove from wishlist' : 'Add to wishlist'}
        >
          <Heart className={`w-4 h-4 ${isFavorited ? 'fill-current' : ''}`} />
        </button>

        {/* Subtle Tag (Only 1 maximum as per anti-slop rules) */}
        {hasDiscount && (
          <span className="absolute top-3 left-3 px-2 py-0.5 text-[11px] font-medium tracking-wide bg-neutral-900 text-white dark:bg-white dark:text-neutral-900 rounded-md">
            Sale
          </span>
        )}
        {!hasDiscount && isOutOfStock && (
          <span className="absolute top-3 left-3 px-2 py-0.5 text-[11px] font-medium tracking-wide bg-neutral-200 text-neutral-700 dark:bg-neutral-800 dark:text-neutral-300 rounded-md">
            Out of Stock
          </span>
        )}
        {!hasDiscount && !isOutOfStock && isLowStock && (
          <span className="absolute top-3 left-3 px-2 py-0.5 text-[11px] font-medium tracking-wide bg-amber-100 text-amber-900 dark:bg-amber-950 dark:text-amber-200 rounded-md">
            Only {product.stock_quantity} left
          </span>
        )}
      </div>

      {/* Card Content */}
      <div className="flex flex-col flex-1 p-4">
        {/* Brand / Category kicker */}
        <div className="flex items-center justify-between text-xs text-neutral-500 dark:text-neutral-400 mb-1">
          <span className="truncate">{product.brand || 'Ali Collection'}</span>
          {product.rating > 0 && (
            <span className="shrink-0 text-neutral-600 dark:text-neutral-300">★ {product.rating.toFixed(1)}</span>
          )}
        </div>

        {/* Product Title */}
        <Link
          to={`/product/${product.slug}`}
          className="text-sm font-semibold text-neutral-900 dark:text-white hover:underline line-clamp-1 mb-2"
        >
          {product.name}
        </Link>

        {/* Price & Action Row */}
        <div className="mt-auto pt-2 flex items-center justify-between border-t border-neutral-100 dark:border-neutral-800/60">
          <div className="flex items-baseline gap-2 font-mono tabular-nums">
            <span className="text-sm font-semibold text-neutral-900 dark:text-white">
              Rs. {(product.discount_price ?? product.price).toLocaleString()}
            </span>
            {hasDiscount && (
              <span className="text-xs text-neutral-400 dark:text-neutral-500 line-through">
                Rs. {product.price.toLocaleString()}
              </span>
            )}
          </div>

          <button
            type="button"
            disabled={isOutOfStock}
            onClick={() => addItem(product, 1, product.variants?.[0])}
            className={`p-2 rounded-lg text-xs font-medium transition-colors ${
              isOutOfStock
                ? 'opacity-40 cursor-not-allowed bg-neutral-100 text-neutral-400 dark:bg-neutral-800'
                : 'bg-neutral-100 hover:bg-neutral-900 hover:text-white dark:bg-neutral-800 dark:hover:bg-white dark:hover:text-neutral-900 text-neutral-800 dark:text-neutral-200'
            }`}
            aria-label="Add to cart"
            title={isOutOfStock ? 'Out of Stock' : 'Add to Cart'}
          >
            <ShoppingBag className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};
