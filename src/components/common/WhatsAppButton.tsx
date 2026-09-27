import React, { useEffect, useState } from 'react';
import { MessageCircle } from 'lucide-react';
import { settingsService } from '../../services/settingsService';

interface WhatsAppButtonProps {
  customMessage?: string;
  className?: string;
}

export const WhatsAppButton: React.FC<WhatsAppButtonProps> = ({ customMessage, className = '' }) => {
  const [phone, setPhone] = useState<string>('923001234567');

  useEffect(() => {
    settingsService.getSettings().then(s => {
      if (s?.whatsapp) {
        setPhone(s.whatsapp.replace(/[^0-9]/g, ''));
      }
    });
  }, []);

  const message = customMessage || 'Hello Ali Online Store, I would like to inquire about an item.';
  const link = `https://wa.me/${phone}?text=${encodeURIComponent(message)}`;

  return (
    <a
      href={link}
      target="_blank"
      rel="noopener noreferrer"
      className={`fixed bottom-6 left-6 z-40 flex items-center gap-2.5 px-4 py-3 bg-emerald-600 hover:bg-emerald-700 text-white rounded-full shadow-lg hover:shadow-xl transition-all duration-200 group ${className}`}
      aria-label="Direct WhatsApp inquiry"
    >
      <MessageCircle className="w-5 h-5 shrink-0" />
      <span className="text-xs font-semibold whitespace-nowrap hidden sm:inline group-hover:inline">
        WhatsApp Us
      </span>
    </a>
  );
};
