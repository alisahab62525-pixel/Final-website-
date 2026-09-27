import React, { useEffect, useState } from 'react';
import { Archive, AlertTriangle, XCircle, CheckCircle, Plus, Minus, Save } from 'lucide-react';
import { inventoryService, InventoryItem } from '../../services/inventoryService';
import { useToast } from '../../contexts/ToastContext';

export const AdminInventoryPage: React.FC = () => {
  const [items, setItems] = useState<InventoryItem[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [filter, setFilter] = useState<'all' | 'low_stock' | 'out_of_stock'>('all');
  const { success, error } = useToast();

  const loadInventory = async () => {
    setLoading(true);
    try {
      const data = await inventoryService.getInventory();
      setItems(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadInventory();
  }, []);

  const handleAdjustDelta = async (productId: string, delta: number) => {
    try {
      await inventoryService.adjustStockDelta(productId, delta);
      loadInventory();
    } catch (err: any) {
      error(err.message || 'Failed to adjust stock');
    }
  };

  const handleSetStock = async (productId: string, quantity: number, threshold?: number) => {
    try {
      await inventoryService.updateStock(productId, quantity, threshold);
      success('Stock updated.');
      loadInventory();
    } catch (err: any) {
      error(err.message || 'Failed to update stock');
    }
  };

  const filteredItems = items.filter(it => {
    if (filter === 'low_stock') return it.status === 'low_stock';
    if (filter === 'out_of_stock') return it.status === 'out_of_stock';
    return true;
  });

  const lowStockCount = items.filter(i => i.status === 'low_stock').length;
  const outOfStockCount = items.filter(i => i.status === 'out_of_stock').length;

  return (
    <div className="space-y-6">
      
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-neutral-200 dark:border-neutral-800">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-neutral-900 dark:text-white font-display">
            Realtime Warehouse & Inventory Tracking
          </h1>
          <p className="text-xs text-neutral-500 mt-1">
            Audit product stock units, set reorder alert thresholds, and prevent stockouts.
          </p>
        </div>

        {/* Filter pills */}
        <div className="flex items-center gap-1 p-1 bg-neutral-200 dark:bg-neutral-800 rounded-xl text-xs font-semibold">
          <button
            type="button"
            onClick={() => setFilter('all')}
            className={`px-3 py-1.5 rounded-lg transition-colors ${
              filter === 'all' ? 'bg-white dark:bg-neutral-900 text-neutral-900 dark:text-white' : 'text-neutral-500'
            }`}
          >
            All Items ({items.length})
          </button>
          <button
            type="button"
            onClick={() => setFilter('low_stock')}
            className={`px-3 py-1.5 rounded-lg transition-colors flex items-center gap-1.5 ${
              filter === 'low_stock' ? 'bg-amber-400 text-neutral-950 font-bold' : 'text-amber-600 dark:text-amber-400'
            }`}
          >
            <AlertTriangle className="w-3.5 h-3.5" />
            <span>Low Stock ({lowStockCount})</span>
          </button>
          <button
            type="button"
            onClick={() => setFilter('out_of_stock')}
            className={`px-3 py-1.5 rounded-lg transition-colors flex items-center gap-1.5 ${
              filter === 'out_of_stock' ? 'bg-rose-500 text-white font-bold' : 'text-rose-500'
            }`}
          >
            <XCircle className="w-3.5 h-3.5" />
            <span>Out of Stock ({outOfStockCount})</span>
          </button>
        </div>
      </div>

      {/* Table */}
      <div className="p-6 rounded-2xl bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 overflow-x-auto">
        {loading ? (
          <div className="p-8 text-center text-xs text-neutral-500">Loading stock records...</div>
        ) : (
          <table className="w-full text-left text-xs">
            <thead className="border-b border-neutral-200 dark:border-neutral-800 text-neutral-400 uppercase text-[10px] tracking-wider">
              <tr>
                <th className="py-3 px-3">Product Name</th>
                <th className="py-3 px-3">SKU</th>
                <th className="py-3 px-3">Price</th>
                <th className="py-3 px-3">Status</th>
                <th className="py-3 px-3 text-center">Alert Threshold</th>
                <th className="py-3 px-3 text-center">Available Stock</th>
                <th className="py-3 px-3 text-right">Quick Stock Adjustment</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-100 dark:divide-neutral-800 font-sans">
              {filteredItems.map(item => (
                <tr key={item.id} className="hover:bg-neutral-50 dark:hover:bg-neutral-850/40 transition-colors">
                  <td className="py-3 px-3 font-semibold text-neutral-900 dark:text-white">
                    {item.name}
                  </td>
                  <td className="py-3 px-3 font-mono text-neutral-500">
                    {item.sku}
                  </td>
                  <td className="py-3 px-3 font-mono tabular-nums text-neutral-900 dark:text-white">
                    Rs. {(item.discount_price ?? item.price).toLocaleString()}
                  </td>
                  <td className="py-3 px-3">
                    <span
                      className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase ${
                        item.status === 'in_stock'
                          ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300'
                          : item.status === 'low_stock'
                          ? 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300'
                          : 'bg-rose-100 text-rose-800 dark:bg-rose-950 dark:text-rose-300'
                      }`}
                    >
                      {item.status.replace(/_/g, ' ')}
                    </span>
                  </td>
                  <td className="py-3 px-3 text-center font-mono">
                    <input
                      type="number"
                      min={0}
                      defaultValue={item.low_stock_threshold}
                      onBlur={e => handleSetStock(item.id, item.stock_quantity, Number(e.target.value))}
                      className="w-16 px-2 py-1 rounded border border-neutral-300 dark:border-neutral-700 bg-neutral-50 dark:bg-neutral-800 text-center text-xs"
                    />
                  </td>
                  <td className="py-3 px-3 text-center font-mono font-bold text-sm">
                    <span className={item.stock_quantity <= item.low_stock_threshold ? 'text-amber-500' : 'text-neutral-900 dark:text-white'}>
                      {item.stock_quantity}
                    </span>
                  </td>
                  <td className="py-3 px-3 text-right">
                    <div className="flex items-center justify-end gap-1.5 font-mono">
                      <button
                        type="button"
                        onClick={() => handleAdjustDelta(item.id, -1)}
                        className="p-1 rounded bg-neutral-100 dark:bg-neutral-800 hover:bg-neutral-200 text-neutral-600 dark:text-neutral-300"
                        title="Deduct 1 unit"
                      >
                        <Minus className="w-3.5 h-3.5" />
                      </button>
                      <button
                        type="button"
                        onClick={() => handleAdjustDelta(item.id, 1)}
                        className="p-1 rounded bg-neutral-100 dark:bg-neutral-800 hover:bg-neutral-200 text-neutral-600 dark:text-neutral-300"
                        title="Add 1 unit"
                      >
                        <Plus className="w-3.5 h-3.5" />
                      </button>
                      <button
                        type="button"
                        onClick={() => handleAdjustDelta(item.id, 10)}
                        className="px-2 py-1 text-[10px] font-semibold rounded bg-neutral-900 text-white dark:bg-white dark:text-neutral-900 hover:opacity-90"
                        title="Add +10 batch stock"
                      >
                        +10
                      </button>
                    </div>
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
