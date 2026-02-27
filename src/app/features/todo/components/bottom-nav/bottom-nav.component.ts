import { ChangeDetectionStrategy, Component, output, signal } from '@angular/core';
import { LucideAngularModule } from 'lucide-angular';

type NavTab = 'home' | 'search' | 'calendar' | 'profile';

@Component({
  selector: 'app-bottom-nav',
  imports: [LucideAngularModule],
  templateUrl: './bottom-nav.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class BottomNavComponent {

  readonly activeTab = signal<NavTab>('home');
  readonly fabClick = output<void>();
  readonly tabChange = output<NavTab>();

  setTab(tab: NavTab): void {
    this.activeTab.set(tab);
    this.tabChange.emit(tab);
  }
}
