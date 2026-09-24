import React, { useState } from 'react';
import { 
  Sparkles, 
  ArrowRight, 
  ShieldCheck, 
  Truck, 
  RotateCcw, 
  Headphones, 
  Star, 
  Tag, 
  Filter, 
  Check, 
  Layers,
  Compass,
  ArrowUpRight
} from 'lucide-react';
import { useStore } from './hooks/useStore';
import { Product } from './types';
import { Navbar } from './components/Navbar';
import { Footer } from './components/Footer';
import { HeroThreeScene } from './components/HeroThreeScene';
import { ThreeProductCanvas } from './components/ThreeProductCanvas';
import { CategoryCard } from './components/CategoryCard';
import { ProductCard } from './components/ProductCard';
import { ProductDetailView } from './components/ProductDetailView';
import { QuickViewModal } from './components/QuickViewModal';
import { CartDrawer } from './components/CartDrawer';
import { CheckoutModal } from './components/CheckoutModal';
import { SearchModal } from './components/SearchModal';
import { OrderTrackingModal } from './components/OrderTrackingModal';
import { AdminPanel } from './components/admin/AdminPanel';

export default function App() {
  const { settings, categories, products, coupons } = useStore();

  // Navigation State
  const [currentPage, setCurrentPage] = useState<string>('home');
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [selectedCategoryFilter, setSelectedCategoryFilter] = useState<string>('all');
  const [sortBy, setSortBy] = useState<'featured' | 'price-asc' | 'price-desc' | 'rating'>('featured');

  // Modals & Drawers
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);
  const [isTrackingOpen, setIsTrackingOpen] = useState(false);
  const [quickViewProduct, setQuickViewProduct] = useState<Product | null>(null);
  const [directBuyData, setDirectBuyData] = useState<any | null>(null);
  const [copiedCoupon, setCopiedCoupon] = useState<string | null>(null);

  // 3D Studio Showcase Active Product
  const [studioActiveProduct, setStudioActiveProduct] = useState<Product>(
    products.find(p => p.model3dType === 'cooker') || products[0]
  );

  // Handlers
  const handleNavigate = (page: string) => {
    if (page.startsWith('shop?cat=')) {
      const cat = decodeURIComponent(page.split('=')[1]);
      setSelectedCategoryFilter(cat);
      setCurrentPage('shop');
    } else if (page.startsWith('shop?filter=')) {
      const filter = page.split('=')[1];
      if (filter === 'wishlist') {
        setSelectedCategoryFilter('wishlist');
      } else {
        setSelectedCategoryFilter('all');
      }
      setCurrentPage('shop');
    } else {
      setCurrentPage(page);
    }
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleSelectProduct = (product: Product) => {
    setSelectedProduct(product);
    setCurrentPage('product-detail');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleInstantBuy = (product: Product, quantity: number, variant?: string, size?: string, color?: string) => {
    setDirectBuyData({ product, quantity, variant, size, color });
    setIsCheckoutOpen(true);
  };

  const handleCopyCoupon = (code: string) => {
    navigator.clipboard?.writeText(code);
    setCopiedCoupon(code);
    setTimeout(() => setCopiedCoupon(null), 2500);
  };

  // If in Admin Panel view
  if (currentPage === 'admin') {
    return <AdminPanel onExit={() => setCurrentPage('home')} />;
  }

  // Filtered & Sorted Products for Shop Catalog
  const shopProducts = products.filter((p) => {
    if (!p.active) return false;
    if (selectedCategoryFilter === 'all') return true;
    if (selectedCategoryFilter === 'wishlist') {
      const wishlist = (window as any)?.velora_wishlist || [];
      return wishlist.includes(p.id);
    }
    return p.category === selectedCategoryFilter;
  }).sort((a, b) => {
    if (sortBy === 'price-asc') return a.salePrice - b.salePrice;
    if (sortBy === 'price-desc') return b.salePrice - a.salePrice;
    if (sortBy === 'rating') return b.rating - a.rating;
    return (b.featured ? 1 : 0) - (a.featured ? 1 : 0);
  });

  return (
    <div className="min-h-screen bg-[#090a0f] text-white selection:bg-amber-400 selection:text-black font-sans">
      {/* Top Dynamic Announcement Bar */}
      {settings.announcementText && (
        <div className="bg-gradient-to-r from-amber-500/20 via-amber-400/30 to-amber-500/20 border-b border-amber-400/20 text-center py-2 px-4 text-xs font-semibold text-amber-300 tracking-wide flex items-center justify-center gap-2">
          <Sparkles className="w-3.5 h-3.5 text-amber-400 animate-pulse" />
          <span>{settings.announcementText}</span>
        </div>
      )}

      {/* Main Luxury Sticky Navbar */}
      <Navbar
        onOpenSearch={() => setIsSearchOpen(true)}
        onOpenCart={() => setIsCartOpen(true)}
        onOpenAccount={() => setIsTrackingOpen(true)}
        onOpenAdmin={() => setCurrentPage('admin')}
        onNavigate={handleNavigate}
        currentPage={currentPage}
      />

      {/* ==============================================================
          VIEW: PRODUCT DETAILS
      ============================================================== */}
      {currentPage === 'product-detail' && selectedProduct && (
        <ProductDetailView
          product={selectedProduct}
          onBack={() => setCurrentPage('home')}
          onSelectProduct={handleSelectProduct}
          onInstantBuy={handleInstantBuy}
        />
      )}

      {/* ==============================================================
          VIEW: FULL SHOP CATALOG
      ============================================================== */}
      {currentPage === 'shop' && (
        <div className="pt-24 pb-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
            <div>
              <span className="text-xs font-bold uppercase tracking-widest text-amber-400">
                Curated Luxury Inventory
              </span>
              <h1 className="font-heading text-3xl font-bold text-white mt-1">
                {selectedCategoryFilter === 'all'
                  ? 'All Luxury Collections'
                  : selectedCategoryFilter === 'wishlist'
                  ? 'Your Saved Wishlist'
                  : selectedCategoryFilter}
              </h1>
            </div>

            {/* Sort Dropdown */}
            <div className="flex items-center gap-2">
              <span className="text-xs text-neutral-400 flex items-center gap-1">
                <Filter className="w-3.5 h-3.5 text-amber-400" /> Sort by:
              </span>
              <select
                value={sortBy}
                onChange={(e: any) => setSortBy(e.target.value)}
                className="px-3 py-2 rounded-xl bg-black/60 border border-white/10 text-white text-xs focus:outline-none focus:border-amber-400"
              >
                <option value="featured">Featured First</option>
                <option value="price-asc">Price: Low to High</option>
                <option value="price-desc">Price: High to Low</option>
                <option value="rating">Highest Rated</option>
              </select>
            </div>
          </div>

          {/* Category Filter Pills */}
          <div className="flex items-center gap-2 overflow-x-auto pb-4 mb-8 border-b border-white/10">
            <button
              onClick={() => setSelectedCategoryFilter('all')}
              className={`px-4 py-2 rounded-full text-xs font-medium whitespace-nowrap transition-all ${
                selectedCategoryFilter === 'all'
                  ? 'bg-amber-400 text-black font-bold shadow-lg shadow-amber-400/20'
                  : 'bg-white/5 text-neutral-300 hover:text-white hover:bg-white/10'
              }`}
            >
              All Items ({products.filter(p => p.active).length})
            </button>
            {categories.map((cat) => (
              <button
                key={cat.id}
                onClick={() => setSelectedCategoryFilter(cat.name)}
                className={`px-4 py-2 rounded-full text-xs font-medium whitespace-nowrap transition-all ${
                  selectedCategoryFilter === cat.name
                    ? 'bg-amber-400 text-black font-bold shadow-lg shadow-amber-400/20'
                    : 'bg-white/5 text-neutral-300 hover:text-white hover:bg-white/10'
                }`}
              >
                {cat.name} ({cat.productCount})
              </button>
            ))}
          </div>

          {/* Product Grid */}
          {shopProducts.length === 0 ? (
            <div className="py-20 text-center text-neutral-400 text-xs border border-dashed border-white/10 rounded-3xl">
              No products found in this collection filter.
            </div>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6">
              {shopProducts.map((prod) => (
                <ProductCard
                  key={prod.id}
                  product={prod}
                  onQuickView={(p) => setQuickViewProduct(p)}
                  onSelectProduct={handleSelectProduct}
                />
              ))}
            </div>
          )}
        </div>
      )}

      {/* ==============================================================
          VIEW: 3D STUDIO SHOWCASE
      ============================================================== */}
      {currentPage === 'studio' && (
        <div className="pt-24 pb-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-10">
            <span className="text-xs font-bold uppercase tracking-widest text-amber-400">
              Interactive WebGL Inspection
            </span>
            <h1 className="font-heading text-3xl sm:text-4xl font-bold text-white mt-1">
              3D Real-Time Design Studio
            </h1>
            <p className="text-xs sm:text-sm text-neutral-400 mt-2">
              Orbit the geometry in 360°, inspect custom metallic finishes, and analyze tolerances before making your selection.
            </p>
          </div>

          {/* Model Selector Bar */}
          <div className="flex items-center justify-center gap-3 overflow-x-auto pb-4 mb-8">
            {products.slice(0, 5).map((p) => (
              <button
                key={p.id}
                onClick={() => setStudioActiveProduct(p)}
                className={`px-4 py-2 rounded-2xl text-xs font-medium transition-all flex items-center gap-2 border ${
                  studioActiveProduct.id === p.id
                    ? 'border-amber-400 bg-amber-400/20 text-amber-300 font-bold shadow-lg shadow-amber-400/20'
                    : 'border-white/10 bg-white/5 text-neutral-400 hover:text-white'
                }`}
              >
                <span>{p.name}</span>
              </button>
            ))}
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
            {/* 3D Canvas (8 cols) */}
            <div className="lg:col-span-8">
              <ThreeProductCanvas product={studioActiveProduct} />
            </div>

            {/* Active Model Specs (4 cols) */}
            <div className="lg:col-span-4 glass-panel p-6 sm:p-8 rounded-3xl border border-white/10 space-y-4">
              <span className="text-[11px] font-bold uppercase tracking-wider text-amber-400">
                Active 3D Artifact
              </span>
              <h3 className="font-heading text-xl font-bold text-white leading-tight">
                {studioActiveProduct.name}
              </h3>
              <p className="text-xs text-neutral-300 leading-relaxed">
                {studioActiveProduct.shortDescription}
              </p>

              <div className="p-4 rounded-2xl bg-black/60 border border-white/10 flex items-baseline justify-between">
                <span className="text-2xl font-bold text-white">
                  {settings.currencySymbol}{studioActiveProduct.salePrice.toLocaleString()}
                </span>
                <span className="text-xs text-emerald-400 font-semibold">Ready for Dispatch</span>
              </div>

              <div className="space-y-2 pt-2 text-xs">
                <div className="flex justify-between py-1 border-b border-white/5 text-neutral-400">
                  <span>Engine:</span>
                  <span className="text-white font-mono">Three.js WebGL 2.0</span>
                </div>
                <div className="flex justify-between py-1 border-b border-white/5 text-neutral-400">
                  <span>Lighting:</span>
                  <span className="text-white">Studio HDRI Rim + Key</span>
                </div>
                <div className="flex justify-between py-1 border-b border-white/5 text-neutral-400">
                  <span>Shading:</span>
                  <span className="text-white">Metallic PBR Physical</span>
                </div>
              </div>

              <button
                onClick={() => handleSelectProduct(studioActiveProduct)}
                className="w-full py-3.5 rounded-2xl bg-amber-400 hover:bg-amber-300 text-black font-extrabold text-xs uppercase tracking-wider shadow-lg shadow-amber-400/20 transition-all mt-4"
              >
                Inspect Specification Sheet →
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ==============================================================
          VIEW: SPECIAL OFFERS & COUPONS
      ============================================================== */}
      {currentPage === 'offers' && (
        <div className="pt-24 pb-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-xl mx-auto mb-12">
            <span className="text-xs font-bold uppercase tracking-widest text-amber-400">
              Exclusive Privileges
            </span>
            <h1 className="font-heading text-3xl font-bold text-white mt-1">
              Active Promotional Codes
            </h1>
            <p className="text-xs text-neutral-400 mt-2">
              Apply these authentic coupon codes during checkout to enjoy exclusive seasonal concessions.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 max-w-4xl mx-auto">
            {coupons.map((c) => (
              <div key={c.id} className="p-6 rounded-3xl glass-panel-gold border border-amber-400/30 flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <span className="px-3.5 py-1.5 rounded-xl bg-amber-400 text-black font-mono font-extrabold text-sm tracking-wider">
                      {c.code}
                    </span>
                    <span className="text-xs text-amber-300 font-bold">
                      {c.discountType === 'percentage' ? `${c.discountValue}% OFF` : `৳${c.discountValue} OFF`}
                    </span>
                  </div>

                  <p className="text-xs text-neutral-200 mb-4 leading-relaxed">
                    Enjoy {c.discountType === 'percentage' ? `${c.discountValue}% off` : `৳${c.discountValue} discount`} on orders over ৳{c.minOrder.toLocaleString()}.
                  </p>
                </div>

                <div className="pt-4 border-t border-white/10 flex items-center justify-between">
                  <span className="text-[10px] text-neutral-400">Expires: {c.expiryDate}</span>
                  <button
                    onClick={() => handleCopyCoupon(c.code)}
                    className="px-3 py-1.5 rounded-xl bg-white/10 hover:bg-white/20 text-white text-xs font-semibold flex items-center gap-1.5 transition-colors"
                  >
                    {copiedCoupon === c.code ? (
                      <>
                        <Check className="w-3.5 h-3.5 text-emerald-400" /> Copied!
                      </>
                    ) : (
                      <>
                        <Tag className="w-3.5 h-3.5 text-amber-400" /> Copy Code
                      </>
                    )}
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ==============================================================
          VIEW: HOME PAGE (CINEMATIC LUXURY LANDING)
      ============================================================== */}
      {currentPage === 'home' && (
        <main>
          {/* SECTION 2 — HERO */}
          <section className="relative min-h-[90vh] flex items-center justify-center pt-28 pb-16 overflow-hidden">
            {/* Ambient Background Glows */}
            <div className="absolute top-1/4 left-1/4 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />
            <div className="absolute bottom-1/3 right-1/4 w-96 h-96 bg-blue-600/10 rounded-full blur-3xl pointer-events-none" />

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full">
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-center">
                {/* Left Side: Headline, Copy, CTAs, Trust Elements (7 cols) */}
                <div className="lg:col-span-7 flex flex-col items-start z-10">
                  {/* Luxury Pill Tag */}
                  <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white/5 border border-white/15 backdrop-blur-md mb-6">
                    <span className="w-2 h-2 rounded-full bg-amber-400 animate-pulse" />
                    <span className="text-xs font-semibold text-neutral-300 uppercase tracking-widest">
                      Engineering The Future • 2026 Edition
                    </span>
                  </div>

                  {/* Dynamic Hero Title */}
                  <h1 className="font-heading text-4xl sm:text-5xl lg:text-6xl font-extrabold text-white tracking-tight leading-[1.12] mb-6">
                    {settings.heroTitle}
                  </h1>

                  {/* Dynamic Hero Description */}
                  <p className="text-base sm:text-lg text-neutral-300 leading-relaxed mb-8 max-w-xl font-normal">
                    {settings.heroDescription}
                  </p>

                  {/* Call-to-Action Buttons */}
                  <div className="flex flex-wrap items-center gap-4 mb-12">
                    <button
                      onClick={() => handleNavigate('shop')}
                      className="px-8 py-4 rounded-2xl bg-amber-400 hover:bg-amber-300 text-black font-extrabold text-xs uppercase tracking-wider flex items-center gap-2 shadow-xl shadow-amber-400/20 hover:scale-105 active:scale-95 transition-all"
                    >
                      <span>{settings.heroPrimaryButtonText || 'Explore Catalog'}</span>
                      <ArrowRight className="w-4 h-4" />
                    </button>

                    <button
                      onClick={() => handleNavigate('studio')}
                      className="px-8 py-4 rounded-2xl bg-white/5 hover:bg-white/10 text-white font-bold text-xs uppercase tracking-wider border border-white/15 hover:border-amber-400/40 backdrop-blur-md flex items-center gap-2 transition-all"
                    >
                      <Sparkles className="w-4 h-4 text-amber-400" />
                      <span>{settings.heroSecondaryButtonText || 'Enter 3D Studio'}</span>
                    </button>
                  </div>

                  {/* Trust Elements */}
                  <div className="grid grid-cols-3 gap-4 pt-6 border-t border-white/10 w-full max-w-lg text-xs">
                    <div>
                      <span className="font-bold text-white block">100% Genuine</span>
                      <span className="text-neutral-400 text-[11px]">Factory Certified</span>
                    </div>
                    <div>
                      <span className="font-bold text-white block">24-48h Delivery</span>
                      <span className="text-neutral-400 text-[11px]">Dhaka Metro Courier</span>
                    </div>
                    <div>
                      <span className="font-bold text-white block">Cash on Delivery</span>
                      <span className="text-neutral-400 text-[11px]">Pay Upon Receipt</span>
                    </div>
                  </div>
                </div>

                {/* Right Side: 3D Interactive Gyroscopic Canvas Scene (5 cols) */}
                <div className="lg:col-span-5 flex items-center justify-center">
                  <HeroThreeScene
                    featuredProductName={products[0]?.name}
                    featuredProductImage={products[0]?.images[0]}
                  />
                </div>
              </div>
            </div>
          </section>

          {/* SECTION 3 — CATEGORY SHOWCASE */}
          <section className="py-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-12">
              <div>
                <span className="text-xs font-bold uppercase tracking-widest text-amber-400">
                  Architectural Departments
                </span>
                <h2 className="font-heading text-3xl sm:text-4xl font-bold text-white mt-1">
                  Explore Curated Collections
                </h2>
              </div>
              <button
                onClick={() => handleNavigate('shop')}
                className="inline-flex items-center gap-1.5 text-xs text-amber-400 hover:text-amber-300 font-bold uppercase tracking-wider group"
              >
                <span>View All Departments</span>
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
              {categories.map((cat) => (
                <CategoryCard
                  key={cat.id}
                  category={cat}
                  onSelect={(catName) => handleNavigate(`shop?cat=${encodeURIComponent(catName)}`)}
                />
              ))}
            </div>
          </section>

          {/* SECTION 4 — FEATURED PRODUCTS */}
          <section className="py-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 border-t border-white/5">
            <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-10">
              <div>
                <span className="text-xs font-bold uppercase tracking-widest text-amber-400">
                  Handcrafted & Engineered
                </span>
                <h2 className="font-heading text-3xl sm:text-4xl font-bold text-white mt-1">
                  Featured Masterpieces
                </h2>
              </div>

              {/* Filter Tabs */}
              <div className="flex items-center gap-1.5 overflow-x-auto pb-2">
                <button
                  onClick={() => setSelectedCategoryFilter('all')}
                  className={`px-3.5 py-1.5 rounded-full text-xs font-medium whitespace-nowrap transition-all ${
                    selectedCategoryFilter === 'all'
                      ? 'bg-amber-400 text-black font-bold'
                      : 'bg-white/5 text-neutral-400 hover:text-white'
                  }`}
                >
                  All
                </button>
                {['Cooker & Rice Items', 'Clothing', 'Organics', 'Medicines'].map((cat) => (
                  <button
                    key={cat}
                    onClick={() => setSelectedCategoryFilter(cat)}
                    className={`px-3.5 py-1.5 rounded-full text-xs font-medium whitespace-nowrap transition-all ${
                      selectedCategoryFilter === cat
                        ? 'bg-amber-400 text-black font-bold'
                        : 'bg-white/5 text-neutral-400 hover:text-white'
                    }`}
                  >
                    {cat}
                  </button>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6">
              {products
                .filter(p => p.active && (selectedCategoryFilter === 'all' || p.category === selectedCategoryFilter))
                .slice(0, 8)
                .map((product) => (
                  <ProductCard
                    key={product.id}
                    product={product}
                    onQuickView={(p) => setQuickViewProduct(p)}
                    onSelectProduct={handleSelectProduct}
                  />
                ))}
            </div>
          </section>

          {/* SECTION 5 — 3D PRODUCT INTERACTIVE EXPERIENCE */}
          <section id="showcase3d" className="py-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 border-t border-white/5">
            <div className="text-center max-w-2xl mx-auto mb-12">
              <span className="text-xs font-bold uppercase tracking-widest text-amber-400">
                Spatial WebGL Immersion
              </span>
              <h2 className="font-heading text-3xl sm:text-4xl font-bold text-white mt-1">
                Real-Time 3D Product Canvas
              </h2>
              <p className="text-xs sm:text-sm text-neutral-400 mt-2">
                Drag to orbit 360°, scroll to zoom, switch camera angles, and test physical material finishes in real time.
              </p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
              <div className="lg:col-span-8">
                <ThreeProductCanvas product={studioActiveProduct} />
              </div>

              <div className="lg:col-span-4 glass-panel p-6 sm:p-8 rounded-3xl border border-white/10 space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-bold uppercase tracking-wider text-amber-400">
                    Smart Vessel Series
                  </span>
                  <span className="px-2.5 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 text-[10px] font-semibold">
                    In Stock
                  </span>
                </div>

                <h3 className="font-heading text-2xl font-bold text-white">
                  {studioActiveProduct.name}
                </h3>

                <p className="text-xs text-neutral-300 leading-relaxed">
                  {studioActiveProduct.description}
                </p>

                <div className="p-4 rounded-2xl bg-black/60 border border-white/10 flex items-baseline justify-between">
                  <span className="text-2xl font-extrabold text-white">
                    {settings.currencySymbol}{studioActiveProduct.salePrice.toLocaleString()}
                  </span>
                  <span className="text-xs text-neutral-400">Full 2-Year Warranty</span>
                </div>

                <div className="pt-2 flex flex-col gap-2.5">
                  <button
                    onClick={() => handleSelectProduct(studioActiveProduct)}
                    className="w-full py-3.5 rounded-2xl bg-amber-400 hover:bg-amber-300 text-black font-extrabold text-xs uppercase tracking-wider shadow-lg shadow-amber-400/20 transition-all flex items-center justify-center gap-2"
                  >
                    <span>Inspect Full Specifications</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>

                  <button
                    onClick={() => handleInstantBuy(studioActiveProduct, 1)}
                    className="w-full py-3 rounded-2xl bg-white/10 hover:bg-white/15 text-white font-bold text-xs uppercase transition-colors"
                  >
                    Direct Checkout
                  </button>
                </div>
              </div>
            </div>
          </section>

          {/* SECTION 6 — TRUST & VALUE PROPOSITIONS */}
          <section className="py-20 border-t border-white/5 bg-[#07080c]/50">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                <div className="p-6 rounded-3xl glass-panel border border-white/10 flex flex-col items-start">
                  <div className="w-12 h-12 rounded-2xl bg-amber-400/10 text-amber-400 flex items-center justify-center mb-4">
                    <Truck className="w-6 h-6" />
                  </div>
                  <h4 className="font-heading font-bold text-sm text-white mb-1">
                    White-Glove Courier
                  </h4>
                  <p className="text-xs text-neutral-400 leading-relaxed">
                    24 to 48 hours delivery within Dhaka metro. Sealed protective packaging.
                  </p>
                </div>

                <div className="p-6 rounded-3xl glass-panel border border-white/10 flex flex-col items-start">
                  <div className="w-12 h-12 rounded-2xl bg-emerald-400/10 text-emerald-400 flex items-center justify-center mb-4">
                    <ShieldCheck className="w-6 h-6" />
                  </div>
                  <h4 className="font-heading font-bold text-sm text-white mb-1">
                    Authenticity Certified
                  </h4>
                  <p className="text-xs text-neutral-400 leading-relaxed">
                    Every batch comes with certified lab credentials and official manufacturer seal.
                  </p>
                </div>

                <div className="p-6 rounded-3xl glass-panel border border-white/10 flex flex-col items-start">
                  <div className="w-12 h-12 rounded-2xl bg-blue-400/10 text-blue-400 flex items-center justify-center mb-4">
                    <RotateCcw className="w-6 h-6" />
                  </div>
                  <h4 className="font-heading font-bold text-sm text-white mb-1">
                    7-Day Hassle-Free Return
                  </h4>
                  <p className="text-xs text-neutral-400 leading-relaxed">
                    Zero friction return policy if any discrepancies in factory specifications.
                  </p>
                </div>

                <div className="p-6 rounded-3xl glass-panel border border-white/10 flex flex-col items-start">
                  <div className="w-12 h-12 rounded-2xl bg-purple-400/10 text-purple-400 flex items-center justify-center mb-4">
                    <Headphones className="w-6 h-6" />
                  </div>
                  <h4 className="font-heading font-bold text-sm text-white mb-1">
                    24/7 Dedicated Concierge
                  </h4>
                  <p className="text-xs text-neutral-400 leading-relaxed">
                    Direct VIP phone and WhatsApp assistance for all order inquiries and product guidance.
                  </p>
                </div>
              </div>
            </div>
          </section>
        </main>
      )}

      {/* Global Modals & Drawers */}
      <CartDrawer
        isOpen={isCartOpen}
        onClose={() => setIsCartOpen(false)}
        onProceedToCheckout={() => setIsCheckoutOpen(true)}
      />

      <CheckoutModal
        isOpen={isCheckoutOpen}
        onClose={() => {
          setIsCheckoutOpen(false);
          setDirectBuyData(null);
        }}
        directBuyItem={directBuyData}
        onOrderSuccess={(order) => {
          // Handled inside modal with print/continue
        }}
      />

      <QuickViewModal
        product={quickViewProduct}
        onClose={() => setQuickViewProduct(null)}
        onViewFullDetails={handleSelectProduct}
      />

      <SearchModal
        isOpen={isSearchOpen}
        onClose={() => setIsSearchOpen(false)}
        onSelectProduct={handleSelectProduct}
      />

      <OrderTrackingModal
        isOpen={isTrackingOpen}
        onClose={() => setIsTrackingOpen(false)}
      />

      {/* Luxury Footer with Dynamic Branding */}
      <Footer
        onOpenAdmin={() => setCurrentPage('admin')}
        onNavigate={handleNavigate}
        onOpenTracking={() => setIsTrackingOpen(true)}
      />
    </div>
  );
}
