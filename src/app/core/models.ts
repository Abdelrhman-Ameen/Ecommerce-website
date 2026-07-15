export type UserRole = 'customer' | 'admin';

export interface Product {
  _id: string;
  id?: string;
  name: string;
  description: string;
  category: string;
  subcategory?: string;
  collection?: string;
  price: number;
  costPrice: number;
  oldPrice?: number | null;
  stock: number;
  isManuallyUnavailable: boolean;
  imageUrl: string;
  gallery: string[];
  featured: boolean;
  isNewArrival: boolean;
  createdAt?: string;
}

export type HomepageMediaMode = 'default' | 'products' | 'custom';
export interface HomepageSettings {
  heroMode: HomepageMediaMode;
  heroProductIds: string[];
  heroImages: string[];
  editorialMode: HomepageMediaMode;
  editorialProductIds: string[];
  editorialImages: string[];
  updatedAt?: string | null;
}
export interface HomepageData {
  settings: HomepageSettings;
  heroSlides: Array<{ image: string; alt: string; background: string; accent: string }>;
  editorialImages: Array<{ image: string; alt: string }>;
}

export interface User {
  _id: string;
  id?: string;
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
  role: UserRole;
  avatarUrl?: string;
  favorites: Array<Product | string>;
  createdAt?: string;
}

export interface CartItem {
  product: Product;
  quantity: number;
}

export interface Cart {
  _id: string;
  user: string;
  items: CartItem[];
}

export type OrderStatus = 'ordered' | 'processing' | 'shipped' | 'delivered' | 'cancelled';

export interface Order {
  _id: string;
  orderNumber: string;
  user: User | string;
  items: Array<{ product: string; name: string; imageUrl: string; price: number; costPrice?: number; quantity: number }>;
  shippingAddress: { fullName: string; email: string; phone: string; street: string; governorate: string; city: string };
  paymentMethod: 'cash';
  subtotal: number;
  shippingPrice: number;
  totalPrice: number;
  status: OrderStatus;
  createdAt: string;
}

export type PaymentMethod = 'cash' | 'instapay' | 'vodafone_cash' | 'card' | 'bank_transfer' | 'mobile_wallet' | 'other';

export interface CatalogCategory {
  _id: string | null;
  name: string;
  parent: string | null;
  productCount: number;
  subcategoryCount?: number;
  createdAt?: string | null;
}

export interface CatalogCategoryNode {
  name: string;
  subcategories: string[];
}

export type SupportTicketStatus = 'open' | 'in_progress' | 'waiting_admin' | 'waiting_customer' | 'resolved';
export interface SupportSettings { email: string; phone: string; hours: string; }
export interface DeliverySettings { deliveryFee: number; freeShippingThreshold: number | null; }
export interface SupportMessage {
  _id?: string;
  sender: 'customer' | 'admin';
  senderId?: string | null;
  body: string;
  createdAt: string;
}
export interface SupportTicket {
  _id: string;
  ticketNumber: string;
  user?: User | string | null;
  name: string;
  email: string;
  phone?: string;
  category: 'order' | 'product' | 'delivery' | 'return' | 'account' | 'other';
  subject: string;
  message: string;
  messages: SupportMessage[];
  status: SupportTicketStatus;
  adminNote?: string;
  createdAt: string;
  updatedAt?: string;
  lastMessageAt?: string;
  resolvedAt?: string | null;
}

export interface OfflinePayment {
  _id: string;
  amount: number;
  method: PaymentMethod;
  paidAt: string;
  note?: string;
}

export interface OfflineSale {
  _id: string;
  customerName: string;
  customerKey: string;
  phone?: string;
  product?: string | null;
  productName: string;
  imageUrl: string;
  quantity?: number | null;
  unitPrice?: number | null;
  totalAmount: number;
  amountPaid: number;
  balanceDue: number;
  paymentStatus: 'paid' | 'partial' | 'debt';
  saleDate: string;
  payments: OfflinePayment[];
  note?: string;
  createdAt: string;
}

export interface OfflineDebtor {
  _id: string;
  customerName: string;
  phone?: string;
  totalSales?: number;
  totalPaid?: number;
  balanceDue: number;
  saleCount?: number;
  lastActivityAt: string;
}

export interface ApiResponse<T> {
  status: string;
  message?: string;
  data: T;
  pagination?: { page: number; limit: number; total: number; pages: number };
}

export interface ApiErrorBody {
  message?: string;
  details?: Array<{ field: string; message: string }>;
}
