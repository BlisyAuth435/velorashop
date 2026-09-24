import React, { useState } from 'react';
import { X, Star, ShoppingBag, Check, ArrowRight } from 'lucide-react';
import { Product } from '../types';
import { useStore } from '../hooks/useStore';

interface QuickViewModalProps {
  product: Product | null;
  onClose: () => void;
  onViewFullDetails: (product: Product) => void;
}

export const QuickViewModal: React.FC<QuickViewModalProps> = ({
  product,
  onClose,
  onViewFullDetails,
}) => {
  const { store, settings } = useStore();
  const [selectedVariant, setSelectedVariant] = useState<string | undefined>(product?.variants?.[0]);
  const [selectedSize, setSelectedSize] = useState<string | undefined>(product?.sizes?.[0]);
  const [selectedColor, setSelectedColor] = useState<string | undefined>(product?.colors?.[0]?.name);
  const [quantity, setQuantity] = useState(1);
  const [isAdded, setIsAdded] = useState(false);

  if (!product) return null;

  const handleAddToCart = () => {
    store.addToCart({
      productId: product.id,
      productName: product.name,
      productImage: product.images[0] || '',
      price: product.salePrice,
      quantity,
      selectedVariant,
      selectedSize,
      selectedColor,
    });
    setIsAdded(true);
    setTimeout(() => {
      setIsAdded(false);
      onClose();
    }, 1200);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div className="fixed inset-0 bg-black/80 backdrop-blur-md" onClick={onClose} />

      {/* Modal Dialog */}
      <div className="relative w-full max-w-3xl rounded-3xl glass-panel border border-white/15 bg-[#0e1017] p-6 sm:p-8 shadow-2xl z-10 overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        <button
          onClick={onClose}
          className="absolute top-5 right-5 p-2 rounded-full text-neutral-400 hover:text-white hover:bg-white/10 transition-colors z-10"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 sm:gap-8 items-center">
          {/* Image */}
          <div className="relative aspect-square rounded-2xl overflow-hidden bg-neutral-900 border border-white/10">
            <img
              src={product.images[0]}
              alt={product.name}
              className="w-full h-full object-cover"
            />
            {product.regularPrice > product.salePrice && (
              <span className="absolute top-3 left-3 px-2.5 py-0.5 rounded-full bg-rose-500 text-white font-extrabold text-[10px] uppercase">
                Save {Math.round(((product.regularPrice - product.salePrice) / product.regularPrice) * 100)}%
              </span>
            )}
          </div>

          {/* Details */}
          <div className="flex flex-col">
            <span className="text-[11px] font-bold uppercase tracking-wider text-amber-400 mb-1">
              {product.category}
            </span>
            <h3 className="font-heading text-xl font-bold text-white mb-2 leading-snug">
              {product.name}
            </h3>

            <div className="flex items-center gap-2 mb-3">
              <div className="flex items-center text-amber-400 text-xs">
                {[...Array(5)].map((_, i) => (
                  <Star
                    key={i}
                    className={`w-3.5 h-3.5 ${i < Math.floor(product.rating) ? 'fill-current' : 'text-neutral-600'}`}
                  />
                ))}
              </div>
              <span className="text-xs text-neutral-400 font-semibold">({product.reviewsCount} reviews)</span>
            </div>

            <div className="flex items-baseline gap-3 mb-4">
              <span className="text-2xl font-extrabold text-white">
                {settings.currencySymbol}{product.salePrice.toLocaleString()}
              </span>
              {product.regularPrice > product.salePrice && (
                <span className="text-sm text-neutral-500 line-through">
                  {settings.currencySymbol}{product.regularPrice.toLocaleString()}
                </span>
              )}
            </div>

            <p className="text-xs text-neutral-300 line-clamp-3 mb-4 leading-relaxed">
              {product.shortDescription || product.description}
            </p>

            {/* Variants */}
            {product.variants && (
              <div className="mb-3">
                <span className="text-[10px] font-bold uppercase tracking-wider text-neutral-400 block mb-1">
                  Edition:
                </span>
                <div className="flex flex-wrap gap-1.5">
                  {product.variants.map((v) => (
                    <button
                      key={v}
                      onClick={() => setSelectedVariant(v)}
                      className={`px-3 py-1 rounded-lg text-xs font-medium border ${
                        selectedVariant === v ? 'border-amber-400 bg-amber-400/20 text-amber-300' : 'border-white/10 text-neutral-400'
                      }`}
                    >
                      {v}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Actions */}
            <div className="flex items-center gap-3 pt-4 border-t border-white/10 mt-auto">
              <div className="flex items-center rounded-xl bg-black/60 border border-white/10 p-1">
                <button
                  onClick={() => setQuantity(Math.max(1, quantity - 1))}
                  className="w-7 h-7 flex items-center justify-center text-neutral-300 hover:text-white"
                >
                  -
                </button>
                <span className="w-8 text-center text-xs font-bold text-white">{quantity}</span>
                <button
                  onClick={() => setQuantity(Math.min(product.stock, quantity + 1))}
                  className="w-7 h-7 flex items-center justify-center text-neutral-300 hover:text-white"
                >
                  +
                </button>
              </div>

              <button
                onClick={handleAddToCart}
                disabled={product.stock === 0}
                className="flex-1 py-2.5 rounded-xl bg-amber-400 hover:bg-amber-300 text-black font-bold text-xs flex items-center justify-center gap-2 shadow-lg shadow-amber-400/20 transition-all"
              >
                {isAdded ? (
                  <>
                    <Check className="w-4 h-4" /> Added!
                  </>
                ) : (
                  <>
                    <ShoppingBag className="w-4 h-4" /> Add to Bag
                  </>
                )}
              </button>
            </div>

            <button
              onClick={() => {
                onClose();
                onViewFullDetails(product);
              }}
              className="mt-3 text-center text-xs text-neutral-400 hover:text-amber-400 transition-colors flex items-center justify-center gap-1 font-medium"
            >
              <span>View full specification sheet</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
