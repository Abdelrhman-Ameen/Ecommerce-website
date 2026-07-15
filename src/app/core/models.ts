export type UserRole = 'customer' | 'admin';

export interface Product {
  _id: string;
  id?: string;
  name: string;
  description: string;
  category: string;
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
