import { ChangeDetectionStrategy, Component, inject, output } from '@angular/core';
import { LucideAngularModule } from 'lucide-angular';
import { MobileNavService, MobileTab } from '../../../../core/services/mobile-nav.service';

@Component({
  selector: 'app-bottom-nav',
  imports: [LucideAngularModule],
  templateUrl: './bottom-nav.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class BottomNavComponent {
  protected mobileNav = inject(MobileNavService);

  readonly fabClick = output<void>();
  readonly tabChange = output<MobileTab>();

  setTab(tab: MobileTab): void {
    this.mobileNav.activeTab.set(tab);
    this.tabChange.emit(tab);
  }
}
