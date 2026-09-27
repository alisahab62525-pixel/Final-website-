import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Package, MapPin, Heart, Clock, ArrowRight } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { useWishlist } from '../../contexts/WishlistContext';
import { orderService } from '../../services/orderService';
import { Order } from '../../types';

export const AccountOverviewPage: React.FC = () => {
  const { user, profile } = useAuth();
  const { wishlistCount } = useWishlist();
  const [recentOrders, setRecentOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    if (user) {
      orderService.getCustomerOrders(user.id).then(orders => {
        setRecentOrders(orders.slice(0, 3));
        setLoading(false);
      });
    }
  }, [user]);

  return (
    <div className="space-y-8">
      
      {/* Quick Metrics */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="p-5 rounded-2xl bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800">
          <div className="flex items-center justify-between text-neutral-500 mb-2">
            <span className="text-xs font-semibold uppercase">Total Orders</span>
            <Package className="w-4 h-4" />
          </div>
          <p className="text-2xl font-bold font-mono text-neutral-900 dark:text-white">
            {recentOrders.length}
          </p>
        </div>

        <div className="p-5 rounded-2xl bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800">
          <div className="flex items-center justify-between text-neutral-500 mb-2">
            <span className="text-xs font-semibold uppercase">Wishlist Items</span>
            <Heart className="w-4 h-4" />
          </div>
          <p className="text-2xl font-bold font-mono text-neutral-900 dark:text-white">
            {wishlistCount}
          </p>
        </div>

        <div className="p-5 rounded-2xl bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800">
          <div className="flex items-center justify-between text-neutral-500 mb-2">
            <span className="text-xs font-semibold uppercase">Account Role</span>
            <span className="w-2 h-2 rounded-full bg-emerald-500" />
          </div>
          <p className="text-sm font-bold text-neutral-900 dark:text-white uppercase tracking-wider">
            Verified Customer
          </p>
        </div>
      </div>

      {/* Recent Orders section */}
      <div className="p-6 rounded-2xl bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-bold uppercase tracking-wider text-neutral-900 dark:text-white">
            Recent Orders
          </h2>
          <Link
            to="/account/orders"
            className="text-xs font-semibold text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-white inline-flex items-center gap-1"
          >
            <span>View All</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        {loading ? (
          <div className="space-y-2">
            {[1, 2].map(n => (
              <div key={n} className="h-16 rounded-xl bg-neutral-100 dark:bg-neutral-800 animate-pulse" />
            ))}
          </div>
        ) : recentOrders.length === 0 ? (
          <p className="text-xs text-neutral-500 py-4">No recent orders yet. Start exploring our store.</p>
        ) : (
          <div className="divide-y divide-neutral-100 dark:divide-neutral-800">
            {recentOrders.map(order => (
              <div key={order.id} className="py-3 flex items-center justify-between text-xs">
                <div>
                  <p className="font-mono font-bold text-neutral-900 dark:text-white">#{order.order_number}</p>
                  <p className="text-neutral-500 text-[11px] mt-0.5">
                    {new Date(order.created_at).toLocaleDateString()} · {order.items?.length || 1} items
                  </p>
                </div>
                <div className="flex items-center gap-4">
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold uppercase bg-neutral-100 dark:bg-neutral-800 text-neutral-800 dark:text-neutral-200">
                    {order.status}
                  </span>
                  <span className="font-mono font-bold text-neutral-900 dark:text-white tabular-nums">
                    Rs. {order.total.toLocaleString()}
                  </span>
                  <Link
                    to={`/account/orders/${order.id}`}
                    className="p-1 text-neutral-400 hover:text-neutral-900 dark:hover:text-white"
                  >
                    <ArrowRight className="w-4 h-4" />
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

    </div>
  );
};
