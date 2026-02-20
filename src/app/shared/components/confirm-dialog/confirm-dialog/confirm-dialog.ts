import { Component, ChangeDetectionStrategy, input, output, HostListener } from '@angular/core';
import { TranslatePipe } from '../../../../shared/pipes/translate.pipe';

@Component({
  selector: 'app-confirm-dialog',
  imports: [TranslatePipe],
  templateUrl: './confirm-dialog.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ConfirmDialog {
  message = input.required<string>();
  confirmed = output<void>();
  cancelled = output<void>();

  onConfirm(): void {
    this.confirmed.emit();
  }

  onCancel(): void {
    this.cancelled.emit();
  }

  @HostListener('document:keydown.escape')
  onEscape(): void {
    this.cancelled.emit();
  }
}
