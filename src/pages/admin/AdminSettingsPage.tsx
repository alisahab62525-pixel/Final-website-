import React, { useEffect, useState } from 'react';
import { Save, Database, Copy, Check, ShieldCheck, Settings } from 'lucide-react';
import { settingsService } from '../../services/settingsService';
import { isSupabaseConfigured } from '../../lib/supabase';
import { useToast } from '../../contexts/ToastContext';
import { StoreSettings } from '../../types';

export const AdminSettingsPage: React.FC = () => {
  const [settings, setSettings] = useState<StoreSettings | null>(null);
  const [activeTab, setActiveTab] = useState<'store' | 'sql'>('store');
  const [saving, setSaving] = useState<boolean>(false);
  const [copiedSql, setCopiedSql] = useState<boolean>(false);
  const [sqlContent, setSqlContent] = useState<string>('');

  const { success, error } = useToast();

  useEffect(() => {
    settingsService.getSettings().then(setSettings);
  }, []);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!settings) return;
    setSaving(true);
    try {
      const updated = await settingsService.updateSettings(settings);
      setSettings(updated);
      success('Store configuration saved successfully.');
    } catch (err: any) {
      error(err.message || 'Failed to update store settings');
    } finally {
      setSaving(false);
    }
  };

  const sampleSqlMigration = `-- =========================================================================
-- ALI ONLINE STORE - PRODUCTION SUPABASE SQL MIGRATION
-- Run this script in your Supabase SQL Editor
-- =========================================================================

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 1. PROFILES TABLE
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
  minimum_order_amount NUMERIC(12, 2) NOT NULL DEFAULT 0,
  maximum_discount NUMERIC(12, 2),
  usage_limit INTEGER NOT NULL DEFAULT 100,
  used_count INTEGER NOT NULL DEFAULT 0,
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
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
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
  description TEXT DEFAULT '',
  phone TEXT NOT NULL DEFAULT '+92 300 1234567',
  email TEXT NOT NULL DEFAULT 'support@alionlinestore.pk',
  whatsapp TEXT NOT NULL DEFAULT '+92 300 1234567',
  address TEXT NOT NULL,
  business_hours TEXT NOT NULL,
  currency TEXT NOT NULL DEFAULT 'PKR',
  currency_symbol TEXT NOT NULL DEFAULT 'Rs.',
  delivery_fee NUMERIC(12, 2) NOT NULL DEFAULT 250,
  free_delivery_threshold NUMERIC(12, 2) NOT NULL DEFAULT 4000,
  social_links JSONB DEFAULT '{}'::jsonb,
  payment_instructions JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- ROW LEVEL SECURITY (RLS) POLICIES ENABLEMENT
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

-- Storage Bucket setup
INSERT INTO storage.buckets (id, name, public)
VALUES ('product-images', 'product-images', true)
ON CONFLICT (id) DO NOTHING;
`;

  const handleCopySql = () => {
    navigator.clipboard.writeText(sampleSqlMigration);
    setCopiedSql(true);
    success('Supabase SQL migration copied to clipboard!');
    setTimeout(() => setCopiedSql(false), 3000);
  };

  if (!settings) {
    return <div className="p-8 text-center text-xs text-neutral-500">Loading settings...</div>;
  }

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-neutral-200 dark:border-neutral-800">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-neutral-900 dark:text-white font-display">
            Store Configurations & Database Setup
          </h1>
          <p className="text-xs text-neutral-500 mt-1">
            General store parameters, WhatsApp contact numbers, delivery rules, and Supabase SQL schema.
          </p>
        </div>

        {/* Tab switch */}
        <div className="flex items-center gap-1 p-1 bg-neutral-200 dark:bg-neutral-800 rounded-xl text-xs font-semibold self-start sm:self-auto">
          <button
            type="button"
            onClick={() => setActiveTab('store')}
            className={`px-3 py-1.5 rounded-lg transition-colors flex items-center gap-1.5 ${
              activeTab === 'store' ? 'bg-white dark:bg-neutral-900 text-neutral-900 dark:text-white' : 'text-neutral-500'
            }`}
          >
            <Settings className="w-3.5 h-3.5" />
            <span>Store Settings</span>
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('sql')}
            className={`px-3 py-1.5 rounded-lg transition-colors flex items-center gap-1.5 ${
              activeTab === 'sql' ? 'bg-white dark:bg-neutral-900 text-neutral-900 dark:text-white' : 'text-neutral-500'
            }`}
          >
            <Database className="w-3.5 h-3.5" />
            <span>Supabase SQL Migration</span>
          </button>
        </div>
      </div>

      {activeTab === 'store' ? (
        <form onSubmit={handleSave} className="space-y-6">
          
          {/* General info */}
          <div className="p-6 rounded-2xl bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 space-y-4">
            <h2 className="text-xs font-bold uppercase tracking-wider text-neutral-900 dark:text-white">
              Identity & Contact Credentials
            </h2>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
              <div>
                <label className="block font-semibold mb-1">Store Name *</label>
                <input
                  type="text"
                  required
                  value={settings.store_name}
                  onChange={e => setSettings({ ...settings, store_name: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl border border-neutral-300 dark:border-neutral-700 bg-neutral-50 dark:bg-neutral-800"
                />
              </div>

              <div>
                <label className="block font-semibold mb-1">Support Email *</label>
                <input
                  type="email"
                  required
                  value={settings.email}
                  onChange={e => setSettings({ ...settings, email: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl border border-neutral-300 dark:border-neutral-700 bg-neutral-50 dark:bg-neutral-800"
                />
              </div>

              <div>
                <label className="block font-semibold mb-1">Direct Phone *</label>
                <input
                  type="tel"
                  required
                  value={settings.phone}
                  onChange={e => setSettings({ ...settings, phone: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl border border-neutral-300 dark:border-neutral-700 bg-neutral-50 dark:bg-neutral-800"
                />
              </div>

              <div>
                <label className="block font-semibold mb-1">WhatsApp Inquiry Number (No dashes) *</label>
                <input
                  type="text"
                  required
                  value={settings.whatsapp}
                  onChange={e => setSettings({ ...settings, whatsapp: e.target.value })}
                  placeholder="+923001234567"
                  className="w-full px-3 py-2 rounded-xl border border-neutral-300 dark:border-neutral-700 bg-neutral-50 dark:bg-neutral-800 font-mono"
                />
              </div>

              <div className="sm:col-span-2">
                <label className="block font-semibold mb-1">Physical Fulfillment Address</label>
                <input
                  type="text"
                  value={settings.address}
                  onChange={e => setSettings({ ...settings, address: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl border border-neutral-300 dark:border-neutral-700 bg-neutral-50 dark:bg-neutral-800"
                />
              </div>

              <div className="sm:col-span-2">
                <label className="block font-semibold mb-1">Store Description</label>
                <input
                  type="text"
                  value={settings.description}
                  onChange={e => setSettings({ ...settings, description: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl border border-neutral-300 dark:border-neutral-700 bg-neutral-50 dark:bg-neutral-800"
                />
              </div>
            </div>
          </div>

          {/* Delivery & Currency Rules */}
          <div className="p-6 rounded-2xl bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 space-y-4">
            <h2 className="text-xs font-bold uppercase tracking-wider text-neutral-900 dark:text-white">
              Currency & Courier Delivery Rules
            </h2>

            <div className="grid grid-cols-1 sm:grid-cols-4 gap-4 text-xs font-mono">
              <div>
                <label className="block font-sans font-semibold mb-1">Currency Code</label>
                <input
                  type="text"
                  value={settings.currency}
                  onChange={e => setSettings({ ...settings, currency: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl border border-neutral-300 dark:border-neutral-700 bg-neutral-50 dark:bg-neutral-800 font-bold"
                />
              </div>

              <div>
                <label className="block font-sans font-semibold mb-1">Display Symbol</label>
                <input
                  type="text"
                  value={settings.currency_symbol}
                  onChange={e => setSettings({ ...settings, currency_symbol: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl border border-neutral-300 dark:border-neutral-700 bg-neutral-50 dark:bg-neutral-800 font-bold"
                />
              </div>

              <div>
                <label className="block font-sans font-semibold mb-1">Base Delivery Fee (Rs.)</label>
                <input
                  type="number"
                  min={0}
                  value={settings.delivery_fee}
                  onChange={e => setSettings({ ...settings, delivery_fee: Number(e.target.value) })}
                  className="w-full px-3 py-2 rounded-xl border border-neutral-300 dark:border-neutral-700 bg-neutral-50 dark:bg-neutral-800 tabular-nums"
                />
              </div>

              <div>
                <label className="block font-sans font-semibold mb-1">Free Delivery Over (Rs.)</label>
                <input
                  type="number"
                  min={0}
                  value={settings.free_delivery_threshold}
                  onChange={e => setSettings({ ...settings, free_delivery_threshold: Number(e.target.value) })}
                  className="w-full px-3 py-2 rounded-xl border border-neutral-300 dark:border-neutral-700 bg-neutral-50 dark:bg-neutral-800 tabular-nums"
                />
              </div>
            </div>
          </div>

          {/* Payment instructions */}
          <div className="p-6 rounded-2xl bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 space-y-4">
            <h2 className="text-xs font-bold uppercase tracking-wider text-neutral-900 dark:text-white">
              Customer Payment Instructions
            </h2>

            <div className="space-y-4 text-xs">
              <div>
                <label className="block font-semibold mb-1">Meezan Bank / Direct Bank Transfer Instructions</label>
                <textarea
                  rows={3}
                  value={settings.payment_instructions.bank_transfer || ''}
                  onChange={e =>
                    setSettings({
                      ...settings,
                      payment_instructions: { ...settings.payment_instructions, bank_transfer: e.target.value },
                    })
                  }
                  className="w-full px-3 py-2 rounded-xl border border-neutral-300 dark:border-neutral-700 bg-neutral-50 dark:bg-neutral-800"
                />
              </div>

              <div>
                <label className="block font-semibold mb-1">EasyPaisa Account Details</label>
                <input
                  type="text"
                  value={settings.payment_instructions.easypaisa || ''}
                  onChange={e =>
                    setSettings({
                      ...settings,
                      payment_instructions: { ...settings.payment_instructions, easypaisa: e.target.value },
                    })
                  }
                  className="w-full px-3 py-2 rounded-xl border border-neutral-300 dark:border-neutral-700 bg-neutral-50 dark:bg-neutral-800"
                />
              </div>

              <div>
                <label className="block font-semibold mb-1">JazzCash Account Details</label>
                <input
                  type="text"
                  value={settings.payment_instructions.jazzcash || ''}
                  onChange={e =>
                    setSettings({
                      ...settings,
                      payment_instructions: { ...settings.payment_instructions, jazzcash: e.target.value },
                    })
                  }
                  className="w-full px-3 py-2 rounded-xl border border-neutral-300 dark:border-neutral-700 bg-neutral-50 dark:bg-neutral-800"
                />
              </div>
            </div>
          </div>

          <div className="flex justify-end pt-2">
            <button
              type="submit"
              disabled={saving}
              className="px-6 py-3 text-xs font-bold rounded-xl bg-neutral-900 text-white dark:bg-white dark:text-neutral-900 hover:opacity-90 transition-opacity flex items-center gap-2 shadow-lg disabled:opacity-50"
            >
              <Save className="w-4 h-4" />
              <span>{saving ? 'Saving...' : 'Save Settings'}</span>
            </button>
          </div>

        </form>
      ) : (
        /* SQL Migration Viewer (Requirement #51) */
        <div className="p-6 rounded-2xl bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-neutral-100 dark:border-neutral-800">
            <div>
              <h2 className="text-sm font-bold text-neutral-900 dark:text-white">
                PostgreSQL Database Schema & Security Policies
              </h2>
              <p className="text-xs text-neutral-500">
                Generated complete migration script with Row Level Security (RLS), updated_at triggers, and storage buckets.
              </p>
            </div>

            <button
              type="button"
              onClick={handleCopySql}
              className="px-4 py-2 text-xs font-semibold rounded-xl bg-neutral-900 text-white dark:bg-white dark:text-neutral-900 hover:opacity-90 inline-flex items-center gap-2 shadow-sm self-start sm:self-auto"
            >
              {copiedSql ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
              <span>{copiedSql ? 'Copied to Clipboard!' : 'Copy SQL Script'}</span>
            </button>
          </div>

          <div className="p-4 rounded-xl bg-neutral-950 text-neutral-200 border border-neutral-800 overflow-x-auto max-h-[500px]">
            <pre className="font-mono text-[11px] leading-relaxed whitespace-pre">
              {sampleSqlMigration}
            </pre>
          </div>

          <div className="p-4 rounded-xl bg-neutral-50 dark:bg-neutral-800 text-xs text-neutral-600 dark:text-neutral-400 space-y-1">
            <span className="font-bold text-neutral-900 dark:text-white block">How to run in Supabase:</span>
            <p>1. Open your Supabase Project Dashboard → SQL Editor.</p>
            <p>2. Click "New Query", paste the SQL above, and click "Run".</p>
            <p>3. Add your <code className="font-mono text-neutral-900 dark:text-white">VITE_SUPABASE_URL</code> and <code className="font-mono text-neutral-900 dark:text-white">VITE_SUPABASE_PUBLISHABLE_KEY</code> to your environment variables.</p>
          </div>
        </div>
      )}

    </div>
  );
};
