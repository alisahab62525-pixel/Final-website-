import React, { createContext, useContext, useState, useEffect } from 'react';
import { CartItem, Product, Coupon } from '../types';
import { safeLocalStorage } from '../lib/storage';
import { couponService } from '../services/couponService';
import { inMemoryDb } from '../services/dbStore';
import { useToast } from './ToastContext';

interface CartContextType {
  items: CartItem[];
  addItem: (product: Product, quantity?: number, variant?: string) => boolean;
  removeItem: (productId: string, variant?: string) => void;
  updateQuantity: (productId: string, quantity: number, variant?: string) => void;
  clearCart: () => void;
  appliedCoupon: Coupon | null;
  applyCoupon: (code: string) => Promise<boolean>;
  removeCoupon: () => void;
  subtotal: number;
  discount: number;
  deliveryFee: number;
  total: number;
  itemCount: number;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export const CartProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [items, setItems] = useState<CartItem[]>(() => safeLocalStorage.getGuestCart());
  const [appliedCoupon, setAppliedCoupon] = useState<Coupon | null>(null);
  const [couponDiscount, setCouponDiscount] = useState<number>(0);
  const { toast, success, error } = useToast();

  useEffect(() => {
    safeLocalStorage.setGuestCart(items);
  }, [items]);

  // Recalculate coupon if items changed
  useEffect(() => {
    if (appliedCoupon) {
      const currentSubtotal = items.reduce((sum, item) => {
        const unitPrice = item.product.discount_price ?? item.product.price;
        return sum + unitPrice * item.quantity;
      }, 0);

      couponService.validateCoupon(appliedCoupon.code, currentSubtotal).then(res => {
        if (!res.isValid) {
          setAppliedCoupon(null);
          setCouponDiscount(0);
          toast(`Coupon removed: ${res.message}`, 'info');
        } else {
          setCouponDiscount(res.calculatedDiscount);
        }
      });
    }
  }, [items, appliedCoupon]);

  const addItem = (product: Product, quantity = 1, variant?: string): boolean => {
    if (product.stock_quantity <= 0) {
      error(`Sorry, "${product.name}" is currently out of stock.`);
      return false;
    }

    let addedSuccessfully = true;

    setItems(prev => {
      const existingIndex = prev.findIndex(
        i => i.product.id === product.id && i.variant === variant
      );

      if (existingIndex > -1) {
        const newQty = prev[existingIndex].quantity + quantity;
        if (newQty > product.stock_quantity) {
          error(`Cannot add more. Maximum available stock is ${product.stock_quantity}.`);
          addedSuccessfully = false;
          return prev;
        }

        const copy = [...prev];
        copy[existingIndex] = {
          ...copy[existingIndex],
          quantity: newQty,
        };
        success(`Updated quantity for "${product.name}".`);
        return copy;
      } else {
        if (quantity > product.stock_quantity) {
          error(`Cannot add ${quantity} units. Only ${product.stock_quantity} available.`);
          addedSuccessfully = false;
          return prev;
        }

        success(`Added "${product.name}" to cart.`);
        return [...prev, { product, quantity, variant }];
      }
    });

    return addedSuccessfully;
  };

  const removeItem = (productId: string, variant?: string) => {
    setItems(prev => prev.filter(i => !(i.product.id === productId && i.variant === variant)));
    toast('Item removed from cart.');
  };

  const updateQuantity = (productId: string, quantity: number, variant?: string) => {
    if (quantity <= 0) {
      removeItem(productId, variant);
      return;
    }

    setItems(prev => {
      return prev.map(item => {
        if (item.product.id === productId && item.variant === variant) {
          if (quantity > item.product.stock_quantity) {
            error(`Only ${item.product.stock_quantity} units available.`);
            return { ...item, quantity: item.product.stock_quantity };
          }
          return { ...item, quantity };
        }
        return item;
      });
    });
  };

  const clearCart = () => {
    setItems([]);
    setAppliedCoupon(null);
    setCouponDiscount(0);
    safeLocalStorage.clearGuestCart();
  };

  const applyCoupon = async (code: string): Promise<boolean> => {
    const currentSubtotal = items.reduce((sum, item) => {
      const price = item.product.discount_price ?? item.product.price;
      return sum + price * item.quantity;
    }, 0);

    const res = await couponService.validateCoupon(code, currentSubtotal);
    if (res.isValid && res.coupon) {
      setAppliedCoupon(res.coupon);
      setCouponDiscount(res.calculatedDiscount);
      success(res.message || 'Coupon applied successfully!');
      return true;
    } else {
      error(res.message || 'Failed to apply coupon.');
      return false;
    }
  };

  const removeCoupon = () => {
    setAppliedCoupon(null);
    setCouponDiscount(0);
    toast('Coupon removed.');
  };

  // Calculations
  const subtotal = items.reduce((sum, item) => {
    const price = item.product.discount_price ?? item.product.price;
    return sum + price * item.quantity;
  }, 0);

  const settings = inMemoryDb.settings;
  const deliveryFee = subtotal === 0 || subtotal >= settings.free_delivery_threshold ? 0 : settings.delivery_fee;
  const total = Math.max(0, subtotal - couponDiscount + deliveryFee);
  const itemCount = items.reduce((sum, item) => sum + item.quantity, 0);

  return (
    <CartContext.Provider
      value={{
        items,
        addItem,
        removeItem,
        updateQuantity,
        clearCart,
        appliedCoupon,
        applyCoupon,
        removeCoupon,
        subtotal,
        discount: couponDiscount,
        deliveryFee,
        total,
        itemCount,
      }}
    >
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) throw new Error('useCart must be used within CartProvider');
  return context;
};
