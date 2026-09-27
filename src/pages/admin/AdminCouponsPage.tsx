import React, { useEffect, useState } from 'react';
import { Plus, Tag, Trash2, CheckCircle2, XCircle } from 'lucide-react';
import { couponService } from '../../services/couponService';
import { useToast } from '../../contexts/ToastContext';
import { Coupon, DiscountType } from '../../types';

export const AdminCouponsPage: React.FC = () => {
  const [coupons, setCoupons] = useState<Coupon[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [modalOpen, setModalOpen] = useState<boolean>(false);
  const { success, error } = useToast();

  // Create form
  const [code, setCode] = useState<string>('');
  const [discountType, setDiscountType] = useState<DiscountType>('percentage');
  const [discountValue, setDiscountValue] = useState<number>(10);
  const [minOrder, setMinOrder] = useState<number>(2000);
  const [maxDiscount, setMaxDiscount] = useState<string>('2000');
  const [usageLimit, setUsageLimit] = useState<number>(100);
  const [expiresAt, setExpiresAt] = useState<string>('2027-12-31');
  const [isActive, setIsActive] = useState<boolean>(true);
  const [saving, setSaving] = useState<boolean>(false);

  const loadCoupons = async () => {
    setLoading(true);
    try {
      const data = await couponService.getCoupons();
      setCoupons(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadCoupons();
  }, []);

  const handleCreateCoupon = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!code.trim() || discountValue <= 0) {
      error('Please enter valid coupon specifications.');
      return;
    }

    setSaving(true);
    try {
      await couponService.createCoupon({
        code: code.trim().toUpperCase(),
        discount_type: discountType,
        discount_value: Number(discountValue),
        minimum_order_amount: Number(minOrder),
        maximum_discount: maxDiscount ? Number(maxDiscount) : undefined,
        usage_limit: Number(usageLimit),
        expires_at: new Date(expiresAt).toISOString(),
        is_active: isActive,
      });
      success(`Coupon ${code.toUpperCase()} successfully created.`);
      setModalOpen(false);
      setCode('');
      loadCoupons();
    } catch (err: any) {
      error(err.message || 'Failed to create coupon');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string, codeName: string) => {
    if (!window.confirm(`Permanently delete coupon "${codeName}"?`)) return;
    try {
      await couponService.deleteCoupon(id);
      success(`Coupon "${codeName}" deleted.`);
      loadCoupons();
    } catch (err: any) {
      error(err.message || 'Failed to delete coupon');
    }
  };

  return (
    <div className="space-y-6">
      
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-neutral-200 dark:border-neutral-800">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-neutral-900 dark:text-white font-display">
            Promotional Coupons & Discounts
          </h1>
          <p className="text-xs text-neutral-500 mt-1">
            Configure secure percentage or fixed vouchers with cart thresholds and usage limits.
          </p>
        </div>

        <button
          type="button"
          onClick={() => setModalOpen(true)}
          className="px-4 py-2 text-xs font-semibold rounded-xl bg-neutral-900 text-white dark:bg-white dark:text-neutral-900 hover:opacity-90 inline-flex items-center gap-1.5 self-start sm:self-auto shadow-sm"
        >
          <Plus className="w-3.5 h-3.5" />
          <span>Create Coupon</span>
        </button>
      </div>

      {/* Coupons Table */}
      <div className="p-6 rounded-2xl bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 overflow-x-auto">
        {loading ? (
          <div className="p-8 text-center text-xs text-neutral-500">Loading coupons...</div>
        ) : coupons.length === 0 ? (
          <div className="p-12 text-center text-xs text-neutral-500">No active promotional vouchers.</div>
        ) : (
          <table className="w-full text-left text-xs">
            <thead className="border-b border-neutral-200 dark:border-neutral-800 text-neutral-400 uppercase text-[10px] tracking-wider font-sans">
              <tr>
                <th className="py-3 px-3">Promo Code</th>
                <th className="py-3 px-3">Discount Type & Rate</th>
                <th className="py-3 px-3">Min. Cart Value</th>
                <th className="py-3 px-3">Max Cap</th>
                <th className="py-3 px-3">Redemptions</th>
                <th className="py-3 px-3">Expires</th>
                <th className="py-3 px-3">Status</th>
                <th className="py-3 px-3 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-100 dark:divide-neutral-800 font-mono text-xs">
              {coupons.map(coup => (
                <tr key={coup.id} className="hover:bg-neutral-50 dark:hover:bg-neutral-850/40 transition-colors">
                  <td className="py-3.5 px-3 font-bold text-neutral-900 dark:text-white">
                    {coup.code}
                  </td>
                  <td className="py-3.5 px-3 font-sans">
                    {coup.discount_type === 'percentage'
                      ? `${coup.discount_value}% Off`
                      : `Rs. ${coup.discount_value.toLocaleString()} Off`}
                  </td>
                  <td className="py-3.5 px-3 tabular-nums">
                    Rs. {coup.minimum_order_amount.toLocaleString()}
                  </td>
                  <td className="py-3.5 px-3 tabular-nums">
                    {coup.maximum_discount ? `Rs. ${coup.maximum_discount.toLocaleString()}` : 'No cap'}
                  </td>
                  <td className="py-3.5 px-3 tabular-nums font-sans">
                    {coup.used_count} / {coup.usage_limit} used
                  </td>
                  <td className="py-3.5 px-3 text-neutral-500 font-sans text-[11px]">
                    {new Date(coup.expires_at).toLocaleDateString()}
                  </td>
                  <td className="py-3.5 px-3 font-sans">
                    <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase ${
                      coup.is_active ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300' : 'bg-neutral-200 text-neutral-600'
                    }`}>
                      {coup.is_active ? 'Active' : 'Disabled'}
                    </span>
                  </td>
                  <td className="py-3.5 px-3 text-right font-sans">
                    <button
                      type="button"
                      onClick={() => handleDelete(coup.id, coup.code)}
                      className="p-1 text-neutral-400 hover:text-rose-500 rounded"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* Modal */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <form onSubmit={handleCreateCoupon} className="max-w-md w-full p-6 rounded-2xl bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 shadow-2xl space-y-4 text-xs">
            <h2 className="text-base font-bold text-neutral-900 dark:text-white">Create New Coupon</h2>

            <div>
              <label className="block font-semibold mb-1">Coupon Code (Uppercase) *</label>
              <input
                type="text"
                required
                value={code}
                onChange={e => setCode(e.target.value.toUpperCase())}
                placeholder="e.g. FLASH20"
                className="w-full px-3 py-2 rounded-xl border border-neutral-300 dark:border-neutral-700 bg-neutral-50 dark:bg-neutral-800 font-mono uppercase"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block font-semibold mb-1">Discount Type</label>
                <select
                  value={discountType}
                  onChange={e => setDiscountType(e.target.value as DiscountType)}
                  className="w-full px-3 py-2 rounded-xl border border-neutral-300 dark:border-neutral-700 bg-neutral-50 dark:bg-neutral-800"
                >
                  <option value="percentage">Percentage (%)</option>
                  <option value="fixed">Fixed Amount (Rs.)</option>
                </select>
              </div>

              <div>
                <label className="block font-semibold mb-1">Discount Value *</label>
                <input
                  type="number"
                  required
                  min={1}
                  value={discountValue}
                  onChange={e => setDiscountValue(Number(e.target.value))}
                  className="w-full px-3 py-2 rounded-xl border border-neutral-300 dark:border-neutral-700 bg-neutral-50 dark:bg-neutral-800 font-mono"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block font-semibold mb-1">Min Order Amount (Rs.)</label>
                <input
                  type="number"
                  min={0}
                  value={minOrder}
                  onChange={e => setMinOrder(Number(e.target.value))}
                  className="w-full px-3 py-2 rounded-xl border border-neutral-300 dark:border-neutral-700 bg-neutral-50 dark:bg-neutral-800 font-mono"
                />
              </div>

              <div>
                <label className="block font-semibold mb-1">Max Cap (Rs. Optional)</label>
                <input
                  type="number"
                  min={0}
                  value={maxDiscount}
                  onChange={e => setMaxDiscount(e.target.value)}
                  placeholder="2000"
                  className="w-full px-3 py-2 rounded-xl border border-neutral-300 dark:border-neutral-700 bg-neutral-50 dark:bg-neutral-800 font-mono"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block font-semibold mb-1">Usage Limit</label>
                <input
                  type="number"
                  min={1}
                  value={usageLimit}
                  onChange={e => setUsageLimit(Number(e.target.value))}
                  className="w-full px-3 py-2 rounded-xl border border-neutral-300 dark:border-neutral-700 bg-neutral-50 dark:bg-neutral-800 font-mono"
                />
              </div>

              <div>
                <label className="block font-semibold mb-1">Expiry Date</label>
                <input
                  type="date"
                  required
                  value={expiresAt}
                  onChange={e => setExpiresAt(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-neutral-300 dark:border-neutral-700 bg-neutral-50 dark:bg-neutral-800 font-mono"
                />
              </div>
            </div>

            <label className="flex items-center gap-2 cursor-pointer pt-1">
              <input
                type="checkbox"
                checked={isActive}
                onChange={e => setIsActive(e.target.checked)}
              />
              <span className="font-semibold">Coupon Active</span>
            </label>

            <div className="flex items-center justify-end gap-2 pt-3 border-t border-neutral-100 dark:border-neutral-800">
              <button
                type="button"
                onClick={() => setModalOpen(false)}
                className="px-4 py-2 font-semibold rounded-lg text-neutral-500"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={saving}
                className="px-4 py-2 font-semibold rounded-lg bg-neutral-900 text-white dark:bg-white dark:text-neutral-900 disabled:opacity-50"
              >
                {saving ? 'Creating...' : 'Save Coupon'}
              </button>
            </div>
          </form>
        </div>
      )}

    </div>
  );
};
