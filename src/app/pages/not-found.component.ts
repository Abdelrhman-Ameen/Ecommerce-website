import { Component, OnDestroy, signal } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { TranslatePipe } from '../shared/translate.pipe';
import { LanguageService } from '../core/language.service';

@Component({
  standalone: true,
  imports: [RouterLink, TranslatePipe],
  template: `
    <section class="fashion-404">
      <button class="auth-language" type="button" (click)="language.toggle()">{{ language.language() === 'en' ? 'عربي' : 'EN' }}</button>
      <a class="brand-mark fashion-404-brand" routerLink="/"><i class="bi bi-stars"></i> LuxeStudio</a>
      <div class="fashion-error-art" aria-hidden="true">
        <div class="error-digits"><span>4</span><span>0</span><span>4</span></div>
        <div class="clothing-rack"><span class="rack-top"></span><span class="rack-pole left"></span><span class="rack-pole right"></span><span class="rack-foot left"></span><span class="rack-foot right"></span>
          <div class="hanger hanger-one"><span></span><div class="garment shirt"></div></div>
          <div class="hanger hanger-two"><span></span><div class="garment jacket"></div></div>
          <div class="hanger hanger-three"><span></span><div class="garment dress"></div></div>
        </div>
        <div class="lost-shopping-bag"><i class="bi bi-bag-heart"></i><span>?</span></div>
        <div class="floating-tag">404<br><small>NOT FOUND</small></div>
      </div>
      <div class="fashion-error-copy"><div class="eyebrow">{{ 'Lost in the collection' | translate }}</div><h1>{{ 'This outfit does not live here.' | translate }}</h1><p>{{ 'The page may have moved, sold out, or taken an unexpected trip to the fitting room.' | translate }}</p><div class="d-flex flex-wrap justify-content-center gap-3"><a class="btn btn-primary-luxe" routerLink="/"><i class="bi bi-house me-2"></i>{{ 'Return home' | translate }}</a><a class="btn btn-outline-ink" routerLink="/products"><i class="bi bi-grid me-2"></i>{{ 'Browse the collection' | translate }}</a></div><small class="auto-return">{{ 'Returning to the landing page in' | translate }} {{ seconds() }}s</small></div>
    </section>
  `,
})
export class NotFoundComponent implements OnDestroy {
  readonly seconds = signal(15);
  private readonly interval = window.setInterval(() => {
    this.seconds.update((value) => value - 1);
    if (this.seconds() <= 0) { window.clearInterval(this.interval); this.router.navigateByUrl('/'); }
  }, 1000);
  constructor(private router: Router, public language: LanguageService) {}
  ngOnDestroy(): void { window.clearInterval(this.interval); }
}
