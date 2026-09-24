import React, { useRef, useState } from 'react';
import { Star, Heart, Eye, ShoppingBag, Check, ShieldAlert } from 'lucide-react';
import { Product } from '../types';
import { useStore } from '../hooks/useStore';

interface ProductCardProps {
  product: Product;
  onQuickView: (product: Product) => void;
  onSelectProduct: (product: Product) => void;
}

export const ProductCard: React.FC<ProductCardProps> = ({
  product,
  onQuickView,
  onSelectProduct,
}) => {
  const { store, settings, wishlist } = useStore();
  const cardRef = useRef<HTMLDivElement>(null);
  const [isAdded, setIsAdded] = useState(false);

  const isInWishlist = wishlist.includes(product.id);

  // Discount percentage math
  const discountPercent =
    product.regularPrice > product.salePrice
      ? Math.round(((product.regularPrice - product.salePrice) / product.regularPrice) * 100)
      : 0;

  // 3D Tilt interaction
  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const card = cardRef.current;
    if (!card) return;
    const rect = card.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    const centerX = rect.width / 2;
    const centerY = rect.height / 2;
    const rotateX = ((y - centerY) / centerY) * -6;
    const rotateY = ((x - centerX) / centerX) * 6;

    card.style.transform = `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) translateY(-6px)`;
  };

  const handleMouseLeave = () => {
    const card = cardRef.current;
    if (!card) return;
    card.style.transform = 'perspective(1000px) rotateX(0deg) rotateY(0deg) translateY(0px)';
  };

  const handleAddToCart = (e: React.MouseEvent) => {
    e.stopPropagation();
    store.addToCart({
      productId: product.id,
      productName: product.name,
      productImage: product.images[0] || '',
      price: product.salePrice,
      quantity: 1,
      selectedVariant: product.variants?.[0],
      selectedSize: product.sizes?.[0],
      selectedColor: product.colors?.[0]?.name,
    });

    setIsAdded(true);
    setTimeout(() => setIsAdded(false), 1800);
  };

  const handleToggleWishlist = (e: React.MouseEvent) => {
    e.stopPropagation();
    store.toggleWishlist(product.id);
  };

  const handleQuickViewClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    onQuickView(product);
  };

  return (
    <div
      ref={cardRef}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      onClick={() => onSelectProduct(product)}
      className="group relative flex flex-col rounded-3xl glass-panel border border-white/10 hover:border-amber-400/40 p-3.5 sm:p-4 cursor-pointer transition-all duration-300 ease-out shadow-lg hover:shadow-2xl hover:shadow-amber-500/10 overflow-hidden"
      style={{ transformStyle: 'preserve-3d' }}
    >
      {/* Top Badges & Wishlist Trigger */}
      <div className="relative w-full aspect-square rounded-2xl overflow-hidden bg-neutral-900 mb-3.5">
        <img
          src={product.images[0] || 'https://images.unsplash.com/photo-1544816155-12df9643f363?auto=format&fit=crop&w=600&q=80'}
          alt={product.name}
          className="w-full h-full object-cover object-center group-hover:scale-108 transition-transform duration-700 ease-out"
          loading="lazy"
        />

        {/* Hover Quick Action Buttons */}
        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center gap-2">
          <button
            onClick={handleQuickViewClick}
            title="Quick View"
            className="p-3 rounded-full bg-white/90 hover:bg-white text-black shadow-xl hover:scale-110 transition-transform"
          >
            <Eye className="w-4 h-4" />
          </button>
        </div>

        {/* Badges container */}
        <div className="absolute top-2.5 left-2.5 flex flex-col gap-1.5 z-10 pointer-events-none">
          {discountPercent > 0 && (
            <span className="px-2.5 py-0.5 rounded-full bg-rose-500/90 backdrop-blur-md text-white font-bold text-[10px] tracking-wider uppercase shadow-md">
              -{discountPercent}%
            </span>
          )}
          {product.bestseller && (
            <span className="px-2.5 py-0.5 rounded-full bg-amber-400/90 backdrop-blur-md text-black font-extrabold text-[10px] tracking-wider uppercase shadow-md">
              Bestseller
            </span>
          )}
          {product.category === 'Medicines' && (
            <span className="px-2.5 py-0.5 rounded-full bg-blue-500/90 backdrop-blur-md text-white font-semibold text-[10px] tracking-wider uppercase flex items-center gap-1 shadow-md">
              <ShieldAlert className="w-3 h-3" /> Demo
            </span>
          )}
        </div>

        {/* Wishlist Heart button */}
        <button
          onClick={handleToggleWishlist}
          title={isInWishlist ? 'Remove from Wishlist' : 'Add to Wishlist'}
          className={`absolute top-2.5 right-2.5 z-10 p-2 rounded-full backdrop-blur-md border transition-all ${
            isInWishlist
              ? 'bg-rose-500/90 border-rose-400 text-white'
              : 'bg-black/50 border-white/15 text-neutral-300 hover:text-white hover:bg-black/70'
          }`}
        >
          <Heart className={`w-3.5 h-3.5 ${isInWishlist ? 'fill-current' : ''}`} />
        </button>

        {/* Stock warning pill if low */}
        {product.stock <= 5 && product.stock > 0 && (
          <div className="absolute bottom-2 left-2 right-2 px-2 py-0.5 rounded-lg bg-amber-500/90 backdrop-blur-md text-black text-[10px] font-bold text-center">
            Only {product.stock} items left in stock
          </div>
        )}
        {product.stock === 0 && (
          <div className="absolute bottom-2 left-2 right-2 px-2 py-0.5 rounded-lg bg-rose-600/90 backdrop-blur-md text-white text-[10px] font-bold text-center">
            Sold Out
          </div>
        )}
      </div>

      {/* Meta: Category & Rating */}
      <div className="flex items-center justify-between gap-2 mb-1.5">
        <span className="text-[11px] font-medium uppercase tracking-wider text-amber-400/90 truncate">
          {product.category}
        </span>
        <div className="flex items-center gap-1 text-[11px] text-neutral-300 font-semibold">
          <Star className="w-3 h-3 fill-amber-400 text-amber-400" />
          <span>{product.rating.toFixed(1)}</span>
          <span className="text-neutral-500 text-[10px]">({product.reviewsCount})</span>
        </div>
      </div>

      {/* Product Title */}
      <h4 className="font-heading text-sm font-bold text-white group-hover:text-amber-200 transition-colors line-clamp-1 mb-1">
        {product.name}
      </h4>

      {/* Short Description */}
      <p className="text-xs text-neutral-400 line-clamp-2 mb-3 leading-relaxed">
        {product.shortDescription}
      </p>

      {/* Price & Add to Cart button */}
      <div className="mt-auto pt-2 border-t border-white/10 flex items-center justify-between gap-2">
        <div className="flex flex-col">
          <div className="flex items-baseline gap-1.5">
            <span className="text-base sm:text-lg font-bold text-white">
              {settings.currencySymbol}{product.salePrice.toLocaleString()}
            </span>
            {product.regularPrice > product.salePrice && (
              <span className="text-xs text-neutral-500 line-through">
                {settings.currencySymbol}{product.regularPrice.toLocaleString()}
              </span>
            )}
          </div>
        </div>

        <button
          onClick={handleAddToCart}
          disabled={product.stock === 0}
          className={`flex items-center justify-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold transition-all shadow-md ${
            isAdded
              ? 'bg-emerald-500 text-white'
              : product.stock === 0
              ? 'bg-neutral-800 text-neutral-500 cursor-not-allowed'
              : 'bg-amber-400 hover:bg-amber-300 text-black hover:scale-105 active:scale-95 shadow-amber-400/20'
          }`}
        >
          {isAdded ? (
            <>
              <Check className="w-3.5 h-3.5" />
              <span>Added</span>
            </>
          ) : (
            <>
              <ShoppingBag className="w-3.5 h-3.5" />
              <span>Add</span>
            </>
          )}
        </button>
      </div>
    </div>
  );
};
