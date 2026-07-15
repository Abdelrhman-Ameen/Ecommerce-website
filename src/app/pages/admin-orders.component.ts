import { CurrencyPipe, DatePipe, TitleCasePipe } from '@angular/common';
import { Component, OnInit, signal } from '@angular/core';
import { Order, OrderStatus, User } from '../core/models';
import { OrderService } from '../core/order.service';
import { ToastService } from '../core/toast.service';
import { TranslatePipe } from '../shared/translate.pipe';

@Component({
  standalone: true,
  imports: [CurrencyPipe, DatePipe, TitleCasePipe, TranslatePipe],
  template: `
    <div class="admin-page-heading"><div><h1>{{ 'Orders' | translate }}</h1><p>{{ 'Review fulfillment, update statuses, and monitor customer deliveries.' | translate }}</p></div><select class="form-select admin-filter-select" [value]="filter()" (change)="changeFilter($event)"><option value="">{{ 'All statuses' | translate }}</option>@for (status of statuses; track status) { <option [value]="status">{{ label(status) | translate }}</option> }</select></div>
    <section class="admin-card"><div class="table-responsive"><table class="table align-middle"><thead><tr><th>{{ 'Order' | translate }}</th><th>{{ 'Customers' | translate }}</th><th>{{ 'Items' | translate }}</th><th>{{ 'Date' | translate }}</th><th>{{ 'Total' | translate }}</th><th>{{ 'Status' | translate }}</th></tr></thead><tbody>@for (order of orders(); track order._id) { <tr><td><button class="order-link-button" type="button" (click)="openDetails(order)">#{{ order.orderNumber }}</button></td><td><button class="customer-link-button" type="button" (click)="openDetails(order)"><strong>{{ customerName(order) }}</strong><small>{{ customerEmail(order) }}</small><span>{{ 'View customer details' | translate }} <i class="bi bi-arrow-right"></i></span></button></td><td>{{ itemCount(order) }}</td><td>{{ order.createdAt | date:'mediumDate' }}</td><td>{{ order.totalPrice | currency }}</td><td><select class="form-select form-select-sm status-select status-{{ order.status }}" [value]="order.status" (change)="update(order, $event)">@for (status of statuses; track status) { <option [value]="status">{{ label(status) | translate }}</option> }</select></td></tr> } @empty { <tr><td colspan="6"><div class="empty-state compact">{{ 'No orders match this status.' | translate }}</div></td></tr> }</tbody></table></div></section>

    @if (selectedOrder(); as order) { <div class="drawer-backdrop" (click)="closeDetails()"></div><aside class="admin-drawer order-detail-drawer"><div class="drawer-head"><div><div class="eyebrow">{{ 'Order details' | translate }}</div><h2>#{{ order.orderNumber }}</h2></div><button type="button" (click)="closeDetails()" [attr.aria-label]="'Close' | translate"><i class="bi bi-x-lg"></i></button></div>
      <div class="order-detail-status"><div><small>{{ 'Status' | translate }}</small><strong>{{ label(order.status) | translate }}</strong></div><div><small>{{ 'Placed' | translate }}</small><strong>{{ order.createdAt | date:'medium' }}</strong></div><div><small>{{ 'Total' | translate }}</small><strong>{{ order.totalPrice | currency }}</strong></div></div>
      <section class="customer-detail-card"><div class="detail-card-heading"><i class="bi bi-person-vcard"></i><div><small>{{ 'Customer account' | translate }}</small><h3>{{ customerName(order) }}</h3></div></div><dl><div><dt>{{ 'Email' | translate }}</dt><dd><a [href]="'mailto:' + customerEmail(order)">{{ customerEmail(order) }}</a></dd></div><div><dt>{{ 'Account phone' | translate }}</dt><dd><a [href]="'tel:' + customerPhone(order)">{{ customerPhone(order) }}</a></dd></div>@if (customer(order); as account) { <div><dt>{{ 'Role' | translate }}</dt><dd>{{ account.role | titlecase }}</dd></div><div><dt>{{ 'Joined' | translate }}</dt><dd>{{ account.createdAt | date:'mediumDate' }}</dd></div> }</dl></section>
      <section class="customer-detail-card"><div class="detail-card-heading"><i class="bi bi-geo-alt"></i><div><small>{{ 'Delivery contact' | translate }}</small><h3>{{ order.shippingAddress.fullName }}</h3></div></div><dl><div><dt>{{ 'Delivery phone' | translate }}</dt><dd><a [href]="'tel:' + order.shippingAddress.phone">{{ order.shippingAddress.phone }}</a></dd></div><div><dt>{{ 'Street address' | translate }}</dt><dd>{{ order.shippingAddress.street }}</dd></div><div><dt>{{ 'Governorate' | translate }}</dt><dd>{{ order.shippingAddress.governorate || '—' }}</dd></div><div><dt>{{ 'City' | translate }}</dt><dd>{{ order.shippingAddress.city }}</dd></div></dl></section>
      <section class="customer-detail-card"><div class="detail-card-heading"><i class="bi bi-bag"></i><div><small>{{ 'Purchased products' | translate }}</small><h3>{{ itemCount(order) }} {{ 'items' | translate }}</h3></div></div><div class="order-detail-items">@for (item of order.items; track item.product) { <article><img [src]="item.imageUrl" [alt]="item.name"><div><strong>{{ item.name }}</strong><small>{{ item.quantity }} × {{ item.price | currency }}</small></div><span>{{ item.quantity * item.price | currency }}</span></article> }</div><div class="order-detail-totals"><div><span>{{ 'Subtotal' | translate }}</span><strong>{{ order.subtotal | currency }}</strong></div><div><span>{{ 'Shipping' | translate }}</span><strong>{{ order.shippingPrice | currency }}</strong></div><div><span>{{ 'Total' | translate }}</span><strong>{{ order.totalPrice | currency }}</strong></div></div></section>
    </aside> }
  `,
})
export class AdminOrdersComponent implements OnInit {
  readonly orders = signal<Order[]>([]);
  readonly filter = signal<OrderStatus | ''>('');
  readonly selectedOrder = signal<Order | null>(null);
  readonly statuses: OrderStatus[] = ['ordered', 'processing', 'shipped', 'delivered', 'cancelled'];

  constructor(private api: OrderService, private toast: ToastService) {}
  ngOnInit(): void { this.load(); }
  load(): void { this.api.all(this.filter() || undefined).subscribe((orders) => this.orders.set(orders)); }
  changeFilter(event: Event): void { this.filter.set((event.target as HTMLSelectElement).value as OrderStatus | ''); this.load(); }
  update(order: Order, event: Event): void { const status = (event.target as HTMLSelectElement).value as OrderStatus; this.api.updateStatus(order._id, status).subscribe((updated) => { this.orders.update((items) => items.map((item) => item._id === updated._id ? { ...item, status: updated.status } : item)); if (this.selectedOrder()?._id === updated._id) this.selectedOrder.update((item) => item ? { ...item, status: updated.status } : item); this.toast.success('Order status updated'); }); }
  label(status: OrderStatus): string { return ({ ordered: 'Ordered', processing: 'Processing', shipped: 'Shipped', delivered: 'Delivered', cancelled: 'Cancelled' })[status]; }
  customer(order: Order): User | null { return typeof order.user === 'object' ? order.user : null; }
  customerName(order: Order): string { const user = this.customer(order); return user?.firstName ? `${user.firstName} ${user.lastName}` : order.shippingAddress.fullName; }
  customerEmail(order: Order): string { return this.customer(order)?.email || order.shippingAddress.email; }
  customerPhone(order: Order): string { return this.customer(order)?.phone || order.shippingAddress.phone; }
  itemCount(order: Order): number { return order.items.reduce((sum, item) => sum + item.quantity, 0); }
  openDetails(order: Order): void { this.selectedOrder.set(order); }
  closeDetails(): void { this.selectedOrder.set(null); }
}
