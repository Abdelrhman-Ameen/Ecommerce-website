import { Component, OnInit, signal } from '@angular/core';
import { Product } from '../core/models';
import { AuthService } from '../core/auth.service';
import { ProductCardComponent } from '../shared/product-card.component';
import { RouterLink } from '@angular/router';
import { TranslatePipe } from '../shared/translate.pipe';

@Component({
  standalone: true,
  imports: [ProductCardComponent, RouterLink, TranslatePipe],
  template: `<section class="account-hero"><div class="container-xxl px-4"><div class="eyebrow">{{ 'Saved collection' | translate }}</div><h1>{{ 'Wishlist' | translate }}</h1><p>{{ 'Everything that caught your eye, kept in one considered place.' | translate }}</p></div></section><section class="section-space"><div class="container-xxl px-4">@if (!products().length) { <div class="empty-state"><i class="bi bi-heart"></i><h2>{{ 'Your favorites are empty' | translate }}</h2><p>{{ 'Save products from the catalog to find them here.' | translate }}</p><a class="btn btn-ink" routerLink="/products">{{ 'All products' | translate }}</a></div> } @else { <div class="row g-4">@for (product of products(); track product._id) { <div class="col-6 col-md-4 col-lg-3"><app-product-card [product]="product"/></div> }</div> }</div></section>`,
})
export class WishlistComponent implements OnInit {
  readonly products = signal<Product[]>([]);
  constructor(private auth: AuthService) {}
  ngOnInit(): void { this.auth.refreshProfile().subscribe(() => this.products.set(this.auth.favoriteProducts())); }
}
