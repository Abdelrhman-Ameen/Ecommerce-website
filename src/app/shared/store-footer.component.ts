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
          <div class="col-lg-4"><a class="footer-logo-link" routerLink="/"><img src="/assets/brand/vellora-logo.png" alt="Vellora — Her Style, Her World."></a><p class="footer-copy mt-3">{{ 'Wear Your Confidence' | translate }}</p><a class="footer-location" href="https://www.google.com/maps/search/?api=1&amp;query=XWJW%2B49J%2C%20Al%20Taif%20Street%2C%20off%20El-Higaz%20Street%2C%20Heliopolis%2C%20Cairo" target="_blank" rel="noopener noreferrer"><i class="bi bi-geo-alt-fill"></i><span><small>{{ 'Store location' | translate }}</small><strong>{{ 'XWJW+49J, Al Taif Street, off El-Higaz Street, Heliopolis, Cairo' | translate }}</strong></span><i class="bi bi-arrow-up-right"></i></a><div class="d-flex gap-3 mt-4"><i class="bi bi-instagram"></i><i class="bi bi-pinterest"></i><i class="bi bi-twitter-x"></i></div></div>
          <div class="col-6 col-lg-2"><h3>{{ 'Shop' | translate }}</h3><a routerLink="/products">{{ 'All products' | translate }}</a><a routerLink="/products" [queryParams]="{category:'fashion'}">{{ 'Fashion' | translate }}</a><a routerLink="/wishlist">{{ 'Favorites' | translate }}</a></div>
          <div class="col-6 col-lg-2"><h3>{{ 'Support' | translate }}</h3><a routerLink="/support">{{ 'Contact us' | translate }}</a><a routerLink="/info/shipping">{{ 'Shipping info' | translate }}</a><a routerLink="/info/returns">{{ 'Returns' | translate }}</a><a routerLink="/info/faq">{{ 'FAQ' | translate }}</a></div>
          <div class="col-6 col-lg-2"><h3>{{ 'Account' | translate }}</h3><a routerLink="/account">{{ 'My account' | translate }}</a><a routerLink="/account">{{ 'Order tracking' | translate }}</a><a routerLink="/login">{{ 'Sign in' | translate }}</a></div>
          <div class="col-6 col-lg-2"><h3>{{ 'Legal' | translate }}</h3><a routerLink="/info/privacy">{{ 'Privacy policy' | translate }}</a><a routerLink="/info/terms">{{ 'Terms of service' | translate }}</a></div>
        </div>
        <div class="footer-bottom d-flex flex-column flex-md-row justify-content-between gap-2 pt-4 mt-4"><span>© {{ year }} Vellora. {{ 'All rights reserved.' | translate }}</span><span><i class="bi bi-credit-card me-3"></i><i class="bi bi-shield-check"></i></span></div>
      </div>
    </footer>
  `,
})
export class StoreFooterComponent { readonly year = new Date().getFullYear(); }
