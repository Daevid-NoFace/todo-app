import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { I18nService } from '../../../core/services/i18n.service';
import { TranslatePipe } from '../../pipes/translate.pipe';
import { AuthService } from '../../../core/services/auth.service';
import { LucideAngularModule } from 'lucide-angular';
import { MobileNavService } from '../../../core/services/mobile-nav.service';
import { ThemeToggleComponent } from '../theme-toggle/theme-toggle.component';

@Component({
  selector: 'app-header',
  imports: [TranslatePipe, LucideAngularModule, ThemeToggleComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './header.component.html',
})
export class HeaderComponent {
  protected i18n = inject(I18nService);
  protected auth = inject(AuthService);
  protected mobileNav = inject(MobileNavService);

  switchLanguage(): void {
    const next = this.i18n.currentLang() === 'en' ? 'pt' : 'en';
    this.i18n.switchLanguage(next);
  }

  goHome(): void {
    this.mobileNav.goHome();
  }
}
