import { Component, Input } from '@angular/core';
import { RouterLink } from '@angular/router';
import { LanguageService } from '../core/language.service';
import { ThemeService } from '../core/theme.service';
import { TranslatePipe } from './translate.pipe';

@Component({
  selector: 'app-auth-showcase',
  standalone: true,
  imports: [RouterLink, TranslatePipe],
  template: `
    <section class="auth-experience" [class.auth-experience-register]="variant === 'register'">
      <video class="auth-film" autoplay muted loop playsinline preload="metadata" poster="/assets/home/fashion-hero-02.webp" aria-hidden="true">
        <source src="/assets/auth/vellora-auth-film.mp4" type="video/mp4">
      </video>
      <div class="auth-film-shade" aria-hidden="true"></div>
      <div class="auth-film-grain" aria-hidden="true"></div>

      <header class="auth-campaign-header">
        <a class="auth-campaign-brand" routerLink="/" aria-label="Vellora home">
          <span aria-hidden="true">V</span>
          <strong>VELLORA</strong>
        </a>
        <div class="auth-campaign-actions">
          <a class="auth-collection-link" routerLink="/products">
            {{ 'View collection' | translate }} <i class="bi bi-arrow-up-right"></i>
          </a>
          <button class="auth-round-control" type="button" (click)="theme.toggle()" [attr.aria-label]="(theme.theme() === 'light' ? 'Enable dark mode' : 'Enable light mode') | translate">
            <i class="bi" [class.bi-moon-stars]="theme.theme() === 'light'" [class.bi-sun]="theme.theme() === 'dark'"></i>
          </button>
          <button class="auth-language-control" type="button" (click)="language.toggle()">
            {{ language.language() === 'en' ? 'عربي' : 'EN' }}
          </button>
        </div>
      </header>

      <main class="auth-campaign-layout">
        <section class="auth-editorial-copy" aria-labelledby="auth-campaign-title">
          <p class="auth-campaign-kicker"><span></span>{{ 'VELLORA PRIVATE EDIT' | translate }} · 2026</p>
          <h1 id="auth-campaign-title">
            <span>{{ 'WEAR YOUR' | translate }}</span>
            <span>{{ 'CONFIDENCE' | translate }}</span>
          </h1>
          <p class="auth-campaign-summary">{{ 'A considered space for your saved pieces, orders, and next signature look.' | translate }}</p>
          <div class="auth-campaign-proof" aria-label="Vellora account benefits">
            <span><i class="bi bi-shield-check"></i>{{ 'Secure access' | translate }}</span>
            <span><i class="bi bi-bag-check"></i>{{ 'Faster checkout' | translate }}</span>
            <span><i class="bi bi-heart"></i>{{ 'Saved favorites' | translate }}</span>
          </div>
        </section>

        <div class="auth-form-stage">
          <ng-content></ng-content>
        </div>
      </main>

      <footer class="auth-campaign-footer">
        <span>CAIRO · EGYPT</span>
        <span>{{ variant === 'login' ? ('MEMBER ACCESS' | translate) : ('NEW MEMBERSHIP' | translate) }} · {{ variant === 'login' ? '01' : '02' }}</span>
      </footer>
    </section>
  `,
})
export class AuthShowcaseComponent {
  @Input() variant: 'login' | 'register' = 'login';

  constructor(public language: LanguageService, public theme: ThemeService) {}
}
