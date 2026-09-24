import React, { useState } from 'react';
import { 
  X, 
  Search, 
  Package, 
  Clock, 
  CheckCircle2, 
  Truck, 
  AlertCircle,
  Phone,
  MapPin,
  Calendar
} from 'lucide-react';
import { useStore } from '../hooks/useStore';
import { Order } from '../types';

interface OrderTrackingModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const OrderTrackingModal: React.FC<OrderTrackingModalProps> = ({
  isOpen,
  onClose,
}) => {
  const { orders, settings } = useStore();
  const [query, setQuery] = useState('');
  const [searchedOrders, setSearchedOrders] = useState<Order[] | null>(null);

  if (!isOpen) return null;

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (!query.trim()) return;

    const cleanQuery = query.trim().toLowerCase();
    const results = orders.filter((o) =>
      o.id.toLowerCase().includes(cleanQuery) ||
      o.phone.toLowerCase().includes(cleanQuery) ||
      o.customerName.toLowerCase().includes(cleanQuery)
    );
    setSearchedOrders(results);
  };

  const getStatusStep = (status: Order['orderStatus']) => {
    switch (status) {
      case 'Pending': return 1;
      case 'Confirmed': return 2;
      case 'Processing': return 3;
      case 'Shipped': return 4;
      case 'Delivered': return 5;
      case 'Cancelled': return -1;
      default: return 1;
    }
  };

  const timelineSteps = [
    { title: 'Pending Verification', icon: Clock },
    { title: 'Order Confirmed', icon: CheckCircle2 },
    { title: 'Processing & Pack', icon: Package },
    { title: 'Shipped & Out for Delivery', icon: Truck },
    { title: 'Delivered', icon: CheckCircle2 },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 overflow-y-auto">
      <div className="fixed inset-0 bg-black/85 backdrop-blur-md" onClick={onClose} />

      <div className="relative w-full max-w-2xl bg-[#0e1017] rounded-3xl border border-white/15 p-6 sm:p-8 shadow-2xl z-10 my-8">
        <button
          onClick={onClose}
          className="absolute top-5 right-5 p-2 rounded-full text-neutral-400 hover:text-white hover:bg-white/10 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="mb-6">
          <span className="text-[11px] font-bold uppercase tracking-wider text-amber-400">
            Customer Self-Service
          </span>
          <h3 className="font-heading text-xl font-bold text-white mt-0.5">
            Track Order & Delivery Status
          </h3>
          <p className="text-xs text-neutral-400 mt-1">
            Enter your 6-digit Order ID (e.g. VEL-102941) or registered phone number.
          </p>
        </div>

        {/* Search Input */}
        <form onSubmit={handleSearch} className="flex gap-2 mb-6">
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-neutral-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Order ID or Phone Number"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              className="w-full pl-10 pr-3.5 py-2.5 rounded-xl bg-black/60 border border-white/10 text-white text-xs placeholder-neutral-500 focus:outline-none focus:border-amber-400"
            />
          </div>
          <button
            type="submit"
            className="px-5 py-2.5 rounded-xl bg-amber-400 hover:bg-amber-300 text-black font-bold text-xs shadow-md transition-colors"
          >
            Track Order
          </button>
        </form>

        {/* Results */}
        {searchedOrders !== null && (
          <div className="space-y-6 max-h-[60vh] overflow-y-auto pr-1">
            {searchedOrders.length === 0 ? (
              <div className="text-center py-8 text-neutral-400 text-xs border border-dashed border-white/10 rounded-2xl">
                No orders found for "{query}". Please verify your reference number or phone number.
              </div>
            ) : (
              searchedOrders.map((ord) => {
                const currentStep = getStatusStep(ord.orderStatus);
                return (
                  <div key={ord.id} className="p-5 rounded-2xl glass-panel border border-white/10 space-y-4">
                    {/* Header line */}
                    <div className="flex flex-wrap items-center justify-between gap-2 pb-3 border-b border-white/10">
                      <div>
                        <span className="font-mono text-xs font-bold text-amber-400 block">{ord.id}</span>
                        <div className="flex items-center gap-2 text-[11px] text-neutral-400">
                          <Calendar className="w-3 h-3" />
                          <span>{new Date(ord.createdAt).toLocaleDateString()}</span>
                        </div>
                      </div>

                      <div className="flex items-center gap-2">
                        <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                          ord.orderStatus === 'Delivered'
                            ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                            : ord.orderStatus === 'Cancelled'
                            ? 'bg-rose-500/20 text-rose-400 border border-rose-500/30'
                            : 'bg-amber-400/20 text-amber-300 border border-amber-400/30'
                        }`}>
                          {ord.orderStatus}
                        </span>
                      </div>
                    </div>

                    {/* Step Timeline */}
                    {ord.orderStatus !== 'Cancelled' ? (
                      <div className="py-2">
                        <div className="grid grid-cols-5 gap-1 relative">
                          {timelineSteps.map((step, idx) => {
                            const isDone = currentStep >= idx + 1;
                            const isCurrent = currentStep === idx + 1;
                            return (
                              <div key={step.title} className="flex flex-col items-center text-center">
                                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold transition-all ${
                                  isDone
                                    ? 'bg-amber-400 text-black shadow-md'
                                    : 'bg-white/5 border border-white/10 text-neutral-500'
                                }`}>
                                  {idx + 1}
                                </div>
                                <span className={`text-[10px] mt-1 font-semibold leading-tight line-clamp-2 ${
                                  isCurrent ? 'text-amber-300' : isDone ? 'text-white' : 'text-neutral-500'
                                }`}>
                                  {step.title}
                                </span>
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    ) : (
                      <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-300 text-xs flex items-center gap-2">
                        <AlertCircle className="w-4 h-4 flex-shrink-0" />
                        <span>This order was cancelled. Please contact customer care for assistance.</span>
                      </div>
                    )}

                    {/* Items Overview */}
                    <div className="text-xs space-y-2 pt-2 border-t border-white/5">
                      <span className="font-semibold text-neutral-300 block">Ordered Products:</span>
                      {ord.items.map((it, idx) => (
                        <div key={idx} className="flex items-center justify-between text-neutral-300">
                          <span className="truncate max-w-[280px]">
                            {it.quantity}x {it.productName}
                          </span>
                          <span className="font-mono text-white">
                            {settings.currencySymbol}{(it.price * it.quantity).toLocaleString()}
                          </span>
                        </div>
                      ))}
                    </div>

                    {/* Delivery & Total Footer */}
                    <div className="flex items-center justify-between text-xs pt-3 border-t border-white/10 text-neutral-400">
                      <div className="flex items-center gap-1.5 truncate max-w-[280px]">
                        <MapPin className="w-3.5 h-3.5 text-amber-400 flex-shrink-0" />
                        <span>{ord.fullAddress}, {ord.district}</span>
                      </div>
                      <div className="text-right">
                        <span className="font-bold text-amber-400 text-sm">
                          {settings.currencySymbol}{ord.total.toLocaleString()}
                        </span>
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        )}
      </div>
    </div>
  );
};
