import React, { useEffect, useState } from 'react';
import { Mail, Phone, MapPin, MessageSquare, Clock, ArrowUpRight } from 'lucide-react';
import { settingsService } from '../../services/settingsService';
import { StoreSettings } from '../../types';

export const ContactPage: React.FC = () => {
  const [settings, setSettings] = useState<StoreSettings | null>(null);

  useEffect(() => {
    settingsService.getSettings().then(setSettings);
  }, []);

  const whatsappPhone = settings?.whatsapp ? settings.whatsapp.replace(/[^0-9]/g, '') : '923001234567';

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16 space-y-12">
      
      <div className="text-center space-y-3">
        <span className="text-xs uppercase tracking-wider text-neutral-500 font-medium">Get in Touch</span>
        <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-neutral-900 dark:text-white font-display">
          Customer Care & Inquiries
        </h1>
        <p className="text-xs sm:text-sm text-neutral-500 dark:text-neutral-400 max-w-md mx-auto leading-relaxed">
          Have questions regarding order dispatch, sizing, or bulk corporate gifting? We are available 6 days a week.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        
        {/* Contact Info Cards */}
        <div className="space-y-4">
          <div className="p-6 rounded-2xl bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 space-y-3">
            <div className="flex items-center gap-3 text-neutral-900 dark:text-white font-semibold text-sm">
              <Phone className="w-4 h-4 text-emerald-500" />
              <span>Direct Phone & WhatsApp</span>
            </div>
            <p className="text-xs text-neutral-600 dark:text-neutral-400 font-mono">
              {settings?.phone || '+92 300 1234567'}
            </p>
            <a
              href={`https://wa.me/${whatsappPhone}?text=${encodeURIComponent('Hello Ali Online Store Support')}`}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 text-xs text-emerald-600 dark:text-emerald-400 font-semibold hover:underline"
            >
              <span>Instant WhatsApp Message</span>
              <ArrowUpRight className="w-3.5 h-3.5" />
            </a>
          </div>

          <div className="p-6 rounded-2xl bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 space-y-2">
            <div className="flex items-center gap-3 text-neutral-900 dark:text-white font-semibold text-sm">
              <Mail className="w-4 h-4 text-neutral-400" />
              <span>Email Support</span>
            </div>
            <p className="text-xs text-neutral-600 dark:text-neutral-400 font-mono">
              {settings?.email || 'support@alionlinestore.pk'}
            </p>
            <p className="text-[11px] text-neutral-400">Response turnaround within 4-8 business hours.</p>
          </div>

          <div className="p-6 rounded-2xl bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 space-y-2">
            <div className="flex items-center gap-3 text-neutral-900 dark:text-white font-semibold text-sm">
              <MapPin className="w-4 h-4 text-neutral-400" />
              <span>Headquarters & Fulfillment</span>
            </div>
            <p className="text-xs text-neutral-600 dark:text-neutral-400">
              {settings?.address || 'Ali Commercial Tower, Main Boulevard, Gulberg III, Lahore, Pakistan'}
            </p>
          </div>

          <div className="p-6 rounded-2xl bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 space-y-2">
            <div className="flex items-center gap-3 text-neutral-900 dark:text-white font-semibold text-sm">
              <Clock className="w-4 h-4 text-neutral-400" />
              <span>Business Operating Hours</span>
            </div>
            <p className="text-xs text-neutral-600 dark:text-neutral-400">
              {settings?.business_hours || 'Monday – Saturday: 9:00 AM – 10:00 PM PKT'}
            </p>
          </div>
        </div>

        {/* Message Box */}
        <div className="p-8 rounded-2xl bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 space-y-4">
          <h2 className="text-base font-bold text-neutral-900 dark:text-white font-display">
            Send an Online Inquiry
          </h2>
          <p className="text-xs text-neutral-500">
            Leave a note and our customer team will follow up via email or phone.
          </p>

          <form
            onSubmit={(e) => {
              e.preventDefault();
              alert('Thank you! Your message has been received. Our team will contact you shortly.');
            }}
            className="space-y-3 text-xs"
          >
            <div>
              <label className="block font-semibold mb-1">Your Name</label>
              <input
                type="text"
                required
                placeholder="Full name"
                className="w-full px-3 py-2 rounded-xl border border-neutral-300 dark:border-neutral-700 bg-neutral-50 dark:bg-neutral-800"
              />
            </div>
            <div>
              <label className="block font-semibold mb-1">Email / Phone</label>
              <input
                type="text"
                required
                placeholder="Contact email or phone"
                className="w-full px-3 py-2 rounded-xl border border-neutral-300 dark:border-neutral-700 bg-neutral-50 dark:bg-neutral-800"
              />
            </div>
            <div>
              <label className="block font-semibold mb-1">Subject</label>
              <input
                type="text"
                placeholder="Order question, product advice..."
                className="w-full px-3 py-2 rounded-xl border border-neutral-300 dark:border-neutral-700 bg-neutral-50 dark:bg-neutral-800"
              />
            </div>
            <div>
              <label className="block font-semibold mb-1">Message</label>
              <textarea
                rows={4}
                required
                placeholder="How can we assist you today?"
                className="w-full px-3 py-2 rounded-xl border border-neutral-300 dark:border-neutral-700 bg-neutral-50 dark:bg-neutral-800"
              />
            </div>
            <button
              type="submit"
              className="w-full py-2.5 px-4 text-xs font-semibold rounded-xl bg-neutral-900 text-white dark:bg-white dark:text-neutral-900"
            >
              Submit Message
            </button>
          </form>
        </div>

      </div>

    </div>
  );
};
