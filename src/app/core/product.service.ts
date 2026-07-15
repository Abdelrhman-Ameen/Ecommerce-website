import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiResponse, Product } from './models';

export interface ProductQuery {
  search?: string;
  category?: string;
  collection?: string;
  sort?: string;
  page?: number;
  limit?: number;
  featured?: boolean;
  isNewArrival?: boolean;
  inStock?: boolean;
  minPrice?: number;
  maxPrice?: number;
}

@Injectable({ providedIn: 'root' })
export class ProductService {
  private readonly api = '/api/v1/products';
  constructor(private http: HttpClient) {}

  list(query: ProductQuery = {}): Observable<ApiResponse<{ products: Product[]; categories: string[]; collections: string[]; priceBounds: { min: number; max: number } }>> {
    let params = new HttpParams();
    Object.entries(query).forEach(([key, value]) => {
      if (value !== undefined && value !== '' && value !== false) params = params.set(key, String(value));
    });
    return this.http.get<ApiResponse<{ products: Product[]; categories: string[]; collections: string[]; priceBounds: { min: number; max: number } }>>(this.api, { params });
  }

  get(id: string): Observable<ApiResponse<{ product: Product }>> { return this.http.get<ApiResponse<{ product: Product }>>(`${this.api}/${id}`); }
  recommendations(id: string, limit = 4): Observable<ApiResponse<{ products: Product[] }>> { return this.http.get<ApiResponse<{ products: Product[] }>>(`${this.api}/${id}/recommendations`, { params: { limit } }); }
  create(product: Partial<Product>): Observable<ApiResponse<{ product: Product }>> { return this.http.post<ApiResponse<{ product: Product }>>(this.api, product); }
  update(id: string, product: Partial<Product>): Observable<ApiResponse<{ product: Product }>> { return this.http.put<ApiResponse<{ product: Product }>>(`${this.api}/${id}`, product); }
  remove(id: string): Observable<ApiResponse<object>> { return this.http.delete<ApiResponse<object>>(`${this.api}/${id}`); }
}
