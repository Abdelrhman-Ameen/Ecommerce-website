import { Component } from '@angular/core';
import { Router, RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { AuthService } from '../core/auth.service';
import { LanguageService } from '../core/language.service';
import { ThemeService } from '../core/theme.service';
import { TranslatePipe } from './translate.pipe';

@Component({
  selector: 'app-admin-layout',
  standalone: true,
  imports: [RouterOutlet, RouterLink, RouterLinkActive, TranslatePipe],
  template: `
    <div class="admin-shell">
      <aside class="admin-sidebar">
        <div class="admin-sidebar-head">
          <a class="brand-mark" routerLink="/admin"><i class="bi bi-stars"></i> Vellora Admin</a>
          <div class="admin-sidebar-controls"><span>{{ 'Interface' | translate }}</span><div><button class="theme-switch" type="button" (click)="theme.toggle()" [attr.aria-label]="(theme.theme() === 'light' ? 'Enable dark mode' : 'Enable light mode') | translate"><i class="bi" [class.bi-moon-stars]="theme.theme() === 'light'" [class.bi-sun]="theme.theme() === 'dark'"></i></button><button class="language-switch" type="button" (click)="language.toggle()">{{ language.language() === 'en' ? 'عربي' : 'EN' }}</button></div></div>
        </div>
        @if (auth.user(); as user) {
          <div class="admin-user"><div class="avatar-button">{{ user.firstName.charAt(0) }}{{ user.lastName.charAt(0) }}</div><div><strong>{{ user.firstName }} {{ user.lastName }}</strong><small>{{ 'Administrator' | translate }}</small></div></div>
        }
        <nav class="admin-nav" aria-label="Admin navigation">
          <a routerLink="/admin" [routerLinkActiveOptions]="{exact:true}" routerLinkActive="active"><i class="bi bi-grid-1x2"></i>{{ 'Dashboard' | translate }}</a>
          <a routerLink="/admin/homepage" routerLinkActive="active"><i class="bi bi-window-stack"></i>{{ 'Homepage editor' | translate }}</a>
          <a routerLink="/admin/products" routerLinkActive="active"><i class="bi bi-box-seam"></i>{{ 'Products' | translate }}</a>
          <a routerLink="/admin/orders" routerLinkActive="active"><i class="bi bi-cart3"></i>{{ 'Orders' | translate }}</a>
          <a routerLink="/admin/offline-sales" routerLinkActive="active"><i class="bi bi-receipt-cutoff"></i>{{ 'Store sales & debts' | translate }}</a>
          <a routerLink="/admin/customers" routerLinkActive="active"><i class="bi bi-people"></i>{{ 'Customers' | translate }}</a>
        </nav>
        <div class="mt-auto admin-nav"><a routerLink="/"><i class="bi bi-shop"></i>{{ 'View store' | translate }}</a><button type="button" (click)="logout()"><i class="bi bi-box-arrow-right"></i>{{ 'Sign out' | translate }}</button></div>
      </aside>
      <div class="admin-main">
        <header class="admin-topbar"><span>{{ 'Admin Console' | translate }}</span><div class="ms-auto d-flex gap-3"><i class="bi bi-bell"></i><i class="bi bi-question-circle"></i></div></header>
        <main class="admin-content"><router-outlet/></main>
      </div>
    </div>
  `,
})
export class AdminLayoutComponent {
  constructor(public auth: AuthService, public language: LanguageService, public theme: ThemeService, private router: Router) {}
  logout(): void { this.auth.logout().subscribe(() => this.router.navigate(['/login'])); }
}
