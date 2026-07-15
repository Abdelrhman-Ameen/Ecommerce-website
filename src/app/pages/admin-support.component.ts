import { DatePipe } from '@angular/common';
import { Component, OnInit, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { AdminService } from '../core/admin.service';
import { SupportSettings, SupportTicket, SupportTicketStatus } from '../core/models';
import { ToastService } from '../core/toast.service';
import { TranslatePipe } from '../shared/translate.pipe';

@Component({
  standalone: true,
  imports: [DatePipe, ReactiveFormsModule, TranslatePipe],
  template: `
    <div class="admin-page-heading"><div><h1>{{ 'Support centre' | translate }}</h1><p>{{ 'Manage customer conversations and the contact information shown on the storefront.' | translate }}</p></div><button class="btn btn-primary-luxe" type="button" (click)="saveSettings()" [disabled]="settingsForm.invalid || savingSettings()"><i class="bi bi-cloud-check me-2"></i>{{ (savingSettings() ? 'Saving...' : 'Save contact details') | translate }}</button></div>
    <div class="row g-4"><div class="col-xl-4"><section class="admin-card support-settings-card"><div class="admin-card-head"><div><h2>{{ 'Store contact details' | translate }}</h2><p>{{ 'Customers see these details on the support page.' | translate }}</p></div></div><form [formGroup]="settingsForm" (ngSubmit)="saveSettings()"><div class="form-group-luxe"><label for="adminSupportEmail">{{ 'Support email' | translate }} *</label><input id="adminSupportEmail" class="form-control" type="email" formControlName="email"></div><div class="form-group-luxe"><label for="adminSupportPhone">{{ 'Support phone' | translate }} *</label><input id="adminSupportPhone" class="form-control" formControlName="phone"></div><div class="form-group-luxe"><label for="adminSupportHours">{{ 'Support hours' | translate }}</label><textarea id="adminSupportHours" class="form-control" rows="3" formControlName="hours" maxlength="160"></textarea></div><button class="btn btn-primary-luxe w-100" type="submit" [disabled]="settingsForm.invalid || savingSettings()">{{ 'Save contact details' | translate }}</button></form></section></div>
    <div class="col-xl-8"><div class="ticket-metric-grid"><article><i class="bi bi-inbox"></i><div><strong>{{ needsAdminCount() }}</strong><span>{{ 'Waiting for support' | translate }}</span></div></article><article><i class="bi bi-chat-dots"></i><div><strong>{{ count('waiting_customer') }}</strong><span>{{ 'Waiting for customer' | translate }}</span></div></article><article><i class="bi bi-check2-circle"></i><div><strong>{{ count('resolved') }}</strong><span>{{ 'Resolved' | translate }}</span></div></article></div><section class="admin-card mt-4"><div class="admin-card-head"><div><h2>{{ 'Customer conversations' | translate }}</h2><p>{{ 'The most recently updated conversations appear first.' | translate }}</p></div><select class="form-select ticket-filter" [value]="filter()" (change)="changeFilter($event)"><option value="all">{{ 'All statuses' | translate }}</option><option value="waiting_admin">{{ 'Waiting for support' | translate }}</option><option value="waiting_customer">{{ 'Waiting for customer' | translate }}</option><option value="resolved">{{ 'Resolved' | translate }}</option></select></div><div class="admin-ticket-list">@for (ticket of tickets(); track ticket._id) { <button type="button" (click)="openTicket(ticket)"><span class="ticket-priority-dot status-{{ normalizedStatus(ticket.status) }}"></span><div><strong>{{ ticket.subject }}</strong><small>#{{ ticket.ticketNumber }} · {{ ticket.name }} · {{ (ticket.lastMessageAt || ticket.createdAt) | date:'medium' }}</small></div><span class="ticket-status status-{{ normalizedStatus(ticket.status) }}">{{ statusLabel(ticket.status) | translate }}</span><i class="bi bi-chevron-right"></i></button> } @empty { <div class="empty-state"><i class="bi bi-inbox"></i><p>{{ 'No support tickets in this view.' | translate }}</p></div> }</div></section></div></div>

    @if (selectedTicket(); as ticket) { <div class="drawer-backdrop" (click)="closeTicket()"></div><aside class="admin-drawer support-ticket-drawer"><div class="drawer-head"><div><div class="eyebrow">#{{ ticket.ticketNumber }}</div><h2>{{ ticket.subject }}</h2></div><button type="button" (click)="closeTicket()"><i class="bi bi-x-lg"></i></button></div><div class="ticket-drawer-actions"><span class="ticket-status status-{{ normalizedStatus(ticket.status) }}">{{ statusLabel(ticket.status) | translate }}</span><button class="btn btn-sm btn-outline-ink" type="button" (click)="toggleResolved()" [disabled]="savingTicket()"><i class="bi" [class.bi-arrow-counterclockwise]="ticket.status === 'resolved'" [class.bi-check2-circle]="ticket.status !== 'resolved'"></i>{{ (ticket.status === 'resolved' ? 'Reopen ticket' : 'Mark resolved') | translate }}</button></div><div class="ticket-customer-card"><div><i class="bi bi-person"></i><span><small>{{ 'Customer' | translate }}</small><strong>{{ ticket.name }}</strong></span></div><a [href]="'mailto:' + ticket.email"><i class="bi bi-envelope"></i>{{ ticket.email }}</a>@if (ticket.phone) { <a [href]="'tel:' + ticket.phone"><i class="bi bi-telephone"></i>{{ ticket.phone }}</a> }<div><i class="bi bi-tag"></i><span><small>{{ 'Topic' | translate }}</small><strong>{{ categoryLabel(ticket.category) | translate }}</strong></span></div></div><div class="support-chat-thread admin-chat-thread">@for (message of ticket.messages; track message._id || message.createdAt) { <article class="chat-message" [class.from-customer]="message.sender === 'customer'" [class.from-admin]="message.sender === 'admin'"><span>{{ (message.sender === 'customer' ? ticket.name : 'Vellora support') | translate }}</span><p>{{ message.body }}</p><time>{{ message.createdAt | date:'medium' }}</time></article> }</div><form class="support-reply-form" [formGroup]="replyForm" (ngSubmit)="sendReply()"><label for="adminTicketReply">{{ 'Reply to customer' | translate }}</label><textarea id="adminTicketReply" class="form-control" rows="4" maxlength="3000" formControlName="message" [placeholder]="'Write a helpful response...' | translate"></textarea><small>{{ 'Sending a reply changes the ticket to waiting for customer.' | translate }}</small><button class="btn btn-primary-luxe w-100" type="submit" [disabled]="replyForm.invalid || savingTicket()">@if (savingTicket()) { <span class="spinner-border spinner-border-sm me-2"></span> } @else { <i class="bi bi-send me-2"></i> }{{ 'Send reply' | translate }}</button></form></aside> }
  `,
})
export class AdminSupportComponent implements OnInit {
  readonly settings = signal<SupportSettings>({ email: '', phone: '', hours: '' });
  readonly tickets = signal<SupportTicket[]>([]);
  readonly allTickets = signal<SupportTicket[]>([]);
  readonly selectedTicket = signal<SupportTicket | null>(null);
  readonly filter = signal<SupportTicketStatus | 'all'>('all');
  readonly savingSettings = signal(false);
  readonly savingTicket = signal(false);
  readonly settingsForm;
  readonly replyForm;

  constructor(private admin: AdminService, private toast: ToastService, fb: FormBuilder) {
    this.settingsForm = fb.nonNullable.group({ email: ['', [Validators.required, Validators.email, Validators.maxLength(160)]], phone: ['', [Validators.required, Validators.minLength(5), Validators.maxLength(30)]], hours: ['', Validators.maxLength(160)] });
    this.replyForm = fb.nonNullable.group({ message: ['', [Validators.required, Validators.maxLength(3000)]] });
  }

  ngOnInit(): void { this.load(); }
  load(): void { this.admin.support('all').subscribe((data) => { this.settings.set(data.settings); this.settingsForm.reset(data.settings); this.allTickets.set(data.tickets); this.applyFilter(); }); }
  count(status: SupportTicketStatus): number { return this.allTickets().filter((ticket) => this.normalizedStatus(ticket.status) === status).length; }
  needsAdminCount(): number { return this.allTickets().filter((ticket) => this.normalizedStatus(ticket.status) === 'waiting_admin').length; }
  changeFilter(event: Event): void { this.filter.set((event.target as HTMLSelectElement).value as SupportTicketStatus | 'all'); this.applyFilter(); }
  applyFilter(): void { this.tickets.set(this.filter() === 'all' ? this.allTickets() : this.allTickets().filter((ticket) => this.normalizedStatus(ticket.status) === this.filter())); }
  saveSettings(): void { if (this.settingsForm.invalid || this.savingSettings()) return; this.savingSettings.set(true); this.admin.saveSupportSettings(this.settingsForm.getRawValue()).subscribe({ next: (settings) => { this.settings.set(settings); this.savingSettings.set(false); this.toast.success('Support contact details saved'); }, error: () => this.savingSettings.set(false) }); }
  openTicket(ticket: SupportTicket): void { this.selectedTicket.set(ticket); this.replyForm.reset({ message: '' }); }
  closeTicket(): void { if (!this.savingTicket()) this.selectedTicket.set(null); }
  sendReply(): void {
    const ticket = this.selectedTicket();
    if (!ticket || this.replyForm.invalid || this.savingTicket()) return;
    this.savingTicket.set(true);
    this.admin.replyToSupportTicket(ticket._id, this.replyForm.controls.message.value).subscribe({ next: (updated) => { this.replaceTicket(updated); this.selectedTicket.set(updated); this.replyForm.reset({ message: '' }); this.savingTicket.set(false); this.toast.success('Reply sent'); }, error: () => this.savingTicket.set(false) });
  }
  toggleResolved(): void {
    const ticket = this.selectedTicket();
    if (!ticket || this.savingTicket()) return;
    const status: SupportTicketStatus = ticket.status === 'resolved' ? 'waiting_admin' : 'resolved';
    this.savingTicket.set(true);
    this.admin.updateSupportTicket(ticket._id, { status }).subscribe({ next: (updated) => { this.replaceTicket(updated); this.selectedTicket.set(updated); this.savingTicket.set(false); this.toast.success(status === 'resolved' ? 'Ticket resolved' : 'Ticket reopened'); }, error: () => this.savingTicket.set(false) });
  }
  replaceTicket(updated: SupportTicket): void { this.allTickets.update((items) => [updated, ...items.filter((item) => item._id !== updated._id)]); this.applyFilter(); }
  normalizedStatus(status: SupportTicketStatus): SupportTicketStatus { return status === 'open' || status === 'in_progress' ? 'waiting_admin' : status; }
  statusLabel(status: SupportTicketStatus): string { return ({ open: 'Waiting for support', in_progress: 'Waiting for support', waiting_admin: 'Waiting for support', waiting_customer: 'Waiting for customer', resolved: 'Resolved' })[status]; }
  categoryLabel(category: SupportTicket['category']): string { return ({ order: 'Order', product: 'Product', delivery: 'Delivery', return: 'Return or exchange', account: 'Account', other: 'Other' })[category]; }
}
