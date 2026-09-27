-- =========================================================================
-- ALI ONLINE STORE - COMPLETE POSTGRESQL / SUPABASE DATABASE SCHEMA
-- Generated for Ali Online Store (React + TypeScript + Supabase)
-- =========================================================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 1. PROFILES TABLE (Associated with auth.users)
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name TEXT NOT NULL,
  email TEXT NOT NULL UNIQUE,
  phone TEXT DEFAULT '',
  role TEXT NOT NULL DEFAULT 'customer' CHECK (role IN ('customer', 'admin')),
  avatar_url TEXT DEFAULT '',
  created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- 2. CATEGORIES TABLE
CREATE TABLE IF NOT EXISTS public.categories (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE,
  description TEXT DEFAULT '',
  image_url TEXT DEFAULT '',
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- 3. PRODUCTS TABLE
CREATE TABLE IF NOT EXISTS public.products (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE,
  description TEXT NOT NULL DEFAULT '',
  short_description TEXT NOT NULL DEFAULT '',
  sku TEXT NOT NULL UNIQUE,
  brand TEXT NOT NULL DEFAULT '',
  price NUMERIC(12, 2) NOT NULL CHECK (price >= 0),
  discount_price NUMERIC(12, 2) CHECK (discount_price IS NULL OR discount_price >= 0),
  category_id UUID NOT NULL REFERENCES public.categories(id) ON DELETE RESTRICT,
  stock_quantity INTEGER NOT NULL DEFAULT 0 CHECK (stock_quantity >= 0),
  low_stock_threshold INTEGER NOT NULL DEFAULT 5 CHECK (low_stock_threshold >= 0),
  is_active BOOLEAN NOT NULL DEFAULT true,
  is_featured BOOLEAN NOT NULL DEFAULT false,
  is_best_seller BOOLEAN NOT NULL DEFAULT false,
  is_new_arrival BOOLEAN NOT NULL DEFAULT false,
  rating NUMERIC(3, 2) NOT NULL DEFAULT 5.0 CHECK (rating >= 0 AND rating <= 5),
  review_count INTEGER NOT NULL DEFAULT 0 CHECK (review_count >= 0),
  variants JSONB DEFAULT '[]'::jsonb,
  specifications JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- 4. PRODUCT IMAGES TABLE
CREATE TABLE IF NOT EXISTS public.product_images (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  product_id UUID NOT NULL REFERENCES public.products(id) ON DELETE CASCADE,
  image_url TEXT NOT NULL,
  alt_text TEXT DEFAULT '',
  sort_order INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- 5. ADDRESSES TABLE
CREATE TABLE IF NOT EXISTS public.addresses (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name TEXT NOT NULL,
  phone TEXT NOT NULL,
  address_line TEXT NOT NULL,
  area TEXT NOT NULL,
  city TEXT NOT NULL,
  postal_code TEXT NOT NULL,
  is_default BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- 6. ORDERS TABLE
CREATE TABLE IF NOT EXISTS public.orders (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  order_number TEXT NOT NULL UNIQUE,
  customer_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE RESTRICT,
  subtotal NUMERIC(12, 2) NOT NULL CHECK (subtotal >= 0),
  discount NUMERIC(12, 2) NOT NULL DEFAULT 0 CHECK (discount >= 0),
  delivery_fee NUMERIC(12, 2) NOT NULL DEFAULT 0 CHECK (delivery_fee >= 0),
  total NUMERIC(12, 2) NOT NULL CHECK (total >= 0),
  payment_method TEXT NOT NULL CHECK (payment_method IN ('cash_on_delivery', 'bank_transfer', 'easypaisa', 'jazzcash')),
  payment_status TEXT NOT NULL DEFAULT 'pending' CHECK (payment_status IN ('pending', 'paid', 'failed', 'refunded')),
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'confirmed', 'processing', 'shipped', 'delivered', 'cancelled')),
  shipping_full_name TEXT NOT NULL,
  shipping_phone TEXT NOT NULL,
  shipping_email TEXT NOT NULL,
  shipping_address TEXT NOT NULL,
  shipping_area TEXT NOT NULL,
  shipping_city TEXT NOT NULL,
  shipping_postal_code TEXT NOT NULL,
  customer_notes TEXT DEFAULT '',
  admin_notes TEXT DEFAULT '',
  courier TEXT DEFAULT '',
  tracking_number TEXT DEFAULT '',
  created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- 7. ORDER ITEMS TABLE
CREATE TABLE IF NOT EXISTS public.order_items (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  order_id UUID NOT NULL REFERENCES public.orders(id) ON DELETE CASCADE,
  product_id UUID REFERENCES public.products(id) ON DELETE SET NULL,
  product_name TEXT NOT NULL,
  product_image TEXT NOT NULL DEFAULT '',
  quantity INTEGER NOT NULL CHECK (quantity > 0),
  unit_price NUMERIC(12, 2) NOT NULL CHECK (unit_price >= 0),
  variant TEXT DEFAULT '',
  created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- 8. COUPONS TABLE
CREATE TABLE IF NOT EXISTS public.coupons (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  code TEXT NOT NULL UNIQUE,
  discount_type TEXT NOT NULL CHECK (discount_type IN ('percentage', 'fixed')),
  discount_value NUMERIC(12, 2) NOT NULL CHECK (discount_value > 0),
  minimum_order_amount NUMERIC(12, 2) NOT NULL DEFAULT 0 CHECK (minimum_order_amount >= 0),
  maximum_discount NUMERIC(12, 2) CHECK (maximum_discount IS NULL OR maximum_discount > 0),
  usage_limit INTEGER NOT NULL DEFAULT 100 CHECK (usage_limit >= 0),
  used_count INTEGER NOT NULL DEFAULT 0 CHECK (used_count >= 0),
  expires_at TIMESTAMPTZ NOT NULL,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- 9. REVIEWS TABLE
CREATE TABLE IF NOT EXISTS public.reviews (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  product_id UUID NOT NULL REFERENCES public.products(id) ON DELETE CASCADE,
  customer_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
  comment TEXT NOT NULL,
  is_approved BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- 10. NOTIFICATIONS TABLE
CREATE TABLE IF NOT EXISTS public.notifications (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE, -- NULL means store administrator
  type TEXT NOT NULL,
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  order_id UUID REFERENCES public.orders(id) ON DELETE SET NULL,
  is_read BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- 11. STORE SETTINGS TABLE
CREATE TABLE IF NOT EXISTS public.store_settings (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  store_name TEXT NOT NULL DEFAULT 'Ali Online Store',
  logo_url TEXT DEFAULT '',
  description TEXT DEFAULT 'Premium quality electronics, fashion, and home lifestyle essentials.',
  phone TEXT NOT NULL DEFAULT '+92 300 1234567',
  email TEXT NOT NULL DEFAULT 'support@alionlinestore.pk',
  whatsapp TEXT NOT NULL DEFAULT '+92 300 1234567',
  address TEXT NOT NULL DEFAULT 'Ali Commercial Center, Main Boulevard, Gulberg III, Lahore, Pakistan',
  business_hours TEXT NOT NULL DEFAULT 'Monday - Saturday: 9:00 AM - 10:00 PM PKT',
  currency TEXT NOT NULL DEFAULT 'PKR',
  currency_symbol TEXT NOT NULL DEFAULT 'Rs.',
  delivery_fee NUMERIC(12, 2) NOT NULL DEFAULT 200,
  free_delivery_threshold NUMERIC(12, 2) NOT NULL DEFAULT 3000,
  social_links JSONB DEFAULT '{"facebook":"https://facebook.com","instagram":"https://instagram.com"}'::jsonb,
  payment_instructions JSONB DEFAULT '{"bank_transfer":"Meezan Bank Ltd | Acc: 01020304050607","easypaisa":"03001234567 (Ali Store)","jazzcash":"03001234567 (Ali Store)"}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- =========================================================================
-- HELPER FUNCTIONS & TRIGGERS
-- =========================================================================

-- Automatic updated_at trigger function
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = timezone('utc'::text, now());
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply updated_at triggers
DO $$
DECLARE
  t text;
BEGIN
  FOREACH t IN ARRAY ARRAY['profiles', 'categories', 'products', 'addresses', 'orders', 'coupons', 'reviews', 'store_settings'] LOOP
    EXECUTE format('DROP TRIGGER IF EXISTS tr_%I_updated_at ON %I;', t, t);
    EXECUTE format('CREATE TRIGGER tr_%I_updated_at BEFORE UPDATE ON %I FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();', t, t);
  END LOOP;
END;
$$;

-- Helper to check if current user is an admin
CREATE OR REPLACE FUNCTION is_admin()
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM public.profiles
    WHERE id = auth.uid() AND role = 'admin'
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Automatic profile creation on user signup
-- Enforces customer role for all public registrations
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, full_name, email, phone, role)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'full_name', 'Customer'),
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'phone', ''),
    'customer' -- STRICT: Always creates customer, never admin!
  )
  ON CONFLICT (id) DO NOTHING;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE handle_new_user();

-- =========================================================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- =========================================================================

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.product_images ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.addresses ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.order_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.coupons ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.reviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.store_settings ENABLE ROW LEVEL SECURITY;

-- 1. Profiles
CREATE POLICY "Public read customer full_name / avatar" ON public.profiles FOR SELECT USING (true);
CREATE POLICY "Users can update own profile" ON public.profiles FOR UPDATE USING (auth.uid() = id);
CREATE POLICY "Admins have full access to profiles" ON public.profiles FOR ALL USING (is_admin());

-- 2. Categories
CREATE POLICY "Public can view active categories" ON public.categories FOR SELECT USING (is_active = true OR is_admin());
CREATE POLICY "Admins can manage categories" ON public.categories FOR ALL USING (is_admin());

-- 3. Products
CREATE POLICY "Public can view active products" ON public.products FOR SELECT USING (is_active = true OR is_admin());
CREATE POLICY "Admins can manage products" ON public.products FOR ALL USING (is_admin());

-- 4. Product Images
CREATE POLICY "Public can view product images" ON public.product_images FOR SELECT USING (true);
CREATE POLICY "Admins can manage product images" ON public.product_images FOR ALL USING (is_admin());

-- 5. Addresses
CREATE POLICY "Users manage own addresses" ON public.addresses FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Admins can view customer addresses" ON public.addresses FOR SELECT USING (is_admin());

-- 6. Orders
CREATE POLICY "Customers view own orders" ON public.orders FOR SELECT USING (auth.uid() = customer_id OR is_admin());
CREATE POLICY "Customers create own orders" ON public.orders FOR INSERT WITH CHECK (auth.uid() = customer_id);
CREATE POLICY "Admins update orders" ON public.orders FOR UPDATE USING (is_admin());

-- 7. Order Items
CREATE POLICY "Customers view own order items" ON public.order_items FOR SELECT USING (
  EXISTS (SELECT 1 FROM public.orders WHERE orders.id = order_items.order_id AND orders.customer_id = auth.uid())
  OR is_admin()
);
CREATE POLICY "Customers insert order items" ON public.order_items FOR INSERT WITH CHECK (
  EXISTS (SELECT 1 FROM public.orders WHERE orders.id = order_items.order_id AND orders.customer_id = auth.uid())
);
CREATE POLICY "Admins manage order items" ON public.order_items FOR ALL USING (is_admin());

-- 8. Coupons
CREATE POLICY "Public can read active coupons" ON public.coupons FOR SELECT USING (is_active = true OR is_admin());
CREATE POLICY "Admins can manage coupons" ON public.coupons FOR ALL USING (is_admin());

-- 9. Reviews
CREATE POLICY "Public can view approved reviews" ON public.reviews FOR SELECT USING (is_approved = true OR auth.uid() = customer_id OR is_admin());
CREATE POLICY "Verified customers can insert reviews" ON public.reviews FOR INSERT WITH CHECK (
  auth.uid() = customer_id AND EXISTS (
    SELECT 1 FROM public.orders o
    JOIN public.order_items oi ON oi.order_id = o.id
    WHERE o.customer_id = auth.uid() AND oi.product_id = reviews.product_id AND o.status = 'delivered'
  )
);
CREATE POLICY "Admins can manage reviews" ON public.reviews FOR ALL USING (is_admin());

-- 10. Notifications
CREATE POLICY "Users read own notifications" ON public.notifications FOR SELECT USING (
  auth.uid() = user_id OR (user_id IS NULL AND is_admin())
);
CREATE POLICY "Users update own notifications" ON public.notifications FOR UPDATE USING (
  auth.uid() = user_id OR (user_id IS NULL AND is_admin())
);
CREATE POLICY "System/Admins insert notifications" ON public.notifications FOR INSERT WITH CHECK (true);

-- 11. Store Settings
CREATE POLICY "Public can view store settings" ON public.store_settings FOR SELECT USING (true);
CREATE POLICY "Admins can update store settings" ON public.store_settings FOR ALL USING (is_admin());

-- =========================================================================
-- STORAGE BUCKET CONFIGURATION (product-images)
-- =========================================================================
INSERT INTO storage.buckets (id, name, public)
VALUES ('product-images', 'product-images', true)
ON CONFLICT (id) DO NOTHING;

CREATE POLICY "Public Access product-images" ON storage.objects FOR SELECT USING (bucket_id = 'product-images');
CREATE POLICY "Admin Upload product-images" ON storage.objects FOR INSERT WITH CHECK (bucket_id = 'product-images' AND is_admin());
CREATE POLICY "Admin Update product-images" ON storage.objects FOR UPDATE USING (bucket_id = 'product-images' AND is_admin());
CREATE POLICY "Admin Delete product-images" ON storage.objects FOR DELETE USING (bucket_id = 'product-images' AND is_admin());
