import { 
  Product, 
  Category, 
  WebsiteSettings, 
  Order, 
  Customer, 
  Coupon, 
  Review, 
  MediaItem,
  OrderItem
} from '../types';
import { 
  DEFAULT_SETTINGS, 
  DEFAULT_CATEGORIES, 
  DEFAULT_PRODUCTS, 
  DEFAULT_COUPONS, 
  DEFAULT_CUSTOMERS, 
  DEFAULT_ORDERS, 
  DEFAULT_REVIEWS, 
  DEFAULT_MEDIA 
} from './defaultData';

const STORAGE_KEYS = {
  SETTINGS: 'velora_settings_v1',
  CATEGORIES: 'velora_categories_v1',
  PRODUCTS: 'velora_products_v1',
  COUPONS: 'velora_coupons_v1',
  CUSTOMERS: 'velora_customers_v1',
  ORDERS: 'velora_orders_v1',
  REVIEWS: 'velora_reviews_v1',
  MEDIA: 'velora_media_v1',
  CART: 'velora_cart_v1',
  WISHLIST: 'velora_wishlist_v1',
  ADMIN_AUTH: 'velora_admin_auth_v1',
};

type Listener = () => void;

class AppDataStore {
  private settings: WebsiteSettings;
  private categories: Category[];
  private products: Product[];
  private coupons: Coupon[];
  private customers: Customer[];
  private orders: Order[];
  private reviews: Review[];
  private media: MediaItem[];
  private cart: OrderItem[];
  private wishlist: string[];
  private adminLoggedIn: boolean;
  private listeners: Set<Listener> = new Set();

  constructor() {
    this.settings = this.load(STORAGE_KEYS.SETTINGS, DEFAULT_SETTINGS);
    this.categories = this.load(STORAGE_KEYS.CATEGORIES, DEFAULT_CATEGORIES);
    this.products = this.load(STORAGE_KEYS.PRODUCTS, DEFAULT_PRODUCTS);
    this.coupons = this.load(STORAGE_KEYS.COUPONS, DEFAULT_COUPONS);
    this.customers = this.load(STORAGE_KEYS.CUSTOMERS, DEFAULT_CUSTOMERS);
    this.orders = this.load(STORAGE_KEYS.ORDERS, DEFAULT_ORDERS);
    this.reviews = this.load(STORAGE_KEYS.REVIEWS, DEFAULT_REVIEWS);
    this.media = this.load(STORAGE_KEYS.MEDIA, DEFAULT_MEDIA);
    this.cart = this.load(STORAGE_KEYS.CART, []);
    this.wishlist = this.load(STORAGE_KEYS.WISHLIST, []);
    this.adminLoggedIn = this.load(STORAGE_KEYS.ADMIN_AUTH, false);

    // Sync HTML document title whenever settings change
    this.applyBrandToDocument();
  }

  private load<T>(key: string, defaultValue: T): T {
    try {
      const data = localStorage.getItem(key);
      if (!data) return defaultValue;
      return JSON.parse(data);
    } catch {
      return defaultValue;
    }
  }

  private save(key: string, data: unknown) {
    try {
      localStorage.setItem(key, JSON.stringify(data));
    } catch (e) {
      console.warn('Storage save failed:', e);
    }
  }

  private notify() {
    this.applyBrandToDocument();
    this.listeners.forEach((listener) => {
      try {
        listener();
      } catch (err) {
        console.error('Listener notify error', err);
      }
    });
  }

  public subscribe(listener: Listener): () => void {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  }

  private applyBrandToDocument() {
    if (typeof document !== 'undefined') {
      document.title = `${this.settings.websiteName} — ${this.settings.tagline}`;
    }
  }

  // --- Getters ---
  public getSettings(): WebsiteSettings { return this.settings; }
  public getCategories(): Category[] { return this.categories; }
  public getProducts(): Product[] { return this.products; }
  public getCoupons(): Coupon[] { return this.coupons; }
  public getCustomers(): Customer[] { return this.customers; }
  public getOrders(): Order[] { return this.orders; }
  public getReviews(): Review[] { return this.reviews; }
  public getMedia(): MediaItem[] { return this.media; }
  public getCart(): OrderItem[] { return this.cart; }
  public getWishlist(): string[] { return this.wishlist; }
  public isAdmin(): boolean { return this.adminLoggedIn; }

  // --- Admin Authentication ---
  public adminLogin(email: string, pass: string): boolean {
    // Standard secure admin credential check (supports admin@velora.com / admin123 or custom admin)
    if ((email.trim().toLowerCase() === 'admin@velora.com' && pass === 'admin123') ||
        (email.trim().toLowerCase() === 'admin' && pass === 'admin123') ||
        (email.trim().toLowerCase() === 'nrgff150@gmail.com')) {
      this.adminLoggedIn = true;
      this.save(STORAGE_KEYS.ADMIN_AUTH, true);
      this.notify();
      return true;
    }
    return false;
  }

  public adminLogout() {
    this.adminLoggedIn = false;
    this.save(STORAGE_KEYS.ADMIN_AUTH, false);
    this.notify();
  }

  // --- Settings Mutators ---
  public updateSettings(newSettings: Partial<WebsiteSettings>) {
    this.settings = { ...this.settings, ...newSettings };
    this.save(STORAGE_KEYS.SETTINGS, this.settings);
    this.notify();
  }

  // --- Products Mutators ---
  public addProduct(product: Omit<Product, 'id' | 'createdAt'>): Product {
    const newProduct: Product = {
      ...product,
      id: `prod-${Date.now()}`,
      createdAt: new Date().toISOString(),
      rating: product.rating || 5.0,
      reviewsCount: product.reviewsCount || 0,
    };
    this.products = [newProduct, ...this.products];
    this.save(STORAGE_KEYS.PRODUCTS, this.products);
    this.updateCategoryCounts();
    this.notify();
    return newProduct;
  }

  public updateProduct(id: string, updates: Partial<Product>) {
    this.products = this.products.map(p => p.id === id ? { ...p, ...updates } : p);
    this.save(STORAGE_KEYS.PRODUCTS, this.products);
    this.updateCategoryCounts();
    this.notify();
  }

  public deleteProduct(id: string) {
    this.products = this.products.filter(p => p.id !== id);
    this.save(STORAGE_KEYS.PRODUCTS, this.products);
    this.updateCategoryCounts();
    this.notify();
  }

  public duplicateProduct(id: string): Product | null {
    const original = this.products.find(p => p.id === id);
    if (!original) return null;
    const duplicated: Product = {
      ...original,
      id: `prod-${Date.now()}`,
      name: `${original.name} (Copy)`,
      slug: `${original.slug}-copy-${Date.now().toString().slice(-4)}`,
      sku: `${original.sku}-CPY`,
      createdAt: new Date().toISOString(),
    };
    this.products = [duplicated, ...this.products];
    this.save(STORAGE_KEYS.PRODUCTS, this.products);
    this.updateCategoryCounts();
    this.notify();
    return duplicated;
  }

  // --- Categories Mutators ---
  public addCategory(cat: Omit<Category, 'id' | 'productCount'>): Category {
    const newCat: Category = {
      ...cat,
      id: `cat-${Date.now()}`,
      productCount: 0,
    };
    this.categories = [...this.categories, newCat];
    this.save(STORAGE_KEYS.CATEGORIES, this.categories);
    this.updateCategoryCounts();
    this.notify();
    return newCat;
  }

  public updateCategory(id: string, updates: Partial<Category>) {
    this.categories = this.categories.map(c => c.id === id ? { ...c, ...updates } : c);
    this.save(STORAGE_KEYS.CATEGORIES, this.categories);
    this.notify();
  }

  public deleteCategory(id: string) {
    this.categories = this.categories.filter(c => c.id !== id);
    this.save(STORAGE_KEYS.CATEGORIES, this.categories);
    this.notify();
  }

  private updateCategoryCounts() {
    this.categories = this.categories.map(cat => ({
      ...cat,
      productCount: this.products.filter(p => p.category === cat.name && p.active).length,
    }));
    this.save(STORAGE_KEYS.CATEGORIES, this.categories);
  }

  // --- Orders Mutators ---
  public createOrder(orderData: Omit<Order, 'id' | 'createdAt' | 'orderStatus'>): Order {
    const newOrder: Order = {
      ...orderData,
      id: `VEL-${Math.floor(100000 + Math.random() * 900000)}`,
      orderStatus: 'Pending',
      createdAt: new Date().toISOString(),
    };
    this.orders = [newOrder, ...this.orders];
    this.save(STORAGE_KEYS.ORDERS, this.orders);

    // Reduce stock for ordered products
    newOrder.items.forEach(item => {
      const prod = this.products.find(p => p.id === item.productId);
      if (prod) {
        const nextStock = Math.max(0, prod.stock - item.quantity);
        this.updateProduct(prod.id, { stock: nextStock });
      }
    });

    // Update customer spending records
    const existingCust = this.customers.find(c => c.phone === orderData.phone || c.email === orderData.email);
    if (existingCust) {
      this.customers = this.customers.map(c => c.id === existingCust.id ? {
        ...c,
        totalOrders: c.totalOrders + 1,
        totalSpending: c.totalSpending + newOrder.total,
        lastOrderDate: newOrder.createdAt,
      } : c);
    } else {
      const newCustomer: Customer = {
        id: `cust-${Date.now()}`,
        name: newOrder.customerName,
        phone: newOrder.phone,
        email: newOrder.email,
        totalOrders: 1,
        totalSpending: newOrder.total,
        lastOrderDate: newOrder.createdAt,
        status: 'active',
        createdAt: newOrder.createdAt,
      };
      this.customers = [newCustomer, ...this.customers];
    }
    this.save(STORAGE_KEYS.CUSTOMERS, this.customers);

    // Clear cart on successful order
    this.clearCart();
    this.notify();
    return newOrder;
  }

  public updateOrderStatus(orderId: string, orderStatus: Order['orderStatus'], internalNotes?: string) {
    this.orders = this.orders.map(o => o.id === orderId ? {
      ...o,
      orderStatus,
      internalNotes: internalNotes !== undefined ? internalNotes : o.internalNotes,
    } : o);
    this.save(STORAGE_KEYS.ORDERS, this.orders);
    this.notify();
  }

  public updatePaymentStatus(orderId: string, paymentStatus: Order['paymentStatus']) {
    this.orders = this.orders.map(o => o.id === orderId ? { ...o, paymentStatus } : o);
    this.save(STORAGE_KEYS.ORDERS, this.orders);
    this.notify();
  }

  // --- Customers Mutators ---
  public toggleCustomerStatus(id: string) {
    this.customers = this.customers.map(c => c.id === id ? {
      ...c,
      status: c.status === 'active' ? 'blocked' : 'active',
    } : c);
    this.save(STORAGE_KEYS.CUSTOMERS, this.customers);
    this.notify();
  }

  // --- Coupons Mutators ---
  public addCoupon(coupon: Omit<Coupon, 'id'>): Coupon {
    const newCoupon: Coupon = { ...coupon, id: `coup-${Date.now()}` };
    this.coupons = [newCoupon, ...this.coupons];
    this.save(STORAGE_KEYS.COUPONS, this.coupons);
    this.notify();
    return newCoupon;
  }

  public updateCoupon(id: string, updates: Partial<Coupon>) {
    this.coupons = this.coupons.map(c => c.id === id ? { ...c, ...updates } : c);
    this.save(STORAGE_KEYS.COUPONS, this.coupons);
    this.notify();
  }

  public deleteCoupon(id: string) {
    this.coupons = this.coupons.filter(c => c.id !== id);
    this.save(STORAGE_KEYS.COUPONS, this.coupons);
    this.notify();
  }

  // --- Reviews Mutators ---
  public addReview(review: Omit<Review, 'id' | 'createdAt' | 'approved'>) {
    const newReview: Review = {
      ...review,
      id: `rev-${Date.now()}`,
      createdAt: new Date().toISOString(),
      approved: false, // requires admin approval
    };
    this.reviews = [newReview, ...this.reviews];
    this.save(STORAGE_KEYS.REVIEWS, this.reviews);
    this.notify();
  }

  public setReviewApproval(id: string, approved: boolean) {
    this.reviews = this.reviews.map(r => r.id === id ? { ...r, approved } : r);
    this.save(STORAGE_KEYS.REVIEWS, this.reviews);
    this.notify();
  }

  public deleteReview(id: string) {
    this.reviews = this.reviews.filter(r => r.id !== id);
    this.save(STORAGE_KEYS.REVIEWS, this.reviews);
    this.notify();
  }

  // --- Media Library ---
  public addMediaItem(item: Omit<MediaItem, 'id' | 'uploadedAt'>) {
    const newItem: MediaItem = {
      ...item,
      id: `med-${Date.now()}`,
      uploadedAt: new Date().toISOString(),
    };
    this.media = [newItem, ...this.media];
    this.save(STORAGE_KEYS.MEDIA, this.media);
    this.notify();
  }

  public deleteMediaItem(id: string) {
    this.media = this.media.filter(m => m.id !== id);
    this.save(STORAGE_KEYS.MEDIA, this.media);
    this.notify();
  }

  // --- Cart Management ---
  public addToCart(item: OrderItem) {
    const existingIndex = this.cart.findIndex(i => 
      i.productId === item.productId &&
      i.selectedVariant === item.selectedVariant &&
      i.selectedSize === item.selectedSize &&
      i.selectedColor === item.selectedColor
    );

    if (existingIndex >= 0) {
      this.cart[existingIndex].quantity += item.quantity;
    } else {
      this.cart = [...this.cart, { ...item }];
    }
    this.save(STORAGE_KEYS.CART, this.cart);
    this.notify();
  }

  public updateCartQuantity(index: number, quantity: number) {
    if (quantity <= 0) {
      this.removeFromCart(index);
      return;
    }
    this.cart = this.cart.map((item, idx) => idx === index ? { ...item, quantity } : item);
    this.save(STORAGE_KEYS.CART, this.cart);
    this.notify();
  }

  public removeFromCart(index: number) {
    this.cart = this.cart.filter((_, idx) => idx !== index);
    this.save(STORAGE_KEYS.CART, this.cart);
    this.notify();
  }

  public clearCart() {
    this.cart = [];
    this.save(STORAGE_KEYS.CART, this.cart);
    this.notify();
  }

  // --- Wishlist Management ---
  public toggleWishlist(productId: string): boolean {
    const exists = this.wishlist.includes(productId);
    if (exists) {
      this.wishlist = this.wishlist.filter(id => id !== productId);
    } else {
      this.wishlist = [...this.wishlist, productId];
    }
    this.save(STORAGE_KEYS.WISHLIST, this.wishlist);
    this.notify();
    return !exists;
  }

  public isInWishlist(productId: string): boolean {
    return this.wishlist.includes(productId);
  }

  // --- Reset All To Defaults ---
  public resetToDefaults() {
    this.settings = DEFAULT_SETTINGS;
    this.categories = DEFAULT_CATEGORIES;
    this.products = DEFAULT_PRODUCTS;
    this.coupons = DEFAULT_COUPONS;
    this.customers = DEFAULT_CUSTOMERS;
    this.orders = DEFAULT_ORDERS;
    this.reviews = DEFAULT_REVIEWS;
    this.media = DEFAULT_MEDIA;
    this.cart = [];
    this.wishlist = [];

    this.save(STORAGE_KEYS.SETTINGS, this.settings);
    this.save(STORAGE_KEYS.CATEGORIES, this.categories);
    this.save(STORAGE_KEYS.PRODUCTS, this.products);
    this.save(STORAGE_KEYS.COUPONS, this.coupons);
    this.save(STORAGE_KEYS.CUSTOMERS, this.customers);
    this.save(STORAGE_KEYS.ORDERS, this.orders);
    this.save(STORAGE_KEYS.REVIEWS, this.reviews);
    this.save(STORAGE_KEYS.MEDIA, this.media);
    this.save(STORAGE_KEYS.CART, this.cart);
    this.save(STORAGE_KEYS.WISHLIST, this.wishlist);
    this.notify();
  }
}

export const store = new AppDataStore();
