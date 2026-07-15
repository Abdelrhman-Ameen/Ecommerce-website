import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable, map } from 'rxjs';
import { ApiResponse, DeliverySettings, Order, OrderStatus } from './models';

@Injectable({ providedIn: 'root' })
export class OrderService {
  private readonly api = '/api/v1/orders';
  constructor(private http: HttpClient) {}

  deliverySettings(): Observable<DeliverySettings> { return this.http.get<ApiResponse<{ settings: DeliverySettings }>>(`${this.api}/delivery-settings`).pipe(map((response) => response.data.settings)); }

  checkout(shippingAddress: Record<string, string>): Observable<Order> {
    return this.http.post<ApiResponse<{ order: Order }>>(this.api, { shippingAddress }).pipe(map((response) => response.data.order));
  }
  mine(): Observable<Order[]> { return this.http.get<ApiResponse<{ orders: Order[] }>>(`${this.api}/my-orders`).pipe(map((response) => response.data.orders)); }
  get(id: string): Observable<Order> { return this.http.get<ApiResponse<{ order: Order }>>(`${this.api}/${id}`).pipe(map((response) => response.data.order)); }
  all(status?: OrderStatus): Observable<Order[]> {
    return this.http.get<ApiResponse<{ orders: Order[] }>>(this.api, { params: status ? { status } : {} }).pipe(map((response) => response.data.orders));
  }
  updateStatus(id: string, status: OrderStatus): Observable<Order> {
    return this.http.patch<ApiResponse<{ order: Order }>>(`${this.api}/${id}/status`, { status }).pipe(map((response) => response.data.order));
  }
}
