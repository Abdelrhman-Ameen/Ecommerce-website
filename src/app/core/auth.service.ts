import { HttpClient } from '@angular/common/http';
import { Injectable, computed, signal } from '@angular/core';
import { Observable, catchError, map, of, tap } from 'rxjs';
import { ApiResponse, Product, User } from './models';
import { ToastService } from './toast.service';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private readonly api = '/api/v1/auth';
  readonly user = signal<User | null>(null);
  readonly loaded = signal(false);
  readonly isAuthenticated = computed(() => !!this.user());
  readonly isAdmin = computed(() => this.user()?.role === 'admin');

  constructor(private http: HttpClient, private toast: ToastService) {}

  ensureSession(): Observable<User | null> {
    if (this.loaded()) return of(this.user());
    return this.http.get<ApiResponse<{ user: User }>>(`${this.api}/me`).pipe(
      map((response) => response.data.user),
      tap((user) => { this.user.set(user); this.loaded.set(true); }),
      catchError(() => { this.user.set(null); this.loaded.set(true); return of(null); }),
    );
  }

  refreshProfile(): Observable<User | null> {
    return this.http.get<ApiResponse<{ user: User }>>(`${this.api}/me`).pipe(
      map((response) => response.data.user),
      tap((user) => { this.user.set(user); this.loaded.set(true); }),
      catchError(() => { this.user.set(null); this.loaded.set(true); return of(null); }),
    );
  }

  login(credentials: { email: string; password: string }): Observable<User> {
    return this.http.post<ApiResponse<{ user: User }>>(`${this.api}/login`, credentials).pipe(
      map((response) => response.data.user),
      tap((user) => { this.user.set(user); this.loaded.set(true); this.toast.success(`Welcome back, ${user.firstName}`); }),
    );
  }

  register(payload: Record<string, string>): Observable<User> {
    return this.http.post<ApiResponse<{ user: User }>>(`${this.api}/register`, payload).pipe(
      map((response) => response.data.user),
      tap((user) => { this.user.set(user); this.loaded.set(true); this.toast.success('Your account is ready'); }),
    );
  }

  logout(): Observable<void> {
    return this.http.post<ApiResponse<object>>(`${this.api}/logout`, {}).pipe(
      tap(() => { this.user.set(null); this.loaded.set(true); this.toast.info('You have been signed out'); }),
      map(() => undefined),
    );
  }

  toggleFavorite(productId: string): Observable<string[]> {
    return this.http.patch<ApiResponse<{ favorites: string[] }>>(`${this.api}/favorites/${productId}`, {}).pipe(
      map((response) => response.data.favorites),
      tap((favorites) => {
        const current = this.user();
        if (current) this.user.set({ ...current, favorites });
      }),
    );
  }

  updateProfile(payload: { firstName: string; lastName: string; phone: string }): Observable<User> {
    return this.http.patch<ApiResponse<{ user: User }>>(`${this.api}/me`, payload).pipe(
      map((response) => response.data.user),
      tap((user) => {
        const favorites = this.user()?.favorites || [];
        this.user.set({ ...user, favorites });
        this.toast.success('Profile updated');
      }),
    );
  }

  changePassword(payload: { currentPassword: string; newPassword: string }): Observable<void> {
    return this.http.patch<ApiResponse<{ user: User }>>(`${this.api}/password`, payload).pipe(
      tap((response) => { this.user.set(response.data.user); this.toast.success('Password changed successfully'); }),
      map(() => undefined),
    );
  }

  favoriteProducts(): Product[] {
    return (this.user()?.favorites || []).filter((item): item is Product => typeof item !== 'string');
  }
}
