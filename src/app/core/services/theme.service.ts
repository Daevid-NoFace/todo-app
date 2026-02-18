import { inject, Injectable, signal } from '@angular/core';
import { StorageService } from './storage.service';

@Injectable({ providedIn: 'root' })
export class ThemeService {
  private storage = inject(StorageService);

  darkMode = signal<boolean>(this.loadInitialTheme());

  constructor() {
    this.applyToDocument();
  }

  toggle() {
    this.darkMode.update(v => !v);
    this.storage.set('theme', this.darkMode() ? 'dark' : 'light');
    this.applyToDocument();
  }

  private loadInitialTheme(): boolean {
    const saved = this.storage.get<string>('theme');

    if (saved) return saved === 'dark';

    // Default to dark mode if the user prefers it
    return window.matchMedia('(prefers-color-scheme: dark)').matches;
  }

  private applyToDocument() {
    document.documentElement.classList.toggle('dark', this.darkMode());
  }
}
