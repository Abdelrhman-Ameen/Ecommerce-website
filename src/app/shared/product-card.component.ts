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
        <img [src]="product.imageUrl" [alt]="product.name" loading="lazy">
      </a>
      <button class="favorite-button" type="button" [attr.aria-label]="isFavorite() ? 'Remove from favorites' : 'Add to favorites'" (click)="toggleFavorite()">
        <i class="bi" [class.bi-heart-fill]="isFavorite()" [class.bi-heart]="!isFavorite()"></i>
      </button>
      <div class="p-3 p-lg-4">
        <div class="product-eyebrow">{{ product.category | titlecase }}</div>
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
  @Input({ required: true }) product!: Product;
  readonly adding = signal(false);
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
    if (!this.auth.user()) {
      this.router.navigate(['/login'], { queryParams: { redirect: this.router.url } });
      return;
    }
    this.adding.set(true);
    this.cart.add(this.product._id, 1, this.product.name).subscribe({
      next: () => this.adding.set(false),
      error: () => this.adding.set(false),
    });
  }

  available(): boolean { return this.product.stock > 0 && !this.product.isManuallyUnavailable; }
}
