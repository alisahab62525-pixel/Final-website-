import React, { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { Heart, ShoppingBag, Truck, ShieldCheck, ArrowRight, MessageCircle, Star, Check } from 'lucide-react';
import { productService } from '../../services/productService';
import { reviewService } from '../../services/reviewService';
import { settingsService } from '../../services/settingsService';
import { useCart } from '../../contexts/CartContext';
import { useWishlist } from '../../contexts/WishlistContext';
import { useAuth } from '../../contexts/AuthContext';
import { useToast } from '../../contexts/ToastContext';
import { safeLocalStorage } from '../../lib/storage';
import { ProductCard } from '../../components/customer/ProductCard';
import { Product, Review } from '../../types';

export const ProductDetailPage: React.FC = () => {
  const { slug } = useParams<{ slug: string }>();
  const navigate = useNavigate();
  const { addItem } = useCart();
  const { isInWishlist, toggleWishlist } = useWishlist();
  const { user, profile } = useAuth();
  const { toast, success, error } = useToast();

  const [product, setProduct] = useState<Product | null>(null);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [relatedProducts, setRelatedProducts] = useState<Product[]>([]);
  const [activeImageIndex, setActiveImageIndex] = useState<number>(0);
  const [selectedVariant, setSelectedVariant] = useState<string>('');
  const [quantity, setQuantity] = useState<number>(1);
  const [loading, setLoading] = useState<boolean>(true);
  const [whatsappPhone, setWhatsappPhone] = useState<string>('923001234567');

  // Review submission state
  const [newRating, setNewRating] = useState<number>(5);
  const [newComment, setNewComment] = useState<string>('');
  const [submittingReview, setSubmittingReview] = useState<boolean>(false);

  useEffect(() => {
    settingsService.getSettings().then(s => {
      if (s?.whatsapp) setWhatsappPhone(s.whatsapp.replace(/[^0-9]/g, ''));
    });
  }, []);

  useEffect(() => {
    async function loadProduct() {
      if (!slug) return;
      setLoading(true);
      try {
        const prod = await productService.getProductBySlug(slug);
        setProduct(prod);

        if (prod) {
          safeLocalStorage.addRecentlyViewed(prod.slug);
          if (prod.variants && prod.variants.length > 0) {
            setSelectedVariant(prod.variants[0]);
          }

          const [revs, related] = await Promise.all([
            reviewService.getProductReviews(prod.id),
            productService.getRelatedProducts(prod.id, prod.category_id, 4),
          ]);
          setReviews(revs);
          setRelatedProducts(related);
        }
      } catch (err) {
        console.error('Failed to load product details', err);
      } finally {
        setLoading(false);
      }
    }
    loadProduct();
  }, [slug]);

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          <div className="aspect-[4/3] bg-neutral-200 dark:bg-neutral-800 rounded-2xl animate-pulse" />
          <div className="space-y-4">
            <div className="h-6 w-32 bg-neutral-200 dark:bg-neutral-800 rounded animate-pulse" />
            <div className="h-10 w-3/4 bg-neutral-200 dark:bg-neutral-800 rounded animate-pulse" />
            <div className="h-6 w-24 bg-neutral-200 dark:bg-neutral-800 rounded animate-pulse" />
            <div className="h-32 bg-neutral-200 dark:bg-neutral-800 rounded animate-pulse" />
          </div>
        </div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-20 text-center">
        <h1 className="text-xl font-bold">Product not found</h1>
        <p className="text-xs text-neutral-500 mt-2">The product you are looking for has been removed or does not exist.</p>
        <Link to="/shop" className="mt-4 inline-block text-xs font-semibold underline">
          Browse Store Catalog
        </Link>
      </div>
    );
  }

  const images = product.images && product.images.length > 0
    ? product.images
    : [{ id: 'fallback', product_id: product.id, image_url: '/src/assets/images/hero_ali_store_showcase_1790526590148.jpg', alt_text: product.name, sort_order: 0, created_at: '' }];

  const currentImage = images[activeImageIndex] || images[0];
  const isOutOfStock = product.stock_quantity <= 0;
  const isLowStock = !isOutOfStock && product.stock_quantity <= product.low_stock_threshold;
  const isFavorited = isInWishlist(product.id);
  const activePrice = product.discount_price ?? product.price;

  const handleAddToCart = () => {
    addItem(product, quantity, selectedVariant || undefined);
  };

  const handleBuyNow = () => {
    // Add to cart first
    const added = addItem(product, quantity, selectedVariant || undefined);
    if (!added) return;

    // Requirement #19: Guest must login before checkout
    if (!user) {
      toast('Please login or create an account to proceed to checkout.', 'info');
      navigate(`/login?redirect=/checkout`);
    } else {
      navigate('/checkout');
    }
  };

  const handleReviewSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) {
      toast('Please sign in to submit a review.', 'info');
      navigate('/login');
      return;
    }
    if (!newComment.trim()) {
      error('Please write a comment for your review.');
      return;
    }

    setSubmittingReview(true);
    try {
      const created = await reviewService.submitReview({
        productId: product.id,
        customerId: user.id,
        customerName: profile?.full_name || 'Verified Buyer',
        rating: newRating,
        comment: newComment.trim(),
      });
      setReviews(prev => [created, ...prev]);
      setNewComment('');
      success('Thank you! Your verified review has been submitted.');
    } catch (err: any) {
      error(err.message || 'Failed to submit review');
    } finally {
      setSubmittingReview(false);
    }
  };

  const whatsappMessage = `Hello Ali Online Store, I would like to inquire about: ${product.name} (SKU: ${product.sku}, Price: Rs. ${activePrice.toLocaleString()}).`;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-16">
      
      {/* Product Contiguous Purchase Module */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-14 items-start">
        
        {/* Gallery Column (Left) */}
        <div className="lg:col-span-7 space-y-4">
          <div className="relative aspect-[4/3] rounded-2xl overflow-hidden bg-neutral-100 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-800">
            <img
              src={currentImage.image_url}
              alt={currentImage.alt_text || product.name}
              referrerPolicy="no-referrer"
              className="w-full h-full object-cover object-center"
              onError={(e) => {
                (e.target as HTMLImageElement).src = '/src/assets/images/hero_ali_store_showcase_1790526590148.jpg';
              }}
            />
            {product.discount_price && (
              <span className="absolute top-4 left-4 px-2.5 py-1 text-xs font-semibold bg-neutral-900 text-white dark:bg-white dark:text-neutral-900 rounded-md">
                Special Offer
              </span>
            )}
          </div>

          {/* Thumbnail Strip */}
          {images.length > 1 && (
            <div className="flex items-center gap-3 overflow-x-auto pb-2">
              {images.map((img, idx) => (
                <button
                  key={img.id}
                  onClick={() => setActiveImageIndex(idx)}
                  className={`relative aspect-[4/3] w-20 rounded-lg overflow-hidden border-2 transition-all shrink-0 ${
                    activeImageIndex === idx
                      ? 'border-neutral-900 dark:border-white ring-1 ring-neutral-900 dark:ring-white'
                      : 'border-transparent opacity-70 hover:opacity-100'
                  }`}
                >
                  <img src={img.image_url} alt="" className="w-full h-full object-cover" />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Purchase Info Module (Right) */}
        <div className="lg:col-span-5 space-y-6">
          {/* Category & SKU */}
          <div className="flex items-center justify-between text-xs text-neutral-500 dark:text-neutral-400">
            <span>{product.brand} · {product.category?.name || 'Curated'}</span>
            <span className="font-mono">SKU: {product.sku}</span>
          </div>

          {/* Title */}
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-neutral-900 dark:text-white font-display">
            {product.name}
          </h1>

          {/* Rating */}
          <div className="flex items-center gap-2 text-xs">
            <div className="flex items-center text-amber-500">
              {[1, 2, 3, 4, 5].map(star => (
                <Star
                  key={star}
                  className={`w-4 h-4 ${star <= Math.round(product.rating) ? 'fill-current' : 'text-neutral-300 dark:text-neutral-700'}`}
                />
              ))}
            </div>
            <span className="font-semibold text-neutral-800 dark:text-neutral-200">
              {product.rating.toFixed(1)}
            </span>
            <span className="text-neutral-400">·</span>
            <span className="text-neutral-500 underline">{reviews.length} verified reviews</span>
          </div>

          {/* Price Box */}
          <div className="p-4 rounded-xl bg-neutral-100 dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 flex items-baseline justify-between font-mono">
            <div>
              <span className="text-2xl font-bold text-neutral-900 dark:text-white tabular-nums">
                Rs. {activePrice.toLocaleString()}
              </span>
              {product.discount_price && (
                <span className="ml-3 text-sm text-neutral-400 line-through tabular-nums">
                  Rs. {product.price.toLocaleString()}
                </span>
              )}
            </div>
            <div>
              {isOutOfStock ? (
                <span className="text-xs font-semibold text-rose-600 dark:text-rose-400">Out of Stock</span>
              ) : isLowStock ? (
                <span className="text-xs font-semibold text-amber-600 dark:text-amber-400">Only {product.stock_quantity} left</span>
              ) : (
                <span className="text-xs font-semibold text-emerald-600 dark:text-emerald-400">In Stock ({product.stock_quantity} units)</span>
              )}
            </div>
          </div>

          {/* Short description */}
          <p className="text-xs sm:text-sm text-neutral-600 dark:text-neutral-300 leading-relaxed">
            {product.short_description || product.description}
          </p>

          {/* Variant Selector */}
          {product.variants && product.variants.length > 0 && (
            <div className="space-y-2">
              <label className="text-xs font-semibold text-neutral-900 dark:text-white">
                Select Option / Variant:
              </label>
              <div className="flex flex-wrap gap-2">
                {product.variants.map(v => (
                  <button
                    key={v}
                    type="button"
                    onClick={() => setSelectedVariant(v)}
                    className={`px-3.5 py-1.5 text-xs font-medium rounded-lg border transition-all ${
                      selectedVariant === v
                        ? 'border-neutral-900 bg-neutral-900 text-white dark:border-white dark:bg-white dark:text-neutral-900 shadow-xs'
                        : 'border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-800 text-neutral-700 dark:text-neutral-300 hover:border-neutral-400'
                    }`}
                  >
                    {v}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Quantity Stepper */}
          <div className="flex items-center gap-4">
            <span className="text-xs font-semibold text-neutral-900 dark:text-white">Quantity:</span>
            <div className="flex items-center border border-neutral-300 dark:border-neutral-700 rounded-lg overflow-hidden bg-white dark:bg-neutral-800">
              <button
                type="button"
                onClick={() => setQuantity(Math.max(1, quantity - 1))}
                className="px-3 py-1.5 text-sm hover:bg-neutral-100 dark:hover:bg-neutral-700 transition-colors"
                disabled={quantity <= 1}
              >
                -
              </button>
              <span className="px-4 py-1.5 text-xs font-mono font-semibold">{quantity}</span>
              <button
                type="button"
                onClick={() => setQuantity(Math.min(product.stock_quantity, quantity + 1))}
                className="px-3 py-1.5 text-sm hover:bg-neutral-100 dark:hover:bg-neutral-700 transition-colors"
                disabled={quantity >= product.stock_quantity}
              >
                +
              </button>
            </div>
          </div>

          {/* CTA Actions */}
          <div className="space-y-3 pt-2">
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                disabled={isOutOfStock}
                onClick={handleAddToCart}
                className="py-3 px-4 rounded-xl text-xs font-bold border border-neutral-900 dark:border-white text-neutral-900 dark:text-white hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors flex items-center justify-center gap-2 disabled:opacity-40 disabled:cursor-not-allowed"
              >
                <ShoppingBag className="w-4 h-4" />
                <span>Add to Cart</span>
              </button>

              <button
                type="button"
                disabled={isOutOfStock}
                onClick={handleBuyNow}
                className="py-3 px-4 rounded-xl text-xs font-bold bg-neutral-900 text-white dark:bg-white dark:text-neutral-900 hover:opacity-90 transition-opacity flex items-center justify-center gap-2 disabled:opacity-40 disabled:cursor-not-allowed shadow-md"
              >
                <span>Buy Now</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>

            <div className="flex items-center gap-3">
              {/* Wishlist button */}
              <button
                type="button"
                onClick={() => toggleWishlist(product.id, product.name)}
                className="flex-1 py-2.5 px-3 rounded-lg border border-neutral-200 dark:border-neutral-800 text-xs font-medium text-neutral-700 dark:text-neutral-300 hover:bg-neutral-50 dark:hover:bg-neutral-850 flex items-center justify-center gap-2"
              >
                <Heart className={`w-4 h-4 ${isFavorited ? 'fill-rose-500 text-rose-500' : ''}`} />
                <span>{isFavorited ? 'In Wishlist' : 'Add to Wishlist'}</span>
              </button>

              {/* Direct WhatsApp Product inquiry */}
              <a
                href={`https://wa.me/${whatsappPhone}?text=${encodeURIComponent(whatsappMessage)}`}
                target="_blank"
                rel="noopener noreferrer"
                className="flex-1 py-2.5 px-3 rounded-lg bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-400 hover:bg-emerald-100 dark:hover:bg-emerald-950/60 border border-emerald-200 dark:border-emerald-800 text-xs font-medium flex items-center justify-center gap-2"
              >
                <MessageCircle className="w-4 h-4" />
                <span>Inquire on WhatsApp</span>
              </a>
            </div>
          </div>

          {/* Trust Guarantees */}
          <div className="pt-4 border-t border-neutral-200 dark:border-neutral-800 space-y-2 text-xs text-neutral-500 dark:text-neutral-400">
            <div className="flex items-center gap-2">
              <Truck className="w-4 h-4 text-emerald-500" />
              <span>Free delivery nationwide on orders above Rs. 4,000</span>
            </div>
            <div className="flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-emerald-500" />
              <span>Cash on Delivery & Bank Transfer accepted</span>
            </div>
          </div>

        </div>

      </div>

      {/* Specifications & Extended Details */}
      <div className="pt-10 border-t border-neutral-200 dark:border-neutral-800">
        <h3 className="text-lg font-bold text-neutral-900 dark:text-white font-display mb-4">
          Product Details & Specifications
        </h3>
        <p className="text-xs sm:text-sm text-neutral-600 dark:text-neutral-300 leading-relaxed max-w-3xl mb-6">
          {product.description}
        </p>

        {product.specifications && Object.keys(product.specifications).length > 0 && (
          <div className="max-w-2xl border border-neutral-200 dark:border-neutral-800 rounded-xl overflow-hidden divide-y divide-neutral-200 dark:divide-neutral-800 text-xs">
            {Object.entries(product.specifications).map(([key, value]) => (
              <div key={key} className="grid grid-cols-2 p-3 bg-white dark:bg-neutral-900">
                <span className="font-semibold text-neutral-700 dark:text-neutral-300">{key}</span>
                <span className="text-neutral-500 dark:text-neutral-400">{value}</span>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Verified Customer Reviews */}
      <div className="pt-10 border-t border-neutral-200 dark:border-neutral-800 space-y-8">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-bold text-neutral-900 dark:text-white font-display">
              Customer Reviews ({reviews.length})
            </h3>
            <p className="text-xs text-neutral-500 mt-1">Verified buyer experiences & impressions</p>
          </div>
        </div>

        {/* Submit Review Form (Customer only) */}
        <div className="p-6 rounded-2xl bg-neutral-100 dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 max-w-2xl">
          <h4 className="text-xs font-bold uppercase tracking-wider text-neutral-900 dark:text-white mb-3">
            Write a Review
          </h4>

          {user ? (
            <form onSubmit={handleReviewSubmit} className="space-y-4">
              <div>
                <label className="block text-xs text-neutral-600 dark:text-neutral-400 mb-1">Your Rating:</label>
                <div className="flex items-center gap-1">
                  {[1, 2, 3, 4, 5].map(star => (
                    <button
                      key={star}
                      type="button"
                      onClick={() => setNewRating(star)}
                      className="p-1 text-amber-500"
                    >
                      <Star className={`w-5 h-5 ${star <= newRating ? 'fill-current' : 'text-neutral-300 dark:text-neutral-700'}`} />
                    </button>
                  ))}
                  <span className="text-xs font-semibold ml-2">{newRating} / 5 Stars</span>
                </div>
              </div>

              <div>
                <label className="block text-xs text-neutral-600 dark:text-neutral-400 mb-1">Your Feedback:</label>
                <textarea
                  rows={3}
                  value={newComment}
                  onChange={e => setNewComment(e.target.value)}
                  placeholder="Share details on quality, sizing, or delivery experience..."
                  required
                  className="w-full px-3 py-2 text-xs rounded-xl border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-800 text-neutral-900 dark:text-white focus:outline-none"
                />
              </div>

              <button
                type="submit"
                disabled={submittingReview}
                className="px-4 py-2 text-xs font-semibold bg-neutral-900 dark:bg-white text-white dark:text-neutral-900 rounded-lg hover:opacity-90 disabled:opacity-50"
              >
                {submittingReview ? 'Submitting...' : 'Post Verified Review'}
              </button>
            </form>
          ) : (
            <div className="text-xs text-neutral-500">
              <span>Please </span>
              <Link to="/login" className="font-semibold text-neutral-900 dark:text-white underline">
                sign in
              </Link>
              <span> to post a verified product review.</span>
            </div>
          )}
        </div>

        {/* Reviews List */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {reviews.length === 0 ? (
            <div className="col-span-2 p-8 text-center text-xs text-neutral-500">
              No reviews yet for this product. Be the first to share your thoughts!
            </div>
          ) : (
            reviews.map(r => (
              <div
                key={r.id}
                className="p-4 rounded-xl border border-neutral-200/80 dark:border-neutral-800 bg-white dark:bg-neutral-900 space-y-2"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1.5">
                    <span className="text-xs font-bold text-neutral-900 dark:text-white">{r.customer_name}</span>
                    <span className="text-[10px] text-emerald-600 bg-emerald-50 dark:bg-emerald-950 px-1.5 py-0.2 rounded font-medium">
                      Verified Buyer
                    </span>
                  </div>
                  <div className="flex items-center text-amber-500">
                    {[1, 2, 3, 4, 5].map(s => (
                      <Star key={s} className={`w-3.5 h-3.5 ${s <= r.rating ? 'fill-current' : 'text-neutral-300'}`} />
                    ))}
                  </div>
                </div>
                <p className="text-xs text-neutral-600 dark:text-neutral-300 leading-relaxed">{r.comment}</p>
                <span className="block text-[10px] text-neutral-400">
                  {new Date(r.created_at).toLocaleDateString()}
                </span>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Related Products */}
      {relatedProducts.length > 0 && (
        <div className="pt-10 border-t border-neutral-200 dark:border-neutral-800 space-y-6">
          <h3 className="text-xl font-bold text-neutral-900 dark:text-white font-display">
            You Might Also Like
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {relatedProducts.map(p => (
              <ProductCard key={p.id} product={p} />
            ))}
          </div>
        </div>
      )}

    </div>
  );
};
