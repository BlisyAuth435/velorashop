import React, { useState } from 'react';
import { 
  X, 
  Trash2, 
  ShoppingBag, 
  ArrowRight, 
  Tag, 
  Check, 
  AlertCircle,
  Truck
} from 'lucide-react';
import { useStore } from '../hooks/useStore';

interface CartDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  onProceedToCheckout: () => void;
}

export const CartDrawer: React.FC<CartDrawerProps> = ({
  isOpen,
  onClose,
  onProceedToCheckout,
}) => {
  const { store, settings, cart, coupons } = useStore();
  const [couponCode, setCouponCode] = useState('');
  const [appliedCoupon, setAppliedCoupon] = useState<{ code: string; discount: number } | null>(null);
  const [couponError, setCouponError] = useState('');
  const [district, setDistrict] = useState<'dhaka' | 'outside'>('dhaka');

  if (!isOpen) return null;

  const subtotal = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const deliveryCharge = cart.length === 0 ? 0 : district === 'dhaka' ? settings.deliveryDhaka : settings.deliveryOutsideDhaka;
  const discount = appliedCoupon ? appliedCoupon.discount : 0;
  const total = Math.max(0, subtotal + deliveryCharge - discount);

  const handleApplyCoupon = (e: React.FormEvent) => {
    e.preventDefault();
    setCouponError('');

    const found = coupons.find(c => c.code.toUpperCase() === couponCode.trim().toUpperCase() && c.active);
    if (!found) {
      setCouponError('Invalid or expired promotional code.');
      return;
    }

    if (subtotal < found.minOrder) {
      setCouponError(`Requires minimum order of ${settings.currencySymbol}${found.minOrder.toLocaleString()}.`);
      return;
    }

    let calculatedDiscount = 0;
    if (found.discountType === 'percentage') {
      calculatedDiscount = Math.min(found.maxDiscount, Math.round((subtotal * found.discountValue) / 100));
    } else {
      calculatedDiscount = Math.min(found.maxDiscount, found.discountValue);
    }

    setAppliedCoupon({ code: found.code, discount: calculatedDiscount });
    setCouponCode('');
  };

  return (
    <div className="fixed inset-0 z-50 overflow-hidden">
      {/* Backdrop */}
      <div 
        className="fixed inset-0 bg-black/80 backdrop-blur-md transition-opacity" 
        onClick={onClose} 
      />

      <div className="fixed inset-y-0 right-0 max-w-full flex pl-10">
        <div className="w-screen max-w-md bg-[#0e1017] border-l border-white/10 shadow-2xl flex flex-col justify-between">
          {/* Header */}
          <div className="p-6 border-b border-white/10 flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <ShoppingBag className="w-5 h-5 text-amber-400" />
              <h3 className="font-heading font-bold text-lg text-white">Your Shopping Bag</h3>
              <span className="px-2 py-0.5 rounded-full bg-white/10 text-xs font-semibold text-neutral-300">
                {cart.reduce((s, i) => s + i.quantity, 0)}
              </span>
            </div>
            <button
              onClick={onClose}
              className="p-2 rounded-full text-neutral-400 hover:text-white hover:bg-white/10 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Cart Items List */}
          <div className="flex-1 overflow-y-auto p-6 divide-y divide-white/5">
            {cart.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-center p-6">
                <div className="w-16 h-16 rounded-full bg-white/5 border border-white/10 flex items-center justify-center text-neutral-500 mb-4">
                  <ShoppingBag className="w-8 h-8" />
                </div>
                <h4 className="font-heading text-lg font-bold text-white mb-1">Your bag is empty</h4>
                <p className="text-xs text-neutral-400 mb-6 max-w-xs">
                  Discover our engineered kitchen appliances, organic harvests, and luxury apparel essentials.
                </p>
                <button
                  onClick={onClose}
                  className="px-6 py-2.5 rounded-xl bg-amber-400 text-black font-bold text-xs shadow-lg shadow-amber-400/20 hover:bg-amber-300 transition-colors"
                >
                  Explore Collection
                </button>
              </div>
            ) : (
              cart.map((item, idx) => (
                <div key={`${item.productId}-${idx}`} className="py-4 flex gap-4">
                  {/* Thumbnail */}
                  <img
                    src={item.productImage || 'https://images.unsplash.com/photo-1544816155-12df9643f363?auto=format&fit=crop&w=200&q=80'}
                    alt={item.productName}
                    className="w-20 h-20 rounded-2xl object-cover bg-neutral-900 border border-white/10 flex-shrink-0"
                  />

                  {/* Info */}
                  <div className="flex-1 flex flex-col justify-between">
                    <div>
                      <div className="flex items-start justify-between gap-2">
                        <h4 className="text-xs font-bold text-white line-clamp-1">
                          {item.productName}
                        </h4>
                        <button
                          onClick={() => store.removeFromCart(idx)}
                          className="text-neutral-500 hover:text-rose-400 transition-colors p-1"
                          title="Remove Item"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>

                      {/* Variant Badges */}
                      <div className="flex flex-wrap gap-1 mt-1 text-[10px] text-neutral-400">
                        {item.selectedVariant && (
                          <span className="px-1.5 py-0.5 rounded bg-white/5">{item.selectedVariant}</span>
                        )}
                        {item.selectedSize && (
                          <span className="px-1.5 py-0.5 rounded bg-white/5">Size: {item.selectedSize}</span>
                        )}
                        {item.selectedColor && (
                          <span className="px-1.5 py-0.5 rounded bg-white/5">{item.selectedColor}</span>
                        )}
                      </div>
                    </div>

                    {/* Quantity & Item Subtotal */}
                    <div className="flex items-center justify-between pt-2">
                      <div className="flex items-center rounded-lg bg-black/60 border border-white/10">
                        <button
                          onClick={() => store.updateCartQuantity(idx, item.quantity - 1)}
                          className="w-6 h-6 flex items-center justify-center text-xs text-neutral-300 hover:text-white"
                        >
                          -
                        </button>
                        <span className="w-7 text-center text-xs font-bold text-white">{item.quantity}</span>
                        <button
                          onClick={() => store.updateCartQuantity(idx, item.quantity + 1)}
                          className="w-6 h-6 flex items-center justify-center text-xs text-neutral-300 hover:text-white"
                        >
                          +
                        </button>
                      </div>

                      <span className="text-xs font-bold text-white">
                        {settings.currencySymbol}{(item.price * item.quantity).toLocaleString()}
                      </span>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Footer Calculations & Checkout */}
          {cart.length > 0 && (
            <div className="p-6 border-t border-white/10 bg-[#090a0f] flex flex-col gap-4">
              {/* Delivery Zone Selector */}
              <div className="p-2.5 rounded-xl bg-white/5 border border-white/10 flex items-center justify-between text-xs">
                <div className="flex items-center gap-1.5 text-neutral-300">
                  <Truck className="w-3.5 h-3.5 text-amber-400" />
                  <span>Delivery Destination:</span>
                </div>
                <div className="flex items-center gap-1 bg-black/50 p-0.5 rounded-lg border border-white/5">
                  <button
                    onClick={() => setDistrict('dhaka')}
                    className={`px-2 py-1 rounded text-[11px] font-medium transition-all ${
                      district === 'dhaka' ? 'bg-amber-400 text-black font-semibold' : 'text-neutral-400'
                    }`}
                  >
                    Dhaka ({settings.currencySymbol}{settings.deliveryDhaka})
                  </button>
                  <button
                    onClick={() => setDistrict('outside')}
                    className={`px-2 py-1 rounded text-[11px] font-medium transition-all ${
                      district === 'outside' ? 'bg-amber-400 text-black font-semibold' : 'text-neutral-400'
                    }`}
                  >
                    Outside ({settings.currencySymbol}{settings.deliveryOutsideDhaka})
                  </button>
                </div>
              </div>

              {/* Coupon Applicator */}
              {!appliedCoupon ? (
                <form onSubmit={handleApplyCoupon} className="flex gap-2">
                  <div className="relative flex-1">
                    <input
                      type="text"
                      placeholder="Coupon Code (e.g. VELORA10)"
                      value={couponCode}
                      onChange={(e) => setCouponCode(e.target.value)}
                      className="w-full px-3 py-2 text-xs rounded-xl bg-black/50 border border-white/10 text-white placeholder-neutral-500 uppercase focus:outline-none focus:border-amber-400"
                    />
                  </div>
                  <button
                    type="submit"
                    className="px-4 py-2 rounded-xl bg-white/10 hover:bg-white/20 text-white text-xs font-semibold transition-colors"
                  >
                    Apply
                  </button>
                </form>
              ) : (
                <div className="flex items-center justify-between px-3 py-2 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs">
                  <div className="flex items-center gap-1.5 font-semibold">
                    <Tag className="w-3.5 h-3.5" />
                    <span>Applied: {appliedCoupon.code}</span>
                  </div>
                  <button
                    onClick={() => setAppliedCoupon(null)}
                    className="text-neutral-400 hover:text-white text-xs underline"
                  >
                    Remove
                  </button>
                </div>
              )}

              {couponError && (
                <div className="text-[11px] text-rose-400 flex items-center gap-1">
                  <AlertCircle className="w-3 h-3" /> {couponError}
                </div>
              )}

              {/* Price Breakdown */}
              <div className="space-y-1.5 text-xs text-neutral-400 border-t border-white/5 pt-3">
                <div className="flex justify-between">
                  <span>Subtotal</span>
                  <span className="text-white font-medium">{settings.currencySymbol}{subtotal.toLocaleString()}</span>
                </div>
                <div className="flex justify-between">
                  <span>Delivery Charge</span>
                  <span className="text-white font-medium">{settings.currencySymbol}{deliveryCharge}</span>
                </div>
                {discount > 0 && (
                  <div className="flex justify-between text-emerald-400 font-semibold">
                    <span>Promotional Discount</span>
                    <span>-{settings.currencySymbol}{discount.toLocaleString()}</span>
                  </div>
                )}
                <div className="flex justify-between text-sm font-extrabold text-white pt-2 border-t border-white/10">
                  <span>Grand Total</span>
                  <span className="text-amber-400 text-base">{settings.currencySymbol}{total.toLocaleString()}</span>
                </div>
              </div>

              {/* Checkout Button */}
              <button
                onClick={() => {
                  onClose();
                  onProceedToCheckout();
                }}
                className="w-full py-3.5 rounded-2xl bg-amber-400 hover:bg-amber-300 text-black font-extrabold text-xs tracking-wider uppercase flex items-center justify-center gap-2 shadow-xl shadow-amber-400/20 transition-all hover:scale-[1.02] active:scale-98"
              >
                <span>Proceed to Checkout</span>
                <ArrowRight className="w-4 h-4" />
              </button>

              <button
                onClick={onClose}
                className="text-center text-xs text-neutral-400 hover:text-white transition-colors"
              >
                Continue Shopping
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
