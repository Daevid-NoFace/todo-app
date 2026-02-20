import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { ThemeService } from '../../../core/services/theme.service';
import { I18nService } from '../../../core/services/i18n.service';
import { TranslatePipe } from '../../pipes/translate.pipe';

@Component({
  selector: 'app-header',
  imports: [TranslatePipe],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <header
      class="sticky top-0 z-10 bg-surface-50/80 dark:bg-surface-900/80 backdrop-blur-sm border-b
            border-surface-200 dark:border-surface-800"
    >
      <div class="max-w-2xl mx-auto px-4 sm:px-6 py-3 sm:py-4 flex items-center justify-between">
        <h1 class="text-xl sm:text-2xl font-bold">{{ 'app.title' | translate }}</h1>
        <div class="flex items-center gap-2 sm:gap-3">
          <button
            (click)="switchLanguage()"
            class="px-2 py-1 rounded-lg text-sm font-medium hover:bg-surface-200 dark:hover:bg-surface-700
                  transition-colors duration-200"
            aria-label="Switch language"
          >
            {{ i18n.currentLang() === 'en' ? 'PT' : 'EN' }}
          </button>

          <button
            (click)="theme.toggle()"
            class="p-2 rounded-lg hover:bg-surface-200 dark:hover:bg-surface-700 transition-colors duration-200"
            [attr.aria-label]="
              theme.darkMode() ? ('theme.light' | translate) : ('theme.dark' | translate)
            "
          >
            @if (theme.darkMode()) {
              <svg
                xmlns="http://www.w3.org/2000/svg"
                class="w-5 h-5"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                stroke-width="2"
                stroke-linecap="round"
                stroke-linejoin="round"
              >
                <circle cx="12" cy="12" r="5" />
                <line x1="12" y1="1" x2="12" y2="3" />
                <line x1="12" y1="21" x2="12" y2="23" />
                <line x1="4.22" y1="4.22" x2="5.64" y2="5.64" />
                <line x1="18.36" y1="18.36" x2="19.78" y2="19.78" />
                <line x1="1" y1="12" x2="3" y2="12" />
                <line x1="21" y1="12" x2="23" y2="12" />
                <line x1="4.22" y1="19.78" x2="5.64" y2="18.36" />
                <line x1="18.36" y1="5.64" x2="19.78" y2="4.22" />
              </svg>
            } @else {
              <svg
                xmlns="http://www.w3.org/2000/svg"
                class="w-5 h-5"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                stroke-width="2"
                stroke-linecap="round"
                stroke-linejoin="round"
              >
                <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
              </svg>
            }
          </button>
        </div>
      </div>
    </header>
  `,
})
export class HeaderComponent {
  protected theme = inject(ThemeService);
  protected i18n = inject(I18nService);

  switchLanguage(): void {
    const next = this.i18n.currentLang() === 'en' ? 'pt' : 'en';
    this.i18n.switchLanguage(next);
  }
}
