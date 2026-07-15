import { TitleCasePipe } from '@angular/common';
import { Component, OnDestroy, OnInit, computed, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { Subscription } from 'rxjs';
import { Product } from '../core/models';
import { ProductService } from '../core/product.service';
import { ProductCardComponent } from '../shared/product-card.component';
import { TranslatePipe } from '../shared/translate.pipe';

@Component({
  standalone: true,
  imports: [ProductCardComponent, TitleCasePipe, TranslatePipe, FormsModule],
  template: `
    <section class="catalog-hero"><div class="container-xxl px-4"><div class="eyebrow">{{ 'Wear Your Confidence' | translate }}</div><h1>{{ 'All products' | translate }}</h1><p>{{ 'Browse the complete collection and filter by category, availability, or price.' | translate }}</p></div></section>
    <section class="catalog-section"><div class="container-xxl px-4"><div class="row g-5">
      <aside class="col-lg-3 catalog-sidebar" aria-label="Product filters">
        <div class="filter-heading"><div><h2>{{ 'Filters' | translate }}</h2><small>{{ activeFilterCount() }} {{ 'active' | translate }}</small></div><button type="button" (click)="clearFilters()">{{ 'Clear' | translate }}</button></div>
        <div class="filter-block"><h2>{{ 'Categories' | translate }}</h2><button type="button" [class.active]="!draftCategory()" (click)="draftCategory.set('')"><span>{{ 'All products' | translate }}</span></button>@for (item of categories(); track item) { <button type="button" [class.active]="draftCategory() === item" (click)="draftCategory.set(item)"><span>{{ item | titlecase }}</span></button> }</div>
        <div class="filter-block"><h2>{{ 'Collections' | translate }}</h2><select class="form-select" [value]="draftCollection()" (change)="draftCollection.set($any($event.target).value)"><option value="">{{ 'All collections' | translate }}</option>@for (item of collections(); track item) { <option [value]="item">{{ item | titlecase }}</option> }</select></div>
        <div class="filter-block"><h2>{{ 'Price range' | translate }}</h2><div class="price-inputs"><label><span>{{ 'Min' | translate }}</span><div><span>$</span><input type="number" min="0" [max]="draftMaxPrice()" [value]="draftMinPrice()" (input)="setDraftMin($event)"></div></label><label><span>{{ 'Max' | translate }}</span><div><span>$</span><input type="number" [min]="draftMinPrice()" [max]="catalogMax()" [value]="draftMaxPrice()" (input)="setDraftMax($event)"></div></label></div><input class="form-range mt-3" type="range" min="0" [max]="catalogMax()" step="5" [value]="draftMaxPrice()" (input)="setDraftMax($event)"><div class="d-flex justify-content-between"><small>$0</small><small>{{ '$' + draftMaxPrice() }}</small></div></div>
        <div class="filter-block"><h2>{{ 'Availability' | translate }}</h2><label class="form-check"><input class="form-check-input" type="checkbox" [checked]="draftInStock()" (change)="draftInStock.set($any($event.target).checked)"><span class="form-check-label">{{ 'In stock only' | translate }}</span></label><label class="form-check mt-3"><input class="form-check-input" type="checkbox" [checked]="draftNewOnly()" (change)="draftNewOnly.set($any($event.target).checked)"><span class="form-check-label">{{ 'New arrivals only' | translate }}</span></label><label class="form-check mt-3"><input class="form-check-input" type="checkbox" [checked]="draftFeatured()" (change)="draftFeatured.set($any($event.target).checked)"><span class="form-check-label">{{ 'Featured only' | translate }}</span></label></div>
        <button class="btn btn-primary-luxe w-100 apply-filter-button" type="button" (click)="applyFilters()"><i class="bi bi-funnel me-2"></i>{{ 'Apply filters' | translate }}</button>
      </aside>
      <div class="col-lg-9">
        <div class="catalog-toolbar"><form class="catalog-search" (submit)="submitSearch($event)"><button class="search-submit" type="submit" [attr.aria-label]="'Search products' | translate"><i class="bi bi-search"></i></button><input type="search" [placeholder]="'Search products' | translate" [attr.aria-label]="'Search products' | translate" [(ngModel)]="searchDraft" name="catalogSearch"></form><select class="form-select" [attr.aria-label]="'Sort products' | translate" [value]="sort()" (change)="changeSort($event)"><option value="newest">{{ 'Newest arrivals' | translate }}</option><option value="priceAsc">{{ 'Price: low to high' | translate }}</option><option value="priceDesc">{{ 'Price: high to low' | translate }}</option><option value="name">{{ 'Name' | translate }}</option></select></div>
        @if (loading()) { <div class="row g-4">@for (item of [1,2,3,4,5,6,7,8,9]; track item) { <div class="col-6 col-md-4"><div class="skeleton product-skeleton"></div></div> }</div> }
        @else if (!products().length) { <div class="empty-state"><i class="bi bi-search"></i><h2>{{ 'No products found' | translate }}</h2><p>{{ 'Try another search or clear the current filters.' | translate }}</p><button class="btn btn-ink" type="button" (click)="clearFilters()">{{ 'Clear filters' | translate }}</button></div> }
        @else { <div class="row g-4">@for (product of products(); track product._id) { <div class="col-6 col-md-4"><app-product-card [product]="product"/></div> }</div><div class="catalog-progress text-center mt-5"><small>{{ 'Showing' | translate }} {{ products().length }} {{ 'of' | translate }} {{ total() }} {{ 'products' | translate }}</small><div class="progress mx-auto my-3"><div class="progress-bar" [style.width.%]="total() ? products().length / total() * 100 : 0"></div></div>@if (page() < pages()) { <button class="btn btn-outline-ink px-5" type="button" (click)="loadMore()" [disabled]="loadingMore()">{{ (loadingMore() ? 'Loading…' : 'Load more products') | translate }}</button> }</div> }
      </div>
    </div></div></section>
  `,
})
export class CatalogComponent implements OnInit, OnDestroy {
  readonly products = signal<Product[]>([]);
  readonly categories = signal<string[]>([]);
  readonly collections = signal<string[]>([]);
  readonly total = signal(0);
  readonly pages = signal(1);
  readonly page = signal(1);
  readonly search = signal('');
  readonly category = signal('');
  readonly collection = signal('');
  readonly sort = signal('newest');
  readonly minPrice = signal(0);
  readonly maxPrice = signal(1000);
  readonly catalogMax = signal(1000);
  readonly inStock = signal(false);
  readonly featured = signal(false);
  readonly newOnly = signal(false);
  readonly draftCategory = signal('');
  readonly draftCollection = signal('');
  readonly draftMinPrice = signal(0);
  readonly draftMaxPrice = signal(1000);
  readonly draftInStock = signal(false);
  readonly draftFeatured = signal(false);
  readonly draftNewOnly = signal(false);
  readonly loading = signal(true);
  readonly loadingMore = signal(false);
  readonly activeFilterCount = computed(() => [this.category(), this.collection(), this.minPrice() > 0, this.maxPrice() < this.catalogMax(), this.inStock(), this.featured(), this.newOnly()].filter(Boolean).length);
  searchDraft = '';
  private querySubscription?: Subscription;

  constructor(private productsApi: ProductService, private route: ActivatedRoute, private router: Router) {}

  ngOnInit(): void {
    this.querySubscription = this.route.queryParams.subscribe((params) => {
      this.searchDraft = params['search'] || '';
      this.search.set(this.searchDraft);
      this.category.set(params['category'] || '');
      this.collection.set(params['collection'] || '');
      this.sort.set(params['sort'] || 'newest');
      this.inStock.set(params['inStock'] === 'true');
      this.featured.set(params['featured'] === 'true');
      this.newOnly.set(params['isNewArrival'] === 'true');
      this.minPrice.set(Math.max(0, Number(params['minPrice']) || 0));
      this.maxPrice.set(Math.max(this.minPrice(), Number(params['maxPrice']) || this.catalogMax()));
      this.syncDrafts();
      this.page.set(1);
      this.fetch(false);
    });
  }

  ngOnDestroy(): void { this.querySubscription?.unsubscribe(); }

  fetch(append: boolean): void {
    if (!append) this.loading.set(true); else this.loadingMore.set(true);
    this.productsApi.list({ search: this.search(), category: this.category(), collection: this.collection(), sort: this.sort(), inStock: this.inStock(), featured: this.featured(), minPrice: this.minPrice() || undefined, maxPrice: this.maxPrice() < this.catalogMax() ? this.maxPrice() : undefined, isNewArrival: this.newOnly(), page: this.page(), limit: 12 }).subscribe({
      next: (response) => {
        this.products.set(append ? [...this.products(), ...response.data.products] : response.data.products);
        this.categories.set(response.data.categories || []);
        this.collections.set(response.data.collections || []);
        const max = Math.max(5, Math.ceil((response.data.priceBounds?.max || 1000) / 5) * 5);
        this.catalogMax.set(max);
        if (!this.route.snapshot.queryParamMap.has('maxPrice')) { this.maxPrice.set(max); this.draftMaxPrice.set(max); }
        this.total.set(response.pagination?.total || 0);
        this.pages.set(response.pagination?.pages || 1);
        this.loading.set(false);
        this.loadingMore.set(false);
      },
      error: () => { this.loading.set(false); this.loadingMore.set(false); },
    });
  }

  updateQuery(values: Record<string, string | number | boolean | null>): void { this.router.navigate([], { relativeTo: this.route, queryParams: values, queryParamsHandling: 'merge' }); }
  submitSearch(event: Event): void { event.preventDefault(); this.updateQuery({ search: this.searchDraft.trim() || null }); }
  changeSort(event: Event): void { this.updateQuery({ sort: (event.target as HTMLSelectElement).value }); }
  setDraftMin(event: Event): void { this.draftMinPrice.set(Math.max(0, Number((event.target as HTMLInputElement).value) || 0)); }
  setDraftMax(event: Event): void { this.draftMaxPrice.set(Math.min(this.catalogMax(), Math.max(0, Number((event.target as HTMLInputElement).value) || 0))); }
  applyFilters(): void {
    const min = Math.min(this.draftMinPrice(), this.draftMaxPrice());
    const max = Math.max(this.draftMinPrice(), this.draftMaxPrice());
    this.updateQuery({ category: this.draftCategory() || null, collection: this.draftCollection() || null, minPrice: min || null, maxPrice: max < this.catalogMax() ? max : null, inStock: this.draftInStock() || null, featured: this.draftFeatured() || null, isNewArrival: this.draftNewOnly() || null });
  }
  loadMore(): void { this.page.update((value) => value + 1); this.fetch(true); }
  clearFilters(): void { this.router.navigate(['/products']); }
  private syncDrafts(): void { this.draftCategory.set(this.category()); this.draftCollection.set(this.collection()); this.draftMinPrice.set(this.minPrice()); this.draftMaxPrice.set(this.maxPrice()); this.draftInStock.set(this.inStock()); this.draftFeatured.set(this.featured()); this.draftNewOnly.set(this.newOnly()); }
}
