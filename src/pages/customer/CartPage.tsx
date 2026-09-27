import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Trash2, ShoppingBag, ArrowRight, ShieldCheck, Tag, X } from 'lucide-react';
import { useCart } from '../../contexts/CartContext';
import { useAuth } from '../../contexts/AuthContext';
import { useToast } from '../../contexts/ToastContext';

export const CartPage: React.FC = () => {
  const {
    items,
    removeItem,
    updateQuantity,
    clearCart,
    subtotal,
    discount,
    deliveryFee,
    total,
    appliedCoupon,
    applyCoupon,
    removeCoupon,
  } = useCart();
  const { user } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();

  const [couponCode, setCouponCode] = useState<string>('');
  const [isApplyingCoupon, setIsApplyingCoupon] = useState<boolean>(false);

  const handleApplyCoupon = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!couponCode.trim()) return;
    setIsApplyingCoupon(true);
    try {
      const ok = await applyCoupon(couponCode.trim());
      if (ok) setCouponCode('');
    } finally {
      setIsApplyingCoupon(false);
    }
  };

  const handleProceedToCheckout = () => {
    // Requirement #19: Redirect guests to login
    if (!user) {
      toast('Please login or create an account to continue with your order.', 'info');
      navigate('/login?redirect=/checkout');
    } else {
      navigate('/checkout');
    }
  };

  if (items.length === 0) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-20 text-center">
        <div className="w-16 h-16 rounded-full bg-neutral-100 dark:bg-neutral-800 flex items-center justify-center mx-auto text-neutral-400 mb-4">
          <ShoppingBag className="w-8 h-8" />
        </div>
        <h1 className="text-2xl font-bold tracking-tight text-neutral-900 dark:text-white font-display">
          Your Shopping Cart is Empty
        </h1>
        <p className="text-xs sm:text-sm text-neutral-500 dark:text-neutral-400 mt-2 max-w-sm mx-auto">
          Explore our collection of fine audio, modern apparel, and interior objects.
        </p>
        <Link
          to="/shop"
          className="mt-6 inline-flex items-center gap-2 px-6 py-3 text-xs font-semibold rounded-xl bg-neutral-900 text-white dark:bg-white dark:text-neutral-900 hover:opacity-90 transition-opacity"
        >
          <span>Continue Shopping</span>
          <ArrowRight className="w-4 h-4" />
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      
      <div className="flex items-center justify-between pb-6 border-b border-neutral-200 dark:border-neutral-800 mb-8">
        <div>
          <span className="text-xs uppercase tracking-wider text-neutral-500 font-medium">Review Order</span>
          <h1 className="text-2xl font-bold tracking-tight text-neutral-900 dark:text-white font-display mt-1">
            Shopping Cart ({items.length} items)
          </h1>
        </div>
        <button
          type="button"
          onClick={clearCart}
          className="text-xs text-rose-500 hover:text-rose-600 transition-colors"
        >
          Clear all items
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-start">
        
        {/* Cart Items List */}
        <div className="lg:col-span-8 space-y-4">
          <div className="divide-y divide-neutral-200 dark:divide-neutral-800 border-y border-neutral-200 dark:border-neutral-800">
            {items.map(item => {
              const unitPrice = item.product.discount_price ?? item.product.price;
              const itemTotal = unitPrice * item.quantity;
              const image = item.product.images?.[0]?.image_url || '/src/assets/images/hero_ali_store_showcase_1790526590148.jpg';

              return (
                <div key={`${item.product.id}-${item.variant || 'default'}`} className="py-5 flex gap-4 sm:gap-6 items-center">
                  
                  {/* Thumbnail */}
                  <Link
                    to={`/product/${item.product.slug}`}
                    className="relative aspect-square w-20 sm:w-24 rounded-xl overflow-hidden bg-neutral-100 dark:bg-neutral-800 shrink-0 border border-neutral-200/80 dark:border-neutral-800"
                  >
                    <img
                      src={image}
                      alt={item.product.name}
                      referrerPolicy="no-referrer"
                      className="w-full h-full object-cover"
                    />
                  </Link>

                  {/* Details */}
                  <div className="flex-1 min-w-0">
                    <span className="text-[11px] text-neutral-500 uppercase">{item.product.brand}</span>
                    <Link
                      to={`/product/${item.product.slug}`}
                      className="block text-sm font-semibold text-neutral-900 dark:text-white hover:underline truncate"
                    >
                      {item.product.name}
                    </Link>

                    {item.variant && (
                      <span className="inline-block mt-0.5 text-xs text-neutral-500 dark:text-neutral-400">
                        Option: {item.variant}
                      </span>
                    )}

                    <div className="flex items-center gap-3 mt-3">
                      {/* Quantity Stepper */}
                      <div className="flex items-center border border-neutral-300 dark:border-neutral-700 rounded-lg overflow-hidden bg-white dark:bg-neutral-800">
                        <button
                          type="button"
                          onClick={() => updateQuantity(item.product.id, item.quantity - 1, item.variant)}
                          className="px-2.5 py-1 text-xs hover:bg-neutral-100 dark:hover:bg-neutral-700"
                        >
                          -
                        </button>
                        <span className="px-3 py-1 text-xs font-mono font-semibold">{item.quantity}</span>
                        <button
                          type="button"
                          onClick={() => updateQuantity(item.product.id, item.quantity + 1, item.variant)}
                          className="px-2.5 py-1 text-xs hover:bg-neutral-100 dark:hover:bg-neutral-700"
                        >
                          +
                        </button>
                      </div>

                      {/* Remove Button */}
                      <button
                        type="button"
                        onClick={() => removeItem(item.product.id, item.variant)}
                        className="text-neutral-400 hover:text-rose-500 transition-colors p-1"
                        aria-label="Remove item"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>

                  {/* Price */}
                  <div className="text-right font-mono tabular-nums shrink-0">
                    <span className="text-sm sm:text-base font-bold text-neutral-900 dark:text-white">
                      Rs. {itemTotal.toLocaleString()}
                    </span>
                    {item.quantity > 1 && (
                      <span className="block text-[11px] text-neutral-400">
                        Rs. {unitPrice.toLocaleString()} each
                      </span>
                    )}
                  </div>

                </div>
              );
            })}
          </div>

          <div className="pt-4 flex items-center justify-between text-xs text-neutral-500">
            <Link to="/shop" className="hover:text-neutral-900 dark:hover:text-white underline">
              ← Continue shopping
            </Link>
            <span>Prices are inclusive of standard local taxes</span>
          </div>
        </div>

        {/* Order Summary & Coupon Column */}
        <div className="lg:col-span-4 space-y-6">
          <div className="p-6 rounded-2xl bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 space-y-5">
            
            <h2 className="text-sm font-bold uppercase tracking-wider text-neutral-900 dark:text-white">
              Order Summary
            </h2>

            {/* Price Breakdown */}
            <div className="space-y-3 text-xs divide-y divide-neutral-100 dark:divide-neutral-800 font-mono">
              <div className="flex justify-between text-neutral-600 dark:text-neutral-400 pb-2">
                <span>Subtotal</span>
                <span className="tabular-nums">Rs. {subtotal.toLocaleString()}</span>
              </div>

              {discount > 0 && (
                <div className="flex justify-between text-emerald-600 dark:text-emerald-400 pt-2 pb-2">
                  <span>Coupon Discount ({appliedCoupon?.code})</span>
                  <span className="tabular-nums">- Rs. {discount.toLocaleString()}</span>
                </div>
              )}

              <div className="flex justify-between text-neutral-600 dark:text-neutral-400 pt-2 pb-2">
                <span>Nationwide Delivery</span>
                <span>{deliveryFee === 0 ? 'FREE' : `Rs. ${deliveryFee.toLocaleString()}`}</span>
              </div>

              <div className="flex justify-between text-sm font-bold text-neutral-900 dark:text-white pt-3">
                <span>Grand Total</span>
                <span className="tabular-nums">Rs. {total.toLocaleString()}</span>
              </div>
            </div>

            {/* Coupon Code Input */}
            <div className="pt-2">
              {appliedCoupon ? (
                <div className="flex items-center justify-between p-2.5 rounded-lg bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 text-xs">
                  <div className="flex items-center gap-2 text-emerald-700 dark:text-emerald-300">
                    <Tag className="w-3.5 h-3.5" />
                    <span className="font-semibold">{appliedCoupon.code} applied</span>
                  </div>
                  <button
                    type="button"
                    onClick={removeCoupon}
                    className="text-emerald-700 dark:text-emerald-300 hover:text-emerald-900 p-0.5"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                </div>
              ) : (
                <form onSubmit={handleApplyCoupon} className="flex gap-2">
                  <input
                    type="text"
                    value={couponCode}
                    onChange={e => setCouponCode(e.target.value.toUpperCase())}
                    placeholder="Enter coupon (e.g. ALI10)"
                    className="flex-1 px-3 py-2 text-xs rounded-lg border border-neutral-300 dark:border-neutral-700 bg-neutral-50 dark:bg-neutral-800 text-neutral-900 dark:text-white font-mono uppercase focus:outline-none"
                  />
                  <button
                    type="submit"
                    disabled={isApplyingCoupon || !couponCode.trim()}
                    className="px-3 py-2 text-xs font-semibold rounded-lg bg-neutral-900 text-white dark:bg-white dark:text-neutral-900 hover:opacity-90 disabled:opacity-40"
                  >
                    {isApplyingCoupon ? '...' : 'Apply'}
                  </button>
                </form>
              )}
            </div>

            {/* Checkout Action Button */}
            <div className="pt-2">
              <button
                type="button"
                onClick={handleProceedToCheckout}
                className="w-full py-3.5 px-4 text-xs font-bold rounded-xl bg-neutral-900 text-white dark:bg-white dark:text-neutral-900 hover:opacity-90 transition-opacity flex items-center justify-center gap-2 shadow-lg"
              >
                <span>Proceed to Checkout</span>
                <ArrowRight className="w-4 h-4" />
              </button>

              {!user && (
                <p className="text-[11px] text-center text-neutral-500 mt-2">
                  You will be prompted to sign in before placing your order.
                </p>
              )}
            </div>

            {/* Assurance */}
            <div className="pt-3 border-t border-neutral-100 dark:border-neutral-800 flex items-center justify-center gap-2 text-[11px] text-neutral-500">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-500" />
              <span>Cash on Delivery / Direct Bank Confirmation</span>
            </div>

          </div>
        </div>

      </div>

    </div>
  );
};
