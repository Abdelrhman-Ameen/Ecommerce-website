import { Component, OnDestroy, OnInit, signal } from '@angular/core';
import { TitleCasePipe } from '@angular/common';
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
    <section class="catalog-hero"><div class="container-xxl px-4"><div class="eyebrow">{{ 'Studio catalog' | translate }}</div><h1>{{ 'All products' | translate }}</h1><p>{{ 'Discover objects selected to bring clarity, character, and lasting usefulness to everyday spaces.' | translate }}</p></div></section>
    <section class="catalog-section"><div class="container-xxl px-4"><div class="row g-5">
      <aside class="col-lg-3 catalog-sidebar">
        <div class="filter-block"><h2>{{ 'Categories' | translate }}</h2><button type="button" [class.active]="!category()" (click)="selectCategory('')"><span>{{ 'All products' | translate }}</span><small>{{ total() }}</small></button>@for (item of categories(); track item) { <button type="button" [class.active]="category() === item" (click)="selectCategory(item)"><span>{{ item | titlecase }}</span></button> }</div>
        <div class="filter-block"><h2>{{ 'Price range' | translate }}</h2><input class="form-range" type="range" min="25" max="1000" step="25" [value]="maxPrice()" (input)="changePrice($event)"><div class="d-flex justify-content-between"><small>$0</small><small>{{ maxPrice() >= 1000 ? '$1,000+' : ('$' + maxPrice()) }}</small></div></div>
        <div class="filter-block"><h2>{{ 'Stock status' | translate }}</h2><label class="form-check"><input class="form-check-input" type="checkbox" [checked]="inStock()" (change)="toggleStock($event)"><span class="form-check-label">{{ 'In stock only' | translate }}</span></label></div>
      </aside>
      <div class="col-lg-9">
        <div class="catalog-toolbar"><form class="catalog-search" (submit)="submitSearch($event)"><button class="search-submit" type="submit" [attr.aria-label]="'Search products' | translate"><i class="bi bi-search"></i></button><input type="search" [placeholder]="'Search products' | translate" [attr.aria-label]="'Search products' | translate" [(ngModel)]="searchDraft" name="catalogSearch"></form><select class="form-select" [attr.aria-label]="'Sort products' | translate" [value]="sort()" (change)="changeSort($event)"><option value="newest">{{ 'Newest arrivals' | translate }}</option><option value="priceAsc">{{ 'Price: low to high' | translate }}</option><option value="priceDesc">{{ 'Price: high to low' | translate }}</option><option value="rating">{{ 'Top rated' | translate }}</option><option value="name">{{ 'Name' | translate }}</option></select></div>
        @if (loading()) { <div class="row g-4">@for (item of [1,2,3,4,5,6,7,8,9]; track item) { <div class="col-6 col-md-4"><div class="skeleton product-skeleton"></div></div> }</div> }
        @else if (!products().length) { <div class="empty-state"><i class="bi bi-search"></i><h2>{{ 'No products found' | translate }}</h2><p>{{ 'Try another search or clear the current filters.' | translate }}</p><button class="btn btn-ink" type="button" (click)="clearFilters()">{{ 'Clear filters' | translate }}</button></div> }
        @else { <div class="row g-4">@for (product of products(); track product._id) { <div class="col-6 col-md-4"><app-product-card [product]="product"/></div> }</div><div class="catalog-progress text-center mt-5"><small>{{ 'Showing' | translate }} {{ products().length }} {{ 'of' | translate }} {{ total() }} {{ 'products' | translate }}</small><div class="progress mx-auto my-3"><div class="progress-bar" [style.width.%]="products().length / total() * 100"></div></div>@if (page() < pages()) { <button class="btn btn-outline-ink px-5" type="button" (click)="loadMore()" [disabled]="loadingMore()">{{ (loadingMore() ? 'Loading…' : 'Load more products') | translate }}</button> }</div> }
      </div>
    </div></div></section>
  `,
})
export class CatalogComponent implements OnInit, OnDestroy {
  readonly products = signal<Product[]>([]); readonly categories = signal<string[]>([]); readonly total = signal(0); readonly pages = signal(1); readonly page = signal(1);
  readonly search = signal(''); readonly category = signal(''); readonly sort = signal('newest'); readonly maxPrice = signal(1000); readonly inStock = signal(false); readonly loading = signal(true); readonly loadingMore = signal(false);
  searchDraft = '';
  private querySubscription?: Subscription;
  constructor(private productsApi: ProductService, private route: ActivatedRoute, private router: Router) {}
  ngOnInit(): void { this.querySubscription = this.route.queryParams.subscribe((params) => { this.searchDraft = params['search'] || ''; this.search.set(this.searchDraft); this.category.set(params['category'] || ''); this.sort.set(params['sort'] || 'newest'); this.inStock.set(params['inStock'] === 'true'); this.maxPrice.set(Number(params['maxPrice']) || 1000); this.page.set(1); this.fetch(false); }); }
  ngOnDestroy(): void { this.querySubscription?.unsubscribe(); }
  fetch(append: boolean): void { if (!append) this.loading.set(true); else this.loadingMore.set(true); this.productsApi.list({ search: this.search(), category: this.category(), sort: this.sort(), inStock: this.inStock(), maxPrice: this.maxPrice() < 1000 ? this.maxPrice() : undefined, isNewArrival: this.route.snapshot.queryParamMap.get('isNewArrival') === 'true', page: this.page(), limit: 12 }).subscribe({ next: (response) => { this.products.set(append ? [...this.products(), ...response.data.products] : response.data.products); this.categories.set(response.data.categories); this.total.set(response.pagination?.total || 0); this.pages.set(response.pagination?.pages || 1); this.loading.set(false); this.loadingMore.set(false); }, error: () => { this.loading.set(false); this.loadingMore.set(false); } }); }
  updateQuery(values: Record<string, string | number | boolean | null>): void { this.router.navigate([], { relativeTo: this.route, queryParams: values, queryParamsHandling: 'merge' }); }
  submitSearch(event: Event): void { event.preventDefault(); this.updateQuery({ search: this.searchDraft.trim() || null }); }
  selectCategory(value: string): void { this.updateQuery({ category: value || null }); }
  changeSort(event: Event): void { this.updateQuery({ sort: (event.target as HTMLSelectElement).value }); }
  changePrice(event: Event): void { this.maxPrice.set(Number((event.target as HTMLInputElement).value)); this.updateQuery({ maxPrice: this.maxPrice() < 1000 ? this.maxPrice() : null }); }
  toggleStock(event: Event): void { this.updateQuery({ inStock: (event.target as HTMLInputElement).checked || null }); }
  loadMore(): void { this.page.update((value) => value + 1); this.fetch(true); }
  clearFilters(): void { this.router.navigate(['/products']); }
}
