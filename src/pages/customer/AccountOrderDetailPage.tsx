import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { ArrowLeft, Check, Truck, Clock, PackageCheck, AlertCircle, MessageCircle } from 'lucide-react';
import { orderService } from '../../services/orderService';
import { settingsService } from '../../services/settingsService';
import { Order, OrderStatus } from '../../types';

export const AccountOrderDetailPage: React.FC = () => {
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

  if (loading) {
    return (
      <div className="p-8 text-center text-xs text-neutral-500">
        Loading order details...
      </div>
    );
  }

  if (!order) {
    return (
      <div className="p-8 text-center text-xs text-neutral-500">
        Order not found.
      </div>
    );
  }

  // Tracking steps progression
  const trackingSteps: Array<{ key: OrderStatus; label: string }> = [
    { key: 'pending', label: 'Order Placed' },
    { key: 'confirmed', label: 'Confirmed' },
    { key: 'processing', label: 'Processing' },
    { key: 'shipped', label: 'Shipped' },
    { key: 'delivered', label: 'Delivered' },
  ];

  const statusOrder: OrderStatus[] = ['pending', 'confirmed', 'processing', 'shipped', 'delivered'];
  const currentIndex = statusOrder.indexOf(order.status);
  const isCancelled = order.status === 'cancelled';

  return (
    <div className="space-y-8">
      
      <Link
        to="/account/orders"
        className="inline-flex items-center gap-1.5 text-xs text-neutral-500 hover:text-neutral-900 dark:hover:text-white transition-colors"
      >
        <ArrowLeft className="w-3.5 h-3.5" />
        <span>Back to Orders</span>
      </Link>

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-neutral-200 dark:border-neutral-800">
        <div>
          <span className="text-xs uppercase tracking-wider text-neutral-500 font-medium">Tracking Status</span>
          <h1 className="text-2xl font-bold font-mono text-neutral-900 dark:text-white mt-1">
            Order #{order.order_number}
          </h1>
          <p className="text-xs text-neutral-500 mt-1">
            Placed on {new Date(order.created_at).toLocaleString()}
          </p>
        </div>

        <div className="flex items-center gap-3">
          <a
            href={`https://wa.me/${whatsappPhone}?text=${encodeURIComponent(`Hello Ali Store, I have an inquiry regarding Order #${order.order_number}`)}`}
            target="_blank"
            rel="noopener noreferrer"
            className="px-4 py-2 text-xs font-semibold rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white transition-colors inline-flex items-center gap-2"
          >
            <MessageCircle className="w-4 h-4" />
            <span>Order Inquiry on WhatsApp</span>
          </a>
        </div>
      </div>

      {/* Visual Tracking Timeline */}
      <div className="p-6 rounded-2xl bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 space-y-6">
        <h2 className="text-xs font-bold uppercase tracking-wider text-neutral-900 dark:text-white">
          Realtime Dispatch Tracker
        </h2>

        {isCancelled ? (
          <div className="p-4 rounded-xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900 flex items-center gap-3 text-xs text-rose-700 dark:text-rose-300">
            <AlertCircle className="w-5 h-5 shrink-0" />
            <span>This order was cancelled. If you have questions, please reach out via customer support.</span>
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-5 gap-4 pt-2">
            {trackingSteps.map((step, idx) => {
              const isPastOrCurrent = currentIndex >= idx;
              const isCurrent = currentIndex === idx;

              return (
                <div key={step.key} className="flex flex-col items-center text-center space-y-2">
                  <div
                    className={`w-9 h-9 rounded-full flex items-center justify-center text-xs font-bold transition-all ${
                      isCurrent
                        ? 'bg-neutral-900 text-white dark:bg-white dark:text-neutral-900 ring-4 ring-neutral-200 dark:ring-neutral-700'
                        : isPastOrCurrent
                        ? 'bg-emerald-500 text-white'
                        : 'bg-neutral-100 dark:bg-neutral-800 text-neutral-400'
                    }`}
                  >
                    {isPastOrCurrent && !isCurrent ? <Check className="w-4 h-4" /> : idx + 1}
                  </div>
                  <div>
                    <p className={`text-xs font-semibold ${isPastOrCurrent ? 'text-neutral-900 dark:text-white' : 'text-neutral-400'}`}>
                      {step.label}
                    </p>
                    {isCurrent && (
                      <span className="text-[10px] text-emerald-600 dark:text-emerald-400 font-medium">
                        Current Status
                      </span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Courier details banner */}
        {order.courier && order.tracking_number && (
          <div className="mt-4 p-4 rounded-xl bg-neutral-50 dark:bg-neutral-800/60 border border-neutral-200 dark:border-neutral-700 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
            <div className="flex items-center gap-3">
              <Truck className="w-5 h-5 text-emerald-500" />
              <div>
                <p className="font-semibold text-neutral-900 dark:text-white">Courier Partner: {order.courier}</p>
                <p className="text-neutral-500 font-mono">Tracking Number: {order.tracking_number}</p>
              </div>
            </div>
            <span className="text-[11px] font-semibold text-emerald-600 dark:text-emerald-400">
              Parcel In Transit
            </span>
          </div>
        )}
      </div>

      {/* Items and Address Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        
        {/* Items List */}
        <div className="lg:col-span-8 p-6 rounded-2xl bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 space-y-4">
          <h2 className="text-xs font-bold uppercase tracking-wider text-neutral-900 dark:text-white">
            Ordered Items
          </h2>

          <div className="divide-y divide-neutral-100 dark:divide-neutral-800">
            {order.items?.map(item => (
              <div key={item.id} className="py-3 flex items-center justify-between text-xs">
                <div className="flex items-center gap-3 min-w-0">
                  <div className="w-12 h-12 rounded-lg bg-neutral-100 dark:bg-neutral-800 overflow-hidden shrink-0 border border-neutral-200/60">
                    <img src={item.product_image} alt="" className="w-full h-full object-cover" />
                  </div>
                  <div className="min-w-0">
                    <p className="font-semibold text-neutral-900 dark:text-white truncate">{item.product_name}</p>
                    <p className="text-[11px] text-neutral-500">
                      Qty: {item.quantity} {item.variant ? `· ${item.variant}` : ''}
                    </p>
                  </div>
                </div>

                <div className="font-mono tabular-nums text-right shrink-0">
                  <span className="font-bold text-neutral-900 dark:text-white">
                    Rs. {(item.unit_price * item.quantity).toLocaleString()}
                  </span>
                </div>
              </div>
            ))}
          </div>

          {/* Breakdown */}
          <div className="pt-4 border-t border-neutral-200 dark:border-neutral-800 space-y-2 text-xs font-mono">
            <div className="flex justify-between text-neutral-500">
              <span>Subtotal</span>
              <span>Rs. {order.subtotal.toLocaleString()}</span>
            </div>
            {order.discount > 0 && (
              <div className="flex justify-between text-emerald-600">
                <span>Discount</span>
                <span>- Rs. {order.discount.toLocaleString()}</span>
              </div>
            )}
            <div className="flex justify-between text-neutral-500">
              <span>Delivery Fee</span>
              <span>{order.delivery_fee === 0 ? 'FREE' : `Rs. ${order.delivery_fee.toLocaleString()}`}</span>
            </div>
            <div className="flex justify-between text-sm font-bold text-neutral-900 dark:text-white pt-2 border-t border-neutral-100 dark:border-neutral-800">
              <span>Total Paid / Payable</span>
              <span>Rs. {order.total.toLocaleString()}</span>
            </div>
          </div>
        </div>

        {/* Shipping & Payment summary */}
        <div className="lg:col-span-4 space-y-6">
          <div className="p-6 rounded-2xl bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 space-y-4 text-xs">
            <h2 className="text-xs font-bold uppercase tracking-wider text-neutral-900 dark:text-white">
              Shipping Destination
            </h2>
            <div className="space-y-1 text-neutral-600 dark:text-neutral-400">
              <p className="font-semibold text-neutral-900 dark:text-white">{order.shipping_full_name}</p>
              <p>{order.shipping_phone}</p>
              <p>{order.shipping_email}</p>
              <p className="pt-1">{order.shipping_address}</p>
              <p>{order.shipping_area ? `${order.shipping_area}, ` : ''}{order.shipping_city} {order.shipping_postal_code}</p>
            </div>
          </div>

          <div className="p-6 rounded-2xl bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 space-y-4 text-xs">
            <h2 className="text-xs font-bold uppercase tracking-wider text-neutral-900 dark:text-white">
              Payment Status
            </h2>
            <div className="space-y-1 text-neutral-600 dark:text-neutral-400">
              <p><span className="font-semibold text-neutral-900 dark:text-white">Method:</span> {order.payment_method.replace(/_/g, ' ').toUpperCase()}</p>
              <p><span className="font-semibold text-neutral-900 dark:text-white">Status:</span> {order.payment_status.toUpperCase()}</p>
            </div>
          </div>
        </div>

      </div>

    </div>
  );
};
