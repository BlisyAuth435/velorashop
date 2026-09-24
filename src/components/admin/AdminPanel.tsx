import React, { useState } from 'react';
import { 
  LayoutDashboard, 
  Settings, 
  Package, 
  Layers, 
  ShoppingBag, 
  Users, 
  Boxes, 
  Tag, 
  Star, 
  Image as ImageIcon, 
  LogOut, 
  ArrowLeft, 
  Plus, 
  Search, 
  Edit3, 
  Trash2, 
  Copy, 
  Check, 
  AlertTriangle, 
  Printer, 
  Eye, 
  ShieldCheck, 
  RefreshCw,
  Save,
  CheckCircle,
  XCircle,
  ExternalLink
} from 'lucide-react';
import { useStore } from '../../hooks/useStore';
import { Product, Category, WebsiteSettings, Order, Coupon } from '../../types';

interface AdminPanelProps {
  onExit: () => void;
}

export const AdminPanel: React.FC<AdminPanelProps> = ({ onExit }) => {
  const { 
    store, 
    settings, 
    products, 
    categories, 
    orders, 
    customers, 
    coupons, 
    reviews, 
    media, 
    isAdmin 
  } = useStore();

  const [activeTab, setActiveTab] = useState<
    'overview' | 'settings' | 'products' | 'categories' | 'orders' | 'inventory' | 'customers' | 'coupons' | 'reviews' | 'media'
  >('overview');

  // Login credentials state if not logged in
  const [adminEmail, setAdminEmail] = useState('');
  const [adminPass, setAdminPass] = useState('');
  const [authError, setAuthError] = useState('');

  // Settings form state (bound to dynamic settings)
  const [settingsForm, setSettingsForm] = useState<WebsiteSettings>(settings);
  const [saveSettingsSuccess, setSaveSettingsSuccess] = useState(false);

  // Product modal state
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [isProductModalOpen, setIsProductModalOpen] = useState(false);
  const [productForm, setProductForm] = useState<Partial<Product>>({});

  // Category modal state
  const [isCategoryModalOpen, setIsCategoryModalOpen] = useState(false);
  const [categoryForm, setCategoryForm] = useState<Partial<Category>>({});

  // Coupon modal state
  const [isCouponModalOpen, setIsCouponModalOpen] = useState(false);
  const [couponForm, setCouponForm] = useState<Partial<Coupon>>({
    discountType: 'percentage',
    discountValue: 10,
    minOrder: 1000,
    maxDiscount: 1000,
    active: true,
  });

  // Selected order for full invoice view
  const [selectedOrderForInvoice, setSelectedOrderForInvoice] = useState<Order | null>(null);

  // Filters & Search
  const [productSearch, setProductSearch] = useState('');
  const [orderStatusFilter, setOrderStatusFilter] = useState('all');
  const [orderSearch, setOrderSearch] = useState('');

  // Admin login handler
  const handleAdminLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setAuthError('');
    const success = store.adminLogin(adminEmail, adminPass);
    if (!success) {
      setAuthError('Invalid credentials. Use demo: admin@velora.com / admin123');
    }
  };

  const handleQuickDemoLogin = () => {
    store.adminLogin('admin@velora.com', 'admin123');
  };

  // Save Settings handler
  const handleSaveSettings = (e: React.FormEvent) => {
    e.preventDefault();
    store.updateSettings(settingsForm);
    setSaveSettingsSuccess(true);
    setTimeout(() => setSaveSettingsSuccess(false), 3000);
  };

  // Product Save / Create handler
  const handleSaveProduct = (e: React.FormEvent) => {
    e.preventDefault();
    if (!productForm.name || !productForm.salePrice || !productForm.category) return;

    if (editingProduct) {
      store.updateProduct(editingProduct.id, productForm);
    } else {
      store.addProduct({
        name: productForm.name || '',
        slug: (productForm.name || '').toLowerCase().replace(/\s+/g, '-'),
        category: productForm.category || 'Cooker & Rice Items',
        shortDescription: productForm.shortDescription || '',
        description: productForm.description || '',
        regularPrice: Number(productForm.regularPrice) || Number(productForm.salePrice),
        salePrice: Number(productForm.salePrice),
        stock: Number(productForm.stock) || 10,
        sku: productForm.sku || `VEL-${Math.floor(1000 + Math.random() * 9000)}`,
        brand: productForm.brand || 'VELORA LUXE',
        images: productForm.images?.length ? productForm.images : ['https://images.unsplash.com/photo-1584269600464-37b1b58a9fe7?auto=format&fit=crop&w=800&q=80'],
        featured: !!productForm.featured,
        bestseller: !!productForm.bestseller,
        newArrival: true,
        rating: 5.0,
        reviewsCount: 0,
        active: productForm.active !== false,
        specifications: productForm.specifications || { 'Build': 'Titanium/Ceramic', 'Warranty': '2 Years' },
        variants: productForm.variants || ['Standard Edition'],
        sizes: productForm.sizes || [],
        colors: productForm.colors || [{ name: 'Obsidian', hex: '#1e2029' }],
        isMedicineOrHealth: productForm.category === 'Medicines' || productForm.category === 'Health' || productForm.category === 'Organics',
        manufacturer: productForm.manufacturer,
        ingredients: productForm.ingredients,
        usageInstructions: productForm.usageInstructions,
        warnings: productForm.warnings,
        expiryDate: productForm.expiryDate,
        batchNumber: productForm.batchNumber,
      });
    }

    setIsProductModalOpen(false);
    setEditingProduct(null);
    setProductForm({});
  };

  // Category Save handler
  const handleSaveCategory = (e: React.FormEvent) => {
    e.preventDefault();
    if (!categoryForm.name) return;

    store.addCategory({
      name: categoryForm.name,
      slug: categoryForm.name.toLowerCase().replace(/\s+/g, '-'),
      image: categoryForm.image || 'https://images.unsplash.com/photo-1544816155-12df9643f363?auto=format&fit=crop&w=600&q=80',
      description: categoryForm.description || '',
      displayOrder: categories.length + 1,
      active: true,
    });

    setIsCategoryModalOpen(false);
    setCategoryForm({});
  };

  // Coupon Save handler
  const handleSaveCoupon = (e: React.FormEvent) => {
    e.preventDefault();
    if (!couponForm.code || !couponForm.discountValue) return;

    store.addCoupon({
      code: couponForm.code.toUpperCase(),
      discountType: couponForm.discountType || 'percentage',
      discountValue: Number(couponForm.discountValue),
      minOrder: Number(couponForm.minOrder) || 0,
      maxDiscount: Number(couponForm.maxDiscount) || 1000,
      expiryDate: couponForm.expiryDate || '2026-12-31',
      active: true,
      usageCount: 0,
    });

    setIsCouponModalOpen(false);
    setCouponForm({});
  };

  // Inline stock updater
  const handleStockQuickUpdate = (productId: string, delta: number) => {
    const prod = products.find(p => p.id === productId);
    if (!prod) return;
    const newStock = Math.max(0, prod.stock + delta);
    store.updateProduct(productId, { stock: newStock });
  };

  // --- Login Screen Guard ---
  if (!isAdmin) {
    return (
      <div className="min-h-screen bg-[#07080c] flex items-center justify-center p-4">
        <div className="w-full max-w-md bg-[#0e1017] border border-white/10 rounded-3xl p-8 shadow-2xl relative">
          <button
            onClick={onExit}
            className="absolute top-5 left-5 text-neutral-400 hover:text-white flex items-center gap-1.5 text-xs font-semibold"
          >
            <ArrowLeft className="w-4 h-4" /> Back to Store
          </button>

          <div className="text-center pt-6 mb-8">
            <div className="w-12 h-12 rounded-2xl bg-amber-400/10 border border-amber-400/30 text-amber-400 flex items-center justify-center mx-auto mb-3 shadow-lg">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <h2 className="font-heading text-xl font-bold text-white uppercase tracking-wider">
              {settings.websiteName} Admin Portal
            </h2>
            <p className="text-xs text-neutral-400 mt-1">
              Secure administrative access and dynamic store management
            </p>
          </div>

          <form onSubmit={handleAdminLogin} className="space-y-4">
            <div>
              <label className="block text-xs font-medium text-neutral-300 mb-1.5">
                Admin Username or Email
              </label>
              <input
                type="text"
                required
                placeholder="admin@velora.com"
                value={adminEmail}
                onChange={(e) => setAdminEmail(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl bg-black/60 border border-white/10 text-white text-xs focus:outline-none focus:border-amber-400"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-neutral-300 mb-1.5">
                Password
              </label>
              <input
                type="password"
                required
                placeholder="••••••••"
                value={adminPass}
                onChange={(e) => setAdminPass(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl bg-black/60 border border-white/10 text-white text-xs focus:outline-none focus:border-amber-400"
              />
            </div>

            {authError && (
              <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-300 text-xs">
                {authError}
              </div>
            )}

            <button
              type="submit"
              className="w-full py-3 rounded-xl bg-amber-400 hover:bg-amber-300 text-black font-bold text-xs uppercase tracking-wider shadow-lg shadow-amber-400/20 transition-all"
            >
              Authenticate & Enter
            </button>
          </form>

          {/* Quick Demo Access Pill */}
          <div className="mt-6 pt-6 border-t border-white/10 text-center">
            <span className="text-[11px] text-neutral-400 block mb-2">Development Testing:</span>
            <button
              onClick={handleQuickDemoLogin}
              className="px-4 py-2 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-amber-300 text-xs font-semibold transition-all inline-flex items-center gap-1.5"
            >
              <span>Instant Demo Login (admin@velora.com)</span>
            </button>
          </div>
        </div>
      </div>
    );
  }

  // --- Main Admin Dashboard Workspace ---
  const totalSales = orders.reduce((sum, o) => o.paymentStatus === 'paid' ? sum + o.total : sum, 0);
  const totalPendingOrders = orders.filter(o => o.orderStatus === 'Pending').length;
  const lowStockProducts = products.filter(p => p.stock <= 5);

  const filteredOrders = orders.filter(o => {
    const matchesStatus = orderStatusFilter === 'all' || o.orderStatus === orderStatusFilter;
    const matchesSearch =
      o.id.toLowerCase().includes(orderSearch.toLowerCase()) ||
      o.customerName.toLowerCase().includes(orderSearch.toLowerCase()) ||
      o.phone.toLowerCase().includes(orderSearch.toLowerCase());
    return matchesStatus && matchesSearch;
  });

  const filteredProductsList = products.filter(p =>
    p.name.toLowerCase().includes(productSearch.toLowerCase()) ||
    p.category.toLowerCase().includes(productSearch.toLowerCase()) ||
    p.sku.toLowerCase().includes(productSearch.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-[#07080c] text-white flex flex-col md:flex-row">
      {/* Left Sidebar Navigation */}
      <aside className="w-full md:w-64 bg-[#0c0d14] border-r border-white/10 flex flex-col justify-between p-4 flex-shrink-0">
        <div>
          {/* Brand Heading */}
          <div className="flex items-center justify-between pb-6 mb-4 border-b border-white/10 pt-2 px-2">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-amber-400 text-black font-extrabold flex items-center justify-center text-sm shadow-md shadow-amber-400/20">
                {settings.websiteName.charAt(0)}
              </div>
              <div className="flex flex-col">
                <span className="font-heading font-bold text-sm text-white tracking-wider uppercase">
                  {settings.websiteName}
                </span>
                <span className="text-[10px] text-amber-400 font-semibold">Admin Center</span>
              </div>
            </div>

            <button
              onClick={onExit}
              title="Return to Public Store"
              className="p-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-neutral-400 hover:text-white transition-colors"
            >
              <ExternalLink className="w-4 h-4" />
            </button>
          </div>

          {/* Navigation Links */}
          <nav className="space-y-1">
            {[
              { id: 'overview', label: 'Dashboard Overview', icon: LayoutDashboard },
              { id: 'settings', label: 'Website Settings', icon: Settings, badge: 'Dynamic' },
              { id: 'products', label: 'Product Catalog', icon: Package, count: products.length },
              { id: 'categories', label: 'Categories', icon: Layers, count: categories.length },
              { id: 'orders', label: 'Orders & Dispatch', icon: ShoppingBag, count: totalPendingOrders, alert: totalPendingOrders > 0 },
              { id: 'inventory', label: 'Stock & Inventory', icon: Boxes, count: lowStockProducts.length, alert: lowStockProducts.length > 0 },
              { id: 'customers', label: 'Customers', icon: Users, count: customers.length },
              { id: 'coupons', label: 'Coupons & Promos', icon: Tag, count: coupons.length },
              { id: 'reviews', label: 'Customer Reviews', icon: Star, count: reviews.filter(r => !r.approved).length },
              { id: 'media', label: 'Media Library', icon: ImageIcon },
            ].map((tab) => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as any)}
                  className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-semibold transition-all ${
                    isActive
                      ? 'bg-amber-400 text-black shadow-lg shadow-amber-400/20 font-bold'
                      : 'text-neutral-400 hover:text-white hover:bg-white/5'
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    <Icon className="w-4 h-4" />
                    <span>{tab.label}</span>
                  </div>

                  {tab.badge && (
                    <span className="px-1.5 py-0.2 rounded bg-amber-400/20 text-amber-300 text-[9px] font-bold uppercase">
                      {tab.badge}
                    </span>
                  )}

                  {tab.count !== undefined && (
                    <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                      isActive
                        ? 'bg-black/20 text-black'
                        : tab.alert
                        ? 'bg-rose-500/20 text-rose-400'
                        : 'bg-white/10 text-neutral-300'
                    }`}>
                      {tab.count}
                    </span>
                  )}
                </button>
              );
            })}
          </nav>
        </div>

        {/* Footer actions */}
        <div className="pt-4 border-t border-white/10 space-y-2">
          <button
            onClick={() => {
              if (window.confirm('Reset all demo products, categories and settings to initial master baseline?')) {
                store.resetToDefaults();
                setSettingsForm(store.getSettings());
              }
            }}
            className="w-full flex items-center gap-2 px-3 py-2 rounded-xl text-xs text-neutral-400 hover:text-amber-400 hover:bg-white/5 transition-colors"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            <span>Reset Demo Baseline</span>
          </button>

          <button
            onClick={() => store.adminLogout()}
            className="w-full flex items-center gap-2 px-3 py-2 rounded-xl text-xs text-rose-400 hover:bg-rose-500/10 transition-colors font-medium"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span>Sign Out Session</span>
          </button>
        </div>
      </aside>

      {/* Main Administrative Content Area */}
      <main className="flex-1 p-4 sm:p-8 overflow-y-auto">
        {/* ==============================================================
            TAB 1: DASHBOARD OVERVIEW
        ============================================================== */}
        {activeTab === 'overview' && (
          <div className="space-y-8 animate-in fade-in duration-200">
            <div>
              <span className="text-xs font-bold uppercase tracking-widest text-amber-400">
                Command Center
              </span>
              <h2 className="font-heading text-2xl font-bold text-white mt-1">
                Executive Store Performance
              </h2>
            </div>

            {/* KPI Cards Row */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="p-5 rounded-2xl glass-panel border border-white/10 flex flex-col justify-between">
                <span className="text-xs font-medium text-neutral-400">Total Settled Sales</span>
                <div className="my-2">
                  <span className="text-2xl sm:text-3xl font-extrabold text-white">
                    {settings.currencySymbol}{totalSales.toLocaleString()}
                  </span>
                </div>
                <span className="text-[11px] text-emerald-400 font-semibold">+18.4% this month</span>
              </div>

              <div className="p-5 rounded-2xl glass-panel border border-white/10 flex flex-col justify-between">
                <span className="text-xs font-medium text-neutral-400">Total Orders Placed</span>
                <div className="my-2">
                  <span className="text-2xl sm:text-3xl font-extrabold text-white">
                    {orders.length}
                  </span>
                </div>
                <span className="text-[11px] text-amber-400 font-semibold">
                  {totalPendingOrders} pending confirmation
                </span>
              </div>

              <div className="p-5 rounded-2xl glass-panel border border-white/10 flex flex-col justify-between">
                <span className="text-xs font-medium text-neutral-400">Active Catalog Items</span>
                <div className="my-2">
                  <span className="text-2xl sm:text-3xl font-extrabold text-white">
                    {products.filter(p => p.active).length}
                  </span>
                </div>
                <span className="text-[11px] text-neutral-400 font-semibold">
                  across {categories.length} luxury collections
                </span>
              </div>

              <div className="p-5 rounded-2xl glass-panel border border-white/10 flex flex-col justify-between">
                <span className="text-xs font-medium text-neutral-400">Low Stock Warnings</span>
                <div className="my-2">
                  <span className="text-2xl sm:text-3xl font-extrabold text-rose-400">
                    {lowStockProducts.length}
                  </span>
                </div>
                <button
                  onClick={() => setActiveTab('inventory')}
                  className="text-[11px] text-neutral-400 hover:text-white underline text-left"
                >
                  Inspect & Replenish →
                </button>
              </div>
            </div>

            {/* Simulated Sales Revenue Trend Visualization */}
            <div className="p-6 rounded-3xl glass-panel border border-white/10">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-heading text-base font-bold text-white">Revenue & Velocity Projection</h3>
                <span className="text-xs text-neutral-400">Fiscal Period: 2026</span>
              </div>

              <div className="h-44 flex items-end gap-2 sm:gap-4 pt-6 pb-2 border-b border-white/10">
                {[
                  { month: 'Jan', val: 45 },
                  { month: 'Feb', val: 58 },
                  { month: 'Mar', val: 72 },
                  { month: 'Apr', val: 65 },
                  { month: 'May', val: 88 },
                  { month: 'Jun', val: 96 },
                  { month: 'Jul', val: 82 },
                  { month: 'Aug', val: 110 },
                  { month: 'Sep', val: 125 },
                  { month: 'Oct', val: 140 },
                  { month: 'Nov', val: 165 },
                  { month: 'Dec', val: 195 },
                ].map((bar) => (
                  <div key={bar.month} className="flex-1 flex flex-col items-center gap-2 group">
                    <div
                      style={{ height: `${(bar.val / 200) * 100}%` }}
                      className="w-full rounded-t-lg bg-gradient-to-t from-amber-500/40 to-amber-400 group-hover:from-amber-400 group-hover:to-amber-300 transition-all shadow-lg"
                    />
                    <span className="text-[10px] text-neutral-400 font-semibold">{bar.month}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Recent Orders Overview */}
            <div className="p-6 rounded-3xl glass-panel border border-white/10">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-heading text-base font-bold text-white">Recent Purchases</h3>
                <button
                  onClick={() => setActiveTab('orders')}
                  className="text-xs text-amber-400 hover:text-amber-300 font-semibold"
                >
                  View All Orders →
                </button>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="text-neutral-400 border-b border-white/10">
                    <tr>
                      <th className="pb-3 font-semibold">Order ID</th>
                      <th className="pb-3 font-semibold">Customer</th>
                      <th className="pb-3 font-semibold">Total</th>
                      <th className="pb-3 font-semibold">Status</th>
                      <th className="pb-3 font-semibold">Payment</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/5">
                    {orders.slice(0, 5).map((o) => (
                      <tr key={o.id} className="hover:bg-white/5 transition-colors">
                        <td className="py-3 font-mono font-bold text-amber-400">{o.id}</td>
                        <td className="py-3 text-white font-medium">{o.customerName}</td>
                        <td className="py-3 font-bold text-white">
                          {settings.currencySymbol}{o.total.toLocaleString()}
                        </td>
                        <td className="py-3">
                          <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                            o.orderStatus === 'Delivered'
                              ? 'bg-emerald-500/20 text-emerald-400'
                              : o.orderStatus === 'Pending'
                              ? 'bg-amber-400/20 text-amber-300'
                              : 'bg-blue-500/20 text-blue-300'
                          }`}>
                            {o.orderStatus}
                          </span>
                        </td>
                        <td className="py-3">
                          <span className="capitalize text-neutral-300">{o.paymentMethod} ({o.paymentStatus})</span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* ==============================================================
            TAB 2: WEBSITE SETTINGS MANAGEMENT (DYNAMIC)
        ============================================================== */}
        {activeTab === 'settings' && (
          <div className="space-y-6 max-w-4xl animate-in fade-in duration-200">
            <div className="flex items-center justify-between">
              <div>
                <span className="text-xs font-bold uppercase tracking-widest text-amber-400">
                  Global Store Configuration
                </span>
                <h2 className="font-heading text-2xl font-bold text-white mt-1">
                  Dynamic Website & Brand Settings
                </h2>
                <p className="text-xs text-neutral-400 mt-1">
                  Any updates saved here immediately propagate to the live website without altering source code.
                </p>
              </div>

              {saveSettingsSuccess && (
                <div className="px-4 py-2 rounded-xl bg-emerald-500/20 border border-emerald-500/40 text-emerald-300 text-xs font-bold flex items-center gap-2 animate-in fade-in">
                  <Check className="w-4 h-4" /> Changes Applied Live!
                </div>
              )}
            </div>

            <form onSubmit={handleSaveSettings} className="space-y-6">
              {/* Brand Essentials */}
              <div className="p-6 rounded-2xl glass-panel border border-white/10 space-y-4">
                <h3 className="font-heading text-sm font-bold text-amber-400 uppercase tracking-wider">
                  Brand Identity
                </h3>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-neutral-300 mb-1">
                      Website / Brand Name
                    </label>
                    <input
                      type="text"
                      required
                      value={settingsForm.websiteName}
                      onChange={(e) => setSettingsForm({ ...settingsForm, websiteName: e.target.value })}
                      className="w-full px-3.5 py-2.5 rounded-xl bg-black/60 border border-white/10 text-white text-xs focus:outline-none focus:border-amber-400"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-neutral-300 mb-1">
                      Brand Tagline
                    </label>
                    <input
                      type="text"
                      value={settingsForm.tagline}
                      onChange={(e) => setSettingsForm({ ...settingsForm, tagline: e.target.value })}
                      className="w-full px-3.5 py-2.5 rounded-xl bg-black/60 border border-white/10 text-white text-xs focus:outline-none focus:border-amber-400"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-neutral-300 mb-1">
                      Logo Image URL (Leave blank for dynamic text insignia)
                    </label>
                    <input
                      type="text"
                      value={settingsForm.logo || ''}
                      onChange={(e) => setSettingsForm({ ...settingsForm, logo: e.target.value })}
                      className="w-full px-3.5 py-2.5 rounded-xl bg-black/60 border border-white/10 text-white text-xs focus:outline-none focus:border-amber-400"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-neutral-300 mb-1">
                      Announcement Bar Banner Text
                    </label>
                    <input
                      type="text"
                      value={settingsForm.announcementText || ''}
                      onChange={(e) => setSettingsForm({ ...settingsForm, announcementText: e.target.value })}
                      className="w-full px-3.5 py-2.5 rounded-xl bg-black/60 border border-white/10 text-white text-xs focus:outline-none focus:border-amber-400"
                    />
                  </div>
                </div>
              </div>

              {/* Hero Banner Dynamic Copy */}
              <div className="p-6 rounded-2xl glass-panel border border-white/10 space-y-4">
                <h3 className="font-heading text-sm font-bold text-amber-400 uppercase tracking-wider">
                  Hero Showcase Presentation
                </h3>

                <div>
                  <label className="block text-xs font-semibold text-neutral-300 mb-1">
                    Hero Headline Title
                  </label>
                  <input
                    type="text"
                    value={settingsForm.heroTitle}
                    onChange={(e) => setSettingsForm({ ...settingsForm, heroTitle: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-black/60 border border-white/10 text-white text-xs focus:outline-none focus:border-amber-400"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-neutral-300 mb-1">
                    Hero Subtitle Description
                  </label>
                  <textarea
                    rows={2}
                    value={settingsForm.heroDescription}
                    onChange={(e) => setSettingsForm({ ...settingsForm, heroDescription: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-black/60 border border-white/10 text-white text-xs focus:outline-none focus:border-amber-400 resize-none"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-neutral-300 mb-1">
                      Primary CTA Button Label
                    </label>
                    <input
                      type="text"
                      value={settingsForm.heroPrimaryButtonText}
                      onChange={(e) => setSettingsForm({ ...settingsForm, heroPrimaryButtonText: e.target.value })}
                      className="w-full px-3.5 py-2.5 rounded-xl bg-black/60 border border-white/10 text-white text-xs focus:outline-none focus:border-amber-400"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-neutral-300 mb-1">
                      Secondary CTA Button Label
                    </label>
                    <input
                      type="text"
                      value={settingsForm.heroSecondaryButtonText}
                      onChange={(e) => setSettingsForm({ ...settingsForm, heroSecondaryButtonText: e.target.value })}
                      className="w-full px-3.5 py-2.5 rounded-xl bg-black/60 border border-white/10 text-white text-xs focus:outline-none focus:border-amber-400"
                    />
                  </div>
                </div>
              </div>

              {/* Delivery Tariffs & Contact */}
              <div className="p-6 rounded-2xl glass-panel border border-white/10 space-y-4">
                <h3 className="font-heading text-sm font-bold text-amber-400 uppercase tracking-wider">
                  Logistics & Contact Information
                </h3>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-neutral-300 mb-1">
                      Delivery Charge Inside Dhaka (৳)
                    </label>
                    <input
                      type="number"
                      value={settingsForm.deliveryDhaka}
                      onChange={(e) => setSettingsForm({ ...settingsForm, deliveryDhaka: Number(e.target.value) })}
                      className="w-full px-3.5 py-2.5 rounded-xl bg-black/60 border border-white/10 text-white text-xs focus:outline-none focus:border-amber-400"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-neutral-300 mb-1">
                      Delivery Charge Outside Dhaka (৳)
                    </label>
                    <input
                      type="number"
                      value={settingsForm.deliveryOutsideDhaka}
                      onChange={(e) => setSettingsForm({ ...settingsForm, deliveryOutsideDhaka: Number(e.target.value) })}
                      className="w-full px-3.5 py-2.5 rounded-xl bg-black/60 border border-white/10 text-white text-xs focus:outline-none focus:border-amber-400"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-neutral-300 mb-1">
                      Customer Service Phone
                    </label>
                    <input
                      type="text"
                      value={settingsForm.phone}
                      onChange={(e) => setSettingsForm({ ...settingsForm, phone: e.target.value })}
                      className="w-full px-3.5 py-2.5 rounded-xl bg-black/60 border border-white/10 text-white text-xs focus:outline-none focus:border-amber-400"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-neutral-300 mb-1">
                      Official Contact Email
                    </label>
                    <input
                      type="email"
                      value={settingsForm.email}
                      onChange={(e) => setSettingsForm({ ...settingsForm, email: e.target.value })}
                      className="w-full px-3.5 py-2.5 rounded-xl bg-black/60 border border-white/10 text-white text-xs focus:outline-none focus:border-amber-400"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-neutral-300 mb-1">
                    Store Flagship Headquarters Address
                  </label>
                  <input
                    type="text"
                    value={settingsForm.address}
                    onChange={(e) => setSettingsForm({ ...settingsForm, address: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-black/60 border border-white/10 text-white text-xs focus:outline-none focus:border-amber-400"
                  />
                </div>
              </div>

              {/* Social Channels */}
              <div className="p-6 rounded-2xl glass-panel border border-white/10 space-y-4">
                <h3 className="font-heading text-sm font-bold text-amber-400 uppercase tracking-wider">
                  Social Channels
                </h3>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div>
                    <label className="block text-[11px] text-neutral-400 mb-1">Facebook URL</label>
                    <input
                      type="text"
                      value={settingsForm.socialLinks.facebook || ''}
                      onChange={(e) => setSettingsForm({
                        ...settingsForm,
                        socialLinks: { ...settingsForm.socialLinks, facebook: e.target.value },
                      })}
                      className="w-full px-3 py-2 rounded-xl bg-black/60 border border-white/10 text-white text-xs"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] text-neutral-400 mb-1">Instagram URL</label>
                    <input
                      type="text"
                      value={settingsForm.socialLinks.instagram || ''}
                      onChange={(e) => setSettingsForm({
                        ...settingsForm,
                        socialLinks: { ...settingsForm.socialLinks, instagram: e.target.value },
                      })}
                      className="w-full px-3 py-2 rounded-xl bg-black/60 border border-white/10 text-white text-xs"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] text-neutral-400 mb-1">WhatsApp Hotline</label>
                    <input
                      type="text"
                      value={settingsForm.socialLinks.whatsapp || ''}
                      onChange={(e) => setSettingsForm({
                        ...settingsForm,
                        socialLinks: { ...settingsForm.socialLinks, whatsapp: e.target.value },
                      })}
                      className="w-full px-3 py-2 rounded-xl bg-black/60 border border-white/10 text-white text-xs"
                    />
                  </div>
                </div>
              </div>

              {/* Save Button */}
              <div className="flex justify-end">
                <button
                  type="submit"
                  className="px-8 py-3.5 rounded-2xl bg-amber-400 hover:bg-amber-300 text-black font-extrabold text-xs uppercase tracking-wider flex items-center gap-2 shadow-xl shadow-amber-400/20 transition-all"
                >
                  <Save className="w-4 h-4" />
                  <span>Save Live Website Settings</span>
                </button>
              </div>
            </form>
          </div>
        )}

        {/* ==============================================================
            TAB 3: PRODUCT CATALOG CRUD
        ============================================================== */}
        {activeTab === 'products' && (
          <div className="space-y-6 animate-in fade-in duration-200">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <span className="text-xs font-bold uppercase tracking-widest text-amber-400">
                  Merchandise & Stock
                </span>
                <h2 className="font-heading text-2xl font-bold text-white mt-1">
                  Product Management ({products.length})
                </h2>
              </div>

              <button
                onClick={() => {
                  setEditingProduct(null);
                  setProductForm({
                    category: categories[0]?.name || 'Cooker & Rice Items',
                    stock: 25,
                    regularPrice: 3500,
                    salePrice: 2900,
                    active: true,
                    featured: true,
                    brand: 'VELORA LUXE',
                  });
                  setIsProductModalOpen(true);
                }}
                className="px-5 py-2.5 rounded-xl bg-amber-400 hover:bg-amber-300 text-black font-bold text-xs flex items-center gap-2 shadow-lg shadow-amber-400/20 transition-all"
              >
                <Plus className="w-4 h-4" /> Add New Product
              </button>
            </div>

            {/* Search filter */}
            <div className="relative max-w-md">
              <Search className="w-4 h-4 text-neutral-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Search by title, SKU, or collection..."
                value={productSearch}
                onChange={(e) => setProductSearch(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-black/60 border border-white/10 text-white text-xs focus:outline-none focus:border-amber-400"
              />
            </div>

            {/* Product Table */}
            <div className="rounded-2xl glass-panel border border-white/10 overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-black/50 text-neutral-400 border-b border-white/10">
                    <tr>
                      <th className="p-3.5">Product</th>
                      <th className="p-3.5">Category</th>
                      <th className="p-3.5">SKU</th>
                      <th className="p-3.5">Pricing</th>
                      <th className="p-3.5">Stock</th>
                      <th className="p-3.5">Status</th>
                      <th className="p-3.5 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/5">
                    {filteredProductsList.map((prod) => (
                      <tr key={prod.id} className="hover:bg-white/5 transition-colors">
                        <td className="p-3.5">
                          <div className="flex items-center gap-3">
                            <img
                              src={prod.images[0]}
                              alt={prod.name}
                              className="w-10 h-10 rounded-lg object-cover bg-neutral-900 border border-white/10"
                            />
                            <div>
                              <span className="font-bold text-white block line-clamp-1">{prod.name}</span>
                              <span className="text-[10px] text-neutral-500 font-mono">{prod.brand}</span>
                            </div>
                          </div>
                        </td>
                        <td className="p-3.5 text-neutral-300 font-medium">{prod.category}</td>
                        <td className="p-3.5 font-mono text-neutral-400">{prod.sku}</td>
                        <td className="p-3.5">
                          <span className="font-bold text-white">
                            {settings.currencySymbol}{prod.salePrice.toLocaleString()}
                          </span>
                          {prod.regularPrice > prod.salePrice && (
                            <span className="text-[10px] text-neutral-500 line-through block">
                              {settings.currencySymbol}{prod.regularPrice.toLocaleString()}
                            </span>
                          )}
                        </td>
                        <td className="p-3.5">
                          <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                            prod.stock <= 5 ? 'bg-rose-500/20 text-rose-400' : 'bg-emerald-500/20 text-emerald-400'
                          }`}>
                            {prod.stock} units
                          </span>
                        </td>
                        <td className="p-3.5">
                          <button
                            onClick={() => store.updateProduct(prod.id, { active: !prod.active })}
                            className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase ${
                              prod.active ? 'bg-emerald-500/10 text-emerald-400' : 'bg-neutral-800 text-neutral-500'
                            }`}
                          >
                            {prod.active ? 'Active' : 'Draft'}
                          </button>
                        </td>
                        <td className="p-3.5 text-right space-x-1">
                          <button
                            onClick={() => {
                              setEditingProduct(prod);
                              setProductForm(prod);
                              setIsProductModalOpen(true);
                            }}
                            className="p-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-neutral-300 hover:text-white"
                            title="Edit"
                          >
                            <Edit3 className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => store.duplicateProduct(prod.id)}
                            className="p-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-neutral-300 hover:text-white"
                            title="Duplicate"
                          >
                            <Copy className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => {
                              if (window.confirm(`Delete ${prod.name}?`)) {
                                store.deleteProduct(prod.id);
                              }
                            }}
                            className="p-1.5 rounded-lg bg-rose-500/10 hover:bg-rose-500/20 text-rose-400"
                            title="Delete"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* ==============================================================
            TAB 4: CATEGORY MANAGEMENT
        ============================================================== */}
        {activeTab === 'categories' && (
          <div className="space-y-6 animate-in fade-in duration-200">
            <div className="flex items-center justify-between">
              <div>
                <span className="text-xs font-bold uppercase tracking-widest text-amber-400">
                  Department Taxonomies
                </span>
                <h2 className="font-heading text-2xl font-bold text-white mt-1">
                  Collection Categories ({categories.length})
                </h2>
              </div>

              <button
                onClick={() => {
                  setCategoryForm({});
                  setIsCategoryModalOpen(true);
                }}
                className="px-5 py-2.5 rounded-xl bg-amber-400 hover:bg-amber-300 text-black font-bold text-xs flex items-center gap-2 shadow-lg shadow-amber-400/20 transition-all"
              >
                <Plus className="w-4 h-4" /> Add Category
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {categories.map((cat) => (
                <div key={cat.id} className="p-5 rounded-2xl glass-panel border border-white/10 flex flex-col justify-between">
                  <div>
                    <div className="relative h-36 rounded-xl overflow-hidden mb-4 bg-neutral-900">
                      <img src={cat.image} alt={cat.name} className="w-full h-full object-cover" />
                      <span className="absolute bottom-2 left-2 px-2.5 py-0.5 rounded-md bg-black/70 text-[10px] font-bold text-amber-300">
                        {cat.productCount} Products
                      </span>
                    </div>

                    <h3 className="font-heading text-base font-bold text-white mb-1">{cat.name}</h3>
                    <p className="text-xs text-neutral-400 line-clamp-2 mb-4">{cat.description}</p>
                  </div>

                  <div className="pt-3 border-t border-white/10 flex items-center justify-between">
                    <span className="text-[10px] font-mono text-neutral-500">/{cat.slug}</span>
                    <button
                      onClick={() => {
                        if (window.confirm(`Delete ${cat.name}?`)) {
                          store.deleteCategory(cat.id);
                        }
                      }}
                      className="p-1.5 rounded-lg text-rose-400 hover:bg-rose-500/10 transition-colors"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ==============================================================
            TAB 5: ORDER MANAGEMENT
        ============================================================== */}
        {activeTab === 'orders' && (
          <div className="space-y-6 animate-in fade-in duration-200">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <span className="text-xs font-bold uppercase tracking-widest text-amber-400">
                  Transactions & Fulfillment
                </span>
                <h2 className="font-heading text-2xl font-bold text-white mt-1">
                  Customer Orders ({orders.length})
                </h2>
              </div>
            </div>

            {/* Filter bar */}
            <div className="flex flex-wrap items-center gap-3">
              <div className="relative flex-1 min-w-[200px]">
                <Search className="w-4 h-4 text-neutral-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  placeholder="Filter by Order ID, Phone or Name..."
                  value={orderSearch}
                  onChange={(e) => setOrderSearch(e.target.value)}
                  className="w-full pl-9 pr-3 py-2 rounded-xl bg-black/60 border border-white/10 text-white text-xs focus:outline-none focus:border-amber-400"
                />
              </div>

              <select
                value={orderStatusFilter}
                onChange={(e) => setOrderStatusFilter(e.target.value)}
                className="px-3 py-2 rounded-xl bg-black/60 border border-white/10 text-white text-xs focus:outline-none focus:border-amber-400"
              >
                <option value="all">All Statuses</option>
                <option value="Pending">Pending</option>
                <option value="Confirmed">Confirmed</option>
                <option value="Processing">Processing</option>
                <option value="Shipped">Shipped</option>
                <option value="Delivered">Delivered</option>
                <option value="Cancelled">Cancelled</option>
              </select>
            </div>

            {/* Orders Table */}
            <div className="rounded-2xl glass-panel border border-white/10 overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-black/50 text-neutral-400 border-b border-white/10">
                    <tr>
                      <th className="p-3.5">Order ID & Date</th>
                      <th className="p-3.5">Customer & Phone</th>
                      <th className="p-3.5">Delivery Destination</th>
                      <th className="p-3.5">Total & Method</th>
                      <th className="p-3.5">Status Flow</th>
                      <th className="p-3.5">Payment</th>
                      <th className="p-3.5 text-right">Invoice</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/5">
                    {filteredOrders.map((ord) => (
                      <tr key={ord.id} className="hover:bg-white/5 transition-colors">
                        <td className="p-3.5">
                          <span className="font-mono font-bold text-amber-400 block">{ord.id}</span>
                          <span className="text-[10px] text-neutral-500">
                            {new Date(ord.createdAt).toLocaleDateString()}
                          </span>
                        </td>
                        <td className="p-3.5">
                          <span className="font-bold text-white block">{ord.customerName}</span>
                          <span className="text-[10px] text-neutral-400">{ord.phone}</span>
                        </td>
                        <td className="p-3.5 text-neutral-300">
                          <span className="block truncate max-w-[200px]">{ord.fullAddress}</span>
                          <span className="text-[10px] text-neutral-400 font-semibold">{ord.district}</span>
                        </td>
                        <td className="p-3.5">
                          <span className="font-bold text-white block">
                            {settings.currencySymbol}{ord.total.toLocaleString()}
                          </span>
                          <span className="text-[10px] text-neutral-400 uppercase">{ord.paymentMethod}</span>
                        </td>
                        <td className="p-3.5">
                          <select
                            value={ord.orderStatus}
                            onChange={(e: any) => store.updateOrderStatus(ord.id, e.target.value)}
                            className={`px-2 py-1 rounded-lg text-xs font-bold border focus:outline-none ${
                              ord.orderStatus === 'Delivered'
                                ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/40'
                                : ord.orderStatus === 'Pending'
                                ? 'bg-amber-400/20 text-amber-300 border-amber-400/40'
                                : ord.orderStatus === 'Cancelled'
                                ? 'bg-rose-500/20 text-rose-400 border-rose-500/40'
                                : 'bg-blue-500/20 text-blue-300 border-blue-500/40'
                            }`}
                          >
                            <option value="Pending">Pending</option>
                            <option value="Confirmed">Confirmed</option>
                            <option value="Processing">Processing</option>
                            <option value="Shipped">Shipped</option>
                            <option value="Delivered">Delivered</option>
                            <option value="Cancelled">Cancelled</option>
                          </select>
                        </td>
                        <td className="p-3.5">
                          <button
                            onClick={() => store.updatePaymentStatus(ord.id, ord.paymentStatus === 'paid' ? 'pending' : 'paid')}
                            className={`px-2.5 py-1 rounded text-[10px] font-bold uppercase ${
                              ord.paymentStatus === 'paid' ? 'bg-emerald-500/20 text-emerald-400' : 'bg-amber-400/10 text-amber-300'
                            }`}
                          >
                            {ord.paymentStatus}
                          </button>
                        </td>
                        <td className="p-3.5 text-right">
                          <button
                            onClick={() => setSelectedOrderForInvoice(ord)}
                            className="p-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-amber-400 hover:text-amber-300 inline-flex items-center gap-1"
                            title="Inspect Order Details & Print"
                          >
                            <Printer className="w-3.5 h-3.5" />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* ==============================================================
            TAB 6: INVENTORY MANAGEMENT & LOW STOCK ALERTS
        ============================================================== */}
        {activeTab === 'inventory' && (
          <div className="space-y-6 animate-in fade-in duration-200">
            <div>
              <span className="text-xs font-bold uppercase tracking-widest text-amber-400">
                Logistics & Warehouse
              </span>
              <h2 className="font-heading text-2xl font-bold text-white mt-1">
                Real-Time Inventory Levels
              </h2>
            </div>

            {/* Low stock alert banner */}
            {lowStockProducts.length > 0 && (
              <div className="p-4 rounded-2xl bg-rose-500/10 border border-rose-500/20 text-rose-300 text-xs flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4 text-rose-400 flex-shrink-0" />
                  <span>
                    Attention: <strong>{lowStockProducts.length} items</strong> have critical stock (≤ 5 units).
                  </span>
                </div>
              </div>
            )}

            <div className="rounded-2xl glass-panel border border-white/10 overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-black/50 text-neutral-400 border-b border-white/10">
                    <tr>
                      <th className="p-3.5">Product</th>
                      <th className="p-3.5">SKU</th>
                      <th className="p-3.5">Current Stock</th>
                      <th className="p-3.5">Status</th>
                      <th className="p-3.5 text-right">Quick Restock</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/5">
                    {products.map((prod) => (
                      <tr key={prod.id} className="hover:bg-white/5 transition-colors">
                        <td className="p-3.5 font-bold text-white">{prod.name}</td>
                        <td className="p-3.5 font-mono text-neutral-400">{prod.sku}</td>
                        <td className="p-3.5 font-mono text-white text-sm font-bold">{prod.stock}</td>
                        <td className="p-3.5">
                          {prod.stock === 0 ? (
                            <span className="text-rose-400 font-bold">Out of Stock</span>
                          ) : prod.stock <= 5 ? (
                            <span className="text-amber-400 font-bold">Low Reserve</span>
                          ) : (
                            <span className="text-emerald-400 font-bold">Optimal</span>
                          )}
                        </td>
                        <td className="p-3.5 text-right space-x-1.5">
                          <button
                            onClick={() => handleStockQuickUpdate(prod.id, 5)}
                            className="px-2.5 py-1 rounded-lg bg-white/5 hover:bg-white/10 text-white font-semibold"
                          >
                            +5
                          </button>
                          <button
                            onClick={() => handleStockQuickUpdate(prod.id, 20)}
                            className="px-2.5 py-1 rounded-lg bg-amber-400/20 hover:bg-amber-400/30 text-amber-300 font-bold"
                          >
                            +20 Restock
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* ==============================================================
            TAB 7: CUSTOMERS
        ============================================================== */}
        {activeTab === 'customers' && (
          <div className="space-y-6 animate-in fade-in duration-200">
            <div>
              <span className="text-xs font-bold uppercase tracking-widest text-amber-400">
                Audience & Retention
              </span>
              <h2 className="font-heading text-2xl font-bold text-white mt-1">
                Customer Database ({customers.length})
              </h2>
            </div>

            <div className="rounded-2xl glass-panel border border-white/10 overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-black/50 text-neutral-400 border-b border-white/10">
                    <tr>
                      <th className="p-3.5">Customer</th>
                      <th className="p-3.5">Phone / Contact</th>
                      <th className="p-3.5">Orders</th>
                      <th className="p-3.5">Total Spent</th>
                      <th className="p-3.5">Status</th>
                      <th className="p-3.5 text-right">Access</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/5">
                    {customers.map((cust) => (
                      <tr key={cust.id} className="hover:bg-white/5 transition-colors">
                        <td className="p-3.5 font-bold text-white">{cust.name}</td>
                        <td className="p-3.5 text-neutral-300">{cust.phone}</td>
                        <td className="p-3.5 text-neutral-300">{cust.totalOrders} purchases</td>
                        <td className="p-3.5 font-bold text-amber-400">
                          {settings.currencySymbol}{cust.totalSpending.toLocaleString()}
                        </td>
                        <td className="p-3.5">
                          <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                            cust.status === 'active' ? 'bg-emerald-500/20 text-emerald-400' : 'bg-rose-500/20 text-rose-400'
                          }`}>
                            {cust.status}
                          </span>
                        </td>
                        <td className="p-3.5 text-right">
                          <button
                            onClick={() => store.toggleCustomerStatus(cust.id)}
                            className={`px-3 py-1 rounded-lg text-xs font-semibold ${
                              cust.status === 'active' ? 'text-rose-400 hover:bg-rose-500/10' : 'text-emerald-400 hover:bg-emerald-500/10'
                            }`}
                          >
                            {cust.status === 'active' ? 'Block Account' : 'Unblock Account'}
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* ==============================================================
            TAB 8: COUPONS & PROMOTION SYSTEM
        ============================================================== */}
        {activeTab === 'coupons' && (
          <div className="space-y-6 animate-in fade-in duration-200">
            <div className="flex items-center justify-between">
              <div>
                <span className="text-xs font-bold uppercase tracking-widest text-amber-400">
                  Marketing & Discounts
                </span>
                <h2 className="font-heading text-2xl font-bold text-white mt-1">
                  Promotional Coupons ({coupons.length})
                </h2>
              </div>

              <button
                onClick={() => setIsCouponModalOpen(true)}
                className="px-5 py-2.5 rounded-xl bg-amber-400 hover:bg-amber-300 text-black font-bold text-xs flex items-center gap-2 shadow-lg shadow-amber-400/20 transition-all"
              >
                <Plus className="w-4 h-4" /> Create Coupon
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {coupons.map((coup) => (
                <div key={coup.id} className="p-5 rounded-2xl glass-panel border border-white/10 flex flex-col justify-between">
                  <div>
                    <div className="flex items-center justify-between mb-3">
                      <span className="px-3 py-1 rounded-lg bg-amber-400/20 text-amber-300 font-mono font-extrabold text-sm tracking-wider border border-amber-400/30">
                        {coup.code}
                      </span>
                      <button
                        onClick={() => store.updateCoupon(coup.id, { active: !coup.active })}
                        className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded ${
                          coup.active ? 'bg-emerald-500/20 text-emerald-400' : 'bg-neutral-800 text-neutral-500'
                        }`}
                      >
                        {coup.active ? 'Active' : 'Inactive'}
                      </button>
                    </div>

                    <div className="space-y-1 text-xs text-neutral-300 mb-4">
                      <p>
                        Discount:{' '}
                        <strong>
                          {coup.discountType === 'percentage' ? `${coup.discountValue}% OFF` : `৳${coup.discountValue} FLAT`}
                        </strong>
                      </p>
                      <p>Min Order: ৳{coup.minOrder.toLocaleString()}</p>
                      <p>Max Cap: ৳{coup.maxDiscount.toLocaleString()}</p>
                      <p className="text-neutral-500 text-[10px]">Valid through: {coup.expiryDate}</p>
                    </div>
                  </div>

                  <div className="pt-3 border-t border-white/10 flex items-center justify-between">
                    <span className="text-[10px] text-neutral-400">{coup.usageCount} times redeemed</span>
                    <button
                      onClick={() => store.deleteCoupon(coup.id)}
                      className="p-1 rounded text-rose-400 hover:bg-rose-500/10"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ==============================================================
            TAB 9: REVIEWS MANAGEMENT
        ============================================================== */}
        {activeTab === 'reviews' && (
          <div className="space-y-6 animate-in fade-in duration-200">
            <div>
              <span className="text-xs font-bold uppercase tracking-widest text-amber-400">
                Moderation Queue
              </span>
              <h2 className="font-heading text-2xl font-bold text-white mt-1">
                Customer Reviews & Testimonials ({reviews.length})
              </h2>
            </div>

            <div className="space-y-3">
              {reviews.map((rev) => (
                <div key={rev.id} className="p-4 rounded-2xl glass-panel border border-white/10 flex items-start justify-between gap-4">
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <span className="font-bold text-xs text-white">{rev.customerName}</span>
                      <span className="text-neutral-500 text-[10px]">on {rev.productName}</span>
                      <div className="flex text-amber-400 text-xs">
                        {[...Array(rev.rating)].map((_, i) => (
                          <Star key={i} className="w-3 h-3 fill-current" />
                        ))}
                      </div>
                    </div>
                    <p className="text-xs text-neutral-300 leading-relaxed mb-2">{rev.comment}</p>
                    <span className="text-[10px] text-neutral-500 font-mono">
                      {new Date(rev.createdAt).toLocaleDateString()}
                    </span>
                  </div>

                  <div className="flex items-center gap-2 flex-shrink-0">
                    <button
                      onClick={() => store.setReviewApproval(rev.id, !rev.approved)}
                      className={`px-3 py-1.5 rounded-xl text-xs font-semibold ${
                        rev.approved
                          ? 'bg-emerald-500/20 text-emerald-400'
                          : 'bg-amber-400 text-black font-bold'
                      }`}
                    >
                      {rev.approved ? 'Approved' : 'Approve Review'}
                    </button>
                    <button
                      onClick={() => store.deleteReview(rev.id)}
                      className="p-2 rounded-xl text-rose-400 hover:bg-rose-500/10"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ==============================================================
            TAB 10: MEDIA LIBRARY
        ============================================================== */}
        {activeTab === 'media' && (
          <div className="space-y-6 animate-in fade-in duration-200">
            <div>
              <span className="text-xs font-bold uppercase tracking-widest text-amber-400">
                Asset Repository
              </span>
              <h2 className="font-heading text-2xl font-bold text-white mt-1">
                Media Library & Product Images ({media.length})
              </h2>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-6 gap-4">
              {media.map((med) => (
                <div key={med.id} className="p-3 rounded-2xl glass-panel border border-white/10 flex flex-col group">
                  <div className="relative aspect-square rounded-xl overflow-hidden bg-neutral-900 mb-2">
                    <img src={med.url} alt={med.name} className="w-full h-full object-cover" />
                  </div>
                  <span className="text-xs font-semibold text-white truncate mb-1">{med.name}</span>
                  <button
                    onClick={() => {
                      navigator.clipboard?.writeText(med.url);
                      alert('Image URL copied to clipboard!');
                    }}
                    className="text-[10px] text-amber-400 hover:text-amber-300 font-semibold text-left underline"
                  >
                    Copy URL
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}
      </main>

      {/* --- PRODUCT EDIT / CREATE MODAL --- */}
      {isProductModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 overflow-y-auto">
          <div className="fixed inset-0 bg-black/85 backdrop-blur-md" onClick={() => setIsProductModalOpen(false)} />
          <div className="relative w-full max-w-2xl bg-[#0e1017] rounded-3xl border border-white/15 p-6 sm:p-8 shadow-2xl z-10 my-8 max-h-[90vh] overflow-y-auto">
            <h3 className="font-heading text-xl font-bold text-white mb-4">
              {editingProduct ? 'Edit Catalog Product' : 'Add New Product to Catalog'}
            </h3>

            <form onSubmit={handleSaveProduct} className="space-y-4 text-xs">
              <div>
                <label className="block text-neutral-300 font-semibold mb-1">Product Title</label>
                <input
                  type="text"
                  required
                  value={productForm.name || ''}
                  onChange={(e) => setProductForm({ ...productForm, name: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl bg-black/60 border border-white/10 text-white"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-neutral-300 font-semibold mb-1">Category</label>
                  <select
                    value={productForm.category || categories[0]?.name}
                    onChange={(e) => setProductForm({ ...productForm, category: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl bg-black/60 border border-white/10 text-white"
                  >
                    {categories.map((c) => (
                      <option key={c.id} value={c.name}>{c.name}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-neutral-300 font-semibold mb-1">SKU Code</label>
                  <input
                    type="text"
                    value={productForm.sku || ''}
                    onChange={(e) => setProductForm({ ...productForm, sku: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl bg-black/60 border border-white/10 text-white"
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block text-neutral-300 font-semibold mb-1">Regular Price (৳)</label>
                  <input
                    type="number"
                    value={productForm.regularPrice || ''}
                    onChange={(e) => setProductForm({ ...productForm, regularPrice: Number(e.target.value) })}
                    className="w-full px-3 py-2 rounded-xl bg-black/60 border border-white/10 text-white"
                  />
                </div>

                <div>
                  <label className="block text-neutral-300 font-semibold mb-1">Sale Price (৳)</label>
                  <input
                    type="number"
                    required
                    value={productForm.salePrice || ''}
                    onChange={(e) => setProductForm({ ...productForm, salePrice: Number(e.target.value) })}
                    className="w-full px-3 py-2 rounded-xl bg-black/60 border border-white/10 text-white"
                  />
                </div>

                <div>
                  <label className="block text-neutral-300 font-semibold mb-1">Stock Quantity</label>
                  <input
                    type="number"
                    value={productForm.stock || 0}
                    onChange={(e) => setProductForm({ ...productForm, stock: Number(e.target.value) })}
                    className="w-full px-3 py-2 rounded-xl bg-black/60 border border-white/10 text-white"
                  />
                </div>
              </div>

              <div>
                <label className="block text-neutral-300 font-semibold mb-1">Primary Image URL</label>
                <input
                  type="text"
                  value={productForm.images?.[0] || ''}
                  onChange={(e) => setProductForm({ ...productForm, images: [e.target.value] })}
                  className="w-full px-3 py-2 rounded-xl bg-black/60 border border-white/10 text-white"
                />
              </div>

              <div>
                <label className="block text-neutral-300 font-semibold mb-1">Short Description</label>
                <input
                  type="text"
                  value={productForm.shortDescription || ''}
                  onChange={(e) => setProductForm({ ...productForm, shortDescription: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl bg-black/60 border border-white/10 text-white"
                />
              </div>

              {/* Health and Medicine Fields */}
              <div className="p-4 rounded-xl bg-white/5 border border-white/10 space-y-3">
                <span className="font-bold text-amber-400 block">Health, Organics & Compliance Details (Optional)</span>
                <div className="grid grid-cols-2 gap-2">
                  <input
                    type="text"
                    placeholder="Manufacturer (e.g. Apex Herbal Lab)"
                    value={productForm.manufacturer || ''}
                    onChange={(e) => setProductForm({ ...productForm, manufacturer: e.target.value })}
                    className="px-3 py-2 rounded-lg bg-black/60 border border-white/10 text-white"
                  />
                  <input
                    type="text"
                    placeholder="Batch Identifier (e.g. VEL-ORG-2026)"
                    value={productForm.batchNumber || ''}
                    onChange={(e) => setProductForm({ ...productForm, batchNumber: e.target.value })}
                    className="px-3 py-2 rounded-lg bg-black/60 border border-white/10 text-white"
                  />
                </div>
                <input
                  type="text"
                  placeholder="Usage instructions (e.g. Take 10ml with lukewarm water)"
                  value={productForm.usageInstructions || ''}
                  onChange={(e) => setProductForm({ ...productForm, usageInstructions: e.target.value })}
                  className="w-full px-3 py-2 rounded-lg bg-black/60 border border-white/10 text-white"
                />
              </div>

              <div className="flex items-center gap-4">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={productForm.featured}
                    onChange={(e) => setProductForm({ ...productForm, featured: e.target.checked })}
                  />
                  <span>Show in Featured Section</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={productForm.bestseller}
                    onChange={(e) => setProductForm({ ...productForm, bestseller: e.target.checked })}
                  />
                  <span>Bestseller Ribbon</span>
                </label>
              </div>

              <div className="flex justify-end gap-2 pt-4">
                <button
                  type="button"
                  onClick={() => setIsProductModalOpen(false)}
                  className="px-4 py-2 rounded-xl bg-white/10 text-neutral-300"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-6 py-2 rounded-xl bg-amber-400 text-black font-bold"
                >
                  Save Product
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* --- INVOICE VIEW MODAL --- */}
      {selectedOrderForInvoice && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 overflow-y-auto">
          <div className="fixed inset-0 bg-black/85 backdrop-blur-md" onClick={() => setSelectedOrderForInvoice(null)} />
          <div className="relative w-full max-w-xl bg-white text-black rounded-3xl p-8 shadow-2xl z-10 my-8">
            <div className="flex items-center justify-between pb-4 border-b border-neutral-200 mb-6">
              <div>
                <h2 className="text-xl font-extrabold uppercase tracking-wider">{settings.websiteName}</h2>
                <p className="text-xs text-neutral-500">Official Purchase Invoice</p>
              </div>
              <div className="text-right">
                <span className="font-mono text-sm font-bold block">{selectedOrderForInvoice.id}</span>
                <span className="text-xs text-neutral-500">
                  {new Date(selectedOrderForInvoice.createdAt).toLocaleDateString()}
                </span>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4 text-xs mb-6">
              <div>
                <span className="font-bold text-neutral-500 uppercase block mb-1">Customer Details</span>
                <p className="font-bold text-sm">{selectedOrderForInvoice.customerName}</p>
                <p>{selectedOrderForInvoice.phone}</p>
                <p className="text-neutral-600">{selectedOrderForInvoice.email}</p>
              </div>
              <div>
                <span className="font-bold text-neutral-500 uppercase block mb-1">Delivery Address</span>
                <p>{selectedOrderForInvoice.fullAddress}</p>
                <p>{selectedOrderForInvoice.district}, Bangladesh</p>
              </div>
            </div>

            <table className="w-full text-left text-xs mb-6 border-y border-neutral-200">
              <thead>
                <tr className="border-b border-neutral-200">
                  <th className="py-2">Item</th>
                  <th className="py-2">Qty</th>
                  <th className="py-2 text-right">Amount</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-100">
                {selectedOrderForInvoice.items.map((it, idx) => (
                  <tr key={idx}>
                    <td className="py-2 font-medium">{it.productName}</td>
                    <td className="py-2">{it.quantity}</td>
                    <td className="py-2 text-right font-mono">
                      {settings.currencySymbol}{(it.price * it.quantity).toLocaleString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            <div className="space-y-1 text-xs text-right mb-6">
              <div>Subtotal: {settings.currencySymbol}{selectedOrderForInvoice.subtotal.toLocaleString()}</div>
              <div>Delivery: {settings.currencySymbol}{selectedOrderForInvoice.deliveryCharge}</div>
              <div className="text-base font-extrabold border-t border-neutral-200 pt-1">
                Total Paid/Due: {settings.currencySymbol}{selectedOrderForInvoice.total.toLocaleString()}
              </div>
            </div>

            <div className="flex gap-2">
              <button
                onClick={() => window.print()}
                className="flex-1 py-2.5 rounded-xl bg-black text-white font-bold text-xs"
              >
                Print Invoice
              </button>
              <button
                onClick={() => setSelectedOrderForInvoice(null)}
                className="px-4 py-2.5 rounded-xl bg-neutral-200 font-bold text-xs text-neutral-800"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* --- ADD CATEGORY MODAL --- */}
      {isCategoryModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="fixed inset-0 bg-black/85" onClick={() => setIsCategoryModalOpen(false)} />
          <div className="relative w-full max-w-md bg-[#0e1017] rounded-3xl border border-white/15 p-6 z-10 text-xs space-y-4">
            <h3 className="text-base font-bold text-white">Create New Category</h3>
            <form onSubmit={handleSaveCategory} className="space-y-3">
              <input
                type="text"
                required
                placeholder="Category Name"
                value={categoryForm.name || ''}
                onChange={(e) => setCategoryForm({ ...categoryForm, name: e.target.value })}
                className="w-full px-3 py-2 rounded-xl bg-black/60 border border-white/10 text-white"
              />
              <input
                type="text"
                placeholder="Image URL"
                value={categoryForm.image || ''}
                onChange={(e) => setCategoryForm({ ...categoryForm, image: e.target.value })}
                className="w-full px-3 py-2 rounded-xl bg-black/60 border border-white/10 text-white"
              />
              <textarea
                placeholder="Short Description"
                rows={2}
                value={categoryForm.description || ''}
                onChange={(e) => setCategoryForm({ ...categoryForm, description: e.target.value })}
                className="w-full px-3 py-2 rounded-xl bg-black/60 border border-white/10 text-white"
              />
              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsCategoryModalOpen(false)}
                  className="px-4 py-2 rounded-xl bg-white/10 text-neutral-400"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-amber-400 text-black font-bold"
                >
                  Save
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* --- CREATE COUPON MODAL --- */}
      {isCouponModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="fixed inset-0 bg-black/85" onClick={() => setIsCouponModalOpen(false)} />
          <div className="relative w-full max-w-md bg-[#0e1017] rounded-3xl border border-white/15 p-6 z-10 text-xs space-y-4">
            <h3 className="text-base font-bold text-white">Create Promotional Coupon</h3>
            <form onSubmit={handleSaveCoupon} className="space-y-3">
              <input
                type="text"
                required
                placeholder="Coupon Code (e.g. VELORA20)"
                value={couponForm.code || ''}
                onChange={(e) => setCouponForm({ ...couponForm, code: e.target.value.toUpperCase() })}
                className="w-full px-3 py-2 rounded-xl bg-black/60 border border-white/10 text-white uppercase"
              />
              <div className="grid grid-cols-2 gap-2">
                <select
                  value={couponForm.discountType}
                  onChange={(e: any) => setCouponForm({ ...couponForm, discountType: e.target.value })}
                  className="px-3 py-2 rounded-xl bg-black/60 border border-white/10 text-white"
                >
                  <option value="percentage">Percentage (%)</option>
                  <option value="fixed">Fixed Cash (৳)</option>
                </select>
                <input
                  type="number"
                  required
                  placeholder="Discount Value"
                  value={couponForm.discountValue || ''}
                  onChange={(e) => setCouponForm({ ...couponForm, discountValue: Number(e.target.value) })}
                  className="px-3 py-2 rounded-xl bg-black/60 border border-white/10 text-white"
                />
              </div>
              <input
                type="number"
                placeholder="Minimum Order Amount (৳)"
                value={couponForm.minOrder || ''}
                onChange={(e) => setCouponForm({ ...couponForm, minOrder: Number(e.target.value) })}
                className="w-full px-3 py-2 rounded-xl bg-black/60 border border-white/10 text-white"
              />
              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsCouponModalOpen(false)}
                  className="px-4 py-2 rounded-xl bg-white/10 text-neutral-400"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-amber-400 text-black font-bold"
                >
                  Create
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
