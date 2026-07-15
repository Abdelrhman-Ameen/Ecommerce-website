import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';
import { TranslatePipe } from './translate.pipe';

@Component({
  selector: 'app-store-footer',
  standalone: true,
  imports: [RouterLink, TranslatePipe],
  template: `
    <footer class="store-footer">
      <div class="container-xxl px-4 py-5">
        <div class="row g-5 py-lg-3">
          <div class="col-lg-4"><a class="brand-mark text-decoration-none" routerLink="/"><i class="bi bi-stars"></i> Vellora</a><p class="footer-copy mt-3">{{ 'Wear Your Confidence' | translate }}</p><div class="d-flex gap-3 mt-4"><i class="bi bi-instagram"></i><i class="bi bi-pinterest"></i><i class="bi bi-twitter-x"></i></div></div>
          <div class="col-6 col-lg-2"><h3>{{ 'Shop' | translate }}</h3><a routerLink="/products">{{ 'All products' | translate }}</a><a routerLink="/products" [queryParams]="{isNewArrival:true}">{{ 'New arrivals' | translate }}</a><a routerLink="/wishlist">{{ 'Favorites' | translate }}</a></div>
          <div class="col-6 col-lg-2"><h3>{{ 'Support' | translate }}</h3><a routerLink="/info/shipping">{{ 'Shipping info' | translate }}</a><a routerLink="/info/returns">{{ 'Returns' | translate }}</a><a routerLink="/info/faq">{{ 'FAQ' | translate }}</a><a routerLink="/info/contact">{{ 'Contact us' | translate }}</a></div>
          <div class="col-6 col-lg-2"><h3>{{ 'Account' | translate }}</h3><a routerLink="/account">{{ 'My account' | translate }}</a><a routerLink="/account">{{ 'Order tracking' | translate }}</a><a routerLink="/login">{{ 'Sign in' | translate }}</a></div>
          <div class="col-6 col-lg-2"><h3>{{ 'Legal' | translate }}</h3><a routerLink="/info/privacy">{{ 'Privacy policy' | translate }}</a><a routerLink="/info/terms">{{ 'Terms of service' | translate }}</a></div>
        </div>
        <div class="footer-bottom d-flex flex-column flex-md-row justify-content-between gap-2 pt-4 mt-4"><span>© {{ year }} Vellora. {{ 'All rights reserved.' | translate }}</span><span><i class="bi bi-credit-card me-3"></i><i class="bi bi-shield-check"></i></span></div>
      </div>
    </footer>
  `,
})
export class StoreFooterComponent { readonly year = new Date().getFullYear(); }
