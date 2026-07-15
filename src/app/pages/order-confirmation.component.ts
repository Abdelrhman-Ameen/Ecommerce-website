import { Component, OnInit, signal } from '@angular/core';
import { CurrencyPipe, DatePipe } from '@angular/common';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { Order, OrderStatus } from '../core/models';
import { OrderService } from '../core/order.service';
import { TranslatePipe } from '../shared/translate.pipe';
import { LanguageService } from '../core/language.service';

@Component({
  standalone: true,
  imports: [CurrencyPipe, DatePipe, RouterLink, TranslatePipe],
  template: `
    <div class="transaction-page confirmation-page"><header class="transaction-header"><a class="brand-mark" routerLink="/"><i class="bi bi-stars"></i> LuxeStudio</a><button class="language-switch" type="button" (click)="language.toggle()">{{ language.language() === 'en' ? 'عربي' : 'EN' }}</button></header>
      @if (loading()) { <main class="confirmation-main"><div class="skeleton confirmation-skeleton"></div></main> }
      @else if (order(); as item) { <main class="confirmation-main"><div class="success-icon"><i class="bi bi-check-lg"></i></div><h1>{{ 'Thank you for your order!' | translate }}</h1><p>{{ 'Your order is confirmed. You can follow its progress from your account.' | translate }}</p><div class="confirmation-card"><div class="confirmation-summary"><div><small>{{ 'Order number' | translate }}</small><strong>#{{ item.orderNumber }}</strong></div><div><small>{{ 'Date' | translate }}</small><strong>{{ item.createdAt | date:'mediumDate' }}</strong></div><div><small>{{ 'Total' | translate }}</small><strong>{{ item.totalPrice | currency }}</strong></div></div><div class="status-tracker"><h2>{{ 'Order status' | translate }}</h2><div class="status-line"><span class="status-progress" [style.width.%]="progress(item.status)"></span>@for (step of steps; track step.value) { <div class="status-step" [class.complete]="stepIndex(item.status) >= stepIndex(step.value)"><i class="bi" [class.bi-check-lg]="stepIndex(item.status) > stepIndex(step.value)" [class.bi-box-seam]="step.value === 'ordered'" [class.bi-arrow-repeat]="step.value === 'processing'" [class.bi-truck]="step.value === 'shipped'" [class.bi-house-check]="step.value === 'delivered'"></i><span>{{ step.label | translate }}</span></div> }</div></div></div><div class="d-flex flex-wrap justify-content-center gap-3"><a class="btn btn-primary-luxe" routerLink="/products"><i class="bi bi-shop me-2"></i>{{ 'Continue shopping' | translate }}</a><a class="btn btn-outline-ink" routerLink="/account">{{ 'My orders' | translate }}</a></div></main> }
      <footer class="transaction-footer"><span>LuxeStudio</span><span>© {{ year }} LuxeStudio. All rights reserved.</span><a routerLink="/info/privacy">{{ 'Privacy policy' | translate }}</a></footer></div>
  `,
})
export class OrderConfirmationComponent implements OnInit {
  readonly order = signal<Order | null>(null); readonly loading = signal(true); readonly year = new Date().getFullYear(); readonly steps: Array<{ value: OrderStatus; label: string }> = [{ value: 'ordered', label: 'Ordered' }, { value: 'processing', label: 'Processing' }, { value: 'shipped', label: 'Shipped' }, { value: 'delivered', label: 'Delivered' }];
  constructor(private route: ActivatedRoute, private router: Router, private orders: OrderService, public language: LanguageService) {}
  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id');
    if (!id) { void this.router.navigateByUrl('/404', { replaceUrl: true }); return; }
    this.orders.get(id).subscribe({
      next: (order) => { this.order.set(order); this.loading.set(false); },
      error: () => void this.router.navigateByUrl('/404', { replaceUrl: true }),
    });
  }
  stepIndex(status: OrderStatus): number { return ['ordered', 'processing', 'shipped', 'delivered'].indexOf(status); }
  progress(status: OrderStatus): number { return Math.max(0, this.stepIndex(status)) / 3 * 100; }
}
