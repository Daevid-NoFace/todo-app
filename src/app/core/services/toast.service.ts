import { Injectable, signal } from '@angular/core';
import { Toast } from '../models/toast.model';

@Injectable({ providedIn: 'root' })
export class ToastService {
  private _toasts = signal<Toast[]>([]);
  toasts = this._toasts.asReadonly();

  show(message: string, type: Toast['type'] = 'info', action?: Toast['action']): void {
    const toast: Toast = {
      id: crypto.randomUUID(),
      message,
      type,
      action,
    };

    toast.timeoutId = setTimeout(() => this.dismiss(toast.id), 5000);
    this._toasts.update((t) => [...t, toast]);
  }

  dismiss(id: string): void {
    const toast = this._toasts().find((t) => t.id === id);

    if (toast?.timeoutId !== undefined) {
      clearTimeout(toast.timeoutId);
    }

    this._toasts.update((t) => t.filter((toast) => toast.id !== id));
  }
}
