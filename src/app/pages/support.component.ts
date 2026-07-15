import { DatePipe } from '@angular/common';
import { Component, OnInit, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { AuthService } from '../core/auth.service';
import { SupportSettings, SupportTicket } from '../core/models';
import { SupportService } from '../core/support.service';
import { ToastService } from '../core/toast.service';
import { TranslatePipe } from '../shared/translate.pipe';

@Component({
  standalone: true,
  imports: [DatePipe, ReactiveFormsModule, TranslatePipe],
  template: `
    <section class="support-hero"><div class="container-xxl"><span class="eyebrow">VELLORA / {{ 'SUPPORT' | translate }}</span><h1>{{ 'How can we help?' | translate }}</h1><p>{{ 'Create a support ticket or contact the store directly. Your request will be available to our admin team immediately.' | translate }}</p></div></section>
    <section class="support-page"><div class="container-xxl"><div class="support-contact-grid"><article><i class="bi bi-envelope-paper"></i><div><small>{{ 'Email support' | translate }}</small><strong>{{ settings().email }}</strong></div><a [href]="'mailto:' + settings().email">{{ 'Send email' | translate }}</a></article><article><i class="bi bi-telephone"></i><div><small>{{ 'Call us' | translate }}</small><strong>{{ settings().phone }}</strong></div><a [href]="'tel:' + phoneLink()">{{ 'Call now' | translate }}</a></article><article><i class="bi bi-clock"></i><div><small>{{ 'Support hours' | translate }}</small><strong>{{ settings().hours }}</strong></div></article></div>
      <div class="row g-4 align-items-start"><div class="col-lg-7"><section class="support-ticket-card"><div class="section-heading-simple"><span>{{ 'New request' | translate }}</span><h2>{{ 'Create a support ticket' | translate }}</h2><p>{{ 'Tell us what happened and include your order number when relevant.' | translate }}</p></div>
        @if (createdTicket(); as ticket) { <div class="ticket-success"><i class="bi bi-check-circle-fill"></i><div><strong>{{ 'Ticket created successfully' | translate }}</strong><p>{{ 'Reference number' | translate }}: <b>{{ ticket.ticketNumber }}</b></p></div><button type="button" (click)="createdTicket.set(null)">{{ 'Create another ticket' | translate }}</button></div> }
        @else { <form [formGroup]="form" (ngSubmit)="submit()" novalidate><div class="row g-3"><div class="col-sm-6 form-group-luxe"><label for="supportName">{{ 'Full name' | translate }} *</label><input id="supportName" class="form-control" formControlName="name" autocomplete="name"></div><div class="col-sm-6 form-group-luxe"><label for="supportEmail">{{ 'Email address' | translate }} *</label><input id="supportEmail" class="form-control" type="email" formControlName="email" autocomplete="email"></div><div class="col-sm-6 form-group-luxe"><label for="supportPhone">{{ 'Phone number' | translate }}</label><input id="supportPhone" class="form-control" formControlName="phone" autocomplete="tel"></div><div class="col-sm-6 form-group-luxe"><label for="supportCategory">{{ 'Topic' | translate }} *</label><select id="supportCategory" class="form-select" formControlName="category"><option value="order">{{ 'Order' | translate }}</option><option value="product">{{ 'Product' | translate }}</option><option value="delivery">{{ 'Delivery' | translate }}</option><option value="return">{{ 'Return or exchange' | translate }}</option><option value="account">{{ 'Account' | translate }}</option><option value="other">{{ 'Other' | translate }}</option></select></div><div class="col-12 form-group-luxe"><label for="supportSubject">{{ 'Subject' | translate }} *</label><input id="supportSubject" class="form-control" formControlName="subject" maxlength="160"></div><div class="col-12 form-group-luxe"><label for="supportMessage">{{ 'How can we help?' | translate }} *</label><textarea id="supportMessage" class="form-control" formControlName="message" rows="6" maxlength="3000"></textarea><small class="form-hint">{{ form.controls.message.value.length }}/3000</small></div></div><button class="btn btn-primary-luxe" type="submit" [disabled]="form.invalid || sending()">@if (sending()) { <span class="spinner-border spinner-border-sm me-2"></span> }{{ (sending() ? 'Sending...' : 'Send support ticket') | translate }}</button></form> }
      </section></div><div class="col-lg-5"><section class="support-side-card"><i class="bi bi-shield-check"></i><h2>{{ 'Safe, direct support' | translate }}</h2><p>{{ 'Vellora staff will never ask for your password or complete payment credentials.' | translate }}</p><ul><li>{{ 'Include your order number when possible.' | translate }}</li><li>{{ 'Describe the issue clearly and add relevant dates.' | translate }}</li><li>{{ 'Use the same email address as your account.' | translate }}</li></ul></section>
        @if (tickets().length) { <section class="support-side-card mt-4"><div class="admin-card-head"><h2>{{ 'My recent tickets' | translate }}</h2></div><div class="customer-ticket-list">@for (ticket of tickets(); track ticket._id) { <article><div><strong>{{ ticket.subject }}</strong><small>#{{ ticket.ticketNumber }} · {{ ticket.createdAt | date:'mediumDate' }}</small></div><span class="ticket-status status-{{ ticket.status }}">{{ statusLabel(ticket.status) | translate }}</span>@if (ticket.adminNote) { <p>{{ ticket.adminNote }}</p> }</article> }</div></section> }
      </div></div></div></section>
  `,
})
export class SupportComponent implements OnInit {
  readonly settings = signal<SupportSettings>({ email: 'support@vellora.store', phone: '+20 100 000 0000', hours: 'Sunday–Thursday, 9:00–17:00 Cairo time' });
  readonly tickets = signal<SupportTicket[]>([]);
  readonly createdTicket = signal<SupportTicket | null>(null);
  readonly sending = signal(false);
  readonly form;
  constructor(private support: SupportService, public auth: AuthService, private toast: ToastService, fb: FormBuilder) {
    this.form = fb.nonNullable.group({ name: ['', [Validators.required, Validators.minLength(2), Validators.maxLength(100)]], email: ['', [Validators.required, Validators.email, Validators.maxLength(160)]], phone: ['', Validators.maxLength(30)], category: ['other' as SupportTicket['category'], Validators.required], subject: ['', [Validators.required, Validators.minLength(3), Validators.maxLength(160)]], message: ['', [Validators.required, Validators.minLength(10), Validators.maxLength(3000)]] });
  }
  ngOnInit(): void { this.support.contact().subscribe((settings) => this.settings.set(settings)); const user = this.auth.user(); if (user) { this.form.patchValue({ name: `${user.firstName} ${user.lastName}`, email: user.email, phone: user.phone || '' }); this.support.myTickets().subscribe((tickets) => this.tickets.set(tickets)); } }
  submit(): void { if (this.form.invalid || this.sending()) return; this.sending.set(true); this.support.createTicket(this.form.getRawValue()).subscribe({ next: (ticket) => { this.createdTicket.set(ticket); this.tickets.update((items) => [ticket, ...items]); this.sending.set(false); this.toast.success('Support ticket created'); }, error: () => this.sending.set(false) }); }
  phoneLink(): string { return this.settings().phone.replace(/[^+\d]/g, ''); }
  statusLabel(status: SupportTicket['status']): string { return ({ open: 'Open', in_progress: 'In progress', resolved: 'Resolved' })[status]; }
}
