import React, { useState } from 'react';
import { 
  Star, 
  Heart, 
  ShoppingBag, 
  Check, 
  ShieldCheck, 
  Truck, 
  RotateCcw, 
  Layers, 
  AlertTriangle, 
  ArrowLeft,
  Share2,
  FileText,
  Clock,
  Sparkles
} from 'lucide-react';
import { Product, ProductColor } from '../types';
import { useStore } from '../hooks/useStore';
import { ThreeProductCanvas } from './ThreeProductCanvas';
import { ProductCard } from './ProductCard';

interface ProductDetailViewProps {
  product: Product;
  onBack: () => void;
  onSelectProduct: (p: Product) => void;
  onInstantBuy: (product: Product, quantity: number, variant?: string, size?: string, color?: string) => void;
}

export const ProductDetailView: React.FC<ProductDetailViewProps> = ({
  product,
  onBack,
  onSelectProduct,
  onInstantBuy,
}) => {
  const { store, settings, products, reviews, wishlist } = useStore();

  const [activeImageIdx, setActiveImageIdx] = useState(0);
  const [selectedVariant, setSelectedVariant] = useState<string | undefined>(product.variants?.[0]);
  const [selectedSize, setSelectedSize] = useState<string | undefined>(product.sizes?.[0]);
  const [selectedColor, setSelectedColor] = useState<ProductColor | undefined>(product.colors?.[0]);
  const [quantity, setQuantity] = useState(1);
  const [view3D, setView3D] = useState(false);
  const [isAdded, setIsAdded] = useState(false);
  const [showShareToast, setShowShareToast] = useState(false);

  // New review form
  const [reviewName, setReviewName] = useState('');
  const [reviewRating, setReviewRating] = useState(5);
  const [reviewComment, setReviewComment] = useState('');
  const [reviewSubmitted, setReviewSubmitted] = useState(false);

  const isInWishlist = wishlist.includes(product.id);

  // Product reviews
  const productReviews = reviews.filter(r => r.productId === product.id && r.approved);

  // Related products
  const relatedProducts = products
    .filter(p => p.id !== product.id && p.category === product.category && p.active)
    .slice(0, 4);

  const discountPercent =
    product.regularPrice > product.salePrice
      ? Math.round(((product.regularPrice - product.salePrice) / product.regularPrice) * 100)
      : 0;

  const handleAddToCart = () => {
    store.addToCart({
      productId: product.id,
      productName: product.name,
      productImage: product.images[activeImageIdx] || product.images[0] || '',
      price: product.salePrice,
      quantity,
      selectedVariant,
      selectedSize,
      selectedColor: selectedColor?.name,
    });
    setIsAdded(true);
    setTimeout(() => setIsAdded(false), 2000);
  };

  const handleBuyNow = () => {
    onInstantBuy(product, quantity, selectedVariant, selectedSize, selectedColor?.name);
  };

  const handleShare = () => {
    navigator.clipboard?.writeText(window.location.href);
    setShowShareToast(true);
    setTimeout(() => setShowShareToast(false), 2500);
  };

  const handleSubmitReview = (e: React.FormEvent) => {
    e.preventDefault();
    if (!reviewName.trim() || !reviewComment.trim()) return;

    store.addReview({
      productId: product.id,
      productName: product.name,
      customerName: reviewName.trim(),
      rating: reviewRating,
      comment: reviewComment.trim(),
    });

    setReviewSubmitted(true);
    setReviewName('');
    setReviewComment('');
  };

  return (
    <div className="min-h-screen pt-24 pb-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Navigation Breadcrumb / Back */}
        <div className="flex items-center justify-between gap-4 mb-8">
          <button
            onClick={onBack}
            className="inline-flex items-center gap-2 text-sm text-neutral-400 hover:text-amber-400 transition-colors font-medium"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Back to Collection</span>
          </button>

          <div className="flex items-center gap-3">
            <button
              onClick={handleShare}
              className="p-2.5 rounded-full bg-white/5 hover:bg-white/10 text-neutral-300 hover:text-white transition-colors"
              title="Share Product"
            >
              <Share2 className="w-4 h-4" />
            </button>
            <button
              onClick={() => store.toggleWishlist(product.id)}
              className={`p-2.5 rounded-full border transition-all ${
                isInWishlist
                  ? 'bg-rose-500 border-rose-400 text-white'
                  : 'bg-white/5 border-white/10 text-neutral-300 hover:text-white'
              }`}
              title="Add to Wishlist"
            >
              <Heart className={`w-4 h-4 ${isInWishlist ? 'fill-current' : ''}`} />
            </button>
          </div>
        </div>

        {showShareToast && (
          <div className="fixed top-20 right-6 z-50 px-4 py-2 rounded-xl bg-amber-400 text-black font-semibold text-xs shadow-2xl flex items-center gap-2 animate-bounce">
            <Check className="w-4 h-4" /> Link copied to clipboard!
          </div>
        )}

        {/* Main Product Layout: Gallery & Details */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-14 mb-20">
          {/* Left Column: Image Gallery & 3D Model Toggle (7 Cols) */}
          <div className="lg:col-span-7 flex flex-col gap-4">
            {/* View Switcher: High-Res Gallery vs Real-Time 3D Studio */}
            <div className="flex items-center justify-between pb-2">
              <span className="text-xs uppercase tracking-wider font-semibold text-neutral-400">
                Visual Inspection
              </span>
              <div className="flex items-center p-1 rounded-xl bg-black/60 border border-white/10">
                <button
                  onClick={() => setView3D(false)}
                  className={`px-3 py-1 text-xs rounded-lg font-medium transition-all ${
                    !view3D ? 'bg-amber-400 text-black font-semibold' : 'text-neutral-400 hover:text-white'
                  }`}
                >
                  Gallery Views
                </button>
                <button
                  onClick={() => setView3D(true)}
                  className={`flex items-center gap-1.5 px-3 py-1 text-xs rounded-lg font-medium transition-all ${
                    view3D ? 'bg-amber-400 text-black font-semibold' : 'text-neutral-400 hover:text-white'
                  }`}
                >
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>3D Interactive</span>
                </button>
              </div>
            </div>

            {/* Main Stage: 3D Canvas or Image Zoom */}
            {view3D ? (
              <ThreeProductCanvas
                product={product}
                selectedColor={selectedColor}
                onColorChange={setSelectedColor}
              />
            ) : (
              <div className="relative w-full aspect-[4/3] rounded-3xl overflow-hidden glass-panel border border-white/10 bg-neutral-950 flex items-center justify-center group">
                <img
                  src={product.images[activeImageIdx] || product.images[0]}
                  alt={product.name}
                  className="w-full h-full object-cover object-center group-hover:scale-110 transition-transform duration-500 ease-out"
                />

                {discountPercent > 0 && (
                  <span className="absolute top-5 left-5 px-3 py-1 rounded-full bg-rose-500 font-extrabold text-xs text-white uppercase tracking-wider shadow-lg">
                    Save {discountPercent}%
                  </span>
                )}
              </div>
            )}

            {/* Thumbnail Row */}
            {!view3D && product.images.length > 1 && (
              <div className="flex items-center gap-3 overflow-x-auto pb-2">
                {product.images.map((img, idx) => (
                  <button
                    key={idx}
                    onClick={() => setActiveImageIdx(idx)}
                    className={`relative w-20 h-20 rounded-2xl overflow-hidden border-2 transition-all flex-shrink-0 bg-neutral-900 ${
                      activeImageIdx === idx
                        ? 'border-amber-400 ring-2 ring-amber-400/30'
                        : 'border-white/10 opacity-70 hover:opacity-100'
                    }`}
                  >
                    <img src={img} alt={`${product.name} angle ${idx + 1}`} className="w-full h-full object-cover" />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Right Column: Pricing, Options & Actions (5 Cols) */}
          <div className="lg:col-span-5 flex flex-col justify-start">
            {/* Category & SKU */}
            <div className="flex items-center justify-between text-xs text-neutral-400 mb-2">
              <span className="uppercase tracking-widest font-semibold text-amber-400">
                {product.category}
              </span>
              <span>SKU: {product.sku}</span>
            </div>

            {/* Product Title */}
            <h1 className="font-heading text-2xl sm:text-3xl font-bold text-white mb-3 leading-tight">
              {product.name}
            </h1>

            {/* Brand & Ratings */}
            <div className="flex items-center gap-3 mb-5">
              <span className="px-2.5 py-0.5 rounded-md bg-white/5 border border-white/10 text-xs font-medium text-neutral-300">
                {product.brand}
              </span>
              <div className="flex items-center gap-1.5 text-xs text-neutral-300">
                <div className="flex items-center text-amber-400">
                  {[...Array(5)].map((_, i) => (
                    <Star
                      key={i}
                      className={`w-3.5 h-3.5 ${
                        i < Math.floor(product.rating) ? 'fill-current' : 'text-neutral-600'
                      }`}
                    />
                  ))}
                </div>
                <span className="font-bold text-white">{product.rating.toFixed(1)}</span>
                <span className="text-neutral-500">({product.reviewsCount} customer reviews)</span>
              </div>
            </div>

            {/* Price block */}
            <div className="p-4 rounded-2xl glass-panel border border-white/10 mb-6 flex items-baseline justify-between">
              <div className="flex items-baseline gap-3">
                <span className="text-3xl font-extrabold text-white">
                  {settings.currencySymbol}{product.salePrice.toLocaleString()}
                </span>
                {product.regularPrice > product.salePrice && (
                  <span className="text-base text-neutral-500 line-through">
                    {settings.currencySymbol}{product.regularPrice.toLocaleString()}
                  </span>
                )}
              </div>
              <div>
                {product.stock > 0 ? (
                  <span className="px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-semibold">
                    In Stock ({product.stock} units)
                  </span>
                ) : (
                  <span className="px-3 py-1 rounded-full bg-rose-500/10 border border-rose-500/20 text-rose-400 text-xs font-semibold">
                    Sold Out
                  </span>
                )}
              </div>
            </div>

            {/* Short Description */}
            <p className="text-sm text-neutral-300 mb-6 leading-relaxed">
              {product.description}
            </p>

            {/* Variants Selector */}
            {product.variants && product.variants.length > 0 && (
              <div className="mb-5">
                <label className="block text-xs font-bold uppercase tracking-wider text-neutral-400 mb-2">
                  Select Variant:
                </label>
                <div className="flex flex-wrap gap-2">
                  {product.variants.map((v) => (
                    <button
                      key={v}
                      onClick={() => setSelectedVariant(v)}
                      className={`px-4 py-2 rounded-xl text-xs font-medium border transition-all ${
                        selectedVariant === v
                          ? 'border-amber-400 bg-amber-400/15 text-amber-300 font-semibold shadow-md'
                          : 'border-white/10 text-neutral-300 hover:border-white/30 hover:bg-white/5'
                      }`}
                    >
                      {v}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Sizes Selector (for Clothing / Combos) */}
            {product.sizes && product.sizes.length > 0 && (
              <div className="mb-5">
                <label className="block text-xs font-bold uppercase tracking-wider text-neutral-400 mb-2">
                  Select Size:
                </label>
                <div className="flex flex-wrap gap-2">
                  {product.sizes.map((s) => (
                    <button
                      key={s}
                      onClick={() => setSelectedSize(s)}
                      className={`px-3.5 py-1.5 rounded-xl text-xs font-medium border transition-all ${
                        selectedSize === s
                          ? 'border-amber-400 bg-amber-400/15 text-amber-300 font-semibold'
                          : 'border-white/10 text-neutral-300 hover:border-white/30 hover:bg-white/5'
                      }`}
                    >
                      {s}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Color Selector */}
            {product.colors && product.colors.length > 0 && (
              <div className="mb-6">
                <label className="block text-xs font-bold uppercase tracking-wider text-neutral-400 mb-2">
                  Finish / Color: <span className="text-white font-normal">{selectedColor?.name}</span>
                </label>
                <div className="flex items-center gap-2.5">
                  {product.colors.map((c) => {
                    const isSelected = selectedColor?.name === c.name;
                    return (
                      <button
                        key={c.name}
                        onClick={() => setSelectedColor(c)}
                        title={c.name}
                        className={`relative w-8 h-8 rounded-full border transition-all flex items-center justify-center ${
                          isSelected ? 'scale-110 border-amber-400 ring-2 ring-amber-400/40 shadow-lg' : 'border-white/20'
                        }`}
                        style={{ backgroundColor: c.hex }}
                      >
                        {isSelected && (
                          <Check className={`w-4 h-4 ${c.hex === '#ffffff' ? 'text-black' : 'text-white'}`} />
                        )}
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Quantity Selector & CTAs */}
            <div className="flex flex-col gap-3.5 mb-8">
              <div className="flex items-center gap-3">
                <div className="flex items-center rounded-xl glass-panel border border-white/15 p-1">
                  <button
                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                    className="w-9 h-9 flex items-center justify-center text-neutral-300 hover:text-white rounded-lg hover:bg-white/10 text-lg font-bold"
                  >
                    -
                  </button>
                  <span className="w-10 text-center text-sm font-bold text-white">{quantity}</span>
                  <button
                    onClick={() => setQuantity(Math.min(product.stock, quantity + 1))}
                    className="w-9 h-9 flex items-center justify-center text-neutral-300 hover:text-white rounded-lg hover:bg-white/10 text-lg font-bold"
                  >
                    +
                  </button>
                </div>

                {/* Add to Cart */}
                <button
                  onClick={handleAddToCart}
                  disabled={product.stock === 0}
                  className={`flex-1 py-3.5 px-6 rounded-2xl font-bold text-sm flex items-center justify-center gap-2 transition-all shadow-xl ${
                    isAdded
                      ? 'bg-emerald-500 text-white'
                      : product.stock === 0
                      ? 'bg-neutral-800 text-neutral-500 cursor-not-allowed'
                      : 'bg-white/10 hover:bg-white/20 text-white border border-white/20 hover:border-amber-400/40'
                  }`}
                >
                  {isAdded ? (
                    <>
                      <Check className="w-4 h-4" /> Added to Bag
                    </>
                  ) : (
                    <>
                      <ShoppingBag className="w-4 h-4 text-amber-400" /> Add to Shopping Bag
                    </>
                  )}
                </button>
              </div>

              {/* Instant Buy Now */}
              <button
                onClick={handleBuyNow}
                disabled={product.stock === 0}
                className="w-full py-3.5 px-6 rounded-2xl font-extrabold text-sm bg-gradient-to-r from-amber-400 to-amber-500 hover:from-amber-300 hover:to-amber-400 text-black shadow-xl shadow-amber-500/20 active:scale-98 transition-all flex items-center justify-center gap-2"
              >
                <span>Instant Checkout</span>
                <span>•</span>
                <span>{settings.currencySymbol}{(product.salePrice * quantity).toLocaleString()}</span>
              </button>
            </div>

            {/* Confidence & Delivery Guarantees */}
            <div className="grid grid-cols-2 gap-3 pt-6 border-t border-white/10 text-xs text-neutral-300">
              <div className="flex items-center gap-2 p-2.5 rounded-xl bg-white/5">
                <Truck className="w-4 h-4 text-amber-400 flex-shrink-0" />
                <span>Express Courier (24-48h Dhaka)</span>
              </div>
              <div className="flex items-center gap-2 p-2.5 rounded-xl bg-white/5">
                <RotateCcw className="w-4 h-4 text-amber-400 flex-shrink-0" />
                <span>7-Day Return Guarantee</span>
              </div>
              <div className="flex items-center gap-2 p-2.5 rounded-xl bg-white/5">
                <ShieldCheck className="w-4 h-4 text-amber-400 flex-shrink-0" />
                <span>100% Authentic Guarantee</span>
              </div>
              <div className="flex items-center gap-2 p-2.5 rounded-xl bg-white/5">
                <Layers className="w-4 h-4 text-amber-400 flex-shrink-0" />
                <span>Secure Cash on Delivery</span>
              </div>
            </div>
          </div>
        </div>

        {/* Specifications & Health / Medicine Safety Compliance Sheet */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 mb-20">
          {/* Left: Technical Specs Table (7 cols) */}
          <div className="lg:col-span-7 glass-panel p-6 sm:p-8 rounded-3xl border border-white/10">
            <h3 className="font-heading text-lg font-bold text-white mb-4 flex items-center gap-2">
              <FileText className="w-5 h-5 text-amber-400" />
              <span>Technical Specifications & Standards</span>
            </h3>

            {product.specifications ? (
              <div className="divide-y divide-white/5">
                {Object.entries(product.specifications).map(([key, val]) => (
                  <div key={key} className="py-3 flex items-center justify-between text-xs sm:text-sm">
                    <span className="text-neutral-400 font-medium">{key}</span>
                    <span className="text-white font-semibold text-right">{val}</span>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-xs text-neutral-400">Standard manufacturer specifications apply.</p>
            )}
          </div>

          {/* Right: Health, Medicine & Safety Compliance Accordion (5 cols) */}
          <div className="lg:col-span-5 flex flex-col gap-4">
            {product.isMedicineOrHealth && (
              <div className="glass-panel-gold p-6 rounded-3xl border border-amber-400/30">
                <div className="flex items-center gap-2 text-amber-400 text-xs font-bold uppercase tracking-wider mb-3">
                  <ShieldCheck className="w-4 h-4" />
                  <span>Clinical & Product Safety Verification</span>
                </div>

                <div className="flex flex-col gap-3 text-xs text-neutral-300">
                  {product.manufacturer && (
                    <div>
                      <span className="text-neutral-400 font-semibold block">Manufacturer:</span>
                      <span className="text-white">{product.manufacturer}</span>
                    </div>
                  )}

                  {product.ingredients && (
                    <div>
                      <span className="text-neutral-400 font-semibold block">Active Ingredients / Content:</span>
                      <span className="text-white leading-relaxed">{product.ingredients}</span>
                    </div>
                  )}

                  {product.usageInstructions && (
                    <div>
                      <span className="text-neutral-400 font-semibold block">Recommended Usage Instructions:</span>
                      <span className="text-white leading-relaxed">{product.usageInstructions}</span>
                    </div>
                  )}

                  {product.batchNumber && (
                    <div className="flex items-center justify-between py-1.5 border-t border-white/10">
                      <span className="text-neutral-400">Batch Identifier:</span>
                      <span className="font-mono text-amber-300 font-bold">{product.batchNumber}</span>
                    </div>
                  )}

                  {product.expiryDate && (
                    <div className="flex items-center justify-between py-1.5 border-t border-white/10">
                      <span className="text-neutral-400">Expiry Date:</span>
                      <span className="font-mono text-neutral-200">{product.expiryDate}</span>
                    </div>
                  )}

                  {product.warnings && (
                    <div className="p-3 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-300 text-[11px] leading-relaxed flex items-start gap-2 mt-2">
                      <AlertTriangle className="w-4 h-4 flex-shrink-0 mt-0.5 text-amber-400" />
                      <span>{product.warnings}</span>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Standard Store Security Note */}
            <div className="glass-panel p-6 rounded-3xl border border-white/10 text-xs text-neutral-400 leading-relaxed">
              <span className="font-bold text-white block mb-1">VELORA White-Glove Packaging</span>
              Every parcel is sealed in tamper-evident protective containers, accompanied by authentic batch certification and serial tracing.
            </div>
          </div>
        </div>

        {/* Customer Reviews Section */}
        <div className="glass-panel p-6 sm:p-10 rounded-3xl border border-white/10 mb-20">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-white/10 mb-8">
            <div>
              <h3 className="font-heading text-xl sm:text-2xl font-bold text-white mb-1">
                Verified Customer Reviews
              </h3>
              <p className="text-xs text-neutral-400">
                Real feedback from verified purchasers of {product.name}
              </p>
            </div>
            <div className="flex items-center gap-3">
              <div className="text-2xl font-bold text-white">{product.rating.toFixed(1)}</div>
              <div className="flex items-center text-amber-400">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className="w-4 h-4 fill-current" />
                ))}
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            {/* Reviews List (7 cols) */}
            <div className="lg:col-span-7 flex flex-col gap-4">
              {productReviews.length > 0 ? (
                productReviews.map((rev) => (
                  <div key={rev.id} className="p-4 rounded-2xl bg-white/5 border border-white/5">
                    <div className="flex items-center justify-between mb-2">
                      <span className="font-bold text-sm text-white">{rev.customerName}</span>
                      <div className="flex items-center text-amber-400 text-xs">
                        {[...Array(rev.rating)].map((_, i) => (
                          <Star key={i} className="w-3 h-3 fill-current" />
                        ))}
                      </div>
                    </div>
                    <p className="text-xs text-neutral-300 leading-relaxed mb-2">{rev.comment}</p>
                    <span className="text-[10px] text-neutral-500 font-mono">
                      {new Date(rev.createdAt).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' })}
                    </span>
                  </div>
                ))
              ) : (
                <div className="p-8 text-center text-neutral-400 text-xs border border-dashed border-white/10 rounded-2xl">
                  No public reviews posted yet for this batch. Be the first to share your experience!
                </div>
              )}
            </div>

            {/* Write a review form (5 cols) */}
            <div className="lg:col-span-5 p-6 rounded-2xl bg-neutral-900/60 border border-white/10">
              <h4 className="font-bold text-sm text-white mb-3">Submit Your Review</h4>
              {reviewSubmitted ? (
                <div className="p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs flex items-center gap-2">
                  <Check className="w-4 h-4" /> Thank you! Your review has been submitted for admin approval.
                </div>
              ) : (
                <form onSubmit={handleSubmitReview} className="flex flex-col gap-3">
                  <div>
                    <label className="block text-[11px] font-semibold text-neutral-300 mb-1">Your Name</label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Mahfuz Rahman"
                      value={reviewName}
                      onChange={(e) => setReviewName(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl bg-black/60 border border-white/10 text-white text-xs focus:outline-none focus:border-amber-400"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-semibold text-neutral-300 mb-1">Rating</label>
                    <div className="flex items-center gap-2">
                      {[1, 2, 3, 4, 5].map((stars) => (
                        <button
                          type="button"
                          key={stars}
                          onClick={() => setReviewRating(stars)}
                          className={`p-1 text-sm ${stars <= reviewRating ? 'text-amber-400' : 'text-neutral-600'}`}
                        >
                          ★
                        </button>
                      ))}
                      <span className="text-xs text-neutral-400 font-semibold">{reviewRating} Stars</span>
                    </div>
                  </div>

                  <div>
                    <label className="block text-[11px] font-semibold text-neutral-300 mb-1">Comments</label>
                    <textarea
                      required
                      rows={3}
                      placeholder="Share details on texture, performance, or packaging..."
                      value={reviewComment}
                      onChange={(e) => setReviewComment(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl bg-black/60 border border-white/10 text-white text-xs focus:outline-none focus:border-amber-400 resize-none"
                    />
                  </div>

                  <button
                    type="submit"
                    className="w-full py-2.5 rounded-xl bg-amber-400 hover:bg-amber-300 text-black font-bold text-xs transition-colors shadow-md mt-1"
                  >
                    Post Review
                  </button>
                </form>
              )}
            </div>
          </div>
        </div>

        {/* Related Products Carousel / Grid */}
        {relatedProducts.length > 0 && (
          <div>
            <div className="flex items-center justify-between mb-8">
              <div>
                <span className="text-xs font-bold uppercase tracking-widest text-amber-400">
                  Recommended Companions
                </span>
                <h3 className="font-heading text-xl sm:text-2xl font-bold text-white">
                  Related Products
                </h3>
              </div>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 sm:gap-6">
              {relatedProducts.map((rel) => (
                <ProductCard
                  key={rel.id}
                  product={rel}
                  onQuickView={onSelectProduct}
                  onSelectProduct={onSelectProduct}
                />
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
