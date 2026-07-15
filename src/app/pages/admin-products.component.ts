import { CurrencyPipe, TitleCasePipe } from '@angular/common';
import { Component, OnInit, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { firstValueFrom } from 'rxjs';
import { AdminService } from '../core/admin.service';
import { ImageUploadService } from '../core/image-upload.service';
import { CatalogCategory, Product } from '../core/models';
import { ProductService } from '../core/product.service';
import { ToastService } from '../core/toast.service';
import { TranslatePipe } from '../shared/translate.pipe';

@Component({
  standalone: true,
  imports: [CurrencyPipe, TitleCasePipe, ReactiveFormsModule, TranslatePipe],
  template: `
    <div class="admin-page-heading"><div><h1>{{ 'Products' | translate }}</h1><p>{{ 'Create, edit, price, and manage catalog availability.' | translate }}</p></div><div class="d-flex flex-wrap gap-2"><button class="btn btn-outline-ink" type="button" (click)="openCategoryManager()"><i class="bi bi-tags me-2"></i>{{ 'Manage categories' | translate }}</button><button class="btn btn-primary-luxe" type="button" (click)="openCreate()"><i class="bi bi-plus-lg me-2"></i>{{ 'Add product' | translate }}</button></div></div>
    <section class="admin-card"><div class="admin-card-head admin-search-head"><form (submit)="searchProducts($event)"><i class="bi bi-search"></i><input type="search" [placeholder]="'Search catalog' | translate" [value]="search()" (input)="search.set($any($event.target).value)"></form><span>{{ products().length }} {{ 'products' | translate }}</span></div><div class="table-responsive"><table class="table align-middle product-admin-table"><thead><tr><th>{{ 'Product' | translate }}</th><th>{{ 'Category' | translate }}</th><th>{{ 'Price' | translate }}</th><th>{{ 'Availability' | translate }}</th><th>{{ 'Featured' | translate }}</th><th class="text-end">{{ 'Actions' | translate }}</th></tr></thead><tbody>@for (product of products(); track product._id) { <tr><td><div class="admin-product-cell"><img [src]="product.imageUrl" [alt]="product.name"><div><strong>{{ product.name }}</strong><small>{{ product.category | titlecase }}</small></div></div></td><td>{{ product.category | titlecase }}</td><td><strong>{{ product.price | currency }}</strong></td><td><span class="availability-badge" [class.unavailable]="!available(product)">{{ available(product) ? (product.stock + ' ' + ('in stock' | translate)) : ('Out of stock' | translate) }}</span>@if (product.isManuallyUnavailable && product.stock > 0) { <small class="d-block text-secondary mt-1">{{ 'Manual override' | translate }}</small> }</td><td><i class="bi" [class.bi-star-fill]="product.featured" [class.bi-star]="!product.featured"></i></td><td class="text-end"><button class="btn btn-sm btn-outline-secondary me-2" type="button" (click)="openEdit(product)" [attr.aria-label]="'Edit' | translate"><i class="bi bi-pencil"></i></button><button class="btn btn-sm btn-outline-danger" type="button" (click)="remove(product)" [attr.aria-label]="'Delete' | translate"><i class="bi bi-trash"></i></button></td></tr> } @empty { <tr><td colspan="6"><div class="empty-state compact">{{ 'No products found' | translate }}.</div></td></tr> }</tbody></table></div></section>

    @if (formOpen()) { <div class="drawer-backdrop" (click)="closeForm()"></div><aside class="admin-drawer product-editor-drawer"><div class="drawer-head"><div><div class="eyebrow">{{ 'Catalog editor' | translate }}</div><h2>{{ (editing() ? 'Edit product' : 'New product') | translate }}</h2></div><button type="button" (click)="closeForm()"><i class="bi bi-x-lg"></i></button></div><form [formGroup]="form" (ngSubmit)="save()" novalidate>
      <div class="form-group-luxe"><label for="productName">{{ 'Name' | translate }} <span class="required-mark">*</span></label><input id="productName" class="form-control" formControlName="name" [class.is-invalid]="invalid('name')">@if (invalid('name')) { <small>{{ 'Enter at least 2 characters' | translate }}</small> }</div>
      <div class="form-group-luxe"><label for="productDescription">{{ 'Description' | translate }} <span class="required-mark">*</span></label><textarea id="productDescription" class="form-control" rows="4" formControlName="description" [class.is-invalid]="invalid('description')"></textarea><small class="form-hint">{{ form.controls.description.value.length }}/1200 — {{ 'minimum 20 characters' | translate }}</small></div>
      <div class="form-group-luxe"><div class="field-label-row"><label for="productCategory">{{ 'Category' | translate }} <span class="required-mark">*</span></label><button type="button" (click)="openCategoryManager()"><i class="bi bi-plus-circle me-1"></i>{{ 'Create category' | translate }}</button></div><select id="productCategory" class="form-select" formControlName="category" [class.is-invalid]="invalid('category')"><option value="">{{ 'Choose category' | translate }}</option>@for (category of categories(); track category.name) { <option [value]="category.name">{{ category.name | titlecase }}</option> }</select><small class="form-hint">{{ 'Categories are managed centrally to prevent duplicates and typos.' | translate }}</small></div>
      <div class="form-group-luxe"><label>{{ 'Product image' | translate }} <span class="required-mark">*</span></label><div class="product-media-uploader" [class.is-dragging]="dragging()" [class.has-image]="!!form.controls.imageUrl.value" (dragenter)="dragOver($event)" (dragover)="dragOver($event)" (dragleave)="dragLeave($event)" (drop)="dropImage($event)">
        @if (form.controls.imageUrl.value) { <div class="product-upload-preview"><img [src]="form.controls.imageUrl.value" [alt]="form.controls.name.value || 'Product preview'"><div><span><i class="bi bi-check-circle-fill"></i>{{ 'Image ready' | translate }}</span><small>{{ 'Choose another image to replace it.' | translate }}</small></div></div> }
        @else { <div class="product-upload-empty"><i class="bi bi-cloud-arrow-up"></i><strong>{{ 'Drop a product photo here' | translate }}</strong><span>{{ 'or choose it from your device' | translate }}</span></div> }
        <div class="product-upload-actions"><label class="btn btn-primary-luxe" [class.disabled]="uploading()"><i class="bi bi-images me-2"></i>{{ (uploading() ? uploadStatus() : 'Choose from gallery') | translate }}<input type="file" accept="image/*" (change)="selectImage($event)" [disabled]="uploading()"></label><label class="btn btn-outline-ink mobile-camera-action" [class.disabled]="uploading()"><i class="bi bi-camera me-2"></i>{{ 'Take a photo' | translate }}<input type="file" accept="image/*" capture="environment" (change)="selectImage($event)" [disabled]="uploading()"></label></div>
      </div>@if (invalid('imageUrl')) { <small class="upload-validation">{{ 'Upload a product image before saving.' | translate }}</small> }
      <button class="image-url-toggle" type="button" (click)="showUrlFallback.update(value => !value)"><i class="bi bi-link-45deg"></i>{{ (showUrlFallback() ? 'Hide image URL option' : 'Use an image URL instead') | translate }}</button>@if (showUrlFallback()) { <div class="mt-2"><input id="productImageUrl" class="form-control" formControlName="imageUrl" placeholder="https://... or /assets/..."><small class="form-hint">{{ 'HTTPS and bundled asset paths remain available as a fallback.' | translate }}</small></div> }</div>
      <div class="row g-3"><div class="col-12"><div class="form-group-luxe"><label for="productPrice">{{ 'Selling price' | translate }} <span class="required-mark">*</span></label><input id="productPrice" class="form-control" type="number" min="0" step="0.01" formControlName="price" [class.is-invalid]="invalid('price')"></div></div><div class="col-6"><div class="form-group-luxe"><label for="productOldPrice">{{ 'Old price' | translate }}</label><input id="productOldPrice" class="form-control" type="number" min="0" step="0.01" formControlName="oldPrice"></div></div><div class="col-6"><div class="form-group-luxe"><label for="productStock">{{ 'Stock' | translate }} <span class="required-mark">*</span></label><input id="productStock" class="form-control" type="number" min="0" step="1" formControlName="stock" [class.is-invalid]="invalid('stock')"></div></div></div>
      <div class="admin-option-grid mb-4"><label class="form-check"><input class="form-check-input" type="checkbox" formControlName="featured"><span class="form-check-label">{{ 'Featured' | translate }}</span></label><label class="form-check"><input class="form-check-input" type="checkbox" formControlName="isNewArrival"><span class="form-check-label">{{ 'New arrival' | translate }}</span></label><label class="form-check manual-stock-option"><input class="form-check-input" type="checkbox" formControlName="isManuallyUnavailable"><span><strong>{{ 'Mark out of stock' | translate }}</strong><small>{{ 'Hide purchasing even when physical stock remains.' | translate }}</small></span></label></div>
      <div class="d-flex gap-2"><button class="btn btn-primary-luxe flex-grow-1" type="submit" [disabled]="saving() || uploading()">@if (saving()) { <span class="spinner-border spinner-border-sm me-2"></span> }{{ (saving() ? 'Saving...' : 'Save product') | translate }}</button><button class="btn btn-outline-ink" type="button" (click)="closeForm()">{{ 'Cancel' | translate }}</button></div>
    </form></aside> }

    @if (categoryManagerOpen()) { <div class="category-manager-backdrop" (click)="closeCategoryManager()"></div><section class="category-manager-panel"><div class="drawer-head"><div><div class="eyebrow">{{ 'Catalog structure' | translate }}</div><h2>{{ 'Manage categories' | translate }}</h2></div><button type="button" (click)="closeCategoryManager()"><i class="bi bi-x-lg"></i></button></div><form class="category-create-form" [formGroup]="categoryForm" (ngSubmit)="createCategory()"><label for="newCategory">{{ 'New category name' | translate }}</label><div><input id="newCategory" class="form-control" formControlName="name" [placeholder]="'Example: Evening wear' | translate"><button class="btn btn-primary-luxe" type="submit" [disabled]="categoryForm.invalid || savingCategory()">{{ (savingCategory() ? 'Adding...' : 'Add category') | translate }}</button></div></form><div class="category-list">@for (category of categories(); track category.name) { <article><div><strong>{{ category.name | titlecase }}</strong><small>{{ category.productCount }} {{ 'products' | translate }}</small></div>@if (category._id && category.productCount === 0) { <button type="button" (click)="deleteCategory(category)" [attr.aria-label]="'Delete' | translate"><i class="bi bi-trash"></i></button> } @else { <i class="bi bi-lock"></i> }</article> } @empty { <div class="empty-state compact">{{ 'Create your first category.' | translate }}</div> }</div></section> }
  `,
})
export class AdminProductsComponent implements OnInit {
  readonly products = signal<Product[]>([]);
  readonly categories = signal<CatalogCategory[]>([]);
  readonly search = signal('');
  readonly formOpen = signal(false);
  readonly categoryManagerOpen = signal(false);
  readonly editing = signal<Product | null>(null);
  readonly saving = signal(false);
  readonly uploading = signal(false);
  readonly uploadStatus = signal('Optimizing...');
  readonly dragging = signal(false);
  readonly showUrlFallback = signal(false);
  readonly savingCategory = signal(false);
  readonly form;
  readonly categoryForm;

  constructor(private api: ProductService, private admin: AdminService, private imageUpload: ImageUploadService, private toast: ToastService, private route: ActivatedRoute, fb: FormBuilder) {
    this.form = fb.nonNullable.group({
      name: ['', [Validators.required, Validators.minLength(2), Validators.maxLength(120)]],
      description: ['', [Validators.required, Validators.minLength(20), Validators.maxLength(1200)]],
      category: ['', [Validators.required, Validators.minLength(2), Validators.maxLength(50)]],
      price: [0, [Validators.required, Validators.min(0), Validators.max(1000000)]],
      oldPrice: [0, [Validators.min(0), Validators.max(1000000)]],
      stock: [0, [Validators.required, Validators.min(0), Validators.max(100000)]],
      imageUrl: ['', [Validators.required, Validators.pattern(/^(\/assets\/|\/api\/v1\/site\/media\/[a-f0-9]{24}$|https:\/\/)/i)]],
      featured: [false],
      isNewArrival: [false],
      isManuallyUnavailable: [false],
      gallery: [[] as string[]],
    });
    this.categoryForm = fb.nonNullable.group({ name: ['', [Validators.required, Validators.minLength(2), Validators.maxLength(50)]] });
  }

  ngOnInit(): void { this.load(); this.loadCategories(); if (this.route.snapshot.queryParamMap.get('manage') === 'categories') this.openCategoryManager(); }
  load(search = ''): void { this.api.list({ search, limit: 48, sort: 'newest' }).subscribe((response) => this.products.set(response.data.products)); }
  loadCategories(): void { this.admin.categories().subscribe((categories) => this.categories.set(categories)); }
  searchProducts(event: Event): void { event.preventDefault(); this.load(this.search()); }
  openCreate(): void { this.editing.set(null); this.showUrlFallback.set(false); this.form.reset({ name: '', description: '', category: '', price: 0, oldPrice: 0, stock: 0, imageUrl: '', featured: false, isNewArrival: false, isManuallyUnavailable: false, gallery: [] }); this.formOpen.set(true); }
  openEdit(product: Product): void { this.editing.set(product); this.showUrlFallback.set(false); this.form.reset({ name: product.name, description: product.description, category: product.category, price: product.price, oldPrice: product.oldPrice || 0, stock: product.stock, imageUrl: product.imageUrl, featured: product.featured, isNewArrival: product.isNewArrival, isManuallyUnavailable: product.isManuallyUnavailable || false, gallery: product.gallery || [] }); this.formOpen.set(true); }
  closeForm(): void { if (this.saving() || this.uploading()) return; this.formOpen.set(false); this.editing.set(null); }
  invalid(name: keyof typeof this.form.controls): boolean { const control = this.form.controls[name]; return control.invalid && (control.touched || control.dirty); }

  async selectImage(event: Event): Promise<void> { const input = event.target as HTMLInputElement; const file = input.files?.[0]; if (file) await this.uploadFile(file); input.value = ''; }
  dragOver(event: DragEvent): void { event.preventDefault(); if (!this.uploading()) this.dragging.set(true); }
  dragLeave(event: DragEvent): void { event.preventDefault(); this.dragging.set(false); }
  async dropImage(event: DragEvent): Promise<void> { event.preventDefault(); this.dragging.set(false); const file = event.dataTransfer?.files?.[0]; if (file && !this.uploading()) await this.uploadFile(file); }
  private async uploadFile(file: File): Promise<void> {
    this.uploading.set(true);
    this.uploadStatus.set('Optimizing...');
    try {
      const dataUrl = await this.imageUpload.optimize(file, { maxBytes: 520000, maxDimension: 1800 });
      this.uploadStatus.set('Uploading...');
      const imageUrl = await firstValueFrom(this.admin.uploadProductMedia(dataUrl));
      this.form.controls.imageUrl.setValue(imageUrl);
      this.form.controls.imageUrl.markAsDirty();
      this.showUrlFallback.set(false);
      this.toast.success('Product image uploaded');
    } catch (error) {
      this.toast.error(error instanceof Error ? error.message : 'Could not upload that image');
    } finally {
      this.uploading.set(false);
      this.uploadStatus.set('Optimizing...');
    }
  }

  openCategoryManager(): void { this.categoryManagerOpen.set(true); this.categoryForm.reset({ name: '' }); }
  closeCategoryManager(): void { if (!this.savingCategory()) this.categoryManagerOpen.set(false); }
  createCategory(): void {
    if (this.categoryForm.invalid || this.savingCategory()) return;
    this.savingCategory.set(true);
    this.admin.createCategory(this.categoryForm.controls.name.value).subscribe({
      next: (category) => { this.categories.update((items) => [...items, category].sort((a, b) => a.name.localeCompare(b.name))); this.form.controls.category.setValue(category.name); this.categoryForm.reset({ name: '' }); this.savingCategory.set(false); this.toast.success('Category created'); },
      error: () => this.savingCategory.set(false),
    });
  }
  deleteCategory(category: CatalogCategory): void { if (!category._id || !window.confirm(`Delete ${category.name}?`)) return; this.admin.deleteCategory(category._id).subscribe(() => this.categories.update((items) => items.filter((item) => item._id !== category._id))); }

  save(): void {
    if (this.form.invalid || this.uploading()) { this.form.markAllAsTouched(); return; }
    this.saving.set(true);
    const raw = this.form.getRawValue();
    const payload = { ...raw, category: raw.category.trim().replace(/\s+/g, ' ').toLowerCase(), oldPrice: raw.oldPrice || null };
    const request = this.editing() ? this.api.update(this.editing()!._id, payload) : this.api.create(payload);
    request.subscribe({ next: (response) => { this.toast.success(response.message || 'Product saved'); this.saving.set(false); this.closeForm(); this.load(this.search()); this.loadCategories(); }, error: () => this.saving.set(false) });
  }
  remove(product: Product): void { if (!window.confirm(`Delete ${product.name}? This cannot be undone.`)) return; this.api.remove(product._id).subscribe(() => { this.toast.info('Product deleted'); this.products.update((items) => items.filter((item) => item._id !== product._id)); this.loadCategories(); }); }
  available(product: Product): boolean { return product.stock > 0 && !product.isManuallyUnavailable; }
}
