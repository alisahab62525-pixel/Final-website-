import React from 'react';

export const PrivacyPage: React.FC = () => {
  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-16 space-y-6 text-neutral-700 dark:text-neutral-300 text-xs leading-relaxed">
      <h1 className="text-2xl font-bold text-neutral-900 dark:text-white font-display">
        Privacy & Data Security Policy
      </h1>
      <p className="text-neutral-500">Last updated: March 2026</p>

      <section className="space-y-2 pt-4">
        <h2 className="text-sm font-semibold text-neutral-900 dark:text-white">1. Scope and Storage Protection</h2>
        <p>
          At Ali Online Store, customer privacy and cryptographic security are core commitments. In accordance with strict database governance, customer accounts, orders, and addresses are secured via Supabase Row Level Security (RLS) policies.
        </p>
      </section>

      <section className="space-y-2 pt-4">
        <h2 className="text-sm font-semibold text-neutral-900 dark:text-white">2. Local Storage Restrictions</h2>
        <p>
          As part of our data protection guidelines, passwords, payment PINs, and administrative credentials are never written to client LocalStorage. LocalStorage is strictly used for guest cart items, guest wishlists, and theme preferences.
        </p>
      </section>

      <section className="space-y-2 pt-4">
        <h2 className="text-sm font-semibold text-neutral-900 dark:text-white">3. Courier Information Sharing</h2>
        <p>
          Delivery details (Recipient Name, Shipping Address, Phone Number) are only transmitted to licensed national delivery partners (TCS, Leopards) strictly for parcel transit and verification.
        </p>
      </section>
    </div>
  );
};
