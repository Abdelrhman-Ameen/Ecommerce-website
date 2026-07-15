import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable, map } from 'rxjs';
import { ApiResponse, CatalogCategory, HomepageData, HomepageSettings, OfflineDebtor, OfflineSale, Order, PaymentMethod, Product, SupportSettings, SupportTicket, SupportTicketStatus, User } from './models';

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
  productSales: Array<{ productId: string | null; productName: string; imageUrl: string; onlineUnits: number; offlineUnits: number; totalUnits: number; revenue: number }>;
}

export interface OfflineSalesData {
  sales: OfflineSale[];
  summary: { revenue: number; collected: number; outstandingDebt: number; salesCount: number };
  debtors: OfflineDebtor[];
}

export interface OfflineSalePayload {
  customerName?: string;
  phone?: string;
  productId?: string;
  manualProductName?: string;
  quantity?: number | null;
  unitPrice?: number | null;
  totalAmount?: number | null;
  amountPaid?: number;
  paymentMethod?: PaymentMethod;
  saleDate?: string;
  paymentDate?: string;
  note?: string;
}

@Injectable({ providedIn: 'root' })
export class AdminService {
  private readonly api = '/api/v1/admin';
  constructor(private http: HttpClient) {}
  dashboard(): Observable<DashboardData> { return this.http.get<ApiResponse<DashboardData>>(`${this.api}/dashboard`).pipe(map((response) => response.data)); }
  users(): Observable<User[]> { return this.http.get<ApiResponse<{ users: User[] }>>(`${this.api}/users`).pipe(map((response) => response.data.users)); }
  homepageSettings(): Observable<HomepageData> { return this.http.get<ApiResponse<HomepageData>>(`${this.api}/homepage-settings`).pipe(map((response) => response.data)); }
  saveHomepageSettings(payload: HomepageSettings): Observable<HomepageData> { return this.http.put<ApiResponse<HomepageData>>(`${this.api}/homepage-settings`, payload).pipe(map((response) => response.data)); }
  uploadHomepageMedia(dataUrl: string): Observable<string> { return this.http.post<ApiResponse<{ imageUrl: string }>>(`${this.api}/homepage-media`, { dataUrl }).pipe(map((response) => response.data.imageUrl)); }
  uploadProductMedia(dataUrl: string): Observable<string> { return this.http.post<ApiResponse<{ imageUrl: string }>>(`${this.api}/product-media`, { dataUrl }).pipe(map((response) => response.data.imageUrl)); }
  categories(): Observable<CatalogCategory[]> { return this.http.get<ApiResponse<{ categories: CatalogCategory[] }>>(`${this.api}/categories`).pipe(map((response) => response.data.categories)); }
  createCategory(name: string): Observable<CatalogCategory> { return this.http.post<ApiResponse<{ category: CatalogCategory }>>(`${this.api}/categories`, { name }).pipe(map((response) => response.data.category)); }
  deleteCategory(id: string): Observable<void> { return this.http.delete<ApiResponse<object>>(`${this.api}/categories/${id}`).pipe(map(() => undefined)); }
  support(status: SupportTicketStatus | 'all' = 'all'): Observable<{ settings: SupportSettings; tickets: SupportTicket[] }> { return this.http.get<ApiResponse<{ settings: SupportSettings; tickets: SupportTicket[] }>>(`${this.api}/support`, { params: { status } }).pipe(map((response) => response.data)); }
  saveSupportSettings(payload: SupportSettings): Observable<SupportSettings> { return this.http.put<ApiResponse<{ settings: SupportSettings }>>(`${this.api}/support/settings`, payload).pipe(map((response) => response.data.settings)); }
  updateSupportTicket(id: string, payload: { status: SupportTicketStatus; adminNote?: string }): Observable<SupportTicket> { return this.http.patch<ApiResponse<{ ticket: SupportTicket }>>(`${this.api}/support/tickets/${id}`, payload).pipe(map((response) => response.data.ticket)); }
  offlineSales(): Observable<OfflineSalesData> { return this.http.get<ApiResponse<OfflineSalesData>>(`${this.api}/offline-sales`).pipe(map((response) => response.data)); }
  createOfflineSale(payload: OfflineSalePayload): Observable<OfflineSale> { return this.http.post<ApiResponse<{ sale: OfflineSale }>>(`${this.api}/offline-sales`, payload).pipe(map((response) => response.data.sale)); }
  addOfflinePayment(id: string, payload: { amount: number; method: PaymentMethod; paidAt: string; note?: string }): Observable<OfflineSale> { return this.http.patch<ApiResponse<{ sale: OfflineSale }>>(`${this.api}/offline-sales/${id}/payments`, payload).pipe(map((response) => response.data.sale)); }
}
