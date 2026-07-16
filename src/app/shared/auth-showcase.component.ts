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
      <div class="auth-shell">
        <section class="auth-form-pane">
          <header class="auth-pane-header">
            <a class="auth-campaign-brand" routerLink="/" aria-label="Vellora home">
              <span class="brand-logo-crop" aria-hidden="true"><img src="/assets/brand/vellora-logo.png" alt=""></span>
              <strong>VELLORA</strong>
            </a>
            <div class="auth-campaign-actions">
              <a class="auth-collection-link" routerLink="/products" [attr.aria-label]="'View collection' | translate">
                <i class="bi bi-grid"></i><span>{{ 'View collection' | translate }}</span>
              </a>
              <button class="auth-round-control" type="button" (click)="theme.toggle()" [attr.aria-label]="(theme.theme() === 'light' ? 'Enable dark mode' : 'Enable light mode') | translate">
                <i class="bi" [class.bi-moon-stars]="theme.theme() === 'light'" [class.bi-sun]="theme.theme() === 'dark'"></i>
              </button>
              <button class="auth-language-control" type="button" (click)="language.toggle()">
                {{ language.language() === 'en' ? 'عربي' : 'EN' }}
              </button>
            </div>
          </header>

          <main class="auth-form-stage">
            <ng-content></ng-content>
          </main>

          <footer class="auth-pane-footer">
            <span><i class="bi bi-shield-check"></i>{{ 'Secure access' | translate }}</span>
            <span>CAIRO · EGYPT</span>
          </footer>
        </section>

        <aside class="auth-visual-pane" aria-label="Vellora animated fashion fitting room">
          <div class="auth-tailor-grid" aria-hidden="true"></div>
          <div class="auth-scene-label" aria-hidden="true"><span></span>VELLORA STYLE LAB · 2026</div>

          <div class="auth-fashion-orbit" aria-hidden="true">
            <span class="auth-orbit-ring auth-ring-one"></span>
            <span class="auth-orbit-ring auth-ring-two"></span>
            <span class="auth-orbit-ring auth-ring-three"></span>
            <span class="auth-thread auth-thread-one"></span>
            <span class="auth-thread auth-thread-two"></span>

            <div class="auth-hanger-look">
              <span class="auth-hanger-hook"></span>
              <span class="auth-hanger-bar auth-hanger-left"></span>
              <span class="auth-hanger-bar auth-hanger-right"></span>
              <span class="auth-fashion-dress"></span>
              <span class="auth-dress-seam"></span>
            </div>

            <span class="auth-orbit-piece auth-piece-bag"><i class="bi bi-bag-heart"></i></span>
            <span class="auth-orbit-piece auth-piece-glasses"><i class="bi bi-sunglasses"></i></span>
            <span class="auth-orbit-piece auth-piece-spark"><i class="bi bi-stars"></i></span>
          </div>

          <div class="auth-visual-message">
            <span>{{ 'VELLORA PRIVATE EDIT' | translate }}</span>
            <h2>{{ 'WEAR YOUR' | translate }} <strong>{{ 'CONFIDENCE' | translate }}</strong></h2>
            <p>{{ 'A considered space for your saved pieces, orders, and next signature look.' | translate }}</p>
          </div>
        </aside>
      </div>
    </section>
  `,
})
export class AuthShowcaseComponent {
  @Input() variant: 'login' | 'register' = 'login';

  constructor(public language: LanguageService, public theme: ThemeService) {}
}
