import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Search, Filter, ArrowRight, Eye, RefreshCw } from 'lucide-react';
import { orderService } from '../../services/orderService';
import { Order, OrderStatus } from '../../types';

export const AdminOrdersPage: React.FC = () => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [statusFilter, setStatusFilter] = useState<OrderStatus | 'all'>('all');
  const [search, setSearch] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(true);

  const fetchOrders = async () => {
    setLoading(true);
    try {
      const data = await orderService.getAllOrders(statusFilter, search);
      setOrders(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, [statusFilter, search]);

  return (
    <div className="space-y-6">
      
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-neutral-200 dark:border-neutral-800">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-neutral-900 dark:text-white font-display">
            Order Fulfillment & Management
          </h1>
          <p className="text-xs text-neutral-500 mt-1">
            Review incoming orders, process shipments, and record courier tracking information.
          </p>
        </div>

        <button
          onClick={fetchOrders}
          className="p-2 text-xs font-semibold rounded-lg border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-800 text-neutral-700 dark:text-neutral-300 hover:bg-neutral-100 self-start sm:self-auto flex items-center gap-1.5"
        >
          <RefreshCw className="w-3.5 h-3.5" />
          <span>Refresh</span>
        </button>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
        {/* Status segmented buttons */}
        <div className="flex items-center gap-1 p-1 bg-neutral-200/80 dark:bg-neutral-800 rounded-xl overflow-x-auto w-full sm:w-auto text-xs font-medium">
          {(['all', 'pending', 'confirmed', 'processing', 'shipped', 'delivered', 'cancelled'] as const).map(st => (
            <button
              key={st}
              type="button"
              onClick={() => setStatusFilter(st)}
              className={`px-3 py-1.5 rounded-lg capitalize whitespace-nowrap transition-colors ${
                statusFilter === st
                  ? 'bg-white dark:bg-neutral-900 text-neutral-900 dark:text-white font-bold shadow-xs'
                  : 'text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-white'
              }`}
            >
              {st}
            </button>
          ))}
        </div>

        {/* Search */}
        <div className="relative w-full sm:w-64">
          <input
            type="text"
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Search #order, customer, phone..."
            className="w-full pl-9 pr-3 py-2 text-xs rounded-xl border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-800 text-neutral-900 dark:text-white focus:outline-none"
          />
          <Search className="w-4 h-4 text-neutral-400 absolute left-3 top-2.5" />
        </div>
      </div>

      {/* Orders Table */}
      <div className="p-6 rounded-2xl bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 overflow-x-auto">
        {loading ? (
          <div className="p-8 text-center text-xs text-neutral-500">Loading orders...</div>
        ) : orders.length === 0 ? (
          <div className="p-12 text-center text-xs text-neutral-500">No orders match current filter.</div>
        ) : (
          <table className="w-full text-left text-xs">
            <thead className="border-b border-neutral-200 dark:border-neutral-800 text-neutral-400 uppercase text-[10px] tracking-wider">
              <tr>
                <th className="py-3 px-3">Order Number</th>
                <th className="py-3 px-3">Customer</th>
                <th className="py-3 px-3">Phone & City</th>
                <th className="py-3 px-3">Items</th>
                <th className="py-3 px-3">Total Amount</th>
                <th className="py-3 px-3">Payment</th>
                <th className="py-3 px-3">Courier</th>
                <th className="py-3 px-3">Status</th>
                <th className="py-3 px-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-100 dark:divide-neutral-800 font-sans">
              {orders.map(order => (
                <tr key={order.id} className="hover:bg-neutral-50 dark:hover:bg-neutral-850/40 transition-colors">
                  <td className="py-3.5 px-3 font-mono font-bold text-neutral-900 dark:text-white">
                    #{order.order_number}
                  </td>
                  <td className="py-3.5 px-3 font-semibold text-neutral-900 dark:text-white">
                    {order.shipping_full_name}
                  </td>
                  <td className="py-3.5 px-3 text-neutral-500">
                    <p className="font-mono text-[11px]">{order.shipping_phone}</p>
                    <p className="text-[11px]">{order.shipping_city}</p>
                  </td>
                  <td className="py-3.5 px-3 text-neutral-500">
                    {order.items?.length || 1} items
                  </td>
                  <td className="py-3.5 px-3 font-mono font-bold text-neutral-900 dark:text-white tabular-nums">
                    Rs. {order.total.toLocaleString()}
                  </td>
                  <td className="py-3.5 px-3 text-neutral-500 text-[11px]">
                    <span className="uppercase font-medium block">{order.payment_method.replace(/_/g, ' ')}</span>
                    <span className={`text-[10px] font-semibold ${order.payment_status === 'paid' ? 'text-emerald-600' : 'text-amber-500'}`}>
                      {order.payment_status}
                    </span>
                  </td>
                  <td className="py-3.5 px-3 text-neutral-500 text-[11px]">
                    {order.courier ? (
                      <div>
                        <span className="font-medium text-neutral-900 dark:text-white block">{order.courier}</span>
                        <span className="font-mono text-[10px]">{order.tracking_number}</span>
                      </div>
                    ) : (
                      <span className="text-neutral-400 italic">Unassigned</span>
                    )}
                  </td>
                  <td className="py-3.5 px-3">
                    <span
                      className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                        order.status === 'delivered'
                          ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300'
                          : order.status === 'cancelled'
                          ? 'bg-rose-100 text-rose-800 dark:bg-rose-950 dark:text-rose-300'
                          : order.status === 'pending'
                          ? 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300'
                          : order.status === 'shipped'
                          ? 'bg-purple-100 text-purple-800 dark:bg-purple-950 dark:text-purple-300'
                          : 'bg-neutral-100 text-neutral-800 dark:bg-neutral-800 dark:text-neutral-200'
                      }`}
                    >
                      {order.status}
                    </span>
                  </td>
                  <td className="py-3.5 px-3 text-right">
                    <Link
                      to={`/admin/orders/${order.id}`}
                      className="px-3 py-1.5 text-xs font-semibold rounded-lg bg-neutral-900 text-white dark:bg-white dark:text-neutral-900 hover:opacity-90 transition-opacity inline-flex items-center gap-1.5"
                    >
                      <Eye className="w-3.5 h-3.5" />
                      <span>Manage</span>
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

    </div>
  );
};
