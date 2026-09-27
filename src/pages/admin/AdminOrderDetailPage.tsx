import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { ArrowLeft, Printer, Truck, Check, AlertCircle, Save, ExternalLink } from 'lucide-react';
import { orderService } from '../../services/orderService';
import { settingsService } from '../../services/settingsService';
import { useToast } from '../../contexts/ToastContext';
import { Order, OrderStatus, PaymentStatus, StoreSettings } from '../../types';

export const AdminOrderDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const { success, error } = useToast();

  const [order, setOrder] = useState<Order | null>(null);
  const [settings, setSettings] = useState<StoreSettings | null>(null);
  const [status, setStatus] = useState<OrderStatus>('pending');
  const [paymentStatus, setPaymentStatus] = useState<PaymentStatus>('pending');
  const [courier, setCourier] = useState<string>('');
  const [trackingNumber, setTrackingNumber] = useState<string>('');
  const [adminNotes, setAdminNotes] = useState<string>('');
  const [saving, setSaving] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    if (id) {
      orderService.getOrder(id).then(ord => {
        if (ord) {
          setOrder(ord);
          setStatus(ord.status);
          setPaymentStatus(ord.payment_status);
          setCourier(ord.courier || '');
          setTrackingNumber(ord.tracking_number || '');
          setAdminNotes(ord.admin_notes || '');
        }
        setLoading(false);
      });
    }

    settingsService.getSettings().then(setSettings);
  }, [id]);

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!order) return;

    setSaving(true);
    try {
      const updated = await orderService.updateOrderStatus(order.id, {
        status,
        payment_status: paymentStatus,
        courier: courier.trim(),
        tracking_number: trackingNumber.trim(),
        admin_notes: adminNotes.trim(),
      });
      setOrder(updated);
      success('Order details & status successfully updated in database.');
    } catch (err: any) {
      error(err.message || 'Failed to update order');
    } finally {
      setSaving(false);
    }
  };

  const handlePrint = () => {
    window.print();
  };

  if (loading) {
    return <div className="p-8 text-center text-xs text-neutral-500">Loading order record...</div>;
  }

  if (!order) {
    return <div className="p-8 text-center text-xs text-neutral-500">Order record not found.</div>;
  }

  return (
    <div className="space-y-8">
      
      {/* Top action row */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-neutral-200 dark:border-neutral-800 no-print">
        <Link
          to="/admin/orders"
          className="inline-flex items-center gap-1.5 text-xs text-neutral-500 hover:text-neutral-900 dark:hover:text-white transition-colors"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>All Orders</span>
        </Link>

        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={handlePrint}
            className="px-4 py-2 text-xs font-semibold rounded-xl bg-neutral-900 text-white dark:bg-white dark:text-neutral-900 hover:opacity-90 inline-flex items-center gap-2 shadow-sm"
          >
            <Printer className="w-4 h-4" />
            <span>Print Invoice</span>
          </button>
        </div>
      </div>

      {/* Main Admin Management Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start no-print">
        
        {/* Left: Status & Courier Controls Form */}
        <div className="lg:col-span-5 space-y-6">
          <form onSubmit={handleUpdate} className="p-6 rounded-2xl bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 space-y-4">
            <h2 className="text-sm font-bold uppercase tracking-wider text-neutral-900 dark:text-white">
              Order Fulfillment Controls
            </h2>

            <div>
              <label className="block text-xs font-semibold text-neutral-700 dark:text-neutral-300 mb-1">
                Order Lifecycle Status
              </label>
              <select
                value={status}
                onChange={e => setStatus(e.target.value as OrderStatus)}
                className="w-full px-3 py-2 text-xs rounded-xl border border-neutral-300 dark:border-neutral-700 bg-neutral-50 dark:bg-neutral-800 font-semibold"
              >
                <option value="pending">Pending Confirmation</option>
                <option value="confirmed">Confirmed</option>
                <option value="processing">Processing / Packing</option>
                <option value="shipped">Shipped / Dispatched</option>
                <option value="delivered">Delivered Successfully</option>
                <option value="cancelled">Cancelled</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-neutral-700 dark:text-neutral-300 mb-1">
                Payment Status
              </label>
              <select
                value={paymentStatus}
                onChange={e => setPaymentStatus(e.target.value as PaymentStatus)}
                className="w-full px-3 py-2 text-xs rounded-xl border border-neutral-300 dark:border-neutral-700 bg-neutral-50 dark:bg-neutral-800 font-semibold"
              >
                <option value="pending">Pending Payment</option>
                <option value="paid">Paid & Verified</option>
                <option value="failed">Payment Failed</option>
                <option value="refunded">Refunded</option>
              </select>
            </div>

            <div className="pt-2 border-t border-neutral-100 dark:border-neutral-800 space-y-3">
              <div>
                <label className="block text-xs font-semibold text-neutral-700 dark:text-neutral-300 mb-1">
                  Courier Partner
                </label>
                <select
                  value={courier}
                  onChange={e => setCourier(e.target.value)}
                  className="w-full px-3 py-2 text-xs rounded-xl border border-neutral-300 dark:border-neutral-700 bg-neutral-50 dark:bg-neutral-800"
                >
                  <option value="">Unassigned</option>
                  <option value="TCS Express">TCS Express</option>
                  <option value="Leopards Courier">Leopards Courier</option>
                  <option value="Trax Courier">Trax Courier</option>
                  <option value="M&P Courier">M&P Courier</option>
                  <option value="Direct Store Dispatch">Direct Store Dispatch (Lahore)</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-neutral-700 dark:text-neutral-300 mb-1">
                  Courier Tracking Reference #
                </label>
                <input
                  type="text"
                  value={trackingNumber}
                  onChange={e => setTrackingNumber(e.target.value)}
                  placeholder="e.g. TCS-84920184"
                  className="w-full px-3 py-2 text-xs rounded-xl border border-neutral-300 dark:border-neutral-700 bg-neutral-50 dark:bg-neutral-800 font-mono"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-neutral-700 dark:text-neutral-300 mb-1">
                  Internal Administrative Notes
                </label>
                <textarea
                  rows={2}
                  value={adminNotes}
                  onChange={e => setAdminNotes(e.target.value)}
                  placeholder="Payment confirmation notes, customer communication details..."
                  className="w-full px-3 py-2 text-xs rounded-xl border border-neutral-300 dark:border-neutral-700 bg-neutral-50 dark:bg-neutral-800"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={saving}
              className="w-full py-2.5 px-4 text-xs font-semibold rounded-xl bg-neutral-900 text-white dark:bg-white dark:text-neutral-900 hover:opacity-90 transition-opacity flex items-center justify-center gap-1.5 shadow-sm disabled:opacity-50"
            >
              <Save className="w-3.5 h-3.5" />
              <span>{saving ? 'Updating Record...' : 'Save Order Changes'}</span>
            </button>
          </form>

          {/* Customer delivery card */}
          <div className="p-6 rounded-2xl bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 space-y-3 text-xs">
            <h3 className="font-bold uppercase tracking-wider text-neutral-900 dark:text-white">
              Customer Shipping Profile
            </h3>
            <div className="space-y-1 text-neutral-600 dark:text-neutral-400">
              <p><span className="font-semibold text-neutral-900 dark:text-white">Name:</span> {order.shipping_full_name}</p>
              <p><span className="font-semibold text-neutral-900 dark:text-white">Phone:</span> <span className="font-mono">{order.shipping_phone}</span></p>
              <p><span className="font-semibold text-neutral-900 dark:text-white">Email:</span> {order.shipping_email}</p>
              <p className="pt-2"><span className="font-semibold text-neutral-900 dark:text-white">Address:</span></p>
              <p>{order.shipping_address}</p>
              <p>{order.shipping_area ? `${order.shipping_area}, ` : ''}{order.shipping_city} {order.shipping_postal_code}</p>
              {order.customer_notes && (
                <div className="mt-2 p-2.5 rounded-lg bg-neutral-100 dark:bg-neutral-800 text-[11px] text-neutral-700 dark:text-neutral-300">
                  <span className="font-semibold block">Customer Special Instructions:</span>
                  {order.customer_notes}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Right: Order Items & Price Snapshot */}
        <div className="lg:col-span-7 space-y-6">
          <div className="p-6 rounded-2xl bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-neutral-100 dark:border-neutral-800">
              <div>
                <span className="text-[10px] text-neutral-400 block uppercase">Order ID</span>
                <span className="font-mono text-base font-bold text-neutral-900 dark:text-white">
                  #{order.order_number}
                </span>
              </div>
              <div className="text-right">
                <span className="text-[10px] text-neutral-400 block uppercase">Created At</span>
                <span className="text-xs text-neutral-700 dark:text-neutral-300">
                  {new Date(order.created_at).toLocaleString()}
                </span>
              </div>
            </div>

            {/* Items */}
            <div className="divide-y divide-neutral-100 dark:divide-neutral-800">
              {order.items?.map(item => (
                <div key={item.id} className="py-3 flex items-center justify-between text-xs">
                  <div className="flex items-center gap-3">
                    <img src={item.product_image} alt="" className="w-12 h-12 rounded-lg object-cover bg-neutral-100 shrink-0" />
                    <div>
                      <p className="font-semibold text-neutral-900 dark:text-white">{item.product_name}</p>
                      <p className="text-[11px] text-neutral-500">
                        Qty: {item.quantity} {item.variant ? `· ${item.variant}` : ''}
                      </p>
                    </div>
                  </div>
                  <span className="font-mono tabular-nums font-bold text-neutral-900 dark:text-white">
                    Rs. {(item.unit_price * item.quantity).toLocaleString()}
                  </span>
                </div>
              ))}
            </div>

            {/* Totals */}
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
              <div className="flex justify-between text-base font-bold text-neutral-900 dark:text-white pt-2 border-t border-neutral-100 dark:border-neutral-800">
                <span>Grand Total</span>
                <span>Rs. {order.total.toLocaleString()}</span>
              </div>
            </div>
          </div>
        </div>

      </div>

      {/* =========================================================================
          PRINTABLE INVOICE TEMPLATE (Requirement #40)
          Visible on screen and optimized for browser print
         ========================================================================= */}
      <div className="p-8 rounded-2xl bg-white text-black border border-neutral-300 shadow-sm space-y-6 print:m-0 print:p-0 print:border-none print:shadow-none">
        <div className="flex items-center justify-between pb-6 border-b border-black">
          <div>
            <h1 className="text-2xl font-bold font-serif tracking-tight">Ali Online Store</h1>
            <p className="text-xs text-neutral-600 mt-1">{settings?.address || 'Lahore, Pakistan'}</p>
            <p className="text-xs text-neutral-600">Phone: {settings?.phone || '+92 300 1234567'} · Email: {settings?.email || 'support@alionlinestore.pk'}</p>
          </div>
          <div className="text-right">
            <span className="text-xs uppercase tracking-widest text-neutral-500 font-semibold block">Official Order Receipt</span>
            <p className="font-mono text-xl font-bold text-black mt-1">#{order.order_number}</p>
            <p className="text-xs text-neutral-600">{new Date(order.created_at).toLocaleDateString()}</p>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-6 text-xs">
          <div>
            <span className="font-bold uppercase tracking-wider block text-neutral-500 mb-1">Billed & Shipped To:</span>
            <p className="font-semibold text-sm">{order.shipping_full_name}</p>
            <p>{order.shipping_address}</p>
            <p>{order.shipping_area ? `${order.shipping_area}, ` : ''}{order.shipping_city} {order.shipping_postal_code}</p>
            <p>Phone: {order.shipping_phone}</p>
          </div>
          <div className="text-right">
            <span className="font-bold uppercase tracking-wider block text-neutral-500 mb-1">Payment & Fulfillment:</span>
            <p><span className="font-semibold">Method:</span> {order.payment_method.replace(/_/g, ' ').toUpperCase()}</p>
            <p><span className="font-semibold">Payment Status:</span> {order.payment_status.toUpperCase()}</p>
            <p><span className="font-semibold">Order Status:</span> {order.status.toUpperCase()}</p>
            {order.courier && <p><span className="font-semibold">Courier:</span> {order.courier} ({order.tracking_number})</p>}
          </div>
        </div>

        {/* Invoice Items Table */}
        <table className="w-full text-left text-xs border border-neutral-300">
          <thead className="bg-neutral-100 border-b border-neutral-300 font-semibold uppercase text-[10px]">
            <tr>
              <th className="py-2.5 px-3">Item Description</th>
              <th className="py-2.5 px-3">Option</th>
              <th className="py-2.5 px-3 text-center">Qty</th>
              <th className="py-2.5 px-3 text-right">Unit Price</th>
              <th className="py-2.5 px-3 text-right">Amount</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-neutral-200">
            {order.items?.map(it => (
              <tr key={it.id}>
                <td className="py-2.5 px-3 font-semibold">{it.product_name}</td>
                <td className="py-2.5 px-3 text-neutral-600">{it.variant || '-'}</td>
                <td className="py-2.5 px-3 text-center font-mono">{it.quantity}</td>
                <td className="py-2.5 px-3 text-right font-mono tabular-nums">Rs. {it.unit_price.toLocaleString()}</td>
                <td className="py-2.5 px-3 text-right font-mono tabular-nums">Rs. {(it.unit_price * it.quantity).toLocaleString()}</td>
              </tr>
            ))}
          </tbody>
        </table>

        {/* Invoice Summary */}
        <div className="flex justify-end pt-2">
          <div className="w-64 space-y-1.5 text-xs font-mono">
            <div className="flex justify-between">
              <span>Subtotal:</span>
              <span>Rs. {order.subtotal.toLocaleString()}</span>
            </div>
            {order.discount > 0 && (
              <div className="flex justify-between text-neutral-600">
                <span>Discount:</span>
                <span>- Rs. {order.discount.toLocaleString()}</span>
              </div>
            )}
            <div className="flex justify-between">
              <span>Delivery Fee:</span>
              <span>{order.delivery_fee === 0 ? 'FREE' : `Rs. ${order.delivery_fee.toLocaleString()}`}</span>
            </div>
            <div className="flex justify-between text-sm font-bold border-t border-black pt-1.5">
              <span>Grand Total:</span>
              <span>Rs. {order.total.toLocaleString()}</span>
            </div>
          </div>
        </div>

        <div className="pt-8 border-t border-neutral-300 text-center text-[10px] text-neutral-500">
          Thank you for choosing Ali Online Store. For questions, contact {settings?.phone || '+92 300 1234567'} or {settings?.email || 'support@alionlinestore.pk'}.
        </div>
      </div>

    </div>
  );
};
