import { Injectable, signal } from '@angular/core';

export type MobileTab = 'home' | 'search' | 'calendar' | 'profile';

@Injectable({ providedIn: 'root' })
export class MobileNavService {
  readonly activeTab = signal<MobileTab>('home');

  goHome() {
    this.activeTab.set('home');
  }
}
