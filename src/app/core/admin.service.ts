import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable, map } from 'rxjs';
import { ApiResponse, Order, Product, User } from './models';

export interface DashboardData {
  usersCount: number;
  productsCount: number;
  ordersCount: number;
  totalRevenue: number;
  lowStockProducts: Product[];
  recentOrders: Order[];
  latestProducts: Product[];
}

@Injectable({ providedIn: 'root' })
export class AdminService {
  private readonly api = '/api/v1/admin';
  constructor(private http: HttpClient) {}
  dashboard(): Observable<DashboardData> { return this.http.get<ApiResponse<DashboardData>>(`${this.api}/dashboard`).pipe(map((response) => response.data)); }
  users(): Observable<User[]> { return this.http.get<ApiResponse<{ users: User[] }>>(`${this.api}/users`).pipe(map((response) => response.data.users)); }
}
