import { Component, inject, input, ChangeDetectionStrategy } from '@angular/core';
import { ThemeService } from '../../../core/services/theme.service';
import { LucideAngularModule } from 'lucide-angular';
import { TranslatePipe } from '../../pipes/translate.pipe';

export type ThemeToggleVariant = 'icon-only' | 'icon-label' | 'row';

@Component({
  selector: 'app-theme-toggle',
  templateUrl: './theme-toggle.component.html',
  imports: [LucideAngularModule, TranslatePipe],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ThemeToggleComponent {
  protected theme = inject(ThemeService);

  variant = input<ThemeToggleVariant>('icon-only');
}
