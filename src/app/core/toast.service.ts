import { Injectable, signal } from '@angular/core';

export interface ToastMessage {
  id: number;
  type: 'success' | 'danger' | 'info';
  text: string;
}

@Injectable({ providedIn: 'root' })
export class ToastService {
  readonly messages = signal<ToastMessage[]>([]);
  private nextId = 1;

  show(text: string, type: ToastMessage['type'] = 'success'): void {
    const id = this.nextId++;
    this.messages.update((items) => [...items, { id, type, text }]);
    window.setTimeout(() => this.dismiss(id), 4200);
  }

  success(text: string): void { this.show(text, 'success'); }
  error(text: string): void { this.show(text, 'danger'); }
  info(text: string): void { this.show(text, 'info'); }
  dismiss(id: number): void { this.messages.update((items) => items.filter((item) => item.id !== id)); }
}
