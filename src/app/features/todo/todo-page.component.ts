import { Component, inject, ChangeDetectionStrategy, signal } from '@angular/core';
import { TodoService } from '../../core/services/todo.service';
import { TodoFormComponent } from './components/todo-form/todo-form.component';
import { TodoListComponent } from './components/todo-list/todo-list.component';
import { Priority } from '../../core/models/todo.model';
import { TranslatePipe } from '../../shared/pipes/translate.pipe';
import { TodoFiltersComponent } from './components/todo-filters/todo-filters.component';
import { ToastService } from '../../core/services/toast.service';
import { I18nService } from '../../core/services/i18n.service';
import { SidebarComponent } from '../../shared/sidebar/sidebar.component';
import { RightPanelComponent } from '../../shared/right-panel/right-panel.component';
import { BottomNavComponent } from './components/bottom-nav/bottom-nav.component';
import { sheetSlideUp } from '../../shared/animations/todo.animations';
import { LucideAngularModule } from 'lucide-angular';
import { AuthService } from '../../core/services/auth.service';
import { ThemeService } from '../../core/services/theme.service';

type MobileTab = 'home' | 'search' | 'calendar' | 'profile';

@Component({
  selector: 'app-todo-page',
  imports: [
    TodoFormComponent,
    TodoListComponent,
    TranslatePipe,
    TodoFiltersComponent,
    SidebarComponent,
    RightPanelComponent,
    BottomNavComponent,
    LucideAngularModule,
  ],
  templateUrl: './todo-page.component.html',
  styleUrl: './todo-page.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
  animations: [sheetSlideUp]
})
export class TodoPageComponent {
  protected todoService = inject(TodoService);
  protected authService = inject(AuthService);
  protected toastService = inject(ToastService);
  protected i18nService = inject(I18nService);
  protected themeService = inject(ThemeService);

  readonly showSheet = signal(false);
  readonly activeMobileTab = signal<MobileTab>('home');

  onTabChange(tab: MobileTab): void {
    this.activeMobileTab.set(tab);
  }

  openSheet(): void {
    this.showSheet.set(true);
  }

  closeSheet(): void {
    this.showSheet.set(false);
  }

  onTodoCreated(data: {
    title: string;
    description?: string;
    priority: Priority;
    dueDate?: string;
  }): void {
    this.todoService.add(data);
    this.toastService.show(this.i18nService.translate('todo.created'), 'success');
    this.closeSheet();
  }

  onTodoEdited(data: {
    id: string;
    title: string;
    description?: string;
    priority: Priority;
    dueDate?: string;
  }): void {
    const { id, ...updateData } = data;
    this.todoService.update(id, updateData);
    this.toastService.show(this.i18nService.translate('todo.updated'), 'success');
  }

  onTodoDeleted(id: string): void {
    this.todoService.delete(id);
    this.toastService.show(this.i18nService.translate('todo.deleted'), 'success');
  }

  onTodoToggled(id: string): void {
    this.todoService.toggleComplete(id);
  }

  switchLanguage(): void {
    const next = this.i18nService.currentLang() === 'en' ? 'pt' : 'en';
    this.i18nService.switchLanguage(next);
  }
}
