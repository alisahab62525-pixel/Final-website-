import React from 'react';
import { ShieldCheck, Sparkles, Truck, Award } from 'lucide-react';

export const AboutPage: React.FC = () => {
  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16 space-y-12">
      
      <div className="text-center space-y-3">
        <span className="text-xs uppercase tracking-wider text-neutral-500 font-medium">Our Story & Heritage</span>
        <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-neutral-900 dark:text-white font-display">
          Ali Online Store
        </h1>
        <p className="text-xs sm:text-sm text-neutral-500 dark:text-neutral-400 max-w-xl mx-auto leading-relaxed">
          Founded in Lahore, Pakistan, Ali Online Store bridges discerning shoppers with authentic acoustics, natural fabric garments, and minimalist architectural living objects.
        </p>
      </div>

      <div className="prose dark:prose-invert max-w-none text-xs sm:text-sm text-neutral-600 dark:text-neutral-300 space-y-4 leading-relaxed">
        <p>
          At Ali Online Store, we reject artificial markup and transient fashion trends. Every piece cataloged on our storefront undergoes rigorous quality appraisal—from soundstage verification on beryllium studio drivers to tactile material testing on European Normandy linen.
        </p>
        <p>
          Whether delivering to Karachi, Islamabad, Peshawar, or Gilgit, our logistics infrastructure partners with premier national couriers (TCS Express & Leopards) ensuring full parcel tracking, tamper-evident seals, and reliable Cash on Delivery verification.
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 pt-6">
        <div className="p-6 rounded-2xl bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 space-y-2">
          <Award className="w-5 h-5 text-neutral-900 dark:text-white" />
          <h3 className="text-sm font-bold text-neutral-900 dark:text-white">Curated Integrity</h3>
          <p className="text-xs text-neutral-500">Only verified manufacturers with demonstrated quality craftsmanship.</p>
        </div>

        <div className="p-6 rounded-2xl bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 space-y-2">
          <Truck className="w-5 h-5 text-neutral-900 dark:text-white" />
          <h3 className="text-sm font-bold text-neutral-900 dark:text-white">Nationwide Reach</h3>
          <p className="text-xs text-neutral-500">Fast 2-4 business day courier transit across all major Pakistani territories.</p>
        </div>

        <div className="p-6 rounded-2xl bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 space-y-2">
          <ShieldCheck className="w-5 h-5 text-neutral-900 dark:text-white" />
          <h3 className="text-sm font-bold text-neutral-900 dark:text-white">Customer First</h3>
          <p className="text-xs text-neutral-500">Personalized assistance on WhatsApp and seamless order tracking.</p>
        </div>
      </div>

    </div>
  );
};
