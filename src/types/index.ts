export type CategoryType = 
  | 'Cooker & Rice Items'
  | 'Clothing'
  | 'T-Shirt Combo'
  | 'Health'
  | 'Organics'
  | 'Medicines';

export interface ProductColor {
  name: string;
  hex: string;
}

export interface Product {
  id: string;
  name: string;
  slug: string;
  category: CategoryType | string;
  description: string;
  shortDescription: string;
  regularPrice: number;
  salePrice: number;
  stock: number;
  sku: string;
  brand: string;
  images: string[];
  variants?: string[];
  sizes?: string[];
  colors?: ProductColor[];
  specifications?: Record<string, string>;
  featured: boolean;
  bestseller: boolean;
  newArrival: boolean;
  active: boolean;
  rating: number;
  reviewsCount: number;
  createdAt: string;
  
  // 3D Model visualization type
  model3dType?: 'cooker' | 'bottle' | 'tshirt' | 'medicine' | 'organic' | 'tech';

  // Compliance & Health Safety Fields
  manufacturer?: string;
  ingredients?: string;
  usageInstructions?: string;
  warnings?: string;
  expiryDate?: string;
  batchNumber?: string;
  isMedicineOrHealth?: boolean;
  prescriptionRequired?: boolean;
}

export interface Category {
  id: string;
  name: CategoryType | string;
  slug: string;
  description: string;
  image: string;
  productCount: number;
  active: boolean;
  sortOrder?: number;
  displayOrder?: number;
}

export interface OrderItem {
  productId: string;
  productName: string;
  productImage: string;
  price: number;
  quantity: number;
  selectedVariant?: string;
  selectedSize?: string;
  selectedColor?: string;
}

export type OrderStatus = 'Pending' | 'Confirmed' | 'Processing' | 'Shipped' | 'Delivered' | 'Cancelled';
export type PaymentStatus = 'pending' | 'paid' | 'failed';
export type PaymentMethod = 'cod' | 'bkash' | 'nagad' | 'card' | 'online';

export interface Order {
  id: string;
  customerName: string;
  phone: string;
  email: string;
  fullAddress: string;
  area: string;
  district: string;
  deliveryNote?: string;
  items: OrderItem[];
  subtotal: number;
  deliveryCharge: number;
  discount: number;
  total: number;
  paymentMethod: PaymentMethod;
  paymentStatus: PaymentStatus;
  orderStatus: OrderStatus;
  internalNotes?: string;
  createdAt: string;
}

export interface Customer {
  id: string;
  name: string;
  phone: string;
  email: string;
  totalOrders: number;
  totalSpending: number;
  lastOrderDate: string;
  status: 'active' | 'blocked';
  createdAt: string;
}

export interface Coupon {
  id: string;
  code: string;
  discountType: 'percentage' | 'fixed';
  discountValue: number;
  minOrder: number;
  maxDiscount: number;
  startDate?: string;
  endDate?: string;
  expiryDate?: string;
  usageCount?: number;
  active: boolean;
}

export interface SpecialOfferConfig {
  enabled: boolean;
  badge: string;
  title: string;
  description: string;
  discount: string;
  productId: string;
  endDate: string;
  buttonText: string;
  buttonLink: string;
  image: string;
}

export interface WebsiteSectionsConfig {
  hero: boolean;
  categories: boolean;
  featuredProducts: boolean;
  showcase3D: boolean;
  specialOffer: boolean;
  whyChooseUs: boolean;
  reviews: boolean;
  newsletter: boolean;
  footer: boolean;
}

export interface WebsiteSettings {
  websiteName: string;
  logo: string;
  tagline: string;
  favicon: string;
  heroBadge?: string;
  heroTitle: string;
  heroDescription: string;
  heroImage?: string;
  heroCtaText?: string;
  heroCtaLink?: string;
  heroPrimaryButtonText?: string;
  heroSecondaryButtonText?: string;
  heroFeaturedProductId?: string;
  announcementText?: string;
  primaryColor?: string;
  secondaryColor?: string;
  footerText?: string;
  footerAboutText?: string;
  footerCopyright?: string;
  phone: string;
  email: string;
  address: string;
  currencySymbol: string;
  deliveryDhaka: number;
  deliveryOutsideDhaka: number;
  socialLinks: {
    facebook?: string;
    instagram?: string;
    tiktok?: string;
    youtube?: string;
    whatsapp?: string;
  };
  specialOffer?: SpecialOfferConfig;
  sections?: WebsiteSectionsConfig;
}

export interface Review {
  id: string;
  productId: string;
  productName: string;
  customerName: string;
  rating: number;
  comment: string;
  createdAt: string;
  approved: boolean;
}

export interface MediaItem {
  id: string;
  name: string;
  url: string;
  category: 'products' | 'categories' | 'hero' | 'banners';
  uploadedAt: string;
  sizeKb: number;
}
