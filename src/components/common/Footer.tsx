import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { ShieldCheck, Truck, Clock, MessageSquare, ArrowUpRight } from 'lucide-react';
import { settingsService } from '../../services/settingsService';
import { StoreSettings } from '../../types';

export const Footer: React.FC = () => {
  const [settings, setSettings] = useState<StoreSettings | null>(null);

  useEffect(() => {
    settingsService.getSettings().then(setSettings);
  }, []);

  return (
    <footer className="bg-white dark:bg-neutral-900 border-t border-neutral-200 dark:border-neutral-800 pt-16 pb-12 transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Trust Badges Bar */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 pb-12 border-b border-neutral-200 dark:border-neutral-800">
          <div className="flex items-start gap-3.5">
            <div className="p-2.5 rounded-xl bg-neutral-100 dark:bg-neutral-800 text-neutral-900 dark:text-white shrink-0">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <h4 className="text-sm font-semibold text-neutral-900 dark:text-white">Authentic Guarantee</h4>
              <p className="text-xs text-neutral-500 dark:text-neutral-400 mt-1">100% verified authentic goods inspected prior to dispatch.</p>
            </div>
          </div>

          <div className="flex items-start gap-3.5">
            <div className="p-2.5 rounded-xl bg-neutral-100 dark:bg-neutral-800 text-neutral-900 dark:text-white shrink-0">
              <Truck className="w-5 h-5" />
            </div>
            <div>
              <h4 className="text-sm font-semibold text-neutral-900 dark:text-white">Nationwide Delivery</h4>
              <p className="text-xs text-neutral-500 dark:text-neutral-400 mt-1">Insured courier dispatch via TCS & Leopards across Pakistan.</p>
            </div>
          </div>

          <div className="flex items-start gap-3.5">
            <div className="p-2.5 rounded-xl bg-neutral-100 dark:bg-neutral-800 text-neutral-900 dark:text-white shrink-0">
              <Clock className="w-5 h-5" />
            </div>
            <div>
              <h4 className="text-sm font-semibold text-neutral-900 dark:text-white">Swift Order Turnaround</h4>
              <p className="text-xs text-neutral-500 dark:text-neutral-400 mt-1">Orders processed and shipped within 24 business hours.</p>
            </div>
          </div>

          <div className="flex items-start gap-3.5">
            <div className="p-2.5 rounded-xl bg-neutral-100 dark:bg-neutral-800 text-neutral-900 dark:text-white shrink-0">
              <MessageSquare className="w-5 h-5" />
            </div>
            <div>
              <h4 className="text-sm font-semibold text-neutral-900 dark:text-white">Direct WhatsApp Support</h4>
              <p className="text-xs text-neutral-500 dark:text-neutral-400 mt-1">Real human support on {settings?.phone || '+92 300 1234567'}.</p>
            </div>
          </div>
        </div>

        {/* Footer Navigation Columns */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-10 py-12">
          {/* Column 1: Store Brand */}
          <div className="md:col-span-1">
            <Link to="/" className="text-lg font-bold text-neutral-900 dark:text-white font-display">
              {settings?.store_name || 'Ali Online Store'}
            </Link>
            <p className="text-xs text-neutral-500 dark:text-neutral-400 mt-3 leading-relaxed">
              {settings?.description || 'Curated high-standard electronics, everyday luxury fashion, and refined home aesthetics.'}
            </p>
            <div className="mt-4 text-xs text-neutral-500 dark:text-neutral-400 space-y-1">
              <p>{settings?.address || 'Lahore, Pakistan'}</p>
              <p>{settings?.phone || '+92 300 1234567'}</p>
              <p>{settings?.email || 'support@alionlinestore.pk'}</p>
            </div>
          </div>

          {/* Column 2: Collections */}
          <div>
            <h5 className="text-xs font-semibold uppercase tracking-wider text-neutral-900 dark:text-white mb-4">
              Collections
            </h5>
            <ul className="space-y-2.5 text-xs text-neutral-600 dark:text-neutral-400">
              <li>
                <Link to="/category/electronics-audio" className="hover:text-neutral-900 dark:hover:text-white transition-colors">
                  Electronics & Audio
                </Link>
              </li>
              <li>
                <Link to="/category/fashion-apparel" className="hover:text-neutral-900 dark:hover:text-white transition-colors">
                  Fashion & Apparel
                </Link>
              </li>
              <li>
                <Link to="/category/home-living" className="hover:text-neutral-900 dark:hover:text-white transition-colors">
                  Home & Living
                </Link>
              </li>
              <li>
                <Link to="/category/footwear-sneakers" className="hover:text-neutral-900 dark:hover:text-white transition-colors">
                  Footwear & Sneakers
                </Link>
              </li>
              <li>
                <Link to="/category/watches-accessories" className="hover:text-neutral-900 dark:hover:text-white transition-colors">
                  Watches & Accessories
                </Link>
              </li>
            </ul>
          </div>

          {/* Column 3: Customer Care */}
          <div>
            <h5 className="text-xs font-semibold uppercase tracking-wider text-neutral-900 dark:text-white mb-4">
              Customer Care
            </h5>
            <ul className="space-y-2.5 text-xs text-neutral-600 dark:text-neutral-400">
              <li>
                <Link to="/account/orders" className="hover:text-neutral-900 dark:hover:text-white transition-colors">
                  Track Order
                </Link>
              </li>
              <li>
                <Link to="/contact" className="hover:text-neutral-900 dark:hover:text-white transition-colors">
                  Contact Support
                </Link>
              </li>
              <li>
                <Link to="/faq" className="hover:text-neutral-900 dark:hover:text-white transition-colors">
                  Shipping & COD FAQs
                </Link>
              </li>
              <li>
                <Link to="/privacy" className="hover:text-neutral-900 dark:hover:text-white transition-colors">
                  Privacy Policy
                </Link>
              </li>
              <li>
                <Link to="/terms" className="hover:text-neutral-900 dark:hover:text-white transition-colors">
                  Terms of Service
                </Link>
              </li>
            </ul>
          </div>

          {/* Column 4: WhatsApp Direct & Admin Portal */}
          <div>
            <h5 className="text-xs font-semibold uppercase tracking-wider text-neutral-900 dark:text-white mb-4">
              Quick Assistance
            </h5>
            <p className="text-xs text-neutral-500 dark:text-neutral-400 mb-3">
              Need instant sizing advice or payment confirmation? Chat with our team directly.
            </p>
            <a
              href={`https://wa.me/${(settings?.whatsapp || '923001234567').replace(/[^0-9]/g, '')}?text=${encodeURIComponent('Hello Ali Online Store, I have an inquiry regarding a product.')}`}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-3.5 py-2 text-xs font-medium rounded-lg bg-emerald-600 text-white hover:bg-emerald-700 transition-colors"
            >
              <span>Chat on WhatsApp</span>
              <ArrowUpRight className="w-3.5 h-3.5" />
            </a>

            <div className="mt-6 pt-4 border-t border-neutral-100 dark:border-neutral-800">
              <Link
                to="/admin/login"
                className="text-[11px] text-neutral-400 hover:text-neutral-600 dark:hover:text-neutral-300 transition-colors inline-flex items-center gap-1"
              >
                <span>Store Management Portal</span>
              </Link>
            </div>
          </div>
        </div>

        {/* Copyright & Payment Badges */}
        <div className="pt-8 border-t border-neutral-200 dark:border-neutral-800 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-neutral-500 dark:text-neutral-400">
          <p>© {new Date().getFullYear()} Ali Online Store. All rights reserved.</p>
          <div className="flex items-center gap-3 text-neutral-400 dark:text-neutral-500 text-[11px]">
            <span>Cash on Delivery</span>
            <span>·</span>
            <span>Bank Transfer</span>
            <span>·</span>
            <span>EasyPaisa</span>
            <span>·</span>
            <span>JazzCash</span>
          </div>
        </div>

      </div>
    </footer>
  );
};
