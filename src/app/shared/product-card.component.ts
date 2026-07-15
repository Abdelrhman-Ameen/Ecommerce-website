import { HttpErrorResponse } from '@angular/common/http';
import { Component, Input, signal } from '@angular/core';
import { CurrencyPipe, TitleCasePipe } from '@angular/common';
import { Router, RouterLink } from '@angular/router';
import { Product } from '../core/models';
import { AuthService } from '../core/auth.service';
import { CartService } from '../core/cart.service';
import { ToastService } from '../core/toast.service';
import { TranslatePipe } from './translate.pipe';

@Component({
  selector: 'app-product-card',
  standalone: true,
  imports: [CurrencyPipe, TitleCasePipe, RouterLink, TranslatePipe],
  template: `
    <article class="product-card h-100">
      <a class="product-image-wrap" [routerLink]="['/products', product._id]" [attr.aria-label]="'View ' + product.name">
        <img [src]="imageSrc()" [alt]="product.name" loading="eager" decoding="async" (load)="imageLoaded.set(true)" (error)="recoverImage()" [class.is-loaded]="imageLoaded()">
      </a>
      <button class="favorite-button" type="button" [attr.aria-label]="isFavorite() ? 'Remove from favorites' : 'Add to favorites'" (click)="toggleFavorite()">
        <i class="bi" [class.bi-heart-fill]="isFavorite()" [class.bi-heart]="!isFavorite()"></i>
      </button>
      <div class="p-3 p-lg-4">
        <div class="product-eyebrow">{{ (product.subcategory || product.category) | titlecase }}</div>
        <a class="product-title" [routerLink]="['/products', product._id]">{{ product.name }}</a>
        <div class="product-card-purchase d-flex align-items-end justify-content-between gap-2 mt-3">
          <div class="product-card-pricing">
            <div class="product-price-line"><strong class="product-price">{{ product.price | currency }}</strong>@if (product.oldPrice) { <span class="old-price">{{ product.oldPrice | currency }}</span> }</div>
            <small class="stock-label d-block" [class.low-stock]="product.stock <= 5 || product.isManuallyUnavailable">{{ available() ? (product.stock + ' ' + ('in stock' | translate)) : ('Out of stock' | translate) }}</small>
          </div>
          <button class="btn btn-ink btn-icon cart-add-button" type="button" [disabled]="!available() || adding() || cart.quantityFor(product._id) >= product.stock" (click)="addToCart()" [attr.aria-label]="('Add to cart' | translate) + '. ' + cart.quantityFor(product._id) + ' in cart'">
            @if (adding()) { <span class="spinner-border spinner-border-sm"></span> } @else { <i class="bi bi-bag-plus"></i> }
            @if (cart.quantityFor(product._id); as quantity) { <span class="product-cart-quantity" aria-live="polite">{{ quantity }}</span> }
          </button>
        </div>
      </div>
    </article>
  `,
})
export class ProductCardComponent {
  private currentProduct!: Product;
  private imageRetries = 0;
  @Input({ required: true })
  set product(value: Product) {
    this.currentProduct = value;
    this.imageRetries = 0;
    this.imageLoaded.set(false);
    this.imageSrc.set(value.imageUrl || '/assets/catalog/product-placeholder.svg');
  }
  get product(): Product { return this.currentProduct; }

  readonly adding = signal(false);
  readonly imageLoaded = signal(false);
  readonly imageSrc = signal('/assets/catalog/product-placeholder.svg');
  constructor(
    private auth: AuthService,
    public cart: CartService,
    private router: Router,
    private toast: ToastService,
  ) {}

  isFavorite(): boolean {
    return (this.auth.user()?.favorites || []).some((item) => (typeof item === 'string' ? item : item._id) === this.product._id);
  }

  toggleFavorite(): void {
    if (!this.auth.user()) {
      this.router.navigate(['/login'], { queryParams: { redirect: this.router.url } });
      return;
    }
    this.auth.toggleFavorite(this.product._id).subscribe(() => this.toast.success(this.isFavorite() ? 'Saved to favorites' : 'Removed from favorites'));
  }

  addToCart(): void {
    if (this.adding()) return;
    this.adding.set(true);
    this.auth.ensureSession().subscribe({
      next: (user) => {
        if (!user) {
          this.adding.set(false);
          this.router.navigate(['/login'], { queryParams: { redirect: this.router.url } });
          return;
        }
        this.cart.add(this.product._id, 1, this.product.name).subscribe({
          next: () => this.adding.set(false),
          error: (error: HttpErrorResponse) => {
            this.adding.set(false);
            if (error.status === 401) {
              this.auth.invalidateSession();
              this.cart.reset();
              this.router.navigate(['/login'], { queryParams: { redirect: this.router.url } });
            }
          },
        });
      },
      error: () => this.adding.set(false),
    });
  }

  recoverImage(): void {
    const original = this.product.imageUrl || '';
    if (this.imageRetries === 0 && original && !original.startsWith('data:') && !original.startsWith('blob:')) {
      this.imageRetries += 1;
      const separator = original.includes('?') ? '&' : '?';
      this.imageSrc.set(`${original}${separator}retry=1`);
      return;
    }
    this.imageLoaded.set(true);
    this.imageSrc.set('/assets/catalog/product-placeholder.svg');
  }

  available(): boolean { return this.product.stock > 0 && !this.product.isManuallyUnavailable; }
}
