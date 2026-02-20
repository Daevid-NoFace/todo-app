import {inject, Injectable, signal } from '@angular/core';
import { StorageService } from './storage.service';

export type Language = 'en' | 'pt';

export interface Translations {
  [key: string]: string | Translations;
}

@Injectable({ providedIn: 'root' })
export class I18nService {
  private storage = inject(StorageService);

  currentLang = signal<Language>(this.loadLang());

  private translations = signal<Translations>({});

  constructor() {
    this.loadTranslations(this.currentLang());
  }

  private loadLang(): Language {
    const lang = this.storage.get<Language>('lang');

    if (lang && (lang === 'en' || lang === 'pt')) {
      return lang;
    }

    const browserLang = navigator.language.substring(0, 2);

    return browserLang === 'pt' ? 'pt' : 'en';
  }

  private loadTranslations(lang: Language): void {
    fetch(`i18n/${lang}.json`)
      .then(res => res.json())
      .then(data => this.translations.set(data));
  }

  switchLanguage(lang: Language): void {
    this.currentLang.set(lang);
    this.storage.set('lang', lang);
    document.documentElement.lang = lang;
    this.loadTranslations(lang);
  }

  translate(key: string, params?: Record<string, string | number>): string {
    const keys = key.split('.');
    let value: string | Translations = this.translations();

    for (const k of keys) {
      if (typeof value === 'object' && value !== null && k in value) {
        value = value[k] as string | Translations;
      } else {
        return key; // Return the key if translation is not found
      }
    }

    if (typeof value !== 'string') {
      return key; // Return the key if the final value is not a string
    }

    if (params) {
      return Object.entries(params).reduce(
        (str, [paramKey, paramValue]) => str.replace(`{{${paramKey}}}`, String(paramValue)),
        value,
      );
    }

    return value;
  }
}
