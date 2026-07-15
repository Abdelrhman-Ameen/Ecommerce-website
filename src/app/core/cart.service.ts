import { HttpClient } from '@angular/common/http';
import { Injectable, computed, signal } from '@angular/core';
import { Observable, map, tap } from 'rxjs';
import { ApiResponse, Cart } from './models';
import { ToastService } from './toast.service';

@Injectable({ providedIn: 'root' })
export class CartService {
  private readonly api = '/api/v1/cart';
  readonly cart = signal<Cart | null>(null);
  readonly itemCount = computed(() => this.cart()?.items.reduce((sum, item) => sum + item.quantity, 0) || 0);
  readonly subtotal = computed(() => this.cart()?.items.reduce((sum, item) => sum + (item.product?.price || 0) * item.quantity, 0) || 0);
  readonly hasUnavailableItems = computed(() => this.cart()?.items.some((item) => !item.product || item.product.stock < item.quantity || item.product.isManuallyUnavailable) || false);

  constructor(private http: HttpClient, private toast: ToastService) {}

  load(): Observable<Cart> {
    return this.http.get<ApiResponse<{ cart: Cart }>>(this.api).pipe(map((response) => this.store(response.data.cart)));
  }

  add(productId: string, quantity = 1, productName = 'Product'): Observable<Cart> {
    return this.http.post<ApiResponse<{ cart: Cart }>>(this.api, { productId, quantity }).pipe(
      map((response) => this.store(response.data.cart)),
      tap((cart) => {
        const current = cart.items.find((item) => item.product?._id === productId)?.quantity || quantity;
        this.toast.success(`${productName}: ${current} in your cart`);
      }),
    );
  }

  update(productId: string, quantity: number): Observable<Cart> {
    return this.http.patch<ApiResponse<{ cart: Cart }>>(`${this.api}/${productId}`, { quantity }).pipe(
      map((response) => this.store(response.data.cart)),
    );
  }

  remove(productId: string): Observable<Cart> {
    return this.http.delete<ApiResponse<{ cart: Cart }>>(`${this.api}/${productId}`).pipe(
      map((response) => this.store(response.data.cart)), tap(() => this.toast.info('Item removed')),
    );
  }

  reset(): void { this.cart.set(null); }
  quantityFor(productId: string): number { return this.cart()?.items.find((item) => item.product?._id === productId)?.quantity || 0; }

  private store(cart: Cart): Cart {
    const safeCart = { ...cart, items: (cart.items || []).filter((item) => Boolean(item?.product)) };
    this.cart.set(safeCart);
    return safeCart;
  }
}
