import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';

// Providers
import { ThemeProvider } from './contexts/ThemeContext';
import { ToastProvider } from './contexts/ToastContext';
import { AuthProvider } from './contexts/AuthContext';
import { CartProvider } from './contexts/CartContext';
import { WishlistProvider } from './contexts/WishlistContext';

// Layouts
import { CustomerLayout } from './layouts/CustomerLayout';
import { AdminLayout } from './layouts/AdminLayout';

// Customer Pages
import { HomePage } from './pages/customer/HomePage';
import { ShopPage } from './pages/customer/ShopPage';
import { CategoriesPage } from './pages/customer/CategoriesPage';
import { CategoryDetailPage } from './pages/customer/CategoryDetailPage';
import { ProductDetailPage } from './pages/customer/ProductDetailPage';
import { SearchPage } from './pages/customer/SearchPage';
import { CartPage } from './pages/customer/CartPage';
import { WishlistPage } from './pages/customer/WishlistPage';
import { LoginPage } from './pages/customer/LoginPage';
import { RegisterPage } from './pages/customer/RegisterPage';
import { CheckoutPage } from './pages/customer/CheckoutPage';
import { OrderSuccessPage } from './pages/customer/OrderSuccessPage';

// Account Pages
import { AccountLayout } from './pages/customer/AccountLayout';
import { AccountOverviewPage } from './pages/customer/AccountOverviewPage';
import { AccountOrdersPage } from './pages/customer/AccountOrdersPage';
import { AccountOrderDetailPage } from './pages/customer/AccountOrderDetailPage';
import { AccountProfilePage } from './pages/customer/AccountProfilePage';
import { AccountAddressesPage } from './pages/customer/AccountAddressesPage';

// Trust Pages
import { AboutPage } from './pages/customer/AboutPage';
import { ContactPage } from './pages/customer/ContactPage';
import { FaqPage } from './pages/customer/FaqPage';
import { PrivacyPage } from './pages/customer/PrivacyPage';
import { TermsPage } from './pages/customer/TermsPage';

// Admin Pages
import { AdminLoginPage } from './pages/admin/AdminLoginPage';
import { AdminDashboardPage } from './pages/admin/AdminDashboardPage';
import { AdminOrdersPage } from './pages/admin/AdminOrdersPage';
import { AdminOrderDetailPage } from './pages/admin/AdminOrderDetailPage';
import { AdminProductsPage } from './pages/admin/AdminProductsPage';
import { AdminProductFormPage } from './pages/admin/AdminProductFormPage';
import { AdminCategoriesPage } from './pages/admin/AdminCategoriesPage';
import { AdminInventoryPage } from './pages/admin/AdminInventoryPage';
import { AdminCustomersPage } from './pages/admin/AdminCustomersPage';
import { AdminCouponsPage } from './pages/admin/AdminCouponsPage';
import { AdminReviewsPage } from './pages/admin/AdminReviewsPage';
import { AdminNotificationsPage } from './pages/admin/AdminNotificationsPage';
import { AdminSettingsPage } from './pages/admin/AdminSettingsPage';

export default function App() {
  return (
    <ThemeProvider>
      <ToastProvider>
        <AuthProvider>
          <CartProvider>
            <WishlistProvider>
              <BrowserRouter>
                <Routes>
                  {/* Public & Customer Website Routes */}
                  <Route element={<CustomerLayout />}>
                    <Route path="/" element={<HomePage />} />
                    <Route path="/shop" element={<ShopPage />} />
                    <Route path="/categories" element={<CategoriesPage />} />
                    <Route path="/category/:slug" element={<CategoryDetailPage />} />
                    <Route path="/product/:slug" element={<ProductDetailPage />} />
                    <Route path="/search" element={<SearchPage />} />
                    <Route path="/cart" element={<CartPage />} />
                    <Route path="/wishlist" element={<WishlistPage />} />
                    <Route path="/login" element={<LoginPage />} />
                    <Route path="/register" element={<RegisterPage />} />
                    <Route path="/checkout" element={<CheckoutPage />} />
                    <Route path="/order-success/:id" element={<OrderSuccessPage />} />
                    <Route path="/about" element={<AboutPage />} />
                    <Route path="/contact" element={<ContactPage />} />
                    <Route path="/faq" element={<FaqPage />} />
                    <Route path="/privacy" element={<PrivacyPage />} />
                    <Route path="/terms" element={<TermsPage />} />

                    {/* Authenticated Customer Account Area */}
                    <Route path="/account" element={<AccountLayout />}>
                      <Route index element={<AccountOverviewPage />} />
                      <Route path="orders" element={<AccountOrdersPage />} />
                      <Route path="orders/:id" element={<AccountOrderDetailPage />} />
                      <Route path="profile" element={<AccountProfilePage />} />
                      <Route path="addresses" element={<AccountAddressesPage />} />
                    </Route>
                  </Route>

                  {/* Private Admin Login (Standalone) */}
                  <Route path="/admin/login" element={<AdminLoginPage />} />

                  {/* Private Admin Portal Area */}
                  <Route path="/admin" element={<AdminLayout />}>
                    <Route index element={<AdminDashboardPage />} />
                    <Route path="orders" element={<AdminOrdersPage />} />
                    <Route path="orders/:id" element={<AdminOrderDetailPage />} />
                    <Route path="products" element={<AdminProductsPage />} />
                    <Route path="products/new" element={<AdminProductFormPage />} />
                    <Route path="products/:id/edit" element={<AdminProductFormPage />} />
                    <Route path="categories" element={<AdminCategoriesPage />} />
                    <Route path="inventory" element={<AdminInventoryPage />} />
                    <Route path="customers" element={<AdminCustomersPage />} />
                    <Route path="coupons" element={<AdminCouponsPage />} />
                    <Route path="reviews" element={<AdminReviewsPage />} />
                    <Route path="notifications" element={<AdminNotificationsPage />} />
                    <Route path="settings" element={<AdminSettingsPage />} />
                  </Route>

                  {/* Fallback */}
                  <Route path="*" element={<Navigate to="/" replace />} />
                </Routes>
              </BrowserRouter>
            </WishlistProvider>
          </CartProvider>
        </AuthProvider>
      </ToastProvider>
    </ThemeProvider>
  );
}
