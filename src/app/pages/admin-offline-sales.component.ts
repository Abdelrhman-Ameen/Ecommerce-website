import { CurrencyPipe, DatePipe } from '@angular/common';
import { Component, OnInit, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { AdminService, OfflineSalePayload, OfflineSalesData } from '../core/admin.service';
import { OfflineSale, PaymentMethod, Product } from '../core/models';
import { ProductService } from '../core/product.service';
import { ToastService } from '../core/toast.service';
import { TranslatePipe } from '../shared/translate.pipe';

@Component({
  standalone: true,
  imports: [CurrencyPipe, DatePipe, ReactiveFormsModule, TranslatePipe],
  template: `
    <div class="admin-page-heading">
      <div><h1>{{ 'Store sales & debts' | translate }}</h1><p>{{ 'Record counter sales, track customer balances, and add dated payments.' | translate }}</p></div>
      <button class="btn btn-primary-luxe" type="button" (click)="openSaleForm()"><i class="bi bi-plus-lg me-2"></i>{{ 'Record store sale' | translate }}</button>
    </div>

    @if (loading()) { <div class="skeleton admin-dashboard-skeleton"></div> }
    @else if (data(); as ledger) {
      <div class="metric-grid debt-metric-grid">
        <article><div><small>{{ 'Store revenue' | translate }}</small><strong>{{ ledger.summary.revenue | currency }}</strong><span>{{ ledger.summary.salesCount }} {{ 'sales' | translate }}</span></div><i class="bi bi-shop-window"></i></article>
        <article><div><small>{{ 'Collected' | translate }}</small><strong>{{ ledger.summary.collected | currency }}</strong><span>{{ 'Paid across all methods' | translate }}</span></div><i class="bi bi-cash-stack"></i></article>
        <article class="debt-metric"><div><small>{{ 'Outstanding debt' | translate }}</small><strong>{{ ledger.summary.outstandingDebt | currency }}</strong><span>{{ ledger.debtors.length }} {{ 'customers with debt' | translate }}</span></div><i class="bi bi-hourglass-split"></i></article>
        <article><div><small>{{ 'Collection rate' | translate }}</small><strong>{{ collectionRate(ledger) }}%</strong><span>{{ 'Of recorded store revenue' | translate }}</span></div><i class="bi bi-pie-chart"></i></article>
      </div>

      <div class="row g-4 mt-1">
        <div class="col-xl-5"><section class="admin-card h-100 debt-chart-card"><div class="admin-card-head"><div><h2>{{ 'Highest customer debts' | translate }}</h2><p>{{ 'Balances are grouped by customer name and phone.' | translate }}</p></div></div>
          @if (ledger.debtors.length) { <div class="debt-bars">@for (debtor of ledger.debtors.slice(0, 6); track debtor._id) { <article><div><strong>{{ debtor.customerName }}</strong><small>{{ debtor.phone || ('No phone' | translate) }}</small></div><div class="debt-bar-track"><span [style.width.%]="debtBarWidth(debtor.balanceDue, ledger)"></span></div><b>{{ debtor.balanceDue | currency }}</b></article> }</div> }
          @else { <div class="empty-state compact"><i class="bi bi-check-circle"></i><p>{{ 'No outstanding customer debt.' | translate }}</p></div> }
        </section></div>
        <div class="col-xl-7"><section class="admin-card h-100"><div class="admin-card-head"><div><h2>{{ 'Customer debt accounts' | translate }}</h2><p>{{ 'Open a sale below to record a payment.' | translate }}</p></div></div><div class="table-responsive"><table class="table align-middle"><thead><tr><th>{{ 'Customer' | translate }}</th><th>{{ 'Sales' | translate }}</th><th>{{ 'Paid' | translate }}</th><th>{{ 'Debt' | translate }}</th><th>{{ 'Last date' | translate }}</th></tr></thead><tbody>@for (debtor of ledger.debtors; track debtor._id) { <tr><td><strong>{{ debtor.customerName }}</strong><small class="d-block text-secondary">{{ debtor.phone || ('No phone' | translate) }}</small></td><td>{{ debtor.totalSales | currency }}</td><td>{{ debtor.totalPaid | currency }}</td><td><strong class="text-danger">{{ debtor.balanceDue | currency }}</strong></td><td>{{ debtor.lastActivityAt | date:'mediumDate' }}</td></tr> } @empty { <tr><td colspan="5"><div class="empty-state compact">{{ 'No debts to display.' | translate }}</div></td></tr> }</tbody></table></div></section></div>
      </div>

      <section class="admin-card mt-4"><div class="admin-card-head"><div><h2>{{ 'Store sales ledger' | translate }}</h2><p>{{ 'Every sale and payment keeps its original date and method.' | translate }}</p></div></div><div class="table-responsive"><table class="table align-middle"><thead><tr><th>{{ 'Customer' | translate }}</th><th>{{ 'Product' | translate }}</th><th>{{ 'Sale date' | translate }}</th><th>{{ 'Total' | translate }}</th><th>{{ 'Paid' | translate }}</th><th>{{ 'Debt' | translate }}</th><th>{{ 'Status' | translate }}</th><th>{{ 'Action' | translate }}</th></tr></thead><tbody>@for (sale of ledger.sales; track sale._id) { <tr><td><strong>{{ sale.customerName }}</strong><small class="d-block text-secondary">{{ sale.phone || ('No phone' | translate) }}</small></td><td><div class="offline-product-cell"><img [src]="sale.imageUrl" [alt]="sale.productName"><div><strong>{{ sale.productName }}</strong><small>{{ sale.quantity }} × {{ sale.unitPrice | currency }}</small></div></div></td><td>{{ sale.saleDate | date:'mediumDate' }}</td><td>{{ sale.totalAmount | currency }}</td><td>{{ sale.amountPaid | currency }}</td><td><strong [class.text-danger]="sale.balanceDue > 0">{{ sale.balanceDue | currency }}</strong></td><td><span class="payment-status status-{{ sale.paymentStatus }}">{{ paymentStatusLabel(sale) | translate }}</span></td><td><button class="btn btn-sm btn-outline-ink" type="button" (click)="openPayment(sale)">{{ (sale.balanceDue > 0 ? 'Manage debt' : 'View payments') | translate }}</button></td></tr> } @empty { <tr><td colspan="8"><div class="empty-state compact">{{ 'No store sales recorded yet.' | translate }}</div></td></tr> }</tbody></table></div></section>
    }

    @if (saleFormOpen()) { <div class="drawer-backdrop" (click)="closeSaleForm()"></div><aside class="admin-drawer"><div class="drawer-head"><div><div class="eyebrow">{{ 'Store counter' | translate }}</div><h2>{{ 'Record store sale' | translate }}</h2></div><button type="button" (click)="closeSaleForm()" [attr.aria-label]="'Close' | translate"><i class="bi bi-x-lg"></i></button></div>
      <form class="admin-form" [formGroup]="saleForm" (ngSubmit)="saveSale()">
        <div class="row g-3"><div class="col-md-7 form-group-luxe"><label for="offlineCustomer">{{ 'Customer name' | translate }} *</label><input id="offlineCustomer" class="form-control" formControlName="customerName" maxlength="100"></div><div class="col-md-5 form-group-luxe"><label for="offlinePhone">{{ 'Phone number' | translate }}</label><input id="offlinePhone" class="form-control" formControlName="phone" inputmode="tel" placeholder="+20..."></div>
        <div class="col-12 form-group-luxe"><label for="offlineProduct">{{ 'Product' | translate }} *</label><select id="offlineProduct" class="form-select" formControlName="productId" (change)="selectProduct($event)"><option value="">{{ 'Choose product' | translate }}</option>@for (product of products(); track product._id) { <option [value]="product._id" [disabled]="product.stock < 1 || product.isManuallyUnavailable">{{ product.name }} — {{ product.stock }} {{ 'in stock' | translate }}</option> }</select></div>
        <div class="col-4 form-group-luxe"><label for="offlineQuantity">{{ 'Quantity' | translate }} *</label><input id="offlineQuantity" class="form-control" type="number" formControlName="quantity" min="1" max="1000"></div><div class="col-4 form-group-luxe"><label for="offlinePrice">{{ 'Unit price' | translate }} *</label><input id="offlinePrice" class="form-control" type="number" formControlName="unitPrice" min="0" step="0.01"></div><div class="col-4 form-group-luxe"><label for="offlineDate">{{ 'Sale date' | translate }} *</label><input id="offlineDate" class="form-control" type="date" formControlName="saleDate"></div>
        <div class="col-md-6 form-group-luxe"><label for="offlinePaid">{{ 'Amount paid now' | translate }}</label><input id="offlinePaid" class="form-control" type="number" formControlName="amountPaid" min="0" step="0.01"><small>{{ 'Leave 0 to record the full amount as debt.' | translate }}</small></div><div class="col-md-6 form-group-luxe"><label for="offlineMethod">{{ 'Payment method' | translate }}</label><select id="offlineMethod" class="form-select" formControlName="paymentMethod">@for (method of paymentMethods; track method) { <option [value]="method">{{ methodLabel(method) | translate }}</option> }</select></div>
        <div class="col-12 form-group-luxe"><label for="offlineNote">{{ 'Note' | translate }}</label><textarea id="offlineNote" class="form-control" rows="3" formControlName="note" maxlength="500"></textarea></div></div>
        <div class="sale-total-preview"><span>{{ 'Sale total' | translate }}</span><strong>{{ saleTotal() | currency }}</strong><small>{{ 'Remaining debt' | translate }}: {{ projectedDebt() | currency }}</small></div>
        <button class="btn btn-primary-luxe w-100 mt-4" type="submit" [disabled]="saleForm.invalid || saving()">{{ (saving() ? 'Saving...' : 'Record sale') | translate }}</button>
      </form></aside> }

    @if (selectedSale(); as sale) { <div class="drawer-backdrop" (click)="closePayment()"></div><aside class="admin-drawer"><div class="drawer-head"><div><div class="eyebrow">{{ 'Customer debt' | translate }}</div><h2>{{ sale.customerName }}</h2></div><button type="button" (click)="closePayment()" [attr.aria-label]="'Close' | translate"><i class="bi bi-x-lg"></i></button></div>
      <div class="debt-summary-card"><div><small>{{ 'Sale total' | translate }}</small><strong>{{ sale.totalAmount | currency }}</strong></div><div><small>{{ 'Paid' | translate }}</small><strong>{{ sale.amountPaid | currency }}</strong></div><div><small>{{ 'Debt' | translate }}</small><strong>{{ sale.balanceDue | currency }}</strong></div></div>
      <section class="customer-detail-card"><div class="detail-card-heading"><i class="bi bi-clock-history"></i><div><small>{{ 'Payment history' | translate }}</small><h3>{{ sale.productName }}</h3></div></div><div class="payment-history">@for (payment of sale.payments; track payment._id) { <article><div><strong>{{ payment.amount | currency }}</strong><small>{{ methodLabel(payment.method) | translate }}</small></div><time>{{ payment.paidAt | date:'mediumDate' }}</time></article> } @empty { <div class="empty-state compact">{{ 'No payments recorded.' | translate }}</div> }</div></section>
      @if (sale.balanceDue > 0) { <form class="admin-form mt-4" [formGroup]="paymentForm" (ngSubmit)="savePayment()"><h3>{{ 'Add payment' | translate }}</h3><div class="row g-3"><div class="col-md-6 form-group-luxe"><label for="debtAmount">{{ 'Payment amount' | translate }} *</label><input id="debtAmount" class="form-control" type="number" formControlName="amount" min="0.01" [max]="sale.balanceDue" step="0.01"></div><div class="col-md-6 form-group-luxe"><label for="debtDate">{{ 'Payment date' | translate }} *</label><input id="debtDate" class="form-control" type="date" formControlName="paidAt"></div><div class="col-12 form-group-luxe"><label for="debtMethod">{{ 'Payment method' | translate }} *</label><select id="debtMethod" class="form-select" formControlName="method">@for (method of paymentMethods; track method) { <option [value]="method">{{ methodLabel(method) | translate }}</option> }</select></div><div class="col-12 form-group-luxe"><label for="debtNote">{{ 'Note' | translate }}</label><input id="debtNote" class="form-control" formControlName="note" maxlength="240"></div></div><button class="btn btn-primary-luxe w-100 mt-4" type="submit" [disabled]="paymentForm.invalid || savingPayment()">{{ (savingPayment() ? 'Saving...' : 'Record payment') | translate }}</button></form> }
    </aside> }
  `,
})
export class AdminOfflineSalesComponent implements OnInit {
  readonly data = signal<OfflineSalesData | null>(null);
  readonly products = signal<Product[]>([]);
  readonly loading = signal(true);
  readonly saleFormOpen = signal(false);
  readonly selectedSale = signal<OfflineSale | null>(null);
  readonly saving = signal(false);
  readonly savingPayment = signal(false);
  readonly paymentMethods: PaymentMethod[] = ['cash', 'card', 'bank_transfer', 'mobile_wallet', 'other'];
  private readonly today = new Date().toISOString().slice(0, 10);
  private readonly fb = inject(FormBuilder);

  readonly saleForm = this.fb.nonNullable.group({
    customerName: ['', [Validators.required, Validators.minLength(2), Validators.maxLength(100)]],
    phone: ['', [Validators.pattern(/^\+?[0-9]{10,15}$/)]],
    productId: ['', Validators.required],
    quantity: [1, [Validators.required, Validators.min(1), Validators.max(1000)]],
    unitPrice: [0, [Validators.required, Validators.min(0)]],
    amountPaid: [0, [Validators.required, Validators.min(0)]],
    paymentMethod: ['cash' as PaymentMethod, Validators.required],
    saleDate: [this.today, Validators.required],
    note: ['', Validators.maxLength(500)],
  });
  readonly paymentForm = this.fb.nonNullable.group({
    amount: [0, [Validators.required, Validators.min(0.01)]],
    method: ['cash' as PaymentMethod, Validators.required],
    paidAt: [this.today, Validators.required],
    note: ['', Validators.maxLength(240)],
  });
  constructor(private admin: AdminService, private productService: ProductService, private toast: ToastService) {}
  ngOnInit(): void {
    this.load();
    this.productService.list({ limit: 48, sort: 'name' }).subscribe((response) => this.products.set(response.data.products));
  }
  load(): void { this.admin.offlineSales().subscribe({ next: (data) => { this.data.set(data); this.loading.set(false); }, error: () => this.loading.set(false) }); }
  openSaleForm(): void { this.saleForm.reset({ customerName: '', phone: '', productId: '', quantity: 1, unitPrice: 0, amountPaid: 0, paymentMethod: 'cash', saleDate: this.today, note: '' }); this.saleFormOpen.set(true); }
  closeSaleForm(): void { if (!this.saving()) this.saleFormOpen.set(false); }
  selectProduct(event: Event): void { const product = this.products().find((item) => item._id === (event.target as HTMLSelectElement).value); if (product) this.saleForm.controls.unitPrice.setValue(product.price); }
  saveSale(): void {
    if (this.saleForm.invalid || this.saving()) { this.saleForm.markAllAsTouched(); return; }
    if (this.saleForm.controls.amountPaid.value > this.saleTotal()) { this.toast.error('Amount paid cannot exceed the sale total'); return; }
    this.saving.set(true);
    this.admin.createOfflineSale(this.saleForm.getRawValue() as OfflineSalePayload).subscribe({ next: () => { this.toast.success('Store sale recorded'); this.saleFormOpen.set(false); this.saving.set(false); this.load(); this.reloadProducts(); }, error: () => this.saving.set(false) });
  }
  openPayment(sale: OfflineSale): void { this.selectedSale.set(sale); this.paymentForm.reset({ amount: Math.min(sale.balanceDue, sale.balanceDue || 0), method: 'cash', paidAt: this.today, note: '' }); }
  closePayment(): void { if (!this.savingPayment()) this.selectedSale.set(null); }
  savePayment(): void {
    const sale = this.selectedSale();
    if (!sale || this.paymentForm.invalid || this.savingPayment()) return;
    if (this.paymentForm.controls.amount.value > sale.balanceDue) { this.toast.error('Payment cannot exceed the remaining debt'); return; }
    this.savingPayment.set(true);
    this.admin.addOfflinePayment(sale._id, this.paymentForm.getRawValue()).subscribe({ next: (updated) => { this.toast.success('Payment recorded'); this.selectedSale.set(updated); this.savingPayment.set(false); this.load(); }, error: () => this.savingPayment.set(false) });
  }
  reloadProducts(): void { this.productService.list({ limit: 48, sort: 'name' }).subscribe((response) => this.products.set(response.data.products)); }
  collectionRate(data: OfflineSalesData): number { return data.summary.revenue ? Math.round((data.summary.collected / data.summary.revenue) * 100) : 0; }
  saleTotal(): number { return Math.max(0, Number(this.saleForm.controls.quantity.value) * Number(this.saleForm.controls.unitPrice.value)); }
  projectedDebt(): number { return Math.max(0, this.saleTotal() - Number(this.saleForm.controls.amountPaid.value)); }
  debtBarWidth(value: number, data: OfflineSalesData): number { return Math.max(4, (value / Math.max(...data.debtors.map((item) => item.balanceDue), 1)) * 100); }
  paymentStatusLabel(sale: OfflineSale): string { return ({ paid: 'Paid', partial: 'Partially paid', debt: 'Debt' })[sale.paymentStatus]; }
  methodLabel(method: PaymentMethod): string { return ({ cash: 'Cash', card: 'Card', bank_transfer: 'Bank transfer', mobile_wallet: 'Mobile wallet', other: 'Other' })[method]; }
}
