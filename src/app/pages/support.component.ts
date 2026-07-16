import { DatePipe } from '@angular/common';
import { Component, OnDestroy, OnInit, signal } from '@angular/core';
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
    <section class="support-hero">
      <div class="support-hero-noise" aria-hidden="true"></div>
      <div class="container-xxl support-hero-grid">
        <div class="support-hero-copy">
          <span class="support-live-pill"><i></i>{{ 'Live boutique support' | translate }}</span>
          <span class="eyebrow">VELLORA / {{ 'SUPPORT' | translate }}</span>
          <h1>{{ 'How can we help?' | translate }}</h1>
          <p>{{ 'A real person is ready to help with orders, styling, delivery, and returns.' | translate }}</p>
          <a class="support-hero-cta" href="#support-request"><span>{{ 'Start a conversation' | translate }}</span><i class="bi bi-arrow-down-right"></i></a>
        </div>

        <div class="support-boutique-wrap" aria-hidden="true">
          <div class="support-boutique-glow"></div>
          <div class="support-boutique" (pointermove)="trackSupportPointer($event)" (pointerleave)="resetSupportPointer($event)">
            <svg class="boutique-gaze-layer" [class.is-active]="gazeConePath()" focusable="false">
              <defs><linearGradient id="velloraGazeFill" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="#ff6048" stop-opacity=".2"></stop><stop offset=".72" stop-color="#ff6048" stop-opacity=".055"></stop><stop offset="1" stop-color="#ff6048" stop-opacity="0"></stop></linearGradient></defs>
              <path class="boutique-gaze-fill" [attr.d]="gazeConePath()"></path>
            </svg>
            <div class="boutique-topbar"><span>PRIVATE CLIENT DESK</span><span>CAIRO / 2026</span></div>
            <div class="boutique-sign"><i>V</i><div><strong>VELLORA</strong><span>CUSTOMER SERVICE</span></div><b><em></em> ONLINE</b></div>
            <div class="boutique-light light-one"></div><div class="boutique-light light-two"></div>
            <div class="boutique-shelf"><span></span><i></i><b></b></div>
            <div class="boutique-rail">
              <span class="rail-bar"></span><span class="rail-leg rail-leg-left"></span><span class="rail-leg rail-leg-right"></span>
              <div class="boutique-garment garment-one"><i></i><span></span></div>
              <div class="boutique-garment garment-two"><i></i><span></span></div>
              <div class="boutique-garment garment-three"><i></i><span></span></div>
            </div>

            <div class="boutique-agent-station">
              <div class="agent-chair"></div>
              <div class="support-agent">
                <div class="agent-torso"><span></span><i></i></div>
                <div class="agent-neck"></div>
                <div class="agent-head">
                  <div class="agent-hair"></div><div class="agent-ear"></div><div class="agent-headset"></div>
                  <div class="agent-brow brow-left"></div><div class="agent-brow brow-right"></div>
                  <div class="agent-eye eye-left"><i></i></div><div class="agent-eye eye-right"><i></i></div>
                  <div class="agent-nose"></div><div class="agent-smile"></div>
                </div>
              </div>
              <div class="agent-desk"><div class="agent-laptop"><i>V</i><span></span></div><b></b></div>
            </div>

            <div class="boutique-message message-one"><i class="bi bi-chat-heart-fill"></i><span>STYLE ADVICE</span></div>
            <div class="boutique-message message-two"><i class="bi bi-box-seam"></i><span>ORDER READY</span></div>
            <div class="boutique-caption"><span>01 / PERSONAL SUPPORT</span><strong>Vellora — Customer Service</strong></div>
          </div>
        </div>
      </div>
    </section>
    <section class="support-page"><div class="container-xxl">
      <div class="support-contact-grid"><article><i class="bi bi-envelope-paper"></i><div><small>{{ 'Email support' | translate }}</small><strong>{{ settings().email }}</strong></div><a [href]="'mailto:' + settings().email">{{ 'Send email' | translate }}</a></article><article><i class="bi bi-telephone"></i><div><small>{{ 'Call us' | translate }}</small><strong>{{ settings().phone }}</strong></div><a [href]="'tel:' + phoneLink()">{{ 'Call now' | translate }}</a></article><article><i class="bi bi-clock"></i><div><small>{{ 'Support hours' | translate }}</small><strong>{{ settings().hours }}</strong></div></article></div>
      <section id="store-location" class="support-location-card">
        <div class="support-location-copy"><span class="eyebrow">VELLORA / {{ 'Store location' | translate }}</span><div class="support-location-icon"><i class="bi bi-geo-alt-fill"></i></div><h2>{{ 'Visit Vellora' | translate }}</h2><p>{{ 'XWJW+49J, Al Taif Street, off El-Higaz Street, Heliopolis, Cairo' | translate }}</p><small>{{ 'Move your cursor across the map to light the way to Vellora.' | translate }}</small><a href="https://www.google.com/maps/search/?api=1&amp;query=XWJW%2B49J%2C%20Al%20Taif%20Street%2C%20off%20El-Higaz%20Street%2C%20Heliopolis%2C%20Cairo" target="_blank" rel="noopener noreferrer"><span>{{ 'Open in Google Maps' | translate }}</span><i class="bi bi-arrow-up-right"></i></a></div>
        <div class="vellora-route-map" (pointermove)="trackMapPointer($event)" (pointerleave)="resetMapRoute()" role="img" [attr.aria-label]="'Interactive neighborhood map leading to the Vellora store' | translate">
          <img src="/images/vellora-location-map-v1.webp" alt="" loading="lazy">
          <div class="route-map-shade"></div>
          <svg class="route-map-path" focusable="false"><path class="route-map-glow" [attr.d]="mapRoutePath()"></path><path class="route-map-line" [attr.d]="mapRoutePath()"></path></svg>
          @if (mapRoutePath()) { <span class="route-map-origin" [style.left.px]="mapPointerX()" [style.top.px]="mapPointerY()"></span> }
          <span class="route-map-instruction"><i class="bi bi-cursor-fill"></i>{{ 'Hover to find your way' | translate }}</span>
        </div>
        <div class="support-map-frame"><iframe title="Vellora store location on Google Maps" src="https://www.google.com/maps?q=XWJW%2B49J%2C%20Al%20Taif%20Street%2C%20off%20El-Higaz%20Street%2C%20Heliopolis%2C%20Cairo&amp;z=18&amp;output=embed" loading="lazy" referrerpolicy="no-referrer-when-downgrade" allowfullscreen></iframe><span><i class="bi bi-pin-map-fill"></i> El-Higaz · Cairo</span><b class="exact-map-pin"><i class="bi bi-geo-alt-fill"></i> VELLORA</b></div>
      </section>
      <div id="support-request" class="row g-4 align-items-start"><div class="col-lg-7"><section class="support-ticket-card"><div class="section-heading-simple"><span>{{ 'New request' | translate }}</span><h2>{{ 'Create a support ticket' | translate }}</h2><p>{{ 'Tell us what happened and include your order number when relevant.' | translate }}</p></div>
        @if (createdTicket(); as ticket) { <div class="ticket-success"><i class="bi bi-check-circle-fill"></i><div><strong>{{ 'Ticket created successfully' | translate }}</strong><p>{{ 'Reference number' | translate }}: <b>{{ ticket.ticketNumber }}</b></p></div>@if (auth.user()) { <button type="button" (click)="selectTicket(ticket)">{{ 'Open conversation' | translate }}</button> }<button type="button" (click)="createdTicket.set(null)">{{ 'Create another ticket' | translate }}</button></div> }
        @else { <form [formGroup]="form" (ngSubmit)="submit()" novalidate><div class="row g-3"><div class="col-sm-6 form-group-luxe"><label for="supportName">{{ 'Full name' | translate }} *</label><input id="supportName" class="form-control" formControlName="name" autocomplete="name"></div><div class="col-sm-6 form-group-luxe"><label for="supportEmail">{{ 'Email address' | translate }} *</label><input id="supportEmail" class="form-control" type="email" formControlName="email" autocomplete="email"></div><div class="col-sm-6 form-group-luxe"><label for="supportPhone">{{ 'Phone number' | translate }}</label><input id="supportPhone" class="form-control" formControlName="phone" autocomplete="tel"></div><div class="col-sm-6 form-group-luxe"><label for="supportCategory">{{ 'Topic' | translate }} *</label><select id="supportCategory" class="form-select" formControlName="category"><option value="order">{{ 'Order' | translate }}</option><option value="product">{{ 'Product' | translate }}</option><option value="delivery">{{ 'Delivery' | translate }}</option><option value="return">{{ 'Return or exchange' | translate }}</option><option value="account">{{ 'Account' | translate }}</option><option value="other">{{ 'Other' | translate }}</option></select></div><div class="col-12 form-group-luxe"><label for="supportSubject">{{ 'Subject' | translate }} *</label><input id="supportSubject" class="form-control" formControlName="subject" maxlength="160"></div><div class="col-12 form-group-luxe"><label for="supportMessage">{{ 'How can we help?' | translate }} *</label><textarea id="supportMessage" class="form-control" formControlName="message" rows="6" maxlength="3000"></textarea><small class="form-hint">{{ form.controls.message.value.length }}/3000</small></div></div><button class="btn btn-primary-luxe" type="submit" [disabled]="form.invalid || sending()">@if (sending()) { <span class="spinner-border spinner-border-sm me-2"></span> }{{ (sending() ? 'Sending...' : 'Send support ticket') | translate }}</button></form> }
      </section></div>
      <div class="col-lg-5"><section class="support-side-card"><i class="bi bi-shield-check"></i><h2>{{ 'Safe, direct support' | translate }}</h2><p>{{ 'Vellora staff will never ask for your password or complete payment credentials.' | translate }}</p><ul><li>{{ 'Include your order number when possible.' | translate }}</li><li>{{ 'Describe the issue clearly and add relevant dates.' | translate }}</li><li>{{ 'Use the same email address as your account.' | translate }}</li></ul></section>
        @if (auth.user() && tickets().length) { <section class="support-side-card support-conversations mt-4"><div class="admin-card-head"><div><h2>{{ 'My conversations' | translate }}</h2><p>{{ 'Continue an existing support request.' | translate }}</p></div></div><div class="customer-ticket-list">@for (ticket of tickets(); track ticket._id) { <button type="button" [class.active]="selectedTicket()?._id === ticket._id" (click)="selectTicket(ticket)"><div><strong>{{ ticket.subject }}</strong><small>#{{ ticket.ticketNumber }} · {{ (ticket.lastMessageAt || ticket.createdAt) | date:'mediumDate' }}</small></div><span class="ticket-status status-{{ ticket.status }}">{{ statusLabel(ticket.status) | translate }}</span><i class="bi bi-chevron-right"></i></button> }</div></section> }
      </div></div>
      @if (selectedTicket(); as ticket) { <section class="customer-chat-card mt-4"><header><div><span class="eyebrow">#{{ ticket.ticketNumber }}</span><h2>{{ ticket.subject }}</h2></div><span class="ticket-status status-{{ ticket.status }}">{{ statusLabel(ticket.status) | translate }}</span><button type="button" (click)="selectedTicket.set(null)" [attr.aria-label]="'Close' | translate"><i class="bi bi-x-lg"></i></button></header><div class="support-chat-thread">@for (message of ticket.messages; track message._id || message.createdAt) { <article class="chat-message" [class.from-customer]="message.sender === 'customer'" [class.from-admin]="message.sender === 'admin'"><span>{{ (message.sender === 'customer' ? 'You' : 'Vellora support') | translate }}</span><p>{{ message.body }}</p><time>{{ message.createdAt | date:'medium' }}</time></article> }</div><form class="support-reply-form" [formGroup]="replyForm" (ngSubmit)="sendReply()"><label for="customerReply">{{ 'Your reply' | translate }}</label><div><textarea id="customerReply" class="form-control" rows="3" maxlength="3000" formControlName="message" [placeholder]="'Write a message...' | translate"></textarea><button class="btn btn-primary-luxe" type="submit" [disabled]="replyForm.invalid || replying()">@if (replying()) { <span class="spinner-border spinner-border-sm"></span> } @else { <i class="bi bi-send"></i> }<span>{{ 'Send' | translate }}</span></button></div><small>{{ 'Your reply reopens the conversation for the support team.' | translate }}</small></form></section> }
    </div></section>
  `,
})
export class SupportComponent implements OnInit, OnDestroy {
  readonly settings = signal<SupportSettings>({ email: 'support@vellora.store', phone: '+20 100 000 0000', hours: 'Sunday–Thursday, 9:00–17:00 Cairo time' });
  readonly tickets = signal<SupportTicket[]>([]);
  readonly createdTicket = signal<SupportTicket | null>(null);
  readonly selectedTicket = signal<SupportTicket | null>(null);
  readonly sending = signal(false);
  readonly replying = signal(false);
  readonly gazeConePath = signal('');
  readonly mapRoutePath = signal('');
  readonly mapPointerX = signal(0);
  readonly mapPointerY = signal(0);
  readonly form;
  readonly replyForm;
  private pointerFrame = 0;
  private pointerTarget: HTMLElement | null = null;
  private pointerX = 0;
  private pointerY = 0;
  private pointerLocalX = 0;
  private pointerLocalY = 0;

  constructor(private support: SupportService, public auth: AuthService, private toast: ToastService, fb: FormBuilder) {
    this.form = fb.nonNullable.group({ name: ['', [Validators.required, Validators.minLength(2), Validators.maxLength(100)]], email: ['', [Validators.required, Validators.email, Validators.maxLength(160)]], phone: ['', Validators.maxLength(30)], category: ['other' as SupportTicket['category'], Validators.required], subject: ['', [Validators.required, Validators.minLength(3), Validators.maxLength(160)]], message: ['', [Validators.required, Validators.minLength(10), Validators.maxLength(3000)]] });
    this.replyForm = fb.nonNullable.group({ message: ['', [Validators.required, Validators.maxLength(3000)]] });
  }

  ngOnInit(): void {
    this.support.contact().subscribe((settings) => this.settings.set(settings));
    const user = this.auth.user();
    if (user) {
      this.form.patchValue({ name: `${user.firstName} ${user.lastName}`, email: user.email, phone: user.phone || '' });
      this.support.myTickets().subscribe((tickets) => this.tickets.set(tickets));
    }
  }

  ngOnDestroy(): void {
    if (this.pointerFrame) cancelAnimationFrame(this.pointerFrame);
  }

  trackSupportPointer(event: PointerEvent): void {
    if (event.pointerType === 'touch') return;
    const target = event.currentTarget as HTMLElement;
    const bounds = target.getBoundingClientRect();
    this.pointerTarget = target;
    this.pointerX = Math.max(-1, Math.min(1, ((event.clientX - bounds.left) / bounds.width - .5) * 2));
    this.pointerY = Math.max(-1, Math.min(1, ((event.clientY - bounds.top) / bounds.height - .5) * 2));
    this.pointerLocalX = event.clientX - bounds.left;
    this.pointerLocalY = event.clientY - bounds.top;
    if (this.pointerFrame) return;
    this.pointerFrame = requestAnimationFrame(() => {
      this.applySupportPointer(this.pointerTarget, this.pointerX, this.pointerY);
      this.updateGazePath(this.pointerTarget, this.pointerLocalX, this.pointerLocalY);
      this.pointerFrame = 0;
    });
  }

  resetSupportPointer(event: PointerEvent): void {
    this.pointerTarget = event.currentTarget as HTMLElement;
    this.pointerX = 0;
    this.pointerY = 0;
    this.gazeConePath.set('');
    if (this.pointerFrame) cancelAnimationFrame(this.pointerFrame);
    this.pointerFrame = requestAnimationFrame(() => {
      this.applySupportPointer(this.pointerTarget, 0, 0);
      this.pointerFrame = 0;
    });
  }

  private applySupportPointer(target: HTMLElement | null, x: number, y: number): void {
    if (!target) return;
    target.style.setProperty('--support-x', `${(x * 18).toFixed(2)}px`);
    target.style.setProperty('--support-y', `${(y * 12).toFixed(2)}px`);
    target.style.setProperty('--support-gaze-x', `${(x * 3.4).toFixed(2)}px`);
    target.style.setProperty('--support-gaze-y', `${(y * 2.2).toFixed(2)}px`);
    target.style.setProperty('--support-head-turn', `${(x * 4.5).toFixed(2)}deg`);
    target.style.setProperty('--support-tilt-x', `${(y * -1.8).toFixed(2)}deg`);
    target.style.setProperty('--support-tilt-y', `${(x * 2.6).toFixed(2)}deg`);
  }

  private updateGazePath(target: HTMLElement | null, targetX: number, targetY: number): void {
    if (!target) return;
    const bounds = target.getBoundingClientRect();
    const eyes = Array.from(target.querySelectorAll<HTMLElement>('.agent-eye')).map((eye) => eye.getBoundingClientRect());
    if (!eyes.length) return;
    const originX = eyes.reduce((sum, eye) => sum + eye.left + eye.width / 2, 0) / eyes.length - bounds.left;
    const originY = eyes.reduce((sum, eye) => sum + eye.top + eye.height / 2, 0) / eyes.length - bounds.top;
    const angle = Math.atan2(targetY - originY, targetX - originX);
    const distance = Math.min(340, Math.max(55, Math.hypot(targetX - originX, targetY - originY)));
    const halfAngle = Math.PI / 12;
    const upperX = originX + Math.cos(angle - halfAngle) * distance;
    const upperY = originY + Math.sin(angle - halfAngle) * distance;
    const lowerX = originX + Math.cos(angle + halfAngle) * distance;
    const lowerY = originY + Math.sin(angle + halfAngle) * distance;
    const point = (value: number) => value.toFixed(1);
    this.gazeConePath.set(`M ${point(originX)} ${point(originY)} L ${point(upperX)} ${point(upperY)} L ${point(lowerX)} ${point(lowerY)} Z`);
  }

  trackMapPointer(event: PointerEvent): void {
    if (event.pointerType === 'touch') return;
    const map = event.currentTarget as HTMLElement;
    const bounds = map.getBoundingClientRect();
    const startX = event.clientX - bounds.left;
    const startY = event.clientY - bounds.top;
    const storeX = bounds.width * .684;
    const storeY = bounds.height * .51;
    const controlX = startX + (storeX - startX) * .52;
    const curve = Math.max(-70, Math.min(70, (startY - storeY) * .24));
    const point = (value: number) => value.toFixed(1);
    this.mapPointerX.set(startX);
    this.mapPointerY.set(startY);
    this.mapRoutePath.set(`M ${point(startX)} ${point(startY)} C ${point(controlX)} ${point(startY - curve)}, ${point(controlX)} ${point(storeY + curve)}, ${point(storeX)} ${point(storeY)}`);
  }

  resetMapRoute(): void {
    this.mapRoutePath.set('');
  }

  submit(): void {
    if (this.form.invalid || this.sending()) return;
    this.sending.set(true);
    this.support.createTicket(this.form.getRawValue()).subscribe({ next: (ticket) => { this.createdTicket.set(ticket); this.tickets.update((items) => [ticket, ...items]); this.sending.set(false); this.toast.success('Support ticket created'); }, error: () => this.sending.set(false) });
  }

  selectTicket(ticket: SupportTicket): void { this.selectedTicket.set(ticket); this.replyForm.reset({ message: '' }); }
  sendReply(): void {
    const ticket = this.selectedTicket();
    if (!ticket || this.replyForm.invalid || this.replying()) return;
    this.replying.set(true);
    this.support.reply(ticket._id, this.replyForm.controls.message.value).subscribe({ next: (updated) => { this.replaceTicket(updated); this.selectedTicket.set(updated); this.replyForm.reset({ message: '' }); this.replying.set(false); this.toast.success('Reply sent'); }, error: () => this.replying.set(false) });
  }
  replaceTicket(updated: SupportTicket): void { this.tickets.update((items) => [updated, ...items.filter((item) => item._id !== updated._id)]); }
  phoneLink(): string { return this.settings().phone.replace(/[^+\d]/g, ''); }
  statusLabel(status: SupportTicket['status']): string { return ({ open: 'Waiting for support', in_progress: 'Waiting for support', waiting_admin: 'Waiting for support', waiting_customer: 'Waiting for you', resolved: 'Resolved' })[status]; }
}
