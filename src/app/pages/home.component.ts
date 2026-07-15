import { Component, OnInit, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { ProductService } from '../core/product.service';
import { Product } from '../core/models';
import { ProductCardComponent } from '../shared/product-card.component';
import { TranslatePipe } from '../shared/translate.pipe';

@Component({
  standalone: true,
  imports: [RouterLink, ProductCardComponent, TranslatePipe],
  template: `
    <section class="hero-section">
      <img class="hero-background" src="/assets/home/home-01.jpg" alt="Professional product photography studio">
      <div class="hero-overlay"></div>
      <div class="container-xxl position-relative h-100 d-flex align-items-center px-4">
        <div class="hero-copy">
          <div class="eyebrow mb-3">{{ 'Curated objects · considered living' | translate }}</div>
          <h1>{{ 'Studio quality.' | translate }}<br><span>{{ 'Everyday prices.' | translate }}</span></h1>
          <p>{{ 'Elevate your space with meticulously selected objects that balance useful design, lasting materials, and quiet beauty.' | translate }}</p>
          <div class="d-flex flex-wrap gap-3 mt-4"><a class="btn btn-primary-luxe" routerLink="/products">{{ 'Explore collections' | translate }} <i class="bi bi-arrow-right ms-2"></i></a><a class="btn btn-light-luxe" routerLink="/products" [queryParams]="{isNewArrival:true}">{{ 'View new arrivals' | translate }}</a></div>
        </div>
        <div class="hero-note d-none d-lg-block"><small>{{ 'THE STUDIO EDIT' | translate }}</small><strong>{{ 'Objects selected' | translate }}<br>{{ 'for modern rituals' | translate }}</strong><span>{{ 'Edition 01' | translate }} — 2026</span></div>
      </div>
    </section>

    <section class="section-space bg-surface">
      <div class="container-xxl px-4">
        <div class="section-heading d-flex align-items-end justify-content-between mb-4"><div><div class="eyebrow">{{ 'The edit' | translate }}</div><h2>{{ 'Featured products' | translate }}</h2><p>{{ 'Distinctive essentials chosen for quality, clarity, and long-term use.' | translate }}</p></div><a class="text-link d-none d-sm-inline" routerLink="/products">{{ 'View all' | translate }} <i class="bi bi-arrow-right"></i></a></div>
        @if (loading()) {
          <div class="row g-4">@for (item of [1,2,3,4]; track item) { <div class="col-6 col-lg-3"><div class="skeleton product-skeleton"></div></div> }</div>
        } @else {
          <div class="row g-4">@for (product of products(); track product._id) { <div class="col-6 col-lg-3"><app-product-card [product]="product"/></div> }</div>
        }
      </div>
    </section>

    <section class="section-space collection-section">
      <div class="container-xxl px-4">
        <div class="row g-4 align-items-stretch">
          <div class="col-lg-7"><a class="collection-tile collection-large" routerLink="/products" [queryParams]="{category:'home decor'}"><img src="/assets/detail/detail-05.jpg" alt="Curated home decor collection" loading="lazy"><span><small>{{ 'Home collection' | translate }}</small><strong>{{ 'Quiet forms for intentional rooms' | translate }}</strong><em>{{ 'Shop the collection' | translate }} <i class="bi bi-arrow-right"></i></em></span></a></div>
          <div class="col-lg-5 d-flex flex-column gap-4"><a class="collection-tile flex-fill" routerLink="/products" [queryParams]="{category:'electronics'}"><img src="/assets/catalog/catalog-02.jpg" alt="Studio electronics collection" loading="lazy"><span><small>{{ 'Studio essentials' | translate }}</small><strong>{{ 'Tools that disappear into the work' | translate }}</strong></span></a><a class="collection-tile flex-fill" routerLink="/products" [queryParams]="{category:'kitchen'}"><img src="/assets/catalog/catalog-11.jpg" alt="Artisan kitchen collection" loading="lazy"><span><small>{{ 'Table & kitchen' | translate }}</small><strong>{{ 'Made to gather around' | translate }}</strong></span></a></div>
        </div>
      </div>
    </section>

    <section class="advantage-section section-space">
      <div class="container-xxl px-4 text-center"><div class="section-heading mx-auto mb-5"><div class="eyebrow">{{ 'Why Ma3rad El Gamila' | translate }}</div><h2>{{ 'The studio advantage' | translate }}</h2><p>{{ 'Thoughtful selection and dependable service, from first click to daily use.' | translate }}</p></div><div class="row g-4"><div class="col-md-4"><div class="advantage-card"><i class="bi bi-gem"></i><h3>{{ 'Intentional quality' | translate }}</h3><p>{{ 'Every object is reviewed for materials, finish, function, and lasting appeal.' | translate }}</p></div></div><div class="col-md-4"><div class="advantage-card"><i class="bi bi-lightning-charge"></i><h3>{{ 'Fast delivery' | translate }}</h3><p>{{ 'Clear stock visibility, prompt fulfillment, and tracking throughout the journey.' | translate }}</p></div></div><div class="col-md-4"><div class="advantage-card"><i class="bi bi-shield-check"></i><h3>{{ '30-day returns' | translate }}</h3><p>{{ 'A straightforward return window and responsive support if something is not right.' | translate }}</p></div></div></div></div>
    </section>

    <section class="newsletter-section"><div class="container-xxl px-4"><div class="newsletter-card"><div><div class="eyebrow">{{ 'Studio notes' | translate }}</div><h2>{{ 'Objects, spaces, and new arrivals.' | translate }}</h2><p>{{ 'Join our monthly edit. No noise, just considered inspiration.' | translate }}</p></div><form class="newsletter-form" (submit)="$event.preventDefault()"><input type="email" [placeholder]="'Email address' | translate" [attr.aria-label]="'Email address' | translate" required><button class="btn btn-ink" type="submit">{{ 'Subscribe' | translate }}</button></form></div></div></section>
  `,
})
export class HomeComponent implements OnInit {
  readonly products = signal<Product[]>([]);
  readonly loading = signal(true);
  constructor(private productService: ProductService) {}
  ngOnInit(): void {
    this.productService.list({ featured: true, limit: 4 }).subscribe({ next: (response) => { this.products.set(response.data.products); this.loading.set(false); }, error: () => this.loading.set(false) });
  }
}
