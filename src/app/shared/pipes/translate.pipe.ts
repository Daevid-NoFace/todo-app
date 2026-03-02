import {inject, Pipe, PipeTransform} from '@angular/core';
import {I18nService} from '../../core/services/i18n.service';

/**
 * Translation pipe with `pure: false` (impure).
 *
 * Why impure: a pure pipe only re-evaluates when its input argument (the key) changes.
 * Here we also need to re-evaluate when the active language changes, which is internal
 * service state — not an Angular input to the pipe.
 * With `pure: false`, Angular re-runs the pipe on every change detection cycle,
 * ensuring translated text updates immediately when the language is switched.
 *
 * Trade-off: more frequent re-evaluations, but negligible cost since translate()
 * is just a key lookup on a JSON object already loaded in memory.
 */
@Pipe({ name: 'translate', pure: false })
export class TranslatePipe implements PipeTransform {
  private i18n = inject(I18nService);

  transform(key: string, params?: Record<string, string | number>): string {
    return this.i18n.translate(key, params);
  }
}
