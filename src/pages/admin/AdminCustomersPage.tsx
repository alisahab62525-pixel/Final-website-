import React, { useEffect, useState } from 'react';
import { Users, Eye, Package, X, ArrowRight } from 'lucide-react';
import { customerService, CustomerSummary } from '../../services/customerService';
import { Order, Profile } from '../../types';

export const AdminCustomersPage: React.FC = () => {
  const [customers, setCustomers] = useState<CustomerSummary[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  // Drawer modal state for viewing customer details
  const [selectedCustomerId, setSelectedCustomerId] = useState<string | null>(null);
  const [selectedDetails, setSelectedDetails] = useState<{ profile: Profile; orders: Order[] } | null>(null);
  const [detailsLoading, setDetailsLoading] = useState<boolean>(false);

  useEffect(() => {
    customerService.getCustomers().then(data => {
      setCustomers(data);
      setLoading(false);
    });
  }, []);

  const handleOpenDetails = async (id: string) => {
    setSelectedCustomerId(id);
    setDetailsLoading(true);
    try {
      const details = await customerService.getCustomerDetails(id);
      setSelectedDetails(details);
    } catch (err) {
      console.error(err);
    } finally {
      setDetailsLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-neutral-200 dark:border-neutral-800">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-neutral-900 dark:text-white font-display">
            Customer Profiles & Lifetime Spending
          </h1>
          <p className="text-xs text-neutral-500 mt-1">
            Registered shopper records, order volumes, and lifetime transactional value.
          </p>
        </div>
      </div>

      <div className="p-6 rounded-2xl bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 overflow-x-auto">
        {loading ? (
          <div className="p-8 text-center text-xs text-neutral-500">Loading customer accounts...</div>
        ) : customers.length === 0 ? (
          <div className="p-12 text-center text-xs text-neutral-500">No customer accounts registered yet.</div>
        ) : (
          <table className="w-full text-left text-xs">
            <thead className="border-b border-neutral-200 dark:border-neutral-800 text-neutral-400 uppercase text-[10px] tracking-wider">
              <tr>
                <th className="py-3 px-3">Customer</th>
                <th className="py-3 px-3">Email Address</th>
                <th className="py-3 px-3">Phone</th>
                <th className="py-3 px-3">Registered Date</th>
                <th className="py-3 px-3 text-center">Orders Placed</th>
                <th className="py-3 px-3 text-right">Lifetime Spent</th>
                <th className="py-3 px-3 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-100 dark:divide-neutral-800 font-sans">
              {customers.map(c => (
                <tr key={c.id} className="hover:bg-neutral-50 dark:hover:bg-neutral-850/40 transition-colors">
                  <td className="py-3.5 px-3 font-semibold text-neutral-900 dark:text-white">
                    {c.full_name}
                  </td>
                  <td className="py-3.5 px-3 text-neutral-500 font-mono text-[11px]">
                    {c.email}
                  </td>
                  <td className="py-3.5 px-3 text-neutral-500 font-mono">
                    {c.phone || '-'}
                  </td>
                  <td className="py-3.5 px-3 text-neutral-400 text-[11px]">
                    {new Date(c.created_at).toLocaleDateString()}
                  </td>
                  <td className="py-3.5 px-3 text-center font-mono font-bold text-neutral-900 dark:text-white">
                    {c.orders_count}
                  </td>
                  <td className="py-3.5 px-3 text-right font-mono font-bold text-neutral-900 dark:text-white tabular-nums">
                    Rs. {c.total_spent.toLocaleString()}
                  </td>
                  <td className="py-3.5 px-3 text-right">
                    <button
                      type="button"
                      onClick={() => handleOpenDetails(c.id)}
                      className="px-2.5 py-1 text-xs font-semibold rounded-md border border-neutral-300 dark:border-neutral-700 hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors inline-flex items-center gap-1"
                    >
                      <Eye className="w-3.5 h-3.5" />
                      <span>History</span>
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* Customer Details History Modal */}
      {selectedCustomerId && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="max-w-2xl w-full p-6 rounded-2xl bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 shadow-2xl space-y-4 max-h-[85vh] flex flex-col">
            <div className="flex items-center justify-between pb-3 border-b border-neutral-100 dark:border-neutral-800">
              <div>
                <h3 className="text-base font-bold text-neutral-900 dark:text-white">
                  Customer History & Orders
                </h3>
                <p className="text-xs text-neutral-500">{selectedDetails?.profile.full_name} ({selectedDetails?.profile.email})</p>
              </div>
              <button
                onClick={() => setSelectedCustomerId(null)}
                className="p-1 text-neutral-400 hover:text-neutral-600 dark:hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto space-y-3 pr-1 text-xs">
              {detailsLoading ? (
                <div className="p-8 text-center text-neutral-400">Loading order records...</div>
              ) : selectedDetails?.orders.length === 0 ? (
                <div className="p-8 text-center text-neutral-400">This customer has not placed any orders yet.</div>
              ) : (
                selectedDetails?.orders.map(o => (
                  <div key={o.id} className="p-3.5 rounded-xl border border-neutral-200 dark:border-neutral-800 space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="font-mono font-bold text-neutral-900 dark:text-white">#{o.order_number}</span>
                      <span className="px-2 py-0.5 rounded text-[10px] uppercase font-bold bg-neutral-100 dark:bg-neutral-800">
                        {o.status}
                      </span>
                    </div>
                    <div className="flex items-center justify-between text-neutral-500 text-[11px]">
                      <span>{new Date(o.created_at).toLocaleDateString()} · {o.payment_method.replace(/_/g, ' ')}</span>
                      <span className="font-mono font-bold text-neutral-900 dark:text-white tabular-nums text-xs">
                        Rs. {o.total.toLocaleString()}
                      </span>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
