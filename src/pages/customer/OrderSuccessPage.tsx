import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { CheckCircle2, Package, ArrowRight, MessageCircle, Truck } from 'lucide-react';
import { orderService } from '../../services/orderService';
import { settingsService } from '../../services/settingsService';
import { Order } from '../../types';

export const OrderSuccessPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [order, setOrder] = useState<Order | null>(null);
  const [whatsappPhone, setWhatsappPhone] = useState<string>('923001234567');
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    if (id) {
      orderService.getOrder(id).then(ord => {
        setOrder(ord);
        setLoading(false);
      });
    }
    settingsService.getSettings().then(s => {
      if (s?.whatsapp) setWhatsappPhone(s.whatsapp.replace(/[^0-9]/g, ''));
    });
  }, [id]);

  const whatsappMsg = order
    ? `Hello Ali Store, I placed order #${order.order_number} for Rs. ${order.total.toLocaleString()} and would like confirmation.`
    : 'Hello Ali Store, I recently placed an order.';

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-16 text-center space-y-8">
      
      <div className="w-16 h-16 rounded-full bg-emerald-100 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 flex items-center justify-center mx-auto">
        <CheckCircle2 className="w-8 h-8" />
      </div>

      <div className="space-y-2">
        <span className="text-xs uppercase tracking-widest text-emerald-600 dark:text-emerald-400 font-semibold">
          Order Placed Successfully
        </span>
        <h1 className="text-3xl font-extrabold tracking-tight text-neutral-900 dark:text-white font-display">
          Thank You For Your Order!
        </h1>
        <p className="text-xs sm:text-sm text-neutral-500 dark:text-neutral-400 max-w-md mx-auto">
          We have registered your order in our system. A confirmation notification has been dispatched to your account.
        </p>
      </div>

      {order && (
        <div className="p-6 rounded-2xl bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 text-left space-y-4 shadow-sm">
          <div className="flex items-center justify-between pb-3 border-b border-neutral-100 dark:border-neutral-800">
            <div>
              <span className="text-[11px] text-neutral-400 block">Order Reference</span>
              <span className="font-mono text-base font-bold text-neutral-900 dark:text-white">
                #{order.order_number}
              </span>
            </div>
            <div className="text-right">
              <span className="text-[11px] text-neutral-400 block">Payment Method</span>
              <span className="text-xs font-semibold uppercase text-neutral-700 dark:text-neutral-300">
                {order.payment_method.replace(/_/g, ' ')}
              </span>
            </div>
          </div>

          <div className="text-xs space-y-1 text-neutral-600 dark:text-neutral-400">
            <p><span className="font-semibold text-neutral-900 dark:text-white">Ship to:</span> {order.shipping_full_name} ({order.shipping_phone})</p>
            <p>{order.shipping_address}, {order.shipping_city}</p>
          </div>

          <div className="pt-3 border-t border-neutral-100 dark:border-neutral-800 flex items-center justify-between font-mono">
            <span className="text-xs text-neutral-500">Order Amount</span>
            <span className="text-sm font-bold text-neutral-900 dark:text-white tabular-nums">
              Rs. {order.total.toLocaleString()}
            </span>
          </div>
        </div>
      )}

      {/* Action Buttons */}
      <div className="flex flex-wrap items-center justify-center gap-4 pt-2">
        {order && (
          <Link
            to={`/account/orders/${order.id}`}
            className="px-6 py-3 text-xs font-semibold rounded-xl bg-neutral-900 text-white dark:bg-white dark:text-neutral-900 hover:opacity-90 transition-opacity inline-flex items-center gap-2"
          >
            <Truck className="w-4 h-4" />
            <span>Track Order Status</span>
          </Link>
        )}

        <a
          href={`https://wa.me/${whatsappPhone}?text=${encodeURIComponent(whatsappMsg)}`}
          target="_blank"
          rel="noopener noreferrer"
          className="px-6 py-3 text-xs font-semibold rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white transition-colors inline-flex items-center gap-2"
        >
          <MessageCircle className="w-4 h-4" />
          <span>Confirm on WhatsApp</span>
        </a>

        <Link
          to="/shop"
          className="px-6 py-3 text-xs font-semibold rounded-xl border border-neutral-300 dark:border-neutral-700 text-neutral-700 dark:text-neutral-300 hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors"
        >
          Continue Shopping
        </Link>
      </div>

    </div>
  );
};
