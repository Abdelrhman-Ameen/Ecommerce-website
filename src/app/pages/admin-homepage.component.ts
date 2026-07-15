import { Component, OnInit, signal } from '@angular/core';
import { AdminService } from '../core/admin.service';
import { HomepageMediaMode, HomepageSettings, Product } from '../core/models';
import { ProductService } from '../core/product.service';
import { ToastService } from '../core/toast.service';
import { TranslatePipe } from '../shared/translate.pipe';

type MediaSection = 'hero' | 'editorial';

@Component({
  standalone: true,
  imports: [TranslatePipe],
  template: `
    <div class="admin-page-heading"><div><h1>{{ 'Homepage editor' | translate }}</h1><p>{{ 'Choose the campaign images yourself without changing code.' | translate }}</p></div><button class="btn btn-primary-luxe" type="button" (click)="save()" [disabled]="saving()"><i class="bi bi-cloud-check me-2"></i>{{ (saving() ? 'Saving...' : 'Publish homepage') | translate }}</button></div>

    <section class="admin-card homepage-editor-intro"><div><span class="eyebrow">VELLORA / {{ 'No-code controls' | translate }}</span><h2>{{ 'Keep the campaign current.' | translate }}</h2><p>{{ 'The current editorial art stays live by default. Choose catalog products or upload optimized images only when you want a change.' | translate }}</p></div><i class="bi bi-stars"></i></section>

    <section class="admin-card mt-4 homepage-editor-section">
      <div class="admin-card-head"><div><h2>{{ 'Animated hero images' | translate }}</h2><p>{{ 'Controls the three images in the opening carousel.' | translate }}</p></div><span>3 {{ 'slots' | translate }}</span></div>
      <div class="homepage-mode-grid">@for (mode of modes; track mode.value) { <label [class.selected]="heroMode() === mode.value"><input type="radio" name="heroMode" [value]="mode.value" [checked]="heroMode() === mode.value" (change)="heroMode.set(mode.value)"><i class="bi {{ mode.icon }}"></i><strong>{{ mode.title | translate }}</strong><small>{{ mode.description | translate }}</small></label> }</div>
      <div class="homepage-slot-grid hero-slots">@for (slot of heroSlots; track slot; let index = $index) { <article class="homepage-media-slot"><div class="homepage-media-preview"><img [src]="preview('hero', index)" [alt]="('Hero image' | translate) + ' ' + (index + 1)"><span>0{{ index + 1 }}</span></div><div><strong>{{ 'Hero image' | translate }} 0{{ index + 1 }}</strong>
        @if (heroMode() === 'default') { <small>{{ 'Current Vellora campaign image' | translate }}</small> }
        @if (heroMode() === 'products') { <select class="form-select" [value]="heroProductIds()[index]" (change)="selectProduct('hero', index, $event)"><option value="">{{ 'Choose product' | translate }}</option>@for (product of products(); track product._id) { <option [value]="product._id">{{ product.name }}</option> }</select> }
        @if (heroMode() === 'custom') { <label class="homepage-upload-button" [class.disabled]="uploading() === 'hero-' + index"><i class="bi bi-upload"></i>{{ (uploading() === 'hero-' + index ? 'Optimizing...' : 'Upload image') | translate }}<input type="file" accept="image/jpeg,image/png,image/webp" (change)="upload($event, 'hero', index)" [disabled]="uploading() !== ''"></label> }
      </div></article> }</div>
    </section>

    <section class="admin-card mt-4 homepage-editor-section">
      <div class="admin-card-head"><div><h2>{{ 'Editorial landing panels' | translate }}</h2><p>{{ 'Controls the two large images below featured products.' | translate }}</p></div><span>2 {{ 'slots' | translate }}</span></div>
      <div class="homepage-mode-grid">@for (mode of modes; track mode.value) { <label [class.selected]="editorialMode() === mode.value"><input type="radio" name="editorialMode" [value]="mode.value" [checked]="editorialMode() === mode.value" (change)="editorialMode.set(mode.value)"><i class="bi {{ mode.icon }}"></i><strong>{{ mode.title | translate }}</strong><small>{{ mode.description | translate }}</small></label> }</div>
      <div class="homepage-slot-grid editorial-slots">@for (slot of editorialSlots; track slot; let index = $index) { <article class="homepage-media-slot"><div class="homepage-media-preview"><img [src]="preview('editorial', index)" [alt]="('Editorial image' | translate) + ' ' + (index + 1)"><span>0{{ index + 1 }}</span></div><div><strong>{{ 'Editorial image' | translate }} 0{{ index + 1 }}</strong>
        @if (editorialMode() === 'default') { <small>{{ 'Current Vellora campaign image' | translate }}</small> }
        @if (editorialMode() === 'products') { <select class="form-select" [value]="editorialProductIds()[index]" (change)="selectProduct('editorial', index, $event)"><option value="">{{ 'Choose product' | translate }}</option>@for (product of products(); track product._id) { <option [value]="product._id">{{ product.name }}</option> }</select> }
        @if (editorialMode() === 'custom') { <label class="homepage-upload-button" [class.disabled]="uploading() === 'editorial-' + index"><i class="bi bi-upload"></i>{{ (uploading() === 'editorial-' + index ? 'Optimizing...' : 'Upload image') | translate }}<input type="file" accept="image/jpeg,image/png,image/webp" (change)="upload($event, 'editorial', index)" [disabled]="uploading() !== ''"></label> }
      </div></article> }</div>
    </section>

    <div class="homepage-editor-actions"><button class="btn btn-primary-luxe" type="button" (click)="save()" [disabled]="saving()"><i class="bi bi-cloud-check me-2"></i>{{ (saving() ? 'Saving...' : 'Publish homepage') | translate }}</button><small>{{ 'Changes appear on the storefront immediately after publishing.' | translate }}</small></div>
  `,
})
export class AdminHomepageComponent implements OnInit {
  readonly heroSlots = [0, 1, 2];
  readonly editorialSlots = [0, 1];
  readonly products = signal<Product[]>([]);
  readonly heroMode = signal<HomepageMediaMode>('default');
  readonly editorialMode = signal<HomepageMediaMode>('default');
  readonly heroProductIds = signal(['', '', '']);
  readonly editorialProductIds = signal(['', '']);
  readonly heroImages = signal(['/assets/home/fashion-hero-01.webp', '/assets/home/fashion-hero-02.webp', '/assets/home/fashion-hero-03.webp']);
  readonly editorialImages = signal(['/assets/home/fashion-hero-02.webp', '/assets/home/fashion-hero-03.webp']);
  readonly uploading = signal('');
  readonly saving = signal(false);
  readonly modes: Array<{ value: HomepageMediaMode; icon: string; title: string; description: string }> = [
    { value: 'default', icon: 'bi-stars', title: 'Vellora campaign', description: 'Keep the current editorial images.' },
    { value: 'products', icon: 'bi-box-seam', title: 'Choose products', description: 'Pick images directly from your catalog.' },
    { value: 'custom', icon: 'bi-cloud-arrow-up', title: 'Upload images', description: 'Upload your own optimized campaign art.' },
  ];

  constructor(private admin: AdminService, private productService: ProductService, private toast: ToastService) {}
  ngOnInit(): void {
    this.admin.homepageSettings().subscribe((data) => {
      this.heroMode.set(data.settings.heroMode);
      this.editorialMode.set(data.settings.editorialMode);
      this.heroProductIds.set(this.pad(data.settings.heroProductIds, 3));
      this.editorialProductIds.set(this.pad(data.settings.editorialProductIds, 2));
      this.heroImages.set(this.padImages(data.settings.heroImages, data.heroSlides.map((item) => item.image), 3));
      this.editorialImages.set(this.padImages(data.settings.editorialImages, data.editorialImages.map((item) => item.image), 2));
    });
    this.productService.list({ limit: 48, sort: 'name' }).subscribe((response) => this.products.set(response.data.products));
  }

  preview(section: MediaSection, index: number): string {
    const mode = section === 'hero' ? this.heroMode() : this.editorialMode();
    const images = section === 'hero' ? this.heroImages() : this.editorialImages();
    if (mode === 'products') {
      const ids = section === 'hero' ? this.heroProductIds() : this.editorialProductIds();
      return this.products().find((product) => product._id === ids[index])?.imageUrl || images[index];
    }
    return images[index];
  }

  selectProduct(section: MediaSection, index: number, event: Event): void {
    const value = (event.target as HTMLSelectElement).value;
    const target = section === 'hero' ? this.heroProductIds : this.editorialProductIds;
    target.update((items) => items.map((item, itemIndex) => itemIndex === index ? value : item));
  }

  async upload(event: Event, section: MediaSection, index: number): Promise<void> {
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0];
    if (!file) return;
    this.uploading.set(`${section}-${index}`);
    try {
      const dataUrl = await this.optimizeImage(file);
      this.admin.uploadHomepageMedia(dataUrl).subscribe({
        next: (imageUrl) => { const target = section === 'hero' ? this.heroImages : this.editorialImages; target.update((items) => items.map((item, itemIndex) => itemIndex === index ? imageUrl : item)); this.uploading.set(''); this.toast.success('Image ready. Publish the homepage to make it live.'); input.value = ''; },
        error: () => { this.uploading.set(''); input.value = ''; },
      });
    } catch (error) {
      this.uploading.set('');
      input.value = '';
      this.toast.error(error instanceof Error ? error.message : 'Could not prepare that image');
    }
  }

  save(): void {
    if (this.saving()) return;
    if (this.heroMode() === 'products' && this.heroProductIds().some((id) => !id)) { this.toast.error('Choose all three hero products'); return; }
    if (this.heroMode() === 'custom' && this.heroImages().some((image) => !image)) { this.toast.error('Upload all three hero images'); return; }
    if (this.editorialMode() === 'products' && this.editorialProductIds().some((id) => !id)) { this.toast.error('Choose both editorial products'); return; }
    if (this.editorialMode() === 'custom' && this.editorialImages().some((image) => !image)) { this.toast.error('Upload both editorial images'); return; }
    const payload: HomepageSettings = { heroMode: this.heroMode(), heroProductIds: this.heroProductIds(), heroImages: this.heroImages(), editorialMode: this.editorialMode(), editorialProductIds: this.editorialProductIds(), editorialImages: this.editorialImages() };
    this.saving.set(true);
    this.admin.saveHomepageSettings(payload).subscribe({ next: () => { this.saving.set(false); this.toast.success('Homepage published'); }, error: () => this.saving.set(false) });
  }

  private pad(values: string[], size: number): string[] { return Array.from({ length: size }, (_, index) => values[index] || ''); }
  private padImages(values: string[], fallbacks: string[], size: number): string[] { return Array.from({ length: size }, (_, index) => values[index] || fallbacks[index] || ''); }
  private optimizeImage(file: File): Promise<string> {
    if (!['image/jpeg', 'image/png', 'image/webp'].includes(file.type)) return Promise.reject(new Error('Choose a JPEG, PNG, or WebP image'));
    if (file.size > 10 * 1024 * 1024) return Promise.reject(new Error('Choose an image smaller than 10 MB'));
    return new Promise((resolve, reject) => {
      const url = URL.createObjectURL(file);
      const image = new Image();
      image.onload = () => {
        try {
          let scale = Math.min(1, 1400 / Math.max(image.naturalWidth, image.naturalHeight));
          let result = '';
          for (let pass = 0; pass < 5 && !result; pass += 1) {
            const canvas = document.createElement('canvas');
            canvas.width = Math.max(1, Math.round(image.naturalWidth * scale));
            canvas.height = Math.max(1, Math.round(image.naturalHeight * scale));
            canvas.getContext('2d')?.drawImage(image, 0, 0, canvas.width, canvas.height);
            for (let quality = .82; quality >= .42; quality -= .08) {
              const candidate = canvas.toDataURL('image/webp', quality);
              if (candidate.length <= 220000) { result = candidate; break; }
            }
            scale *= .8;
          }
          URL.revokeObjectURL(url);
          result ? resolve(result) : reject(new Error('This image could not be optimized below 180 KB'));
        } catch (error) { URL.revokeObjectURL(url); reject(error); }
      };
      image.onerror = () => { URL.revokeObjectURL(url); reject(new Error('The selected image could not be read')); };
      image.src = url;
    });
  }
}
