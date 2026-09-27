import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Package, ArrowRight, ExternalLink } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { orderService } from '../../services/orderService';
import { Order } from '../../types';

export const AccountOrdersPage: React.FC = () => {
  const { user } = useAuth();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    if (user) {
      orderService.getCustomerOrders(user.id).then(ord => {
        setOrders(ord);
        setLoading(false);
      });
    }
  }, [user]);

  if (loading) {
    return (
      <div className="space-y-3">
        {[1, 2, 3].map(n => (
          <div key={n} className="h-24 rounded-2xl bg-neutral-100 dark:bg-neutral-800 animate-pulse" />
        ))}
      </div>
    );
  }

  if (orders.length === 0) {
    return (
      <div className="p-12 text-center border border-dashed border-neutral-300 dark:border-neutral-700 rounded-2xl">
        <Package className="w-8 h-8 text-neutral-400 mx-auto mb-2" />
        <p className="text-sm font-semibold text-neutral-800 dark:text-neutral-200">No orders found</p>
        <p className="text-xs text-neutral-500 mt-1">You haven't placed any orders with Ali Online Store yet.</p>
        <Link
          to="/shop"
          className="mt-4 inline-block px-4 py-2 text-xs font-semibold rounded-lg bg-neutral-900 text-white dark:bg-white dark:text-neutral-900"
        >
          Start Shopping
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {orders.map(order => (
        <div
          key={order.id}
          className="p-5 rounded-2xl bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 flex flex-col sm:flex-row sm:items-center justify-between gap-4 transition-all hover:border-neutral-300 dark:hover:border-neutral-700"
        >
          <div className="space-y-1">
            <div className="flex items-center gap-3">
              <span className="font-mono text-sm font-bold text-neutral-900 dark:text-white">
                #{order.order_number}
              </span>
              <span
                className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                  order.status === 'delivered'
                    ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300'
                    : order.status === 'cancelled'
                    ? 'bg-rose-100 text-rose-800 dark:bg-rose-950 dark:text-rose-300'
                    : 'bg-neutral-100 text-neutral-800 dark:bg-neutral-800 dark:text-neutral-200'
                }`}
              >
                {order.status}
              </span>
            </div>

            <p className="text-xs text-neutral-500">
              Placed on {new Date(order.created_at).toLocaleDateString()} · Payment: {order.payment_method.replace(/_/g, ' ')} ({order.payment_status})
            </p>

            {order.courier && order.tracking_number && (
              <p className="text-xs font-medium text-emerald-600 dark:text-emerald-400">
                Dispatched via {order.courier} (Tracking: {order.tracking_number})
              </p>
            )}
          </div>

          <div className="flex items-center justify-between sm:justify-end gap-6 pt-2 sm:pt-0 border-t sm:border-t-0 border-neutral-100 dark:border-neutral-800">
            <div className="text-left sm:text-right font-mono tabular-nums">
              <span className="block text-xs text-neutral-400">Total</span>
              <span className="text-sm font-bold text-neutral-900 dark:text-white">
                Rs. {order.total.toLocaleString()}
              </span>
            </div>

            <Link
              to={`/account/orders/${order.id}`}
              className="px-4 py-2 text-xs font-semibold rounded-lg bg-neutral-900 text-white dark:bg-white dark:text-neutral-900 hover:opacity-90 inline-flex items-center gap-1.5"
            >
              <span>Track Order</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>
      ))}
    </div>
  );
};
