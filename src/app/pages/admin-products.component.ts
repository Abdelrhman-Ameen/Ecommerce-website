import { CurrencyPipe, DecimalPipe, TitleCasePipe } from '@angular/common';
import { Component, OnInit, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Product } from '../core/models';
import { ProductService } from '../core/product.service';
import { ToastService } from '../core/toast.service';
import { TranslatePipe } from '../shared/translate.pipe';

@Component({
  standalone: true,
  imports: [CurrencyPipe, DecimalPipe, TitleCasePipe, ReactiveFormsModule, TranslatePipe],
  template: `
    <div class="admin-page-heading"><div><h1>{{ 'Products' | translate }}</h1><p>{{ 'Create, edit, price, and manage catalog availability.' | translate }}</p></div><button class="btn btn-primary-luxe" type="button" (click)="openCreate()"><i class="bi bi-plus-lg me-2"></i>{{ 'Add product' | translate }}</button></div>
    <section class="admin-card"><div class="admin-card-head admin-search-head"><form (submit)="searchProducts($event)"><i class="bi bi-search"></i><input type="search" [placeholder]="'Search catalog' | translate" [value]="search()" (input)="search.set($any($event.target).value)"></form><span>{{ products().length }} {{ 'products' | translate }}</span></div><div class="table-responsive"><table class="table align-middle product-admin-table"><thead><tr><th>{{ 'Product' | translate }}</th><th>{{ 'Category' | translate }}</th><th>{{ 'Price' | translate }}</th><th>{{ 'Margin' | translate }}</th><th>{{ 'Availability' | translate }}</th><th>{{ 'Featured' | translate }}</th><th class="text-end">{{ 'Actions' | translate }}</th></tr></thead><tbody>@for (product of products(); track product._id) { <tr><td><div class="admin-product-cell"><img [src]="product.imageUrl" [alt]="product.name"><div><strong>{{ product.name }}</strong><small>{{ (product.collection || 'Core catalog') | titlecase }}</small></div></div></td><td>{{ product.category | titlecase }}</td><td><strong>{{ product.price | currency }}</strong><small class="d-block text-secondary">{{ 'Cost' | translate }}: {{ (product.costPrice || 0) | currency }}</small></td><td>{{ margin(product) | number:'1.0-1' }}%</td><td><span class="availability-badge" [class.unavailable]="!available(product)">{{ available(product) ? (product.stock + ' ' + ('in stock' | translate)) : ('Out of stock' | translate) }}</span>@if (product.isManuallyUnavailable && product.stock > 0) { <small class="d-block text-secondary mt-1">{{ 'Manual override' | translate }}</small> }</td><td><i class="bi" [class.bi-star-fill]="product.featured" [class.bi-star]="!product.featured"></i></td><td class="text-end"><button class="btn btn-sm btn-outline-secondary me-2" type="button" (click)="openEdit(product)" [attr.aria-label]="'Edit' | translate"><i class="bi bi-pencil"></i></button><button class="btn btn-sm btn-outline-danger" type="button" (click)="remove(product)" [attr.aria-label]="'Delete' | translate"><i class="bi bi-trash"></i></button></td></tr> } @empty { <tr><td colspan="7"><div class="empty-state compact">{{ 'No products found' | translate }}.</div></td></tr> }</tbody></table></div></section>
    @if (formOpen()) { <div class="drawer-backdrop" (click)="closeForm()"></div><aside class="admin-drawer"><div class="drawer-head"><div><div class="eyebrow">{{ 'Catalog editor' | translate }}</div><h2>{{ (editing() ? 'Edit product' : 'New product') | translate }}</h2></div><button type="button" (click)="closeForm()"><i class="bi bi-x-lg"></i></button></div><form [formGroup]="form" (ngSubmit)="save()" novalidate>
      <div class="form-group-luxe"><label for="productName">{{ 'Name' | translate }} <span class="required-mark">*</span></label><input id="productName" class="form-control" formControlName="name" [class.is-invalid]="invalid('name')">@if (invalid('name')) { <small>{{ 'Enter at least 2 characters' | translate }}</small> }</div>
      <div class="form-group-luxe"><label for="productDescription">{{ 'Description' | translate }} <span class="required-mark">*</span></label><textarea id="productDescription" class="form-control" rows="4" formControlName="description" [class.is-invalid]="invalid('description')"></textarea><small class="form-hint">{{ form.controls.description.value.length }}/1200 — {{ 'minimum 20 characters' | translate }}</small></div>
      <div class="row g-3"><div class="col-6"><div class="form-group-luxe"><label for="productCategory">{{ 'Category' | translate }} <span class="required-mark">*</span></label><input id="productCategory" class="form-control" formControlName="category" list="categoryOptions" autocomplete="off" (blur)="normalizeCatalogField('category')" [class.is-invalid]="invalid('category')"><datalist id="categoryOptions">@for (category of categories(); track category) { <option [value]="category">{{ category | titlecase }}</option> }</datalist><small class="form-hint">{{ 'Choose an existing category or enter a new one.' | translate }}</small></div></div><div class="col-6"><div class="form-group-luxe"><label for="productCollection">{{ 'Collection' | translate }}</label><input id="productCollection" class="form-control" formControlName="collection" list="collectionOptions" autocomplete="off" (blur)="normalizeCatalogField('collection')"><datalist id="collectionOptions">@for (collection of collections(); track collection) { <option [value]="collection">{{ collection | titlecase }}</option> }</datalist></div></div></div>
      <div class="row g-3"><div class="col-6"><div class="form-group-luxe"><label for="productPrice">{{ 'Selling price' | translate }} <span class="required-mark">*</span></label><input id="productPrice" class="form-control" type="number" min="0" step="0.01" formControlName="price" [class.is-invalid]="invalid('price')"></div></div><div class="col-6"><div class="form-group-luxe"><label for="productCostPrice">{{ 'Cost price' | translate }} <span class="required-mark">*</span></label><input id="productCostPrice" class="form-control" type="number" min="0" step="0.01" formControlName="costPrice" [class.is-invalid]="invalid('costPrice')"><small class="form-hint">{{ 'Used for profit analytics; never shown to customers.' | translate }}</small></div></div></div>
      <div class="row g-3"><div class="col-6"><div class="form-group-luxe"><label for="productOldPrice">{{ 'Old price' | translate }}</label><input id="productOldPrice" class="form-control" type="number" min="0" step="0.01" formControlName="oldPrice"></div></div><div class="col-6"><div class="form-group-luxe"><label for="productStock">{{ 'Stock' | translate }} <span class="required-mark">*</span></label><input id="productStock" class="form-control" type="number" min="0" step="1" formControlName="stock" [class.is-invalid]="invalid('stock')"></div></div></div>
      <div class="form-group-luxe"><label for="productImageUrl">{{ 'Image path or HTTPS URL' | translate }} <span class="required-mark">*</span></label><input id="productImageUrl" class="form-control" formControlName="imageUrl" [class.is-invalid]="invalid('imageUrl')"><small class="form-hint">{{ 'Use /assets/... for bundled images.' | translate }}</small>@if (form.controls.imageUrl.valid) { <img class="admin-image-preview mt-2" [src]="form.controls.imageUrl.value" alt="Product preview"> }</div>
      <div class="admin-option-grid mb-4"><label class="form-check"><input class="form-check-input" type="checkbox" formControlName="featured"><span class="form-check-label">{{ 'Featured' | translate }}</span></label><label class="form-check"><input class="form-check-input" type="checkbox" formControlName="isNewArrival"><span class="form-check-label">{{ 'New arrival' | translate }}</span></label><label class="form-check manual-stock-option"><input class="form-check-input" type="checkbox" formControlName="isManuallyUnavailable"><span><strong>{{ 'Mark out of stock' | translate }}</strong><small>{{ 'Hide purchasing even when physical stock remains.' | translate }}</small></span></label></div>
      <div class="d-flex gap-2"><button class="btn btn-primary-luxe flex-grow-1" type="submit" [disabled]="saving()">@if (saving()) { <span class="spinner-border spinner-border-sm me-2"></span> }{{ (saving() ? 'Saving...' : 'Save product') | translate }}</button><button class="btn btn-outline-ink" type="button" (click)="closeForm()">{{ 'Cancel' | translate }}</button></div>
    </form></aside> }
  `,
})
export class AdminProductsComponent implements OnInit {
  readonly products = signal<Product[]>([]);
  readonly categories = signal<string[]>([]);
  readonly collections = signal<string[]>([]);
  readonly search = signal('');
  readonly formOpen = signal(false);
  readonly editing = signal<Product | null>(null);
  readonly saving = signal(false);
  readonly form;

  constructor(private api: ProductService, private toast: ToastService, fb: FormBuilder) {
    this.form = fb.nonNullable.group({
      name: ['', [Validators.required, Validators.minLength(2), Validators.maxLength(120)]],
      description: ['', [Validators.required, Validators.minLength(20), Validators.maxLength(1200)]],
      category: ['', [Validators.required, Validators.minLength(2), Validators.maxLength(50)]],
      collection: ['', Validators.maxLength(80)],
      price: [0, [Validators.required, Validators.min(0), Validators.max(1000000)]],
      costPrice: [0, [Validators.required, Validators.min(0), Validators.max(1000000)]],
      oldPrice: [0, [Validators.min(0), Validators.max(1000000)]],
      stock: [0, [Validators.required, Validators.min(0), Validators.max(100000)]],
      imageUrl: ['/assets/catalog/catalog-01.jpg', [Validators.required, Validators.pattern(/^(\/assets\/|https:\/\/)/)]],
      featured: [false],
      isNewArrival: [false],
      isManuallyUnavailable: [false],
      gallery: [[] as string[]],
    });
  }

  ngOnInit(): void { this.load(); }
  load(search = ''): void { this.api.list({ search, limit: 48, sort: 'newest' }).subscribe((response) => { this.products.set(response.data.products); this.categories.set(response.data.categories || []); this.collections.set(response.data.collections || []); }); }
  searchProducts(event: Event): void { event.preventDefault(); this.load(this.search()); }
  openCreate(): void { this.editing.set(null); this.form.reset({ name: '', description: '', category: '', collection: '', price: 0, costPrice: 0, oldPrice: 0, stock: 0, imageUrl: '/assets/catalog/catalog-01.jpg', featured: false, isNewArrival: false, isManuallyUnavailable: false, gallery: [] }); this.formOpen.set(true); }
  openEdit(product: Product): void { this.editing.set(product); this.form.reset({ name: product.name, description: product.description, category: product.category, collection: product.collection || '', price: product.price, costPrice: product.costPrice || 0, oldPrice: product.oldPrice || 0, stock: product.stock, imageUrl: product.imageUrl, featured: product.featured, isNewArrival: product.isNewArrival, isManuallyUnavailable: product.isManuallyUnavailable || false, gallery: product.gallery || [] }); this.formOpen.set(true); }
  closeForm(): void { this.formOpen.set(false); this.editing.set(null); }
  normalizeCatalogField(field: 'category' | 'collection'): void { const control = this.form.controls[field]; control.setValue(control.value.trim().replace(/\s+/g, ' ').toLowerCase()); }
  invalid(name: keyof typeof this.form.controls): boolean { const control = this.form.controls[name]; return control.invalid && (control.touched || control.dirty); }
  save(): void {
    this.normalizeCatalogField('category');
    this.normalizeCatalogField('collection');
    if (this.form.invalid) { this.form.markAllAsTouched(); return; }
    this.saving.set(true);
    const raw = this.form.getRawValue();
    const payload = { ...raw, oldPrice: raw.oldPrice || null };
    const request = this.editing() ? this.api.update(this.editing()!._id, payload) : this.api.create(payload);
    request.subscribe({ next: (response) => { this.toast.success(response.message || 'Product saved'); this.saving.set(false); this.closeForm(); this.load(this.search()); }, error: () => this.saving.set(false) });
  }
  remove(product: Product): void { if (!window.confirm(`Delete ${product.name}? This cannot be undone.`)) return; this.api.remove(product._id).subscribe(() => { this.toast.info('Product deleted'); this.products.update((items) => items.filter((item) => item._id !== product._id)); }); }
  available(product: Product): boolean { return product.stock > 0 && !product.isManuallyUnavailable; }
  margin(product: Product): number { return product.price > 0 ? ((product.price - (product.costPrice || 0)) / product.price) * 100 : 0; }
}
