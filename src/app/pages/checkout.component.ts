import { Component, OnInit, signal } from '@angular/core';
import { CurrencyPipe } from '@angular/common';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { CartService } from '../core/cart.service';
import { AuthService } from '../core/auth.service';
import { OrderService } from '../core/order.service';
import { TranslatePipe } from '../shared/translate.pipe';
import { LanguageService } from '../core/language.service';

@Component({
  standalone: true,
  imports: [CurrencyPipe, ReactiveFormsModule, RouterLink, TranslatePipe],
  template: `
    <div class="transaction-page"><header class="transaction-header"><a class="brand-mark" routerLink="/">LuxeStudio</a><button class="language-switch" type="button" (click)="language.toggle()">{{ language.language() === 'en' ? 'عربي' : 'EN' }}</button></header>
      <main class="checkout-main"><div class="container-xxl px-4"><div class="row g-5">
        <section class="col-lg-7"><div class="d-flex align-items-center justify-content-between mb-4"><h1>{{ 'Your cart' | translate }}</h1><a class="text-link" routerLink="/products">{{ 'Continue shopping' | translate }}</a></div>
          @if (loading()) { <div class="skeleton checkout-skeleton"></div> }
          @else if (!cart.cart()?.items?.length) { <div class="empty-state checkout-empty"><i class="bi bi-bag"></i><h2>{{ 'Your cart is empty' | translate }}</h2><p>{{ 'Explore the catalog and add something considered.' | translate }}</p><a class="btn btn-ink" routerLink="/products">{{ 'All products' | translate }}</a></div> }
          @else { <div class="checkout-items">@for (item of cart.cart()!.items; track item.product._id) { <article class="checkout-item"><img [src]="item.product.imageUrl" [alt]="item.product.name"><div class="flex-grow-1"><h2>{{ item.product.name }}</h2><p>{{ item.product.category }}</p><div class="d-flex align-items-center justify-content-between mt-3"><div class="quantity-control"><button type="button" (click)="updateQuantity(item.product._id, item.quantity - 1)" [disabled]="item.quantity <= 1"><i class="bi bi-dash"></i></button><span>{{ item.quantity }}</span><button type="button" (click)="updateQuantity(item.product._id, item.quantity + 1)" [disabled]="item.quantity >= item.product.stock"><i class="bi bi-plus"></i></button></div><strong>{{ item.product.price * item.quantity | currency }}</strong></div></div><button class="remove-item" type="button" (click)="remove(item.product._id)" aria-label="Remove item"><i class="bi bi-x-lg"></i></button></article> }</div> }
        </section>
        <aside class="col-lg-5"><div class="checkout-card"><h2>{{ 'Checkout details' | translate }}</h2><form [formGroup]="form" (ngSubmit)="placeOrder()" novalidate><h3>{{ 'Shipping information' | translate }}</h3><div class="form-group-luxe"><label for="fullName">{{ 'Full name' | translate }}</label><input id="fullName" class="form-control" formControlName="fullName" autocomplete="name"></div><div class="row g-3"><div class="col-sm-7"><div class="form-group-luxe"><label for="email">{{ 'Email address' | translate }}</label><input id="email" class="form-control" type="email" formControlName="email" autocomplete="email"></div></div><div class="col-sm-5"><div class="form-group-luxe"><label for="phone">{{ 'Phone number' | translate }}</label><input id="phone" class="form-control" formControlName="phone" autocomplete="tel"></div></div></div><div class="form-group-luxe"><label for="street">{{ 'Street address' | translate }}</label><input id="street" class="form-control" formControlName="street" autocomplete="street-address"></div><div class="form-group-luxe"><label for="city">{{ 'City' | translate }}</label><input id="city" class="form-control" formControlName="city" autocomplete="address-level2"></div>
              <div class="payment-method"><i class="bi bi-cash-stack"></i><div><strong>{{ 'Cash on delivery' | translate }}</strong><small>{{ 'Pay safely when your order arrives.' | translate }}</small></div><i class="bi bi-check-circle-fill ms-auto"></i></div>
              <div class="order-totals"><div><span>{{ 'Subtotal' | translate }}</span><strong>{{ cart.subtotal() | currency }}</strong></div><div><span>{{ 'Shipping' | translate }}</span><strong>{{ shipping() === 0 ? 'Free' : (shipping() | currency) }}</strong></div><div class="total"><span>{{ 'Total' | translate }}</span><strong>{{ cart.subtotal() + shipping() | currency }}</strong></div></div>
              <button class="btn btn-primary-luxe w-100" type="submit" [disabled]="placing() || !cart.cart()?.items?.length">@if (placing()) { <span class="spinner-border spinner-border-sm me-2"></span> }<i class="bi bi-lock me-2"></i>{{ 'Place order' | translate }}</button><div class="checkout-trust"><span><i class="bi bi-shield-check"></i>{{ 'Secure checkout' | translate }}</span><span><i class="bi bi-arrow-counterclockwise"></i>{{ '30-day returns' | translate }}</span></div>
            </form></div></aside>
      </div></div></main><footer class="transaction-footer"><span>LuxeStudio</span><span>© {{ year }} LuxeStudio. All rights reserved.</span><a routerLink="/info/privacy">{{ 'Privacy policy' | translate }}</a></footer></div>
  `,
})
export class CheckoutComponent implements OnInit {
  readonly loading = signal(true); readonly placing = signal(false); readonly year = new Date().getFullYear(); readonly form;
  constructor(public cart: CartService, private auth: AuthService, private orders: OrderService, private router: Router, fb: FormBuilder, public language: LanguageService) {
    const user = auth.user(); this.form = fb.nonNullable.group({ fullName: [`${user?.firstName || ''} ${user?.lastName || ''}`.trim(), [Validators.required, Validators.minLength(3)]], email: [user?.email || '', [Validators.required, Validators.email]], phone: [user?.phone || '', [Validators.required, Validators.pattern(/^\+?[0-9]{10,15}$/)]], street: ['', [Validators.required, Validators.minLength(5)]], city: ['', [Validators.required, Validators.minLength(2)]] });
  }
  ngOnInit(): void { this.cart.load().subscribe({ next: () => this.loading.set(false), error: () => this.loading.set(false) }); }
  shipping(): number { return this.cart.subtotal() >= 500 ? 0 : 25; }
  updateQuantity(id: string, quantity: number): void { if (quantity >= 1) this.cart.update(id, quantity).subscribe(); }
  remove(id: string): void { this.cart.remove(id).subscribe(); }
  placeOrder(): void { if (this.form.invalid) { this.form.markAllAsTouched(); return; } this.placing.set(true); this.orders.checkout(this.form.getRawValue()).subscribe({ next: (order) => { this.cart.reset(); this.router.navigate(['/order-confirmation', order._id]); }, error: () => this.placing.set(false) }); }
}
