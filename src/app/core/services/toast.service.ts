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

        this._toasts.update(t => [...t, toast]);
        setTimeout(() => this.dismiss(toast.id), 5000);
    }

    dismiss(id: string): void {
        this._toasts.update(t => t.filter(toast => toast.id !== id));
    }
}