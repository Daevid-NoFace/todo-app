import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { ThemeService } from '../../../core/services/theme.service';
import { I18nService } from '../../../core/services/i18n.service';
import { TranslatePipe } from '../../pipes/translate.pipe';
import { AuthService } from '../../../core/services/auth.service';

@Component({
  selector: 'app-header',
  imports: [TranslatePipe],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './header.component.html',
})
export class HeaderComponent {
  protected theme = inject(ThemeService);
  protected i18n = inject(I18nService);
  protected auth = inject(AuthService);

  switchLanguage(): void {
    const next = this.i18n.currentLang() === 'en' ? 'pt' : 'en';
    this.i18n.switchLanguage(next);
  }
}
