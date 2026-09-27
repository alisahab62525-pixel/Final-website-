import { CartItem, Product } from '../types';

const GUEST_CART_KEY = 'ali_guest_cart_v1';
const GUEST_WISHLIST_KEY = 'ali_guest_wishlist_v1';
const RECENTLY_VIEWED_KEY = 'ali_recently_viewed_v1';
const THEME_KEY = 'ali_theme_preference';

export const safeLocalStorage = {
  // Theme
  getTheme: (): 'light' | 'dark' | 'system' => {
    try {
      const val = localStorage.getItem(THEME_KEY);
      if (val === 'light' || val === 'dark' || val === 'system') return val;
      return 'system';
    } catch {
      return 'system';
    }
  },
  setTheme: (theme: 'light' | 'dark' | 'system') => {
    try {
      localStorage.setItem(THEME_KEY, theme);
    } catch (e) {
      console.warn('Unable to persist theme to localStorage', e);
    }
  },

  // Guest Cart
  getGuestCart: (): CartItem[] => {
    try {
      const data = localStorage.getItem(GUEST_CART_KEY);
      return data ? JSON.parse(data) : [];
    } catch {
      return [];
    }
  },
  setGuestCart: (items: CartItem[]) => {
    try {
      localStorage.setItem(GUEST_CART_KEY, JSON.stringify(items));
    } catch (e) {
      console.warn('Unable to persist guest cart', e);
    }
  },
  clearGuestCart: () => {
    try {
      localStorage.removeItem(GUEST_CART_KEY);
    } catch {
      // ignore
    }
  },

  // Guest Wishlist (product IDs)
  getGuestWishlist: (): string[] => {
    try {
      const data = localStorage.getItem(GUEST_WISHLIST_KEY);
      return data ? JSON.parse(data) : [];
    } catch {
      return [];
    }
  },
  setGuestWishlist: (ids: string[]) => {
    try {
      localStorage.setItem(GUEST_WISHLIST_KEY, JSON.stringify(ids));
    } catch (e) {
      console.warn('Unable to persist guest wishlist', e);
    }
  },

  // Recently viewed product slugs
  getRecentlyViewed: (): string[] => {
    try {
      const data = localStorage.getItem(RECENTLY_VIEWED_KEY);
      return data ? JSON.parse(data) : [];
    } catch {
      return [];
    }
  },
  addRecentlyViewed: (slug: string) => {
    try {
      const current = safeLocalStorage.getRecentlyViewed().filter(s => s !== slug);
      current.unshift(slug);
      localStorage.setItem(RECENTLY_VIEWED_KEY, JSON.stringify(current.slice(0, 8)));
    } catch {
      // ignore
    }
  },
};
