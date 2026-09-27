import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  ShoppingBag,
  Clock,
  CheckCircle,
  Truck,
  PackageCheck,
  XCircle,
  Users,
  Package,
  AlertTriangle,
  TrendingUp,
  ArrowRight,
  ExternalLink,
} from 'lucide-react';
import { orderService } from '../../services/orderService';
import { customerService } from '../../services/customerService';
import { productService } from '../../services/productService';
import { Order } from '../../types';

export const AdminDashboardPage: React.FC = () => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [customerCount, setCustomerCount] = useState<number>(0);
  const [productCount, setProductCount] = useState<number>(0);
  const [lowStockCount, setLowStockCount] = useState<number>(0);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    async function loadDashboardMetrics() {
      try {
        const [allOrders, customers, prodRes] = await Promise.all([
          orderService.getAllOrders(),
          customerService.getCustomers(),
          productService.getProducts({ includeInactive: true, limit: 100 }),
        ]);

        setOrders(allOrders);
        setCustomerCount(customers.length);
        setProductCount(prodRes.total);

        const lowStock = prodRes.products.filter(
          p => p.stock_quantity <= p.low_stock_threshold && p.stock_quantity > 0
        ).length;
        setLowStockCount(lowStock);
      } catch (err) {
        console.error('Failed to load dashboard metrics', err);
      } finally {
        setLoading(false);
      }
    }
    loadDashboardMetrics();
  }, []);

  const totalOrders = orders.length;
  const pendingOrders = orders.filter(o => o.status === 'pending').length;
  const confirmedOrders = orders.filter(o => o.status === 'confirmed').length;
  const processingOrders = orders.filter(o => o.status === 'processing').length;
  const shippedOrders = orders.filter(o => o.status === 'shipped').length;
  const deliveredOrders = orders.filter(o => o.status === 'delivered').length;
  const cancelledOrders = orders.filter(o => o.status === 'cancelled').length;
  const grossSales = orders
    .filter(o => o.status !== 'cancelled')
    .reduce((sum, o) => sum + o.total, 0);

  return (
    <div className="space-y-8">
      
      {/* Top Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-neutral-200 dark:border-neutral-800">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-neutral-900 dark:text-white font-display">
            Store Performance & Orders Overview
          </h1>
          <p className="text-xs text-neutral-500 mt-1">
            Realtime metrics across inventory, deliveries, and gross store revenue.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Link
            to="/admin/products/new"
            className="px-4 py-2 text-xs font-semibold rounded-xl bg-neutral-900 text-white dark:bg-white dark:text-neutral-900 hover:opacity-90 inline-flex items-center gap-1.5 shadow-sm"
          >
            <span>+ Add New Product</span>
          </Link>
        </div>
      </div>

      {/* Revenue & High-Level KPIs */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Gross Sales */}
        <div className="p-5 rounded-2xl bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800">
          <div className="flex items-center justify-between text-neutral-500 mb-2">
            <span className="text-xs font-semibold uppercase">Gross Revenue</span>
            <TrendingUp className="w-4 h-4 text-emerald-500" />
          </div>
          <p className="text-2xl font-bold font-mono text-neutral-900 dark:text-white tabular-nums">
            Rs. {grossSales.toLocaleString()}
          </p>
          <span className="text-[11px] text-neutral-400 mt-1 block">Active sales across {totalOrders} orders</span>
        </div>

        {/* Total Orders */}
        <div className="p-5 rounded-2xl bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800">
          <div className="flex items-center justify-between text-neutral-500 mb-2">
            <span className="text-xs font-semibold uppercase">Total Orders</span>
            <ShoppingBag className="w-4 h-4 text-neutral-400" />
          </div>
          <p className="text-2xl font-bold font-mono text-neutral-900 dark:text-white tabular-nums">
            {totalOrders}
          </p>
          <span className="text-[11px] text-amber-500 mt-1 block font-medium">
            {pendingOrders} awaiting confirmation
          </span>
        </div>

        {/* Customers */}
        <div className="p-5 rounded-2xl bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800">
          <div className="flex items-center justify-between text-neutral-500 mb-2">
            <span className="text-xs font-semibold uppercase">Active Customers</span>
            <Users className="w-4 h-4 text-neutral-400" />
          </div>
          <p className="text-2xl font-bold font-mono text-neutral-900 dark:text-white tabular-nums">
            {customerCount}
          </p>
          <span className="text-[11px] text-neutral-400 mt-1 block">Registered shopper accounts</span>
        </div>

        {/* Catalog & Low Stock */}
        <div className="p-5 rounded-2xl bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800">
          <div className="flex items-center justify-between text-neutral-500 mb-2">
            <span className="text-xs font-semibold uppercase">Inventory Status</span>
            <Package className="w-4 h-4 text-neutral-400" />
          </div>
          <p className="text-2xl font-bold font-mono text-neutral-900 dark:text-white tabular-nums">
            {productCount} SKUs
          </p>
          {lowStockCount > 0 ? (
            <span className="text-[11px] text-rose-500 font-semibold mt-1 block flex items-center gap-1">
              <AlertTriangle className="w-3 h-3" /> {lowStockCount} items near threshold
            </span>
          ) : (
            <span className="text-[11px] text-emerald-500 mt-1 block">Inventory levels healthy</span>
          )}
        </div>
      </div>

      {/* Order Status Breakdown Cards (Requirement #30) */}
      <div>
        <h2 className="text-xs font-bold uppercase tracking-wider text-neutral-500 mb-3">
          Order Pipeline Status
        </h2>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
          
          <div className="p-4 rounded-xl bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800">
            <span className="text-[11px] font-semibold text-neutral-500 uppercase flex items-center gap-1">
              <Clock className="w-3.5 h-3.5 text-amber-500" /> Pending
            </span>
            <p className="text-xl font-bold font-mono text-neutral-900 dark:text-white mt-1 tabular-nums">
              {pendingOrders}
            </p>
          </div>

          <div className="p-4 rounded-xl bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800">
            <span className="text-[11px] font-semibold text-neutral-500 uppercase flex items-center gap-1">
              <CheckCircle className="w-3.5 h-3.5 text-blue-500" /> Confirmed
            </span>
            <p className="text-xl font-bold font-mono text-neutral-900 dark:text-white mt-1 tabular-nums">
              {confirmedOrders}
            </p>
          </div>

          <div className="p-4 rounded-xl bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800">
            <span className="text-[11px] font-semibold text-neutral-500 uppercase flex items-center gap-1">
              <PackageCheck className="w-3.5 h-3.5 text-indigo-500" /> Processing
            </span>
            <p className="text-xl font-bold font-mono text-neutral-900 dark:text-white mt-1 tabular-nums">
              {processingOrders}
            </p>
          </div>

          <div className="p-4 rounded-xl bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800">
            <span className="text-[11px] font-semibold text-neutral-500 uppercase flex items-center gap-1">
              <Truck className="w-3.5 h-3.5 text-purple-500" /> Shipped
            </span>
            <p className="text-xl font-bold font-mono text-neutral-900 dark:text-white mt-1 tabular-nums">
              {shippedOrders}
            </p>
          </div>

          <div className="p-4 rounded-xl bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800">
            <span className="text-[11px] font-semibold text-neutral-500 uppercase flex items-center gap-1">
              <CheckCircle className="w-3.5 h-3.5 text-emerald-500" /> Delivered
            </span>
            <p className="text-xl font-bold font-mono text-neutral-900 dark:text-white mt-1 tabular-nums">
              {deliveredOrders}
            </p>
          </div>

          <div className="p-4 rounded-xl bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800">
            <span className="text-[11px] font-semibold text-neutral-500 uppercase flex items-center gap-1">
              <XCircle className="w-3.5 h-3.5 text-rose-500" /> Cancelled
            </span>
            <p className="text-xl font-bold font-mono text-neutral-900 dark:text-white mt-1 tabular-nums">
              {cancelledOrders}
            </p>
          </div>

        </div>
      </div>

      {/* Recent Orders Table (Requirement #30) */}
      <div className="p-6 rounded-2xl bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-bold uppercase tracking-wider text-neutral-900 dark:text-white">
            Recent Customer Orders
          </h2>
          <Link
            to="/admin/orders"
            className="text-xs font-semibold text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-white inline-flex items-center gap-1"
          >
            <span>View All Orders ({totalOrders})</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="border-b border-neutral-200 dark:border-neutral-800 text-neutral-400 uppercase text-[10px] tracking-wider">
              <tr>
                <th className="py-3 px-3">Order ID</th>
                <th className="py-3 px-3">Customer</th>
                <th className="py-3 px-3">Phone</th>
                <th className="py-3 px-3">Total</th>
                <th className="py-3 px-3">Payment</th>
                <th className="py-3 px-3">Status</th>
                <th className="py-3 px-3">Date</th>
                <th className="py-3 px-3 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-100 dark:divide-neutral-800 font-sans">
              {orders.slice(0, 6).map(order => (
                <tr key={order.id} className="hover:bg-neutral-50 dark:hover:bg-neutral-850/40 transition-colors">
                  <td className="py-3 px-3 font-mono font-bold text-neutral-900 dark:text-white">
                    #{order.order_number}
                  </td>
                  <td className="py-3 px-3 font-semibold text-neutral-900 dark:text-white">
                    {order.shipping_full_name}
                  </td>
                  <td className="py-3 px-3 text-neutral-500 font-mono">
                    {order.shipping_phone}
                  </td>
                  <td className="py-3 px-3 font-mono font-bold text-neutral-900 dark:text-white tabular-nums">
                    Rs. {order.total.toLocaleString()}
                  </td>
                  <td className="py-3 px-3 uppercase text-[11px] text-neutral-500">
                    {order.payment_method.replace(/_/g, ' ')}
                  </td>
                  <td className="py-3 px-3">
                    <span
                      className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase ${
                        order.status === 'delivered'
                          ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300'
                          : order.status === 'cancelled'
                          ? 'bg-rose-100 text-rose-800 dark:bg-rose-950 dark:text-rose-300'
                          : order.status === 'pending'
                          ? 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300'
                          : 'bg-neutral-100 text-neutral-800 dark:bg-neutral-800 dark:text-neutral-200'
                      }`}
                    >
                      {order.status}
                    </span>
                  </td>
                  <td className="py-3 px-3 text-neutral-400 text-[11px]">
                    {new Date(order.created_at).toLocaleDateString()}
                  </td>
                  <td className="py-3 px-3 text-right">
                    <Link
                      to={`/admin/orders/${order.id}`}
                      className="px-2.5 py-1 text-xs font-semibold rounded-md border border-neutral-300 dark:border-neutral-700 hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors inline-block"
                    >
                      Inspect
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

    </div>
  );
};
