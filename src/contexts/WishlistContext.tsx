import React, { createContext, useContext, useState, useEffect } from 'react';
import { safeLocalStorage } from '../lib/storage';
import { useToast } from './ToastContext';

interface WishlistContextType {
  wishlistIds: string[];
  toggleWishlist: (productId: string, productName?: string) => void;
  isInWishlist: (productId: string) => boolean;
  clearWishlist: () => void;
  wishlistCount: number;
}

const WishlistContext = createContext<WishlistContextType | undefined>(undefined);

export const WishlistProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [wishlistIds, setWishlistIds] = useState<string[]>(() => safeLocalStorage.getGuestWishlist());
  const { toast } = useToast();

  useEffect(() => {
    safeLocalStorage.setGuestWishlist(wishlistIds);
  }, [wishlistIds]);

  const toggleWishlist = (productId: string, productName?: string) => {
    setWishlistIds(prev => {
      const exists = prev.includes(productId);
      if (exists) {
        toast(productName ? `Removed "${productName}" from wishlist.` : 'Removed from wishlist.');
        return prev.filter(id => id !== productId);
      } else {
        toast(productName ? `Added "${productName}" to wishlist.` : 'Added to wishlist.', 'info');
        return [...prev, productId];
      }
    });
  };

  const isInWishlist = (productId: string) => wishlistIds.includes(productId);

  const clearWishlist = () => {
    setWishlistIds([]);
    safeLocalStorage.setGuestWishlist([]);
  };

  return (
    <WishlistContext.Provider
      value={{
        wishlistIds,
        toggleWishlist,
        isInWishlist,
        clearWishlist,
        wishlistCount: wishlistIds.length,
      }}
    >
      {children}
    </WishlistContext.Provider>
  );
};

export const useWishlist = () => {
  const context = useContext(WishlistContext);
  if (!context) throw new Error('useWishlist must be used within WishlistProvider');
  return context;
};
