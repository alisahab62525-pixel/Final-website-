import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Truck, ShieldCheck, CheckCircle2, ArrowRight, CreditCard, Banknote, Smartphone, Plus } from 'lucide-react';
import { useCart } from '../../contexts/CartContext';
import { useAuth } from '../../contexts/AuthContext';
import { useToast } from '../../contexts/ToastContext';
import { customerService } from '../../services/customerService';
import { orderService } from '../../services/orderService';
import { settingsService } from '../../services/settingsService';
import { Address, PaymentMethod, StoreSettings } from '../../types';

export const CheckoutPage: React.FC = () => {
  const { items, subtotal, discount, deliveryFee, total, appliedCoupon, clearCart } = useCart();
  const { user, profile, loading: authLoading } = useAuth();
  const { success, error, toast } = useToast();
  const navigate = useNavigate();

  const [savedAddresses, setSavedAddresses] = useState<Address[]>([]);
  const [selectedAddressId, setSelectedAddressId] = useState<string>('new');
  const [settings, setSettings] = useState<StoreSettings | null>(null);

  // Address form fields
  const [fullName, setFullName] = useState<string>('');
  const [phone, setPhone] = useState<string>('');
  const [email, setEmail] = useState<string>('');
  const [addressLine, setAddressLine] = useState<string>('');
  const [area, setArea] = useState<string>('');
  const [city, setCity] = useState<string>('Lahore');
  const [postalCode, setPostalCode] = useState<string>('');
  const [customerNotes, setCustomerNotes] = useState<string>('');
  const [saveThisAddress, setSaveThisAddress] = useState<boolean>(true);

  // Payment method
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('cash_on_delivery');
  const [placingOrder, setPlacingOrder] = useState<boolean>(false);

  // Ensure authenticated
  useEffect(() => {
    if (!authLoading && !user) {
      toast('Please login or create an account to proceed to checkout.', 'info');
      navigate('/login?redirect=/checkout', { replace: true });
    }
  }, [user, authLoading, navigate, toast]);

  // Load user data and addresses
  useEffect(() => {
    if (user) {
      setEmail(user.email || '');
      if (profile) {
        setFullName(profile.full_name || '');
        setPhone(profile.phone || '');
      }

      customerService.getAddresses(user.id).then(addresses => {
        setSavedAddresses(addresses);
        const defaultAddr = addresses.find(a => a.is_default) || addresses[0];
        if (defaultAddr) {
          setSelectedAddressId(defaultAddr.id);
          setFullName(defaultAddr.full_name);
          setPhone(defaultAddr.phone);
          setAddressLine(defaultAddr.address_line);
          setArea(defaultAddr.area);
          setCity(defaultAddr.city);
          setPostalCode(defaultAddr.postal_code);
        }
      });
    }

    settingsService.getSettings().then(setSettings);
  }, [user, profile]);

  const handleSelectSavedAddress = (addrId: string) => {
    setSelectedAddressId(addrId);
    if (addrId === 'new') {
      setAddressLine('');
      setArea('');
      setPostalCode('');
    } else {
      const chosen = savedAddresses.find(a => a.id === addrId);
      if (chosen) {
        setFullName(chosen.full_name);
        setPhone(chosen.phone);
        setAddressLine(chosen.address_line);
        setArea(chosen.area);
        setCity(chosen.city);
        setPostalCode(chosen.postal_code);
      }
    }
  };

  const handlePlaceOrder = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) {
      navigate('/login?redirect=/checkout');
      return;
    }
    if (items.length === 0) {
      error('Your cart is empty.');
      navigate('/cart');
      return;
    }
    if (!fullName.trim() || !phone.trim() || !addressLine.trim() || !city.trim()) {
      error('Please complete all mandatory delivery details.');
      return;
    }

    setPlacingOrder(true);
    try {
      // Save address if requested and new
      if (selectedAddressId === 'new' && saveThisAddress) {
        await customerService.addAddress(user.id, {
          full_name: fullName.trim(),
          phone: phone.trim(),
          address_line: addressLine.trim(),
          area: area.trim(),
          city: city.trim(),
          postal_code: postalCode.trim(),
          is_default: savedAddresses.length === 0,
        });
      }

      // Execute Order Creation
      const createdOrder = await orderService.placeOrder({
        customerId: user.id,
        items,
        shippingAddress: {
          fullName: fullName.trim(),
          phone: phone.trim(),
          email: email.trim(),
          addressLine: addressLine.trim(),
          area: area.trim(),
          city: city.trim(),
          postalCode: postalCode.trim(),
        },
        paymentMethod,
        couponCode: appliedCoupon?.code,
        customerNotes: customerNotes.trim(),
      });

      clearCart();
      success(`Order placed successfully! Order #${createdOrder.order_number}`);
      navigate(`/order-success/${createdOrder.id}`);
    } catch (err: any) {
      error(err.message || 'Failed to place order. Please try again.');
    } finally {
      setPlacingOrder(false);
    }
  };

  if (authLoading || !user) {
    return (
      <div className="min-h-[50vh] flex items-center justify-center">
        <span className="text-xs text-neutral-500 font-medium">Checking customer authentication...</span>
      </div>
    );
  }

  if (items.length === 0) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-20 text-center">
        <h2 className="text-xl font-bold">Your cart is empty</h2>
        <Link to="/shop" className="mt-4 inline-block text-xs font-semibold underline">
          Return to Store Catalog
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-10">
      
      <div className="pb-6 border-b border-neutral-200 dark:border-neutral-800">
        <span className="text-xs uppercase tracking-wider text-neutral-500 font-medium">Secure Checkout</span>
        <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-neutral-900 dark:text-white font-display mt-1">
          Finalize Your Order
        </h1>
        <p className="text-xs text-neutral-500 dark:text-neutral-400 mt-1">
          Signed in as {profile?.full_name || user.email}
        </p>
      </div>

      <form onSubmit={handlePlaceOrder} className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-start">
        
        {/* Left Column: Delivery Address & Payment Method */}
        <div className="lg:col-span-7 space-y-8">
          
          {/* Section 1: Shipping Address */}
          <div className="p-6 rounded-2xl bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 space-y-5">
            <div className="flex items-center justify-between">
              <h2 className="text-sm font-bold uppercase tracking-wider text-neutral-900 dark:text-white flex items-center gap-2">
                <Truck className="w-4 h-4" />
                <span>1. Shipping & Delivery Address</span>
              </h2>
            </div>

            {/* Saved Addresses Selector */}
            {savedAddresses.length > 0 && (
              <div className="space-y-2">
                <label className="text-xs font-semibold text-neutral-700 dark:text-neutral-300">
                  Select a saved destination:
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {savedAddresses.map(addr => (
                    <button
                      key={addr.id}
                      type="button"
                      onClick={() => handleSelectSavedAddress(addr.id)}
                      className={`p-3 text-left rounded-xl border text-xs transition-all ${
                        selectedAddressId === addr.id
                          ? 'border-neutral-900 dark:border-white bg-neutral-50 dark:bg-neutral-800'
                          : 'border-neutral-200 dark:border-neutral-800 hover:border-neutral-300'
                      }`}
                    >
                      <p className="font-semibold text-neutral-900 dark:text-white">{addr.full_name}</p>
                      <p className="text-neutral-500 mt-0.5 truncate">{addr.address_line}</p>
                      <p className="text-neutral-500">{addr.city}, {addr.phone}</p>
                    </button>
                  ))}
                  <button
                    type="button"
                    onClick={() => handleSelectSavedAddress('new')}
                    className={`p-3 text-center rounded-xl border border-dashed text-xs font-semibold transition-all flex items-center justify-center gap-1.5 ${
                      selectedAddressId === 'new'
                        ? 'border-neutral-900 text-neutral-900 dark:border-white dark:text-white bg-neutral-50 dark:bg-neutral-800'
                        : 'border-neutral-300 dark:border-neutral-700 text-neutral-500'
                    }`}
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Enter New Address</span>
                  </button>
                </div>
              </div>
            )}

            {/* Address Input Fields */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
              <div>
                <label className="block text-xs font-semibold text-neutral-700 dark:text-neutral-300 mb-1">
                  Recipient Name *
                </label>
                <input
                  type="text"
                  required
                  value={fullName}
                  onChange={e => setFullName(e.target.value)}
                  placeholder="Full legal name"
                  className="w-full px-3 py-2 text-xs rounded-xl border border-neutral-300 dark:border-neutral-700 bg-neutral-50 dark:bg-neutral-800 text-neutral-900 dark:text-white focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-neutral-700 dark:text-neutral-300 mb-1">
                  Contact Mobile Number *
                </label>
                <input
                  type="tel"
                  required
                  value={phone}
                  onChange={e => setPhone(e.target.value)}
                  placeholder="+92 300 1234567"
                  className="w-full px-3 py-2 text-xs rounded-xl border border-neutral-300 dark:border-neutral-700 bg-neutral-50 dark:bg-neutral-800 text-neutral-900 dark:text-white focus:outline-none"
                />
              </div>

              <div className="sm:col-span-2">
                <label className="block text-xs font-semibold text-neutral-700 dark:text-neutral-300 mb-1">
                  Email for Dispatch Updates *
                </label>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  className="w-full px-3 py-2 text-xs rounded-xl border border-neutral-300 dark:border-neutral-700 bg-neutral-50 dark:bg-neutral-800 text-neutral-900 dark:text-white focus:outline-none"
                />
              </div>

              <div className="sm:col-span-2">
                <label className="block text-xs font-semibold text-neutral-700 dark:text-neutral-300 mb-1">
                  Street Address & House / Building No. *
                </label>
                <input
                  type="text"
                  required
                  value={addressLine}
                  onChange={e => setAddressLine(e.target.value)}
                  placeholder="House #, Street name, Sector / Block"
                  className="w-full px-3 py-2 text-xs rounded-xl border border-neutral-300 dark:border-neutral-700 bg-neutral-50 dark:bg-neutral-800 text-neutral-900 dark:text-white focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-neutral-700 dark:text-neutral-300 mb-1">
                  Area / Neighborhood
                </label>
                <input
                  type="text"
                  value={area}
                  onChange={e => setArea(e.target.value)}
                  placeholder="e.g. DHA Phase 5, Gulberg, Clifton"
                  className="w-full px-3 py-2 text-xs rounded-xl border border-neutral-300 dark:border-neutral-700 bg-neutral-50 dark:bg-neutral-800 text-neutral-900 dark:text-white focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-neutral-700 dark:text-neutral-300 mb-1">
                  City *
                </label>
                <select
                  value={city}
                  onChange={e => setCity(e.target.value)}
                  className="w-full px-3 py-2 text-xs rounded-xl border border-neutral-300 dark:border-neutral-700 bg-neutral-50 dark:bg-neutral-800 text-neutral-900 dark:text-white focus:outline-none"
                >
                  <option value="Lahore">Lahore</option>
                  <option value="Karachi">Karachi</option>
                  <option value="Islamabad">Islamabad</option>
                  <option value="Rawalpindi">Rawalpindi</option>
                  <option value="Faisalabad">Faisalabad</option>
                  <option value="Multan">Multan</option>
                  <option value="Peshawar">Peshawar</option>
                  <option value="Quetta">Quetta</option>
                  <option value="Sialkot">Sialkot</option>
                  <option value="Gujranwala">Gujranwala</option>
                  <option value="Other">Other City (Pakistan)</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-neutral-700 dark:text-neutral-300 mb-1">
                  Postal Code
                </label>
                <input
                  type="text"
                  value={postalCode}
                  onChange={e => setPostalCode(e.target.value)}
                  placeholder="54000"
                  className="w-full px-3 py-2 text-xs rounded-xl border border-neutral-300 dark:border-neutral-700 bg-neutral-50 dark:bg-neutral-800 text-neutral-900 dark:text-white focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-neutral-700 dark:text-neutral-300 mb-1">
                  Delivery Instructions (Optional)
                </label>
                <input
                  type="text"
                  value={customerNotes}
                  onChange={e => setCustomerNotes(e.target.value)}
                  placeholder="e.g. Ring bell twice, deliver after 2 PM"
                  className="w-full px-3 py-2 text-xs rounded-xl border border-neutral-300 dark:border-neutral-700 bg-neutral-50 dark:bg-neutral-800 text-neutral-900 dark:text-white focus:outline-none"
                />
              </div>
            </div>

            {selectedAddressId === 'new' && (
              <label className="flex items-center gap-2 pt-2 text-xs text-neutral-600 dark:text-neutral-400 cursor-pointer">
                <input
                  type="checkbox"
                  checked={saveThisAddress}
                  onChange={e => setSaveThisAddress(e.target.checked)}
                  className="rounded border-neutral-300 dark:border-neutral-700"
                />
                <span>Save this address to my profile for future orders</span>
              </label>
            )}
          </div>

          {/* Section 2: Payment Method */}
          <div className="p-6 rounded-2xl bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 space-y-4">
            <h2 className="text-sm font-bold uppercase tracking-wider text-neutral-900 dark:text-white flex items-center gap-2">
              <CreditCard className="w-4 h-4" />
              <span>2. Payment Option</span>
            </h2>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              
              {/* Cash on Delivery */}
              <button
                type="button"
                onClick={() => setPaymentMethod('cash_on_delivery')}
                className={`p-4 rounded-xl border text-left text-xs transition-all ${
                  paymentMethod === 'cash_on_delivery'
                    ? 'border-neutral-900 dark:border-white bg-neutral-50 dark:bg-neutral-800'
                    : 'border-neutral-200 dark:border-neutral-800'
                }`}
              >
                <div className="flex items-center justify-between mb-1">
                  <span className="font-bold text-neutral-900 dark:text-white">Cash on Delivery (COD)</span>
                  <Banknote className="w-4 h-4 text-emerald-500" />
                </div>
                <p className="text-neutral-500">Pay cash directly to the courier upon packet delivery.</p>
              </button>

              {/* Bank Transfer */}
              <button
                type="button"
                onClick={() => setPaymentMethod('bank_transfer')}
                className={`p-4 rounded-xl border text-left text-xs transition-all ${
                  paymentMethod === 'bank_transfer'
                    ? 'border-neutral-900 dark:border-white bg-neutral-50 dark:bg-neutral-800'
                    : 'border-neutral-200 dark:border-neutral-800'
                }`}
              >
                <div className="flex items-center justify-between mb-1">
                  <span className="font-bold text-neutral-900 dark:text-white">Direct Bank Transfer</span>
                  <CreditCard className="w-4 h-4 text-blue-500" />
                </div>
                <p className="text-neutral-500">Meezan Bank Ltd account transfer with instant receipt verification.</p>
              </button>

              {/* EasyPaisa */}
              <button
                type="button"
                onClick={() => setPaymentMethod('easypaisa')}
                className={`p-4 rounded-xl border text-left text-xs transition-all ${
                  paymentMethod === 'easypaisa'
                    ? 'border-neutral-900 dark:border-white bg-neutral-50 dark:bg-neutral-800'
                    : 'border-neutral-200 dark:border-neutral-800'
                }`}
              >
                <div className="flex items-center justify-between mb-1">
                  <span className="font-bold text-neutral-900 dark:text-white">EasyPaisa Mobile Wallet</span>
                  <Smartphone className="w-4 h-4 text-emerald-500" />
                </div>
                <p className="text-neutral-500">Send money directly to Ali Store official EasyPaisa wallet.</p>
              </button>

              {/* JazzCash */}
              <button
                type="button"
                onClick={() => setPaymentMethod('jazzcash')}
                className={`p-4 rounded-xl border text-left text-xs transition-all ${
                  paymentMethod === 'jazzcash'
                    ? 'border-neutral-900 dark:border-white bg-neutral-50 dark:bg-neutral-800'
                    : 'border-neutral-200 dark:border-neutral-800'
                }`}
              >
                <div className="flex items-center justify-between mb-1">
                  <span className="font-bold text-neutral-900 dark:text-white">JazzCash Mobile Wallet</span>
                  <Smartphone className="w-4 h-4 text-rose-500" />
                </div>
                <p className="text-neutral-500">Fast mobile account payment with instant confirmation.</p>
              </button>
            </div>

            {/* Dynamic payment instructions */}
            {paymentMethod !== 'cash_on_delivery' && (
              <div className="p-4 rounded-xl bg-neutral-50 dark:bg-neutral-800/80 border border-neutral-200 dark:border-neutral-700 text-xs space-y-1">
                <span className="font-bold text-neutral-900 dark:text-white block mb-1">
                  Payment Instructions:
                </span>
                <pre className="font-sans whitespace-pre-line text-neutral-600 dark:text-neutral-300">
                  {paymentMethod === 'bank_transfer'
                    ? settings?.payment_instructions.bank_transfer || 'Meezan Bank Ltd | Acc: 01020304050607 | Ali Online Store'
                    : paymentMethod === 'easypaisa'
                    ? settings?.payment_instructions.easypaisa || '0300-1234567 | Ali Store Official'
                    : settings?.payment_instructions.jazzcash || '0300-1234567 | Ali Store Official'}
                </pre>
                <p className="text-[11px] text-neutral-400 pt-1">
                  After placing your order, our WhatsApp support team will verify the payment transaction ID.
                </p>
              </div>
            )}

          </div>

        </div>

        {/* Right Column: Order Summary & Place Order */}
        <div className="lg:col-span-5 space-y-6">
          <div className="p-6 rounded-2xl bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 space-y-6 sticky top-24">
            
            <h2 className="text-sm font-bold uppercase tracking-wider text-neutral-900 dark:text-white">
              Order Summary ({items.length} items)
            </h2>

            {/* Mini Items list */}
            <div className="max-h-60 overflow-y-auto divide-y divide-neutral-100 dark:divide-neutral-800/60 pr-1">
              {items.map(item => {
                const price = item.product.discount_price ?? item.product.price;
                return (
                  <div key={`${item.product.id}-${item.variant}`} className="py-2.5 flex items-center justify-between text-xs">
                    <div className="min-w-0 pr-2">
                      <p className="font-semibold text-neutral-900 dark:text-white truncate">{item.product.name}</p>
                      <p className="text-[11px] text-neutral-400">
                        Qty: {item.quantity} {item.variant ? `· ${item.variant}` : ''}
                      </p>
                    </div>
                    <span className="font-mono tabular-nums font-medium text-neutral-900 dark:text-white shrink-0">
                      Rs. {(price * item.quantity).toLocaleString()}
                    </span>
                  </div>
                );
              })}
            </div>

            {/* Calculations Breakdown */}
            <div className="space-y-2 text-xs divide-y divide-neutral-100 dark:divide-neutral-800 font-mono">
              <div className="flex justify-between text-neutral-600 dark:text-neutral-400 pb-1.5">
                <span>Subtotal</span>
                <span className="tabular-nums">Rs. {subtotal.toLocaleString()}</span>
              </div>

              {discount > 0 && (
                <div className="flex justify-between text-emerald-600 dark:text-emerald-400 pt-1.5 pb-1.5">
                  <span>Coupon Discount ({appliedCoupon?.code})</span>
                  <span className="tabular-nums">- Rs. {discount.toLocaleString()}</span>
                </div>
              )}

              <div className="flex justify-between text-neutral-600 dark:text-neutral-400 pt-1.5 pb-1.5">
                <span>Nationwide Shipping</span>
                <span>{deliveryFee === 0 ? 'FREE' : `Rs. ${deliveryFee.toLocaleString()}`}</span>
              </div>

              <div className="flex justify-between text-base font-bold text-neutral-900 dark:text-white pt-2.5">
                <span>Final Total</span>
                <span className="tabular-nums">Rs. {total.toLocaleString()}</span>
              </div>
            </div>

            {/* Submit Action */}
            <button
              type="submit"
              disabled={placingOrder}
              className="w-full py-3.5 px-4 text-xs font-bold rounded-xl bg-neutral-900 text-white dark:bg-white dark:text-neutral-900 hover:opacity-90 transition-opacity flex items-center justify-center gap-2 disabled:opacity-50 shadow-lg"
            >
              <span>{placingOrder ? 'Processing Order...' : 'Confirm & Place Order'}</span>
              <ArrowRight className="w-4 h-4" />
            </button>

            <div className="pt-2 text-[11px] text-neutral-400 text-center space-y-1">
              <p>By clicking "Confirm & Place Order" you agree to store policies.</p>
              <div className="flex items-center justify-center gap-1.5 text-emerald-600 dark:text-emerald-400 font-medium">
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span>Zero payment card risks · Direct verification</span>
              </div>
            </div>

          </div>
        </div>

      </form>

    </div>
  );
};
