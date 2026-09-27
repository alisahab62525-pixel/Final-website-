import React from 'react';

export const TermsPage: React.FC = () => {
  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-16 space-y-6 text-neutral-700 dark:text-neutral-300 text-xs leading-relaxed">
      <h1 className="text-2xl font-bold text-neutral-900 dark:text-white font-display">
        Terms of Service
      </h1>
      <p className="text-neutral-500">Effective Date: March 2026</p>

      <section className="space-y-2 pt-4">
        <h2 className="text-sm font-semibold text-neutral-900 dark:text-white">1. Authenticated Purchasing</h2>
        <p>
          While browsing Ali Online Store is open to all visitors, finalizing an order and accessing shipping records requires an authenticated customer profile.
        </p>
      </section>

      <section className="space-y-2 pt-4">
        <h2 className="text-sm font-semibold text-neutral-900 dark:text-white">2. Currency and Pricing</h2>
        <p>
          All product valuations and invoices are computed in Pakistani Rupees (PKR / Rs.). Coupon discounts and order subtotals are validated server-side to guarantee cryptographic accuracy.
        </p>
      </section>

      <section className="space-y-2 pt-4">
        <h2 className="text-sm font-semibold text-neutral-900 dark:text-white">3. Cash on Delivery Policy</h2>
        <p>
          For Cash on Delivery orders, customers are expected to receive packages from the courier and provide exact payment upon delivery. Repeated unaccepted shipments may result in account restriction.
        </p>
      </section>
    </div>
  );
};
