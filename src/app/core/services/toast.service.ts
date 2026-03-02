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

    // Store the timer ID on the toast object before pushing it to the signal array.
    // This allows dismiss() to cancel the auto-dismiss timer when the user manually
    // closes a toast, preventing a stale timer from calling dismiss() on an ID
    // that no longer exists in the array.
    toast.timeoutId = setTimeout(() => this.dismiss(toast.id), 5000);
    this._toasts.update((t) => [...t, toast]);
  }

  dismiss(id: string): void {
    const toast = this._toasts().find((t) => t.id === id);

    // Cancel the pending auto-dismiss timer before removing from the array.
    // Without this, a manually dismissed toast would still trigger dismiss()
    // again after 5s — a no-op, but a memory leak and unintended behaviour.
    if (toast?.timeoutId !== undefined) {
      clearTimeout(toast.timeoutId);
    }

    this._toasts.update((t) => t.filter((toast) => toast.id !== id));
  }
}
