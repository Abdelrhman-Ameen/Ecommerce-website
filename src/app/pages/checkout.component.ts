import { CurrencyPipe } from '@angular/common';
import { Component, OnInit, computed, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../core/auth.service';
import { CartService } from '../core/cart.service';
import { EGYPT_LOCATIONS, LocationOption } from '../core/egypt-locations';
import { LanguageService } from '../core/language.service';
import { OrderService } from '../core/order.service';
import { TranslatePipe } from '../shared/translate.pipe';

@Component({
  standalone: true,
  imports: [CurrencyPipe, ReactiveFormsModule, RouterLink, TranslatePipe],
  template: `
    <section class="checkout-page">
      <main class="checkout-main"><div class="container-xxl px-4"><div class="row g-5">
        <section class="col-lg-7"><div class="d-flex align-items-center justify-content-between mb-4"><h1>{{ 'Your cart' | translate }}</h1><a class="text-link" routerLink="/products">{{ 'Continue shopping' | translate }}</a></div>
          @if (loading()) { <div class="skeleton checkout-skeleton"></div> }
          @else if (!cart.cart()?.items?.length) { <div class="empty-state checkout-empty"><i class="bi bi-bag"></i><h2>{{ 'Your cart is empty' | translate }}</h2><p>{{ 'Explore the catalog and add something considered.' | translate }}</p><a class="btn btn-ink" routerLink="/products">{{ 'All products' | translate }}</a></div> }
          @else { <div class="checkout-items">@for (item of cart.cart()!.items; track item.product._id) { <article class="checkout-item" [class.checkout-item-unavailable]="item.product.isManuallyUnavailable || item.product.stock < item.quantity"><img [src]="item.product.imageUrl" [alt]="item.product.name"><div class="flex-grow-1"><h2>{{ item.product.name }}</h2><p>{{ item.product.category }}</p>@if (item.product.isManuallyUnavailable || item.product.stock < item.quantity) { <small class="item-unavailable-message"><i class="bi bi-exclamation-triangle"></i> {{ 'Currently unavailable — remove or reduce this item' | translate }}</small> }<div class="d-flex align-items-center justify-content-between mt-3"><div class="quantity-control"><button type="button" (click)="updateQuantity(item.product._id, item.quantity - 1)" [disabled]="item.quantity <= 1 || item.product.isManuallyUnavailable"><i class="bi bi-dash"></i></button><span>{{ item.quantity }}</span><button type="button" (click)="updateQuantity(item.product._id, item.quantity + 1)" [disabled]="item.quantity >= item.product.stock || item.product.isManuallyUnavailable"><i class="bi bi-plus"></i></button></div><strong>{{ item.product.price * item.quantity | currency }}</strong></div></div><button class="remove-item" type="button" (click)="remove(item.product._id)" [attr.aria-label]="'Remove item' | translate"><i class="bi bi-x-lg"></i></button></article> }</div> }
        </section>
        <aside class="col-lg-5"><div class="checkout-card"><h2>{{ 'Checkout details' | translate }}</h2><form [formGroup]="form" (ngSubmit)="placeOrder()" novalidate><h3>{{ 'Shipping information' | translate }}</h3>
          <div class="form-group-luxe"><label for="fullName">{{ 'Full name' | translate }} <span class="required-mark">*</span></label><input id="fullName" class="form-control" formControlName="fullName" autocomplete="name" required [class.is-invalid]="invalid('fullName')">@if (invalid('fullName')) { <small>{{ 'Full name is required' | translate }}</small> }</div>
          <div class="row g-3"><div class="col-sm-7"><div class="form-group-luxe"><label for="email">{{ 'Email address' | translate }} <span class="required-mark">*</span></label><input id="email" class="form-control" type="email" formControlName="email" autocomplete="email" required [class.is-invalid]="invalid('email')">@if (invalid('email')) { <small>{{ 'Enter a valid email address.' | translate }}</small> }</div></div><div class="col-sm-5"><div class="form-group-luxe"><label for="phone">{{ 'Phone number' | translate }} <span class="required-mark">*</span></label><input id="phone" class="form-control" formControlName="phone" autocomplete="tel" required [class.is-invalid]="invalid('phone')">@if (invalid('phone')) { <small>{{ 'Enter a valid phone number' | translate }}</small> }</div></div></div>
          <div class="form-group-luxe"><label for="street">{{ 'Street address' | translate }} <span class="required-mark">*</span></label><input id="street" class="form-control" formControlName="street" autocomplete="street-address" required [class.is-invalid]="invalid('street')" [placeholder]="'Building, street, area' | translate">@if (invalid('street')) { <small>{{ 'Street address is required' | translate }}</small> }</div>
          <div class="row g-3"><div class="col-sm-6"><div class="form-group-luxe"><label for="governorate">{{ 'Governorate' | translate }} <span class="required-mark">*</span></label><select id="governorate" class="form-select" formControlName="governorate" autocomplete="address-level1" required [class.is-invalid]="invalid('governorate')" (change)="selectGovernorate($event)"><option value="">{{ 'Select governorate' | translate }}</option>@for (governorate of governorates; track governorate.en) { <option [value]="governorate.en">{{ locationLabel(governorate) }}</option> }</select>@if (invalid('governorate')) { <small>{{ 'Governorate is required' | translate }}</small> }</div></div><div class="col-sm-6"><div class="form-group-luxe"><label for="city">{{ 'City' | translate }} <span class="required-mark">*</span></label><select id="city" class="form-select" formControlName="city" autocomplete="address-level2" required [class.is-invalid]="invalid('city')"><option value="">{{ 'Select city' | translate }}</option>@for (city of cities(); track city.en) { <option [value]="city.en">{{ locationLabel(city) }}</option> }</select>@if (invalid('city')) { <small>{{ 'City is required' | translate }}</small> }</div></div></div>
          <p class="typeahead-hint"><i class="bi bi-keyboard"></i>{{ 'Tip: open a list and type the first letters to jump to a location.' | translate }}</p>
          <div class="payment-method"><i class="bi bi-cash-stack"></i><div><strong>{{ 'Cash on delivery' | translate }}</strong><small>{{ 'Pay safely when your order arrives.' | translate }}</small></div><i class="bi bi-check-circle-fill ms-auto"></i></div>
          <div class="order-totals"><div><span>{{ 'Subtotal' | translate }}</span><strong>{{ cart.subtotal() | currency }}</strong></div><div><span>{{ 'Shipping' | translate }}</span><strong>{{ shipping() === 0 ? ('Free' | translate) : (shipping() | currency) }}</strong></div><div class="total"><span>{{ 'Total' | translate }}</span><strong>{{ cart.subtotal() + shipping() | currency }}</strong></div></div>
          @if (cart.hasUnavailableItems()) { <div class="alert alert-warning checkout-warning"><i class="bi bi-exclamation-triangle me-2"></i>{{ 'Resolve unavailable cart items before placing the order.' | translate }}</div> }
          <button class="btn btn-primary-luxe w-100" type="submit" [disabled]="placing() || !cart.cart()?.items?.length || cart.hasUnavailableItems()">@if (placing()) { <span class="spinner-border spinner-border-sm me-2"></span> }<i class="bi bi-lock me-2"></i>{{ 'Place order' | translate }}</button><div class="checkout-trust"><span><i class="bi bi-shield-check"></i>{{ 'Secure checkout' | translate }}</span><span><i class="bi bi-arrow-counterclockwise"></i>{{ '30-day returns' | translate }}</span></div>
        </form></div></aside>
      </div></div></main>
    </section>
  `,
})
export class CheckoutComponent implements OnInit {
  readonly loading = signal(true);
  readonly placing = signal(false);
  readonly governorates = EGYPT_LOCATIONS;
  readonly selectedGovernorate = signal('');
  readonly cities = computed(() => this.governorates.find((item) => item.en === this.selectedGovernorate())?.cities || []);
  readonly form;

  constructor(
    public cart: CartService,
    private auth: AuthService,
    private orders: OrderService,
    private router: Router,
    fb: FormBuilder,
    public language: LanguageService,
  ) {
    const user = auth.user();
    this.form = fb.nonNullable.group({
      fullName: [`${user?.firstName || ''} ${user?.lastName || ''}`.trim(), [Validators.required, Validators.minLength(3)]],
      email: [user?.email || '', [Validators.required, Validators.email]],
      phone: [user?.phone || '', [Validators.required, Validators.pattern(/^\+?[0-9]{10,15}$/)]],
      street: ['', [Validators.required, Validators.minLength(5), Validators.maxLength(180)]],
      governorate: ['', Validators.required],
      city: ['', Validators.required],
    });
  }

  ngOnInit(): void { this.cart.load().subscribe({ next: () => this.loading.set(false), error: () => this.loading.set(false) }); }
  shipping(): number { return this.cart.subtotal() >= 500 ? 0 : 25; }
  updateQuantity(id: string, quantity: number): void { if (quantity >= 1) this.cart.update(id, quantity).subscribe(); }
  remove(id: string): void { this.cart.remove(id).subscribe(); }
  invalid(name: keyof typeof this.form.controls): boolean { const control = this.form.controls[name]; return control.invalid && (control.touched || control.dirty); }
  locationLabel(location: LocationOption): string { return this.language.language() === 'ar' ? location.ar : location.en; }
  selectGovernorate(event: Event): void {
    this.selectedGovernorate.set((event.target as HTMLSelectElement).value);
    this.form.controls.city.setValue('');
  }
  placeOrder(): void {
    if (this.form.invalid || this.cart.hasUnavailableItems()) { this.form.markAllAsTouched(); return; }
    this.placing.set(true);
    this.orders.checkout(this.form.getRawValue()).subscribe({
      next: (order) => { this.cart.reset(); this.router.navigate(['/order-confirmation', order._id]); },
      error: () => this.placing.set(false),
    });
  }
}
