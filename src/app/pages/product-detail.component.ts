import { Component, OnInit, signal } from '@angular/core';
import { CurrencyPipe, TitleCasePipe } from '@angular/common';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { Product } from '../core/models';
import { ProductService } from '../core/product.service';
import { CartService } from '../core/cart.service';
import { AuthService } from '../core/auth.service';
import { ProductCardComponent } from '../shared/product-card.component';
import { TranslatePipe } from '../shared/translate.pipe';
import { ToastService } from '../core/toast.service';

@Component({
  standalone: true,
  imports: [CurrencyPipe, TitleCasePipe, RouterLink, ProductCardComponent, TranslatePipe],
  template: `
    @if (loading()) { <div class="detail-loading container-xxl px-4"><div class="row g-5"><div class="col-lg-7"><div class="skeleton detail-image"></div></div><div class="col-lg-5"><div class="skeleton h-100"></div></div></div></div> }
    @else if (product(); as item) {
      <section class="product-detail-section"><div class="container-xxl px-4">
        <nav class="breadcrumb-line"><a routerLink="/">{{ 'Home' | translate }}</a><i class="bi bi-chevron-right"></i><a routerLink="/products">{{ 'Products' | translate }}</a><i class="bi bi-chevron-right"></i><span>{{ item.name }}</span></nav>
        <div class="row g-5 align-items-start">
          <div class="col-lg-7"><div class="detail-main-image"><img [src]="selectedImage() || item.imageUrl" [alt]="item.name"><span class="image-badge"><i class="bi bi-badge-hd"></i> {{ 'Studio imagery' | translate }}</span></div><div class="thumbnail-row">@for (image of gallery(item); track image) { <button type="button" [class.active]="(selectedImage() || item.imageUrl) === image" (click)="selectedImage.set(image)"><img [src]="image" alt=""></button> }</div></div>
          <div class="col-lg-5"><div class="product-detail-copy"><div class="eyebrow">{{ (item.collection || item.category) | titlecase }}</div><h1>{{ item.name }}</h1><div class="d-flex align-items-center gap-3 mb-4"><strong class="detail-price">{{ item.price | currency }}</strong>@if (item.oldPrice) { <span class="old-price">{{ item.oldPrice | currency }}</span> }<span class="rating"><i class="bi bi-star-fill"></i> {{ item.rating }} <small>({{ item.reviewsCount }} reviews)</small></span></div><p class="detail-description">{{ item.description }}</p>
            <div class="availability-card"><div><span class="stock-dot" [class.out]="item.stock === 0"></span><strong>{{ item.stock ? (item.stock + ' ' + ('in stock' | translate)) : ('Out of stock' | translate) }}</strong></div><small>{{ (item.stock ? 'Ships within 1–2 business days' : 'Join the restock list') | translate }}</small></div>
            <div class="detail-purchase-row"><div class="quantity-control"><button type="button" (click)="decrease()" [disabled]="quantity() <= 1" [attr.aria-label]="'Decrease quantity' | translate"><i class="bi bi-dash"></i></button><span>{{ quantity() }}</span><button type="button" (click)="increase(item.stock)" [disabled]="quantity() >= item.stock" [attr.aria-label]="'Increase quantity' | translate"><i class="bi bi-plus"></i></button></div><button class="btn btn-primary-luxe flex-grow-1" type="button" [disabled]="item.stock === 0 || adding()" (click)="add(item)"><i class="bi bi-bag me-2"></i>{{ (adding() ? 'Adding...' : 'Add to cart') | translate }}</button><button class="btn btn-outline-ink btn-icon" type="button" (click)="favorite(item)" [attr.aria-label]="'Favorite' | translate"><i class="bi" [class.bi-heart-fill]="isFavorite(item)" [class.bi-heart]="!isFavorite(item)"></i></button></div>
            <div class="detail-benefits"><span><i class="bi bi-truck"></i>{{ 'Free shipping' | translate }}</span><span><i class="bi bi-patch-check"></i>{{ 'Authentic' | translate }}</span><span><i class="bi bi-arrow-counterclockwise"></i>{{ '30-day returns' | translate }}</span></div>
            <div class="accordion detail-accordion" id="detailAccordion"><div class="accordion-item"><h2 class="accordion-header"><button class="accordion-button" type="button" data-bs-toggle="collapse" data-bs-target="#materials">{{ 'Materials & care' | translate }}</button></h2><div id="materials" class="accordion-collapse collapse show"><div class="accordion-body">{{ 'Made with carefully sourced materials. Wipe clean with a soft, dry cloth and avoid abrasive cleaners.' | translate }}</div></div></div><div class="accordion-item"><h2 class="accordion-header"><button class="accordion-button collapsed" type="button" data-bs-toggle="collapse" data-bs-target="#delivery">{{ 'Delivery & returns' | translate }}</button></h2><div id="delivery" class="accordion-collapse collapse"><div class="accordion-body">{{ 'Tracked delivery and a 30-day return window on unused products in original packaging.' | translate }}</div></div></div></div>
          </div></div>
        </div>
      </div></section>
      @if (related().length) { <section class="section-space bg-surface"><div class="container-xxl px-4"><div class="section-heading mb-4"><div class="eyebrow">{{ 'Complete the look' | translate }}</div><h2>{{ 'You may also like' | translate }}</h2></div><div class="row g-4">@for (relatedItem of related(); track relatedItem._id) { <div class="col-6 col-lg-3"><app-product-card [product]="relatedItem"/></div> }</div></div></section> }
    } @else { <div class="empty-state my-5"><i class="bi bi-box-seam"></i><h1>Product not found</h1><a class="btn btn-ink" routerLink="/products">{{ 'All products' | translate }}</a></div> }
  `,
})
export class ProductDetailComponent implements OnInit {
  readonly product = signal<Product | null>(null); readonly related = signal<Product[]>([]); readonly loading = signal(true); readonly selectedImage = signal(''); readonly quantity = signal(1); readonly adding = signal(false);
  constructor(private route: ActivatedRoute, private products: ProductService, private cart: CartService, private auth: AuthService, private router: Router, private toast: ToastService) {}
  ngOnInit(): void { this.route.paramMap.subscribe((params) => { const id = params.get('id'); if (id) this.load(id); }); }
  load(id: string): void { this.loading.set(true); this.products.get(id).subscribe({ next: (response) => { const product = response.data.product; this.product.set(product); this.selectedImage.set(product.imageUrl); this.loading.set(false); this.products.list({ category: product.category, limit: 4 }).subscribe((related) => this.related.set(related.data.products.filter((item) => item._id !== product._id).slice(0, 4))); }, error: () => this.router.navigate(['/404'], { replaceUrl: true }) }); }
  gallery(product: Product): string[] { return [...new Set([product.imageUrl, ...(product.gallery || [])])].slice(0, 5); }
  decrease(): void { this.quantity.update((value) => Math.max(1, value - 1)); }
  increase(stock: number): void { this.quantity.update((value) => Math.min(stock, value + 1)); }
  add(product: Product): void { if (!this.auth.user()) { this.router.navigate(['/login'], { queryParams: { redirect: this.router.url } }); return; } this.adding.set(true); this.cart.add(product._id, this.quantity()).subscribe({ next: () => this.adding.set(false), error: () => this.adding.set(false) }); }
  isFavorite(product: Product): boolean { return (this.auth.user()?.favorites || []).some((item) => (typeof item === 'string' ? item : item._id) === product._id); }
  favorite(product: Product): void { if (!this.auth.user()) { this.router.navigate(['/login'], { queryParams: { redirect: this.router.url } }); return; } this.auth.toggleFavorite(product._id).subscribe(() => this.toast.success(this.isFavorite(product) ? 'Saved to favorites' : 'Removed from favorites')); }
}
