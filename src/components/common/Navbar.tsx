import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ShoppingBag, Heart, Search, User, Sun, Moon, Menu, X, Shield } from 'lucide-react';
import { useCart } from '../../contexts/CartContext';
import { useWishlist } from '../../contexts/WishlistContext';
import { useAuth } from '../../contexts/AuthContext';
import { useTheme } from '../../contexts/ThemeContext';

export const Navbar: React.FC = () => {
  const { itemCount } = useCart();
  const { wishlistCount } = useWishlist();
  const { user, profile, isAdmin, logout } = useAuth();
  const { theme, setTheme } = useTheme();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [showSearchInput, setShowSearchInput] = useState(false);
  const navigate = useNavigate();

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/shop?search=${encodeURIComponent(searchQuery.trim())}`);
      setShowSearchInput(false);
      setSearchQuery('');
    }
  };

  return (
    <>
      {/* Promotional Top Announcement Banner */}
      <div className="bg-neutral-900 text-neutral-200 text-xs py-2 px-4 text-center border-b border-neutral-800 flex items-center justify-center gap-2">
        <span>Free express delivery across Pakistan on orders above Rs. 4,000</span>
        <span className="text-neutral-500">·</span>
        <span className="text-neutral-400">Cash on Delivery & Bank Transfer</span>
      </div>

      {/* Main Navigation Bar */}
      <header className="sticky top-0 z-40 bg-white/95 dark:bg-neutral-900/95 backdrop-blur-md border-b border-neutral-200 dark:border-neutral-800 transition-colors">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16 gap-4">
            
            {/* Zone 1: Single text element wordmark */}
            <div className="flex items-center gap-3">
              <button
                type="button"
                className="md:hidden p-2 text-neutral-600 dark:text-neutral-300 hover:text-neutral-900 dark:hover:text-white"
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                aria-label="Toggle navigation menu"
              >
                {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
              </button>

              <Link to="/" className="text-xl font-bold tracking-tight text-neutral-900 dark:text-white font-display">
                Ali Online Store
              </Link>
            </div>

            {/* Zone 2: 4-6 clean text navigation links */}
            <nav className="hidden md:flex items-center gap-8 text-sm font-medium text-neutral-600 dark:text-neutral-300">
              <Link to="/shop" className="hover:text-neutral-900 dark:hover:text-white transition-colors">
                Shop
              </Link>
              <Link to="/categories" className="hover:text-neutral-900 dark:hover:text-white transition-colors">
                Categories
              </Link>
              <Link to="/shop?sort=newest" className="hover:text-neutral-900 dark:hover:text-white transition-colors">
                New Arrivals
              </Link>
              <Link to="/about" className="hover:text-neutral-900 dark:hover:text-white transition-colors">
                About
              </Link>
              <Link to="/contact" className="hover:text-neutral-900 dark:hover:text-white transition-colors">
                Contact
              </Link>
            </nav>

            {/* Zone 3: Primary Actions */}
            <div className="flex items-center gap-2 sm:gap-3">
              {/* Search Toggle / Input */}
              {showSearchInput ? (
                <form onSubmit={handleSearchSubmit} className="relative flex items-center">
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={e => setSearchQuery(e.target.value)}
                    placeholder="Search products..."
                    autoFocus
                    className="w-40 sm:w-56 px-3 py-1.5 text-xs rounded-lg border border-neutral-300 dark:border-neutral-700 bg-neutral-50 dark:bg-neutral-800 text-neutral-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-neutral-900 dark:focus:ring-white"
                  />
                  <button
                    type="button"
                    onClick={() => setShowSearchInput(false)}
                    className="ml-1 p-1 text-neutral-400 hover:text-neutral-600 dark:hover:text-neutral-200"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </form>
              ) : (
                <button
                  type="button"
                  onClick={() => setShowSearchInput(true)}
                  className="p-2 text-neutral-600 dark:text-neutral-300 hover:text-neutral-900 dark:hover:text-white transition-colors rounded-lg"
                  aria-label="Search"
                >
                  <Search className="w-5 h-5" />
                </button>
              )}

              {/* Wishlist */}
              <Link
                to="/wishlist"
                className="relative p-2 text-neutral-600 dark:text-neutral-300 hover:text-neutral-900 dark:hover:text-white transition-colors rounded-lg"
                aria-label="Wishlist"
              >
                <Heart className="w-5 h-5" />
                {wishlistCount > 0 && (
                  <span className="absolute top-1 right-1 w-4 h-4 text-[10px] font-semibold text-white bg-neutral-900 dark:bg-white dark:text-neutral-900 rounded-full flex items-center justify-center">
                    {wishlistCount}
                  </span>
                )}
              </Link>

              {/* Cart */}
              <Link
                to="/cart"
                className="relative p-2 text-neutral-600 dark:text-neutral-300 hover:text-neutral-900 dark:hover:text-white transition-colors rounded-lg"
                aria-label="Shopping Cart"
              >
                <ShoppingBag className="w-5 h-5" />
                {itemCount > 0 && (
                  <span className="absolute top-1 right-1 w-4 h-4 text-[10px] font-semibold text-white bg-neutral-900 dark:bg-white dark:text-neutral-900 rounded-full flex items-center justify-center">
                    {itemCount}
                  </span>
                )}
              </Link>

              {/* Theme toggle */}
              <button
                type="button"
                onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
                className="p-2 text-neutral-600 dark:text-neutral-300 hover:text-neutral-900 dark:hover:text-white transition-colors rounded-lg"
                aria-label="Toggle theme"
              >
                {theme === 'dark' ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
              </button>

              {/* User Account / Admin Badge */}
              {user ? (
                <div className="flex items-center gap-2 pl-1">
                  {isAdmin && (
                    <Link
                      to="/admin"
                      className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-white bg-neutral-900 dark:bg-neutral-800 rounded-lg hover:bg-neutral-800 dark:hover:bg-neutral-700 transition-colors"
                    >
                      <Shield className="w-3.5 h-3.5 text-amber-400" />
                      <span>Admin Panel</span>
                    </Link>
                  )}
                  <Link
                    to="/account"
                    className="p-2 text-neutral-600 dark:text-neutral-300 hover:text-neutral-900 dark:hover:text-white transition-colors rounded-lg flex items-center gap-1.5"
                    title={profile?.full_name || 'My Account'}
                  >
                    <User className="w-5 h-5" />
                    <span className="hidden xl:inline text-xs font-medium max-w-[90px] truncate">
                      {profile?.full_name?.split(' ')[0] || 'Account'}
                    </span>
                  </Link>
                </div>
              ) : (
                <Link
                  to="/login"
                  className="px-3.5 py-1.5 text-xs font-medium text-white bg-neutral-900 dark:bg-white dark:text-neutral-900 rounded-lg hover:bg-neutral-800 dark:hover:bg-neutral-100 transition-colors whitespace-nowrap"
                >
                  Sign In
                </Link>
              )}
            </div>

          </div>
        </div>

        {/* Mobile Navigation Dropdown */}
        {mobileMenuOpen && (
          <div className="md:hidden border-t border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 px-4 pt-3 pb-5 space-y-3">
            <Link
              to="/shop"
              onClick={() => setMobileMenuOpen(false)}
              className="block text-sm font-medium text-neutral-700 dark:text-neutral-200 py-1"
            >
              Shop All Products
            </Link>
            <Link
              to="/categories"
              onClick={() => setMobileMenuOpen(false)}
              className="block text-sm font-medium text-neutral-700 dark:text-neutral-200 py-1"
            >
              Categories
            </Link>
            <Link
              to="/shop?sort=newest"
              onClick={() => setMobileMenuOpen(false)}
              className="block text-sm font-medium text-neutral-700 dark:text-neutral-200 py-1"
            >
              New Arrivals
            </Link>
            <Link
              to="/about"
              onClick={() => setMobileMenuOpen(false)}
              className="block text-sm font-medium text-neutral-700 dark:text-neutral-200 py-1"
            >
              About Ali Store
            </Link>
            <Link
              to="/contact"
              onClick={() => setMobileMenuOpen(false)}
              className="block text-sm font-medium text-neutral-700 dark:text-neutral-200 py-1"
            >
              Customer Support
            </Link>

            {isAdmin && (
              <Link
                to="/admin"
                onClick={() => setMobileMenuOpen(false)}
                className="flex items-center gap-2 text-sm font-medium text-amber-600 dark:text-amber-400 py-1 border-t border-neutral-100 dark:border-neutral-800 pt-2"
              >
                <Shield className="w-4 h-4" />
                <span>Admin Dashboard</span>
              </Link>
            )}

            {user && (
              <div className="border-t border-neutral-100 dark:border-neutral-800 pt-2 flex items-center justify-between">
                <Link
                  to="/account"
                  onClick={() => setMobileMenuOpen(false)}
                  className="text-sm font-medium text-neutral-900 dark:text-white"
                >
                  My Account ({profile?.full_name})
                </Link>
                <button
                  onClick={() => {
                    logout();
                    setMobileMenuOpen(false);
                  }}
                  className="text-xs text-rose-500 hover:text-rose-600 font-medium"
                >
                  Sign Out
                </button>
              </div>
            )}
          </div>
        )}
      </header>
    </>
  );
};
