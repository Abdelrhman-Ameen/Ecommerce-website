import { Component, effect, signal } from '@angular/core';
import { Router, RouterLink, RouterLinkActive } from '@angular/router';
import { AuthService } from '../core/auth.service';
import { CartService } from '../core/cart.service';
import { LanguageService } from '../core/language.service';
import { TranslatePipe } from './translate.pipe';
import { ThemeService } from '../core/theme.service';

@Component({
  selector: 'app-store-header',
  standalone: true,
  imports: [RouterLink, RouterLinkActive, TranslatePipe],
  template: `
    <header class="store-header sticky-top">
      <nav class="navbar navbar-expand-lg" aria-label="Primary navigation">
        <div class="container-xxl px-3 px-lg-4">
          <a class="navbar-brand brand-mark" routerLink="/"><span class="brand-logo-crop"><img src="/assets/brand/vellora-logo.png" alt=""></span><span>Vellora</span></a>
          <button class="navbar-toggler border-0" type="button" data-bs-toggle="collapse" data-bs-target="#mainNavigation" aria-controls="mainNavigation" aria-expanded="false" aria-label="Toggle navigation">
            <i class="bi bi-list fs-3"></i>
          </button>
          <div class="collapse navbar-collapse" id="mainNavigation">
            <ul class="navbar-nav ms-lg-5 gap-lg-2">
              <li class="nav-item"><a class="nav-link" routerLink="/" [routerLinkActiveOptions]="{exact:true}" routerLinkActive="active">{{ 'Home' | translate }}</a></li>
              <li class="nav-item"><a class="nav-link" routerLink="/products" routerLinkActive="active">{{ 'Products' | translate }}</a></li>
              <li class="nav-item"><a class="nav-link" routerLink="/support" routerLinkActive="active">{{ 'Support' | translate }}</a></li>
            </ul>
            <form class="header-search mx-lg-auto my-3 my-lg-0" role="search" (submit)="searchProducts($event)">
              <button class="search-submit" type="submit" [attr.aria-label]="'Search products' | translate"><i class="bi bi-search"></i></button>
              <input type="search" aria-label="Search products" [placeholder]="'Search products...' | translate" [value]="search()" (input)="setSearch($event)">
            </form>
            <div class="header-actions ms-lg-3">
              <button class="theme-switch" type="button" (click)="theme.toggle()" [attr.aria-label]="(theme.theme() === 'light' ? 'Enable dark mode' : 'Enable light mode') | translate"><i class="bi" [class.bi-moon-stars]="theme.theme() === 'light'" [class.bi-sun]="theme.theme() === 'dark'"></i></button>
              <button class="language-switch" type="button" (click)="language.toggle()" [attr.aria-label]="language.language() === 'en' ? 'Switch to Arabic' : 'Switch to English'">{{ language.language() === 'en' ? 'عربي' : 'EN' }}</button>
              <a class="header-icon" routerLink="/wishlist" [attr.aria-label]="'Favorites' | translate"><i class="bi bi-heart"></i></a>
              <a class="header-icon position-relative" routerLink="/checkout" aria-label="Cart">
                <i class="bi bi-bag"></i>
                @if (cart.itemCount()) { <span class="cart-count">{{ cart.itemCount() }}</span> }
              </a>
              @if (auth.user(); as user) {
                <div class="dropdown">
                  <button class="avatar-button" type="button" data-bs-toggle="dropdown" aria-expanded="false" [attr.aria-label]="user.firstName + ' account menu'">{{ user.firstName.charAt(0) }}{{ user.lastName.charAt(0) }}</button>
                  <ul class="dropdown-menu dropdown-menu-end shadow-sm border-0 mt-2">
                    <li class="px-3 py-2"><strong class="d-block">{{ user.firstName }} {{ user.lastName }}</strong><small class="text-secondary">{{ user.email }}</small></li>
                    <li><hr class="dropdown-divider"></li>
                    @if (user.role === 'admin') { <li><a class="dropdown-item" routerLink="/admin"><i class="bi bi-grid me-2"></i>{{ 'Admin portal' | translate }}</a></li> }
                    <li><a class="dropdown-item" routerLink="/account"><i class="bi bi-person me-2"></i>{{ 'My account' | translate }}</a></li>
                    <li><a class="dropdown-item" routerLink="/wishlist"><i class="bi bi-heart me-2"></i>{{ 'Favorites' | translate }}</a></li>
                    <li><button class="dropdown-item" type="button" (click)="logout()"><i class="bi bi-box-arrow-right me-2"></i>{{ 'Sign out' | translate }}</button></li>
                  </ul>
                </div>
              } @else {
                <a class="btn btn-ink btn-sm px-3" routerLink="/login">{{ 'Sign in' | translate }}</a>
              }
            </div>
          </div>
        </div>
      </nav>
    </header>
  `,
})
export class StoreHeaderComponent {
  readonly search = signal('');
  constructor(public auth: AuthService, public cart: CartService, public language: LanguageService, public theme: ThemeService, private router: Router) {
    effect(() => {
      if (auth.user() && !cart.cart()) cart.load().subscribe({ error: () => undefined });
      if (!auth.user()) cart.reset();
    });
  }
  setSearch(event: Event): void { this.search.set((event.target as HTMLInputElement).value); }
  searchProducts(event: Event): void { event.preventDefault(); this.router.navigate(['/products'], { queryParams: { search: this.search().trim() || null } }); }
  logout(): void { this.auth.logout().subscribe(() => this.router.navigate(['/'])); }
}
