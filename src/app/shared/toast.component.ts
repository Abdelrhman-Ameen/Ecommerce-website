import { Component } from '@angular/core';
import { ToastService } from '../core/toast.service';

@Component({
  selector: 'app-toast-stack',
  standalone: true,
  template: `
    <div class="toast-stack" aria-live="polite" aria-atomic="true">
      @for (message of toast.messages(); track message.id) {
        <div class="alert alert-{{ message.type }} shadow-sm d-flex align-items-center gap-2 mb-2" role="status">
          <i class="bi" [class.bi-check-circle-fill]="message.type === 'success'" [class.bi-exclamation-circle-fill]="message.type === 'danger'" [class.bi-info-circle-fill]="message.type === 'info'"></i>
          <span class="flex-grow-1">{{ message.text }}</span>
          <button class="btn-close" type="button" aria-label="Dismiss" (click)="toast.dismiss(message.id)"></button>
        </div>
      }
    </div>
  `,
})
export class ToastComponent {
  constructor(public toast: ToastService) {}
}
