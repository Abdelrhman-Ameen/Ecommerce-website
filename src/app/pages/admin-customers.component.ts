import { Component, OnInit, computed, signal } from '@angular/core';
import { DatePipe, TitleCasePipe } from '@angular/common';
import { User } from '../core/models';
import { AdminService } from '../core/admin.service';
import { TranslatePipe } from '../shared/translate.pipe';

@Component({
  standalone: true,
  imports: [DatePipe, TitleCasePipe, TranslatePipe],
  template: `
    <div class="admin-page-heading"><div><h1>{{ 'Customers' | translate }}</h1><p>{{ 'View registered customer accounts and contact details.' | translate }}</p></div></div>
    <section class="admin-card"><div class="admin-card-head admin-search-head"><div class="admin-search"><i class="bi bi-search"></i><input type="search" [placeholder]="'Search customers' | translate" [value]="search()" (input)="search.set($any($event.target).value)"></div><span>{{ filtered().length }} {{ 'accounts' | translate }}</span></div><div class="table-responsive"><table class="table align-middle"><thead><tr><th>{{ 'Customer' | translate }}</th><th>{{ 'Email' | translate }}</th><th>{{ 'Phone' | translate }}</th><th>{{ 'Role' | translate }}</th><th>{{ 'Joined' | translate }}</th></tr></thead><tbody>@for (user of filtered(); track user._id) { <tr><td><div class="customer-cell"><span class="avatar-button">{{ user.firstName.charAt(0) }}{{ user.lastName.charAt(0) }}</span><strong>{{ user.firstName }} {{ user.lastName }}</strong></div></td><td>{{ user.email }}</td><td>{{ user.phone || '—' }}</td><td><span class="role-badge">{{ user.role | titlecase }}</span></td><td>{{ user.createdAt | date:'mediumDate' }}</td></tr> } @empty { <tr><td colspan="5"><div class="empty-state compact">{{ 'No customers found.' | translate }}</div></td></tr> }</tbody></table></div></section>
  `,
})
export class AdminCustomersComponent implements OnInit {
  readonly users = signal<User[]>([]); readonly search = signal(''); readonly filtered = computed(() => { const value = this.search().trim().toLowerCase(); return !value ? this.users() : this.users().filter((user) => `${user.firstName} ${user.lastName} ${user.email}`.toLowerCase().includes(value)); });
  constructor(private admin: AdminService) {}
  ngOnInit(): void { this.admin.users().subscribe((users) => this.users.set(users)); }
}
