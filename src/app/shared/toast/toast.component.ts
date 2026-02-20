import { Component, ChangeDetectionStrategy, inject } from '@angular/core';
import { ToastService } from '../../core/services/toast.service';
import { fadeSlideIn } from '../animations/todo.animations';

@Component({
  selector: 'app-toast',
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './toast.component.html',
  animations: [fadeSlideIn]
})
export class ToastComponent {
  protected toastService = inject(ToastService);

  typeClasses(type: string): string {
    const map: Record<string, string> = {
      success: 'bg-green-50 dark:bg-green-900/30 border-green-200 dark:border-green-800 text-green-800 dark:text-green-200',
      error: 'bg-red-50 dark:bg-red-900/30 border-red-200 dark:border-red-800 text-red-800 dark:text-red-200',
      info: 'bg-primary-50 dark:bg-primary-900/30 border-primary-200 dark:border-primary-800 text-primary-800 dark:text-primary-200',
    };

    return map[type] ?? map['info'];
  }
}
