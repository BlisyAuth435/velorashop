import React, { useState } from 'react';
import { 
  X, 
  ShieldCheck, 
  CreditCard, 
  Truck, 
  Check, 
  Smartphone, 
  CheckCircle2, 
  Printer, 
  ArrowRight,
  Sparkles
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { useStore } from '../hooks/useStore';
import { PaymentMethod, Order } from '../types';

interface CheckoutModalProps {
  isOpen: boolean;
  onClose: () => void;
  directBuyItem?: {
    product: any;
    quantity: number;
    variant?: string;
    size?: string;
    color?: string;
  } | null;
  onOrderSuccess: (order: Order) => void;
}

export const CheckoutModal: React.FC<CheckoutModalProps> = ({
  isOpen,
  onClose,
  directBuyItem,
  onOrderSuccess,
}) => {
  const { store, settings, cart } = useStore();

  const [customerName, setCustomerName] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [fullAddress, setFullAddress] = useState('');
  const [area, setArea] = useState('');
  const [district, setDistrict] = useState<'Dhaka' | 'Chittagong' | 'Sylhet' | 'Rajshahi' | 'Khulna' | 'Barisal' | 'Rangpur' | 'Mymensingh'>('Dhaka');
  const [deliveryNote, setDeliveryNote] = useState('');
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('cod');
  const [mobileNumber, setMobileNumber] = useState('');
  const [trxId, setTrxId] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [createdOrder, setCreatedOrder] = useState<Order | null>(null);

  if (!isOpen) return null;

  // Calculate items based on direct buy or active cart
  const items = directBuyItem
    ? [
        {
          productId: directBuyItem.product.id,
          productName: directBuyItem.product.name,
          productImage: directBuyItem.product.images[0] || '',
          price: directBuyItem.product.salePrice,
          quantity: directBuyItem.quantity,
          selectedVariant: directBuyItem.variant,
          selectedSize: directBuyItem.size,
          selectedColor: directBuyItem.color,
        },
      ]
    : cart;

  const subtotal = items.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const deliveryCharge = district === 'Dhaka' ? settings.deliveryDhaka : settings.deliveryOutsideDhaka;
  const discount = 0;
  const total = subtotal + deliveryCharge - discount;

  const handlePlaceOrder = (e: React.FormEvent) => {
    e.preventDefault();
    if (!customerName.trim() || !phone.trim() || !fullAddress.trim()) return;

    setIsSubmitting(true);

    setTimeout(() => {
      const order = store.createOrder({
        customerName: customerName.trim(),
        phone: phone.trim(),
        email: email.trim() || `${phone.replace(/\D/g, '')}@customer.velora`,
        fullAddress: fullAddress.trim(),
        area: area.trim() || 'Central',
        district,
        deliveryNote: deliveryNote.trim(),
        items,
        subtotal,
        deliveryCharge,
        discount,
        total,
        paymentMethod,
        paymentStatus: paymentMethod === 'cod' ? 'pending' : 'paid',
        internalNotes: paymentMethod !== 'cod' ? `Online Payment TrxID: ${trxId || 'AUTOPAY-SIM'}` : 'Cash On Delivery Verified',
      });

      // Fire celebratory luxury confetti
      try {
        confetti({
          particleCount: 80,
          spread: 70,
          origin: { y: 0.6 },
          colors: ['#d4af37', '#ffffff', '#3b82f6', '#10b981'],
        });
      } catch (err) {
        // ignore if not loaded
      }

      setCreatedOrder(order);
      setIsSubmitting(false);
      onOrderSuccess(order);
    }, 800);
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 overflow-y-auto">
      <div className="fixed inset-0 bg-black/85 backdrop-blur-md" onClick={onClose} />

      <div className="relative w-full max-w-2xl bg-[#0e1017] rounded-3xl border border-white/15 p-6 sm:p-8 shadow-2xl z-10 my-8">
        <button
          onClick={onClose}
          className="absolute top-5 right-5 p-2 rounded-full text-neutral-400 hover:text-white hover:bg-white/10"
        >
          <X className="w-5 h-5" />
        </button>

        {createdOrder ? (
          /* Order Placed Success Confirmation Screen */
          <div className="text-center py-6 flex flex-col items-center">
            <div className="w-16 h-16 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 flex items-center justify-center mb-4 animate-bounce">
              <CheckCircle2 className="w-8 h-8" />
            </div>

            <span className="text-xs font-bold uppercase tracking-widest text-amber-400 mb-1">
              Order Confirmed & Logged
            </span>
            <h3 className="font-heading text-2xl font-bold text-white mb-2">
              Thank You, {createdOrder.customerName}
            </h3>
            <p className="text-xs text-neutral-400 max-w-md mb-6 leading-relaxed">
              Your order has been recorded in our dispatch system. We will contact your phone ({createdOrder.phone}) to verify dispatch schedule.
            </p>

            {/* Order Card Receipt */}
            <div className="w-full text-left p-5 rounded-2xl glass-panel border border-white/10 mb-6 text-xs divide-y divide-white/5">
              <div className="flex items-center justify-between pb-3">
                <span className="text-neutral-400">Order Reference ID:</span>
                <span className="font-mono text-amber-400 font-extrabold text-sm">{createdOrder.id}</span>
              </div>
              <div className="py-2.5 flex items-center justify-between">
                <span className="text-neutral-400">Delivery Address:</span>
                <span className="text-white font-medium max-w-xs text-right truncate">
                  {createdOrder.fullAddress}, {createdOrder.area}, {createdOrder.district}
                </span>
              </div>
              <div className="py-2.5 flex items-center justify-between">
                <span className="text-neutral-400">Payment Option:</span>
                <span className="text-white font-semibold uppercase">{createdOrder.paymentMethod}</span>
              </div>
              <div className="py-2.5 flex items-center justify-between">
                <span className="text-neutral-400">Total Amount Payable:</span>
                <span className="text-amber-400 font-bold text-sm">
                  {settings.currencySymbol}{createdOrder.total.toLocaleString()}
                </span>
              </div>
            </div>

            <div className="flex items-center gap-3 w-full">
              <button
                onClick={handlePrint}
                className="flex-1 py-3 rounded-xl bg-white/10 hover:bg-white/15 text-white font-semibold text-xs flex items-center justify-center gap-2 border border-white/10 transition-colors"
              >
                <Printer className="w-4 h-4" /> Print Order Receipt
              </button>
              <button
                onClick={onClose}
                className="flex-1 py-3 rounded-xl bg-amber-400 hover:bg-amber-300 text-black font-bold text-xs shadow-lg shadow-amber-400/20 transition-colors"
              >
                Continue Browsing
              </button>
            </div>
          </div>
        ) : (
          /* Checkout Input Form */
          <div>
            <div className="flex items-center gap-2.5 mb-6 pb-4 border-b border-white/10">
              <ShieldCheck className="w-6 h-6 text-amber-400" />
              <div>
                <h3 className="font-heading text-xl font-bold text-white">Express Secure Checkout</h3>
                <p className="text-xs text-neutral-400">Instant direct ordering with zero required registration</p>
              </div>
            </div>

            <form onSubmit={handlePlaceOrder} className="space-y-5">
              {/* Customer Contact Details */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-neutral-300 mb-1">
                    Customer Full Name <span className="text-amber-400">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Mahfuzul Alam"
                    value={customerName}
                    onChange={(e) => setCustomerName(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-black/50 border border-white/10 text-white text-xs focus:outline-none focus:border-amber-400"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-neutral-300 mb-1">
                    Phone / Mobile Number <span className="text-amber-400">*</span>
                  </label>
                  <input
                    type="tel"
                    required
                    placeholder="e.g. 01711234567"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-black/50 border border-white/10 text-white text-xs focus:outline-none focus:border-amber-400"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-neutral-300 mb-1">
                  Email Address (Optional for e-invoice)
                </label>
                <input
                  type="email"
                  placeholder="e.g. your.email@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-black/50 border border-white/10 text-white text-xs focus:outline-none focus:border-amber-400"
                />
              </div>

              {/* Delivery Destination */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="sm:col-span-2">
                  <label className="block text-xs font-semibold text-neutral-300 mb-1">
                    Full Delivery Address <span className="text-amber-400">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="House, Flat, Road, Street Name"
                    value={fullAddress}
                    onChange={(e) => setFullAddress(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-black/50 border border-white/10 text-white text-xs focus:outline-none focus:border-amber-400"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-neutral-300 mb-1">
                    District
                  </label>
                  <select
                    value={district}
                    onChange={(e: any) => setDistrict(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-black/50 border border-white/10 text-white text-xs focus:outline-none focus:border-amber-400"
                  >
                    <option value="Dhaka">Dhaka (৳{settings.deliveryDhaka})</option>
                    <option value="Chittagong">Chittagong (৳{settings.deliveryOutsideDhaka})</option>
                    <option value="Sylhet">Sylhet (৳{settings.deliveryOutsideDhaka})</option>
                    <option value="Rajshahi">Rajshahi (৳{settings.deliveryOutsideDhaka})</option>
                    <option value="Khulna">Khulna (৳{settings.deliveryOutsideDhaka})</option>
                    <option value="Barisal">Barisal (৳{settings.deliveryOutsideDhaka})</option>
                    <option value="Rangpur">Rangpur (৳{settings.deliveryOutsideDhaka})</option>
                    <option value="Mymensingh">Mymensingh (৳{settings.deliveryOutsideDhaka})</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-neutral-300 mb-1">
                  Delivery Instructions / Note (Optional)
                </label>
                <input
                  type="text"
                  placeholder="e.g. Leave with concierge or call before delivery"
                  value={deliveryNote}
                  onChange={(e) => setDeliveryNote(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-black/50 border border-white/10 text-white text-xs focus:outline-none focus:border-amber-400"
                />
              </div>

              {/* Payment Methods */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-neutral-300 mb-2">
                  Select Payment Method:
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <button
                    type="button"
                    onClick={() => setPaymentMethod('cod')}
                    className={`p-3 rounded-2xl border text-left flex flex-col justify-between transition-all ${
                      paymentMethod === 'cod'
                        ? 'border-amber-400 bg-amber-400/10 text-white shadow-md'
                        : 'border-white/10 text-neutral-400 hover:border-white/20'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <Truck className="w-4 h-4 text-amber-400" />
                      {paymentMethod === 'cod' && <Check className="w-3.5 h-3.5 text-amber-400" />}
                    </div>
                    <span className="font-bold text-xs text-white">Cash on Delivery</span>
                    <span className="text-[10px] text-neutral-400">Pay when goods arrive</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setPaymentMethod('bkash')}
                    className={`p-3 rounded-2xl border text-left flex flex-col justify-between transition-all ${
                      paymentMethod === 'bkash'
                        ? 'border-pink-500 bg-pink-500/10 text-white shadow-md'
                        : 'border-white/10 text-neutral-400 hover:border-white/20'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <Smartphone className="w-4 h-4 text-pink-500" />
                      {paymentMethod === 'bkash' && <Check className="w-3.5 h-3.5 text-pink-400" />}
                    </div>
                    <span className="font-bold text-xs text-white">bKash / Nagad</span>
                    <span className="text-[10px] text-neutral-400">Instant Mobile Pay</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setPaymentMethod('card')}
                    className={`p-3 rounded-2xl border text-left flex flex-col justify-between transition-all ${
                      paymentMethod === 'card'
                        ? 'border-blue-400 bg-blue-400/10 text-white shadow-md'
                        : 'border-white/10 text-neutral-400 hover:border-white/20'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <CreditCard className="w-4 h-4 text-blue-400" />
                      {paymentMethod === 'card' && <Check className="w-3.5 h-3.5 text-blue-400" />}
                    </div>
                    <span className="font-bold text-xs text-white">Credit / Debit Card</span>
                    <span className="text-[10px] text-neutral-400">Visa / Mastercard</span>
                  </button>
                </div>

                {/* Mobile Banking info if bkash selected */}
                {paymentMethod === 'bkash' && (
                  <div className="p-3.5 rounded-2xl bg-pink-500/10 border border-pink-500/20 mt-3 text-xs flex flex-col gap-2">
                    <p className="text-pink-300 font-semibold">
                      Please send payment of {settings.currencySymbol}{total.toLocaleString()} to Merchant bKash: 01800835672
                    </p>
                    <input
                      type="text"
                      placeholder="Enter TrxID / Transaction Code"
                      value={trxId}
                      onChange={(e) => setTrxId(e.target.value)}
                      className="px-3 py-2 rounded-xl bg-black/60 border border-pink-500/30 text-white text-xs uppercase"
                    />
                  </div>
                )}
              </div>

              {/* Order Summary Line */}
              <div className="p-4 rounded-2xl bg-black/50 border border-white/10 flex items-center justify-between">
                <div>
                  <span className="text-neutral-400 text-xs block">Order Total ({items.length} items + delivery):</span>
                  <span className="text-lg font-extrabold text-amber-400">
                    {settings.currencySymbol}{total.toLocaleString()}
                  </span>
                </div>

                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-6 py-3 rounded-xl bg-amber-400 hover:bg-amber-300 text-black font-extrabold text-xs uppercase tracking-wider shadow-lg shadow-amber-400/20 transition-all flex items-center gap-2"
                >
                  {isSubmitting ? (
                    <span>Registering Order...</span>
                  ) : (
                    <>
                      <span>Confirm & Place Order</span>
                      <ArrowRight className="w-4 h-4" />
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        )}
      </div>
    </div>
  );
};
