import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable, map } from 'rxjs';
import { ApiResponse, OfflineDebtor, OfflineSale, Order, PaymentMethod, Product, User } from './models';

export interface DashboardData {
  usersCount: number;
  productsCount: number;
  ordersCount: number;
  offlineSalesCount: number;
  totalTransactions: number;
  totalRevenue: number;
  onlineRevenue: number;
  offlineRevenue: number;
  collectedOfflineRevenue: number;
  outstandingDebt: number;
  averageSaleValue: number;
  unitsSold: number;
  deliveredRevenue: number;
  cancelledValue: number;
  cancelledOrders: number;
  monthlySales: Array<{ month: string; revenue: number; onlineRevenue: number; offlineRevenue: number; sales: number }>;
  statusBreakdown: Array<{ status: string; count: number; value: number }>;
  inventory: { units: number; retailValue: number; unavailableProducts: number };
  lowStockProducts: Product[];
  recentOrders: Order[];
  latestProducts: Product[];
  highestDebts: OfflineDebtor[];
}

export interface OfflineSalesData {
  sales: OfflineSale[];
  summary: { revenue: number; collected: number; outstandingDebt: number; salesCount: number };
  debtors: OfflineDebtor[];
}

export interface OfflineSalePayload {
  customerName: string;
  phone?: string;
  productId: string;
  quantity: number;
  unitPrice: number;
  amountPaid: number;
  paymentMethod: PaymentMethod;
  saleDate: string;
  paymentDate?: string;
  note?: string;
}

@Injectable({ providedIn: 'root' })
export class AdminService {
  private readonly api = '/api/v1/admin';
  constructor(private http: HttpClient) {}
  dashboard(): Observable<DashboardData> { return this.http.get<ApiResponse<DashboardData>>(`${this.api}/dashboard`).pipe(map((response) => response.data)); }
  users(): Observable<User[]> { return this.http.get<ApiResponse<{ users: User[] }>>(`${this.api}/users`).pipe(map((response) => response.data.users)); }
  offlineSales(): Observable<OfflineSalesData> { return this.http.get<ApiResponse<OfflineSalesData>>(`${this.api}/offline-sales`).pipe(map((response) => response.data)); }
  createOfflineSale(payload: OfflineSalePayload): Observable<OfflineSale> { return this.http.post<ApiResponse<{ sale: OfflineSale }>>(`${this.api}/offline-sales`, payload).pipe(map((response) => response.data.sale)); }
  addOfflinePayment(id: string, payload: { amount: number; method: PaymentMethod; paidAt: string; note?: string }): Observable<OfflineSale> { return this.http.patch<ApiResponse<{ sale: OfflineSale }>>(`${this.api}/offline-sales/${id}/payments`, payload).pipe(map((response) => response.data.sale)); }
}
