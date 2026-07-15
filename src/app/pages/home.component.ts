import { Component, OnDestroy, OnInit, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { ProductService } from '../core/product.service';
import { Product } from '../core/models';
import { ProductCardComponent } from '../shared/product-card.component';
import { TranslatePipe } from '../shared/translate.pipe';
import { HomepageService } from '../core/homepage.service';

type Direction = 'next' | 'prev';

interface FashionSlide {
  image: string;
  alt: string;
  background: string;
  accent: string;
  number: string;
}

const DEFAULT_SLIDES: FashionSlide[] = [
  { image: '/assets/home/fashion-hero-01.webp', alt: 'Model in a sculptural black evening look against a red studio background', background: '#7d1718', accent: '#ee5a46', number: '01' },
  { image: '/assets/home/fashion-hero-02.webp', alt: 'Model in a monochrome editorial look', background: '#d6d2cc', accent: '#171717', number: '02' },
  { image: '/assets/home/fashion-hero-03.webp', alt: 'Model wearing a checked coat and white sunglasses', background: '#063b3e', accent: '#ff5a36', number: '03' },
];

@Component({
  standalone: true,
  imports: [RouterLink, ProductCardComponent, TranslatePipe],
  template: `
    <section class="fashion-hero" tabindex="0" aria-roledescription="carousel" [attr.aria-label]="'Wear Your Confidence' | translate" [style.--hero-bg]="activeSlide().background" [style.--hero-accent]="activeSlide().accent" (keydown.arrowLeft)="navigate('prev')" (keydown.arrowRight)="navigate('next')" (touchstart)="startTouch($event)" (touchend)="endTouch($event)">
      <div class="fashion-grain" aria-hidden="true"></div>
      <div class="fashion-hero-meta"><span>VELLORA</span><span>CAMPAIGN / 2026</span></div>
      <div class="fashion-ghost-title fashion-title-back" [class.is-shifting]="animating()" aria-hidden="true"><span>WEAR YOUR</span><span>CONFIDENCE</span></div>
      <div class="fashion-ghost-title fashion-title-front" [class.is-shifting]="animating()" aria-hidden="true"><span>WEAR YOUR</span><span>CONFIDENCE</span></div>
      <div class="fashion-stage">
        @for (slide of slides(); track $index; let index = $index) {
          <figure class="fashion-slide" [class.is-active]="role(index) === 'active'" [class.is-prev]="role(index) === 'prev'" [class.is-next]="role(index) === 'next'" [style.--slide-accent]="slide.accent" [attr.aria-hidden]="role(index) !== 'active'">
            <img [src]="slide.image" [alt]="role(index) === 'active' ? slide.alt : ''" draggable="false" [attr.fetchpriority]="index === 0 ? 'high' : null">
            <figcaption>{{ slide.number }} / {{ slides().length.toString().padStart(2, '0') }}</figcaption>
          </figure>
        }
      </div>
      <div class="fashion-hero-copy">
        <span aria-live="polite">{{ activeSlide().number }} / {{ slides().length.toString().padStart(2, '0') }}</span>
        <h1>{{ 'Wear Your Confidence' | translate }}</h1>
      </div>
      <div class="fashion-carousel-controls">
        <button type="button" (click)="navigate('prev')" [disabled]="animating()" [attr.aria-label]="'Previous look' | translate"><i class="bi bi-arrow-left"></i></button>
        <button type="button" (click)="navigate('next')" [disabled]="animating()" [attr.aria-label]="'Next look' | translate"><i class="bi bi-arrow-right"></i></button>
      </div>
      <a class="fashion-discover" routerLink="/products"><span>{{ 'Shop collection' | translate }}</span><i class="bi bi-arrow-up-right"></i></a>
      <a class="fashion-scroll-cue" href="#featured-edit"><span>{{ 'Scroll' | translate }}</span><i class="bi bi-arrow-down"></i></a>
    </section>

    <section class="fashion-marquee" aria-label="Vellora campaign statements"><div>@for (line of campaignLines; track line) { <span>{{ line | translate }}</span><i>✦</i> }</div></section>

    <section id="featured-edit" class="fashion-products section-space">
      <div class="container-xxl px-4">
        <div class="fashion-section-heading"><div><span>01 / {{ 'Shop' | translate }}</span><h2>{{ 'Featured products' | translate }}</h2></div><a routerLink="/products">{{ 'View all' | translate }} <i class="bi bi-arrow-right"></i></a></div>
        @if (loading()) { <div class="row g-4">@for (item of [1,2,3,4]; track item) { <div class="col-6 col-lg-3"><div class="skeleton product-skeleton"></div></div> }</div> }
        @else { <div class="row g-4">@for (product of products(); track product._id) { <div class="col-6 col-lg-3"><app-product-card [product]="product"/></div> }</div> }
      </div>
    </section>

    <section class="fashion-editorial">
      <div class="fashion-editorial-image fashion-editorial-primary"><img [src]="editorialImages()[0].image" [alt]="editorialImages()[0].alt" loading="lazy"><span>02 / EDITORIAL</span></div>
      <div class="fashion-editorial-menu"><span>COLLECTIONS</span><nav><a routerLink="/products" [queryParams]="{isNewArrival:true}">{{ 'New arrivals' | translate }} <i class="bi bi-arrow-up-right"></i></a><a routerLink="/products" [queryParams]="{category:'accessories'}">{{ 'Accessories' | translate }} <i class="bi bi-arrow-up-right"></i></a><a routerLink="/products">{{ 'All products' | translate }} <i class="bi bi-arrow-up-right"></i></a></nav></div>
      <div class="fashion-editorial-image fashion-editorial-secondary"><img [src]="editorialImages()[1].image" [alt]="editorialImages()[1].alt" loading="lazy"><span>03 / NIGHT</span></div>
    </section>

    <section id="campaign-finale" class="fashion-closing">
      <div class="fashion-closing-orbit" aria-hidden="true">
        <svg class="fashion-orbit-outer" viewBox="0 0 500 500">
          <defs><path id="velloraOrbitOuter" d="M250 28a222 222 0 1 1 0 444 222 222 0 1 1 0-444Z"/></defs>
          <text textLength="1370" lengthAdjust="spacing"><textPath href="#velloraOrbitOuter">WEAR YOUR CONFIDENCE • OWN THE MOMENT • MOVE WITHOUT PERMISSION •</textPath></text>
        </svg>
        <svg class="fashion-orbit-inner" viewBox="0 0 500 500">
          <defs><path id="velloraOrbitInner" d="M250 93a157 157 0 1 1 0 314 157 157 0 1 1 0-314Z"/></defs>
          <text textLength="980" lengthAdjust="spacing"><textPath href="#velloraOrbitInner">MADE TO BE REMEMBERED • DESIGNED FOR PRESENCE • VELLORA •</textPath></text>
        </svg>
      </div>
      <div class="fashion-closing-content"><small>VELLORA / CAMPAIGN 2026</small><span class="fashion-closing-kicker">{{ 'Made to be remembered' | translate }}</span><h2>{{ 'Own the moment' | translate }}</h2><a class="btn btn-fashion-light" routerLink="/products">{{ 'Explore the collection' | translate }} <i class="bi bi-arrow-right ms-2"></i></a></div>
    </section>
  `,
})
export class HomeComponent implements OnInit, OnDestroy {
  readonly campaignLines = ['Wear Your Confidence', 'Own the moment', 'Move without permission'];
  readonly slides = signal<FashionSlide[]>(DEFAULT_SLIDES);
  readonly editorialImages = signal([{ image: '/assets/home/fashion-hero-02.webp', alt: 'Black and white editorial fashion portrait' }, { image: '/assets/home/fashion-hero-03.webp', alt: 'Street fashion portrait with sunglasses' }]);
  readonly products = signal<Product[]>([]);
  readonly loading = signal(true);
  readonly activeIndex = signal(0);
  readonly animating = signal(false);
  private touchStartX = 0;
  private unlockTimer?: ReturnType<typeof setTimeout>;

  constructor(private productService: ProductService, private homepage: HomepageService) {}
  ngOnInit(): void {
    this.preload(this.slides().map((slide) => slide.image));
    this.homepage.get().subscribe({ next: (data) => { this.slides.set(data.heroSlides.map((slide, index) => ({ ...slide, number: (index + 1).toString().padStart(2, '0') }))); this.editorialImages.set(data.editorialImages); this.preload([...data.heroSlides.map((slide) => slide.image), ...data.editorialImages.map((item) => item.image)]); }, error: () => undefined });
    this.productService.list({ featured: true, limit: 4 }).subscribe({ next: (response) => { this.products.set(response.data.products); this.loading.set(false); }, error: () => this.loading.set(false) });
  }
  ngOnDestroy(): void { clearTimeout(this.unlockTimer); }
  activeSlide(): FashionSlide { return this.slides()[this.activeIndex()] || DEFAULT_SLIDES[0]; }
  role(index: number): 'active' | 'prev' | 'next' { const length = this.slides().length; if (index === this.activeIndex()) return 'active'; return index === (this.activeIndex() + length - 1) % length ? 'prev' : 'next'; }
  navigate(direction: Direction): void {
    if (this.animating()) return;
    this.animating.set(true);
    const delta = direction === 'next' ? 1 : -1;
    this.activeIndex.update((value) => (value + delta + this.slides().length) % this.slides().length);
    clearTimeout(this.unlockTimer);
    this.unlockTimer = setTimeout(() => this.animating.set(false), 700);
  }
  startTouch(event: TouchEvent): void { this.touchStartX = event.changedTouches[0]?.clientX || 0; }
  endTouch(event: TouchEvent): void { const distance = (event.changedTouches[0]?.clientX || 0) - this.touchStartX; if (Math.abs(distance) > 55) this.navigate(distance > 0 ? 'prev' : 'next'); }
  private preload(urls: string[]): void { for (const url of urls) { const image = new Image(); image.src = url; } }
}
