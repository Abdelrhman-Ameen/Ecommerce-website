import { Component, OnInit, signal } from '@angular/core';
import { CurrencyPipe, DatePipe } from '@angular/common';
import { Order, OrderStatus } from '../core/models';
import { OrderService } from '../core/order.service';
import { ToastService } from '../core/toast.service';
import { TranslatePipe } from '../shared/translate.pipe';

@Component({
  standalone: true,
  imports: [CurrencyPipe, DatePipe, TranslatePipe],
  template: `
    <div class="admin-page-heading"><div><h1>{{ 'Orders' | translate }}</h1><p>{{ 'Review fulfillment, update statuses, and monitor customer deliveries.' | translate }}</p></div><select class="form-select admin-filter-select" [value]="filter()" (change)="changeFilter($event)"><option value="">{{ 'All statuses' | translate }}</option>@for (status of statuses; track status) { <option [value]="status">{{ label(status) | translate }}</option> }</select></div>
    <section class="admin-card"><div class="table-responsive"><table class="table align-middle"><thead><tr><th>{{ 'Order' | translate }}</th><th>{{ 'Customers' | translate }}</th><th>{{ 'Items' | translate }}</th><th>{{ 'Date' | translate }}</th><th>{{ 'Total' | translate }}</th><th>{{ 'Status' | translate }}</th></tr></thead><tbody>@for (order of orders(); track order._id) { <tr><td><strong>#{{ order.orderNumber }}</strong></td><td><div><strong>{{ customerName(order) }}</strong><small class="d-block text-secondary">{{ customerEmail(order) }}</small></div></td><td>{{ itemCount(order) }}</td><td>{{ order.createdAt | date:'mediumDate' }}</td><td>{{ order.totalPrice | currency }}</td><td><select class="form-select form-select-sm status-select status-{{ order.status }}" [value]="order.status" (change)="update(order, $event)">@for (status of statuses; track status) { <option [value]="status">{{ label(status) | translate }}</option> }</select></td></tr> } @empty { <tr><td colspan="6"><div class="empty-state compact">{{ 'No orders match this status.' | translate }}</div></td></tr> }</tbody></table></div></section>
  `,
})
export class AdminOrdersComponent implements OnInit {
  readonly orders = signal<Order[]>([]); readonly filter = signal<OrderStatus | ''>(''); readonly statuses: OrderStatus[] = ['ordered', 'processing', 'shipped', 'delivered', 'cancelled'];
  constructor(private api: OrderService, private toast: ToastService) {}
  ngOnInit(): void { this.load(); }
  load(): void { this.api.all(this.filter() || undefined).subscribe((orders) => this.orders.set(orders)); }
  changeFilter(event: Event): void { this.filter.set((event.target as HTMLSelectElement).value as OrderStatus | ''); this.load(); }
  update(order: Order, event: Event): void { const status = (event.target as HTMLSelectElement).value as OrderStatus; this.api.updateStatus(order._id, status).subscribe((updated) => { this.orders.update((items) => items.map((item) => item._id === updated._id ? { ...item, status: updated.status } : item)); this.toast.success('Order status updated'); }); }
  label(status: OrderStatus): string { return ({ ordered: 'Ordered', processing: 'Processing', shipped: 'Shipped', delivered: 'Delivered', cancelled: 'Cancelled' })[status]; }
  customerName(order: Order): string { const user = order.user as { firstName?: string; lastName?: string }; return user?.firstName ? `${user.firstName} ${user.lastName}` : order.shippingAddress.fullName; }
  customerEmail(order: Order): string { return (order.user as { email?: string })?.email || order.shippingAddress.email; }
  itemCount(order: Order): number { return order.items.reduce((sum, item) => sum + item.quantity, 0); }
}
