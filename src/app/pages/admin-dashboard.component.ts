import { Component, OnInit, signal } from '@angular/core';
import { CurrencyPipe, DatePipe } from '@angular/common';
import { RouterLink } from '@angular/router';
import { AdminService, DashboardData } from '../core/admin.service';
import { TranslatePipe } from '../shared/translate.pipe';

@Component({
  standalone: true,
  imports: [CurrencyPipe, DatePipe, RouterLink, TranslatePipe],
  template: `
    <div class="admin-page-heading"><div><h1>{{ 'Dashboard overview' | translate }}</h1><p>{{ 'Here is what is happening across LuxeStudio today.' | translate }}</p></div><a class="btn btn-primary-luxe" routerLink="/admin/products"><i class="bi bi-plus-lg me-2"></i>{{ 'Add product' | translate }}</a></div>
    @if (loading()) { <div class="skeleton admin-dashboard-skeleton"></div> }
    @else if (data(); as dashboard) {
      <div class="metric-grid"><article><div><small>{{ 'Total revenue' | translate }}</small><strong>{{ dashboard.totalRevenue | currency }}</strong><span class="positive"><i class="bi bi-graph-up-arrow"></i> {{ 'Confirmed orders' | translate }}</span></div><i class="bi bi-wallet2"></i></article><article><div><small>{{ 'Total orders' | translate }}</small><strong>{{ dashboard.ordersCount }}</strong><span>{{ 'Across all statuses' | translate }}</span></div><i class="bi bi-cart3"></i></article><article><div><small>{{ 'Customers' | translate }}</small><strong>{{ dashboard.usersCount }}</strong><span>{{ 'Registered accounts' | translate }}</span></div><i class="bi bi-people"></i></article><article><div><small>{{ 'Total products' | translate }}</small><strong>{{ dashboard.productsCount }}</strong><span>{{ 'Active catalog' | translate }}</span></div><i class="bi bi-box-seam"></i></article><article class="danger-metric"><div><small>{{ 'Low stock' | translate }}</small><strong>{{ dashboard.lowStockProducts.length }}</strong><span>{{ 'Needs attention' | translate }}</span></div><i class="bi bi-exclamation-triangle"></i></article></div>
      <div class="row g-4 mt-2"><div class="col-xl-8"><section class="admin-card"><div class="admin-card-head"><h2>{{ 'Recent orders' | translate }}</h2><a routerLink="/admin/orders">{{ 'View all' | translate }} <i class="bi bi-arrow-right"></i></a></div><div class="table-responsive"><table class="table align-middle"><thead><tr><th>{{ 'Order' | translate }}</th><th>{{ 'Customers' | translate }}</th><th>{{ 'Date' | translate }}</th><th>{{ 'Total' | translate }}</th><th>{{ 'Status' | translate }}</th></tr></thead><tbody>@for (order of dashboard.recentOrders; track order._id) { <tr><td><strong>#{{ order.orderNumber }}</strong></td><td>{{ customerName(order.user) }}</td><td>{{ order.createdAt | date:'mediumDate' }}</td><td>{{ order.totalPrice | currency }}</td><td><span class="status-badge status-{{ order.status }}">{{ statusLabel(order.status) | translate }}</span></td></tr> } @empty { <tr><td colspan="5" class="text-center py-5 text-secondary">{{ 'No orders yet' | translate }}</td></tr> }</tbody></table></div></section><section class="admin-card mt-4"><div class="admin-card-head"><h2>{{ 'Latest products' | translate }}</h2><a routerLink="/admin/products">{{ 'Manage catalog' | translate }}</a></div><div class="latest-product-grid">@for (product of dashboard.latestProducts; track product._id) { <article><img [src]="product.imageUrl" [alt]="product.name"><div><strong>{{ product.name }}</strong><span>{{ product.price | currency }}</span><small [class.low-stock]="product.stock <= 5">{{ 'Stock' | translate }}: {{ product.stock }}</small></div></article> }</div></section></div>
      <div class="col-xl-4"><section class="admin-card h-100"><div class="admin-card-head"><h2><i class="bi bi-exclamation-triangle me-2"></i>{{ 'Low stock' | translate }}</h2></div><div class="low-stock-list">@for (product of dashboard.lowStockProducts; track product._id) { <article><img [src]="product.imageUrl" [alt]="product.name"><div><strong>{{ product.name }}</strong><small>{{ product.stock }} {{ 'remaining' | translate }}</small></div><a [routerLink]="['/admin/products']"><i class="bi bi-pencil"></i></a></article> } @empty { <div class="empty-state compact"><i class="bi bi-check-circle"></i><p>{{ 'All stock levels look healthy.' | translate }}</p></div> }</div></section></div></div>
    }
  `,
})
export class AdminDashboardComponent implements OnInit {
  readonly data = signal<DashboardData | null>(null); readonly loading = signal(true);
  constructor(private admin: AdminService) {}
  ngOnInit(): void { this.admin.dashboard().subscribe({ next: (data) => { this.data.set(data); this.loading.set(false); }, error: () => this.loading.set(false) }); }
  customerName(user: unknown): string { const value = user as { firstName?: string; lastName?: string }; return value?.firstName ? `${value.firstName} ${value.lastName}` : 'Customer'; }
  statusLabel(status: string): string { return ({ ordered: 'Ordered', processing: 'Processing', shipped: 'Shipped', delivered: 'Delivered', cancelled: 'Cancelled' } as Record<string, string>)[status] || status; }
}
