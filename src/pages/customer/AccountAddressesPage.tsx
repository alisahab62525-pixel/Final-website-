import React, { useEffect, useState } from 'react';
import { Plus, Trash2, MapPin, Check } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { useToast } from '../../contexts/ToastContext';
import { customerService } from '../../services/customerService';
import { Address } from '../../types';

export const AccountAddressesPage: React.FC = () => {
  const { user } = useAuth();
  const { success, error } = useToast();

  const [addresses, setAddresses] = useState<Address[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [showAddForm, setShowAddForm] = useState<boolean>(false);

  // New address state
  const [fullName, setFullName] = useState<string>('');
  const [phone, setPhone] = useState<string>('');
  const [addressLine, setAddressLine] = useState<string>('');
  const [area, setArea] = useState<string>('');
  const [city, setCity] = useState<string>('Lahore');
  const [postalCode, setPostalCode] = useState<string>('');
  const [isDefault, setIsDefault] = useState<boolean>(false);

  const loadAddresses = async () => {
    if (!user) return;
    try {
      const data = await customerService.getAddresses(user.id);
      setAddresses(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAddresses();
  }, [user]);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    try {
      await customerService.addAddress(user.id, {
        full_name: fullName.trim(),
        phone: phone.trim(),
        address_line: addressLine.trim(),
        area: area.trim(),
        city: city.trim(),
        postal_code: postalCode.trim(),
        is_default: isDefault || addresses.length === 0,
      });
      success('Address added successfully.');
      setShowAddForm(false);
      setFullName('');
      setPhone('');
      setAddressLine('');
      setArea('');
      setPostalCode('');
      loadAddresses();
    } catch (err: any) {
      error(err.message || 'Failed to save address');
    }
  };

  const handleDelete = async (id: string) => {
    if (!user) return;
    try {
      await customerService.deleteAddress(id, user.id);
      success('Address deleted.');
      loadAddresses();
    } catch (err: any) {
      error(err.message || 'Failed to delete address');
    }
  };

  const handleSetDefault = async (id: string) => {
    if (!user) return;
    try {
      await customerService.updateAddress(id, user.id, { is_default: true });
      success('Default address updated.');
      loadAddresses();
    } catch (err: any) {
      error(err.message || 'Failed to update address');
    }
  };

  return (
    <div className="space-y-6">
      
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-sm font-bold uppercase tracking-wider text-neutral-900 dark:text-white">
            Saved Shipping Destinations
          </h2>
          <p className="text-xs text-neutral-500 mt-0.5">Manage delivery addresses for faster checkout.</p>
        </div>
        <button
          type="button"
          onClick={() => setShowAddForm(!showAddForm)}
          className="px-4 py-2 text-xs font-semibold rounded-xl bg-neutral-900 text-white dark:bg-white dark:text-neutral-900 hover:opacity-90 inline-flex items-center gap-1.5"
        >
          <Plus className="w-3.5 h-3.5" />
          <span>Add Address</span>
        </button>
      </div>

      {/* Add Address Form Modal / Accordion */}
      {showAddForm && (
        <form onSubmit={handleCreate} className="p-6 rounded-2xl bg-neutral-100 dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 space-y-4 max-w-xl">
          <h3 className="text-xs font-bold uppercase text-neutral-900 dark:text-white">New Delivery Location</h3>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
            <div>
              <label className="block font-semibold mb-1">Recipient Name *</label>
              <input
                type="text"
                required
                value={fullName}
                onChange={e => setFullName(e.target.value)}
                className="w-full px-3 py-2 rounded-lg border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-800"
              />
            </div>
            <div>
              <label className="block font-semibold mb-1">Mobile Phone *</label>
              <input
                type="tel"
                required
                value={phone}
                onChange={e => setPhone(e.target.value)}
                className="w-full px-3 py-2 rounded-lg border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-800"
              />
            </div>
            <div className="sm:col-span-2">
              <label className="block font-semibold mb-1">Address Line *</label>
              <input
                type="text"
                required
                value={addressLine}
                onChange={e => setAddressLine(e.target.value)}
                className="w-full px-3 py-2 rounded-lg border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-800"
              />
            </div>
            <div>
              <label className="block font-semibold mb-1">Area / Sector</label>
              <input
                type="text"
                value={area}
                onChange={e => setArea(e.target.value)}
                className="w-full px-3 py-2 rounded-lg border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-800"
              />
            </div>
            <div>
              <label className="block font-semibold mb-1">City *</label>
              <select
                value={city}
                onChange={e => setCity(e.target.value)}
                className="w-full px-3 py-2 rounded-lg border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-800"
              >
                <option value="Lahore">Lahore</option>
                <option value="Karachi">Karachi</option>
                <option value="Islamabad">Islamabad</option>
                <option value="Rawalpindi">Rawalpindi</option>
                <option value="Faisalabad">Faisalabad</option>
                <option value="Other">Other</option>
              </select>
            </div>
            <div>
              <label className="block font-semibold mb-1">Postal Code</label>
              <input
                type="text"
                value={postalCode}
                onChange={e => setPostalCode(e.target.value)}
                className="w-full px-3 py-2 rounded-lg border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-800"
              />
            </div>
            <div className="sm:col-span-2 pt-1">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={isDefault}
                  onChange={e => setIsDefault(e.target.checked)}
                />
                <span>Set as default shipping address</span>
              </label>
            </div>
          </div>

          <div className="flex items-center gap-2 pt-2">
            <button
              type="submit"
              className="px-4 py-2 text-xs font-semibold rounded-lg bg-neutral-900 text-white dark:bg-white dark:text-neutral-900"
            >
              Save Address
            </button>
            <button
              type="button"
              onClick={() => setShowAddForm(false)}
              className="px-4 py-2 text-xs font-semibold rounded-lg border border-neutral-300 dark:border-neutral-700 text-neutral-600 dark:text-neutral-400"
            >
              Cancel
            </button>
          </div>
        </form>
      )}

      {/* Address cards list */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {addresses.map(addr => (
          <div
            key={addr.id}
            className="p-5 rounded-2xl bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 flex flex-col justify-between space-y-4"
          >
            <div className="space-y-1 text-xs">
              <div className="flex items-center justify-between">
                <span className="font-bold text-neutral-900 dark:text-white">{addr.full_name}</span>
                {addr.is_default && (
                  <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300">
                    Default
                  </span>
                )}
              </div>
              <p className="text-neutral-600 dark:text-neutral-400 pt-1">{addr.address_line}</p>
              {addr.area && <p className="text-neutral-500">{addr.area}</p>}
              <p className="text-neutral-500">{addr.city} {addr.postal_code}</p>
              <p className="text-neutral-500 font-mono pt-1">{addr.phone}</p>
            </div>

            <div className="pt-3 border-t border-neutral-100 dark:border-neutral-800 flex items-center justify-between text-xs">
              {!addr.is_default ? (
                <button
                  type="button"
                  onClick={() => handleSetDefault(addr.id)}
                  className="text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-white underline text-[11px]"
                >
                  Set as Default
                </button>
              ) : (
                <span className="text-[11px] text-emerald-600 flex items-center gap-1 font-medium">
                  <Check className="w-3.5 h-3.5" /> Default Address
                </span>
              )}

              <button
                type="button"
                onClick={() => handleDelete(addr.id)}
                className="text-neutral-400 hover:text-rose-500 p-1"
                aria-label="Delete address"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          </div>
        ))}
      </div>

    </div>
  );
};
