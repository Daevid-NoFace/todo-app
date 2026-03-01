import { Component, inject, ChangeDetectionStrategy, signal, computed } from '@angular/core';
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
import { FormsModule } from '@angular/forms';
import { ProjectService } from '../../core/services/project.service';
import { Project } from '../../core/models/project.model';
import { MobileNavService, MobileTab } from '../../core/services/mobile-nav.service';
import {
  PROJECT_COLORS,
  PROJECT_ICONS,
  PROJECT_DEFAULT_COLOR,
  PROJECT_DEFAULT_ICON,
} from '../../core/constants/project.constants';

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
    FormsModule,
  ],
  templateUrl: './todo-page.component.html',
  styleUrl: './todo-page.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
  animations: [sheetSlideUp],
})
export class TodoPageComponent {
  protected todoService = inject(TodoService);
  protected authService = inject(AuthService);
  protected toastService = inject(ToastService);
  protected i18nService = inject(I18nService);
  protected themeService = inject(ThemeService);
  protected projectService = inject(ProjectService);
  protected mobileNav = inject(MobileNavService);

  readonly showSheet = signal(false);
  readonly showDateSheet = signal(false);

  // Project signals
  readonly showProjectSheet = signal(false);
  readonly editingMobileProject = signal<Project | null>(null);
  readonly mobileProjectName = signal('');
  readonly mobileProjectColor = signal(PROJECT_DEFAULT_COLOR);
  readonly mobileProjectIcon = signal(PROJECT_DEFAULT_ICON);

  readonly projectColors = PROJECT_COLORS;

  readonly projectIcons = PROJECT_ICONS;

  // --- Project mobile management ---
  openNewProjectSheet(): void {
    this.editingMobileProject.set(null);
    this.mobileProjectName.set('');
    this.mobileProjectColor.set(PROJECT_DEFAULT_COLOR);
    this.mobileProjectIcon.set(PROJECT_DEFAULT_ICON);
    this.showProjectSheet.set(true);
  }

  openEditProjectSheet(project: Project, event: Event): void {
    event.stopPropagation();
    this.editingMobileProject.set(project);
    this.mobileProjectName.set(project.name);
    this.mobileProjectColor.set(project.color);
    this.mobileProjectIcon.set(project.icon);
    this.showProjectSheet.set(true);
  }

  saveMobileProject(): void {
    const name = this.mobileProjectName().trim();
    if (!name) return;
    const editing = this.editingMobileProject();
    if (editing) {
      this.projectService.update(editing.id, {
        name,
        color: this.mobileProjectColor(),
        icon: this.mobileProjectIcon(),
      });
    } else {
      this.projectService.addProject({
        name,
        color: this.mobileProjectColor(),
        icon: this.mobileProjectIcon(),
      });
    }
    this.showProjectSheet.set(false);
  }

  deleteMobileProject(id: string): void {
    this.projectService.delete(id);
    if (this.todoService.filter().projectId === id) {
      this.todoService.updateFilter({ view: 'all', projectId: undefined });
    }
    this.showProjectSheet.set(false);
  }

  // --- Navigation ---
  readonly preselectedProjectId = computed(() => {
    const f = this.todoService.filter();
    return f.view === 'project' ? (f.projectId ?? null) : null;
  });

  onTabChange(tab: MobileTab): void {
    this.mobileNav.activeTab.set(tab);
    if (tab !== 'search') {
      this.todoService.updateFilter({ searchTerm: '' });
    }
  }

  openSheet(): void {
    this.showSheet.set(true);
  }

  closeSheet(): void {
    this.showSheet.set(false);
  }

  readonly selectedDateLabel = computed(() => {
    const date = this.todoService.filter().dateFilter;

    if (!date) return '';

    return new Date(date + 'T00:00:00').toLocaleDateString('en-US', {
      weekday: 'long',
      month: 'short',
      day: 'numeric',
    });
  });

  onDateSelected(date: string | null): void {
    this.showDateSheet.set(date !== null);
  }

  closeDateSheet(): void {
    this.showDateSheet.set(false);
    this.todoService.updateFilter({ view: 'all', dateFilter: undefined });
  }

  onTodoCreated(data: {
    title: string;
    description?: string;
    priority: Priority;
    dueDate?: string;
    projectId?: string;
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
    projectId?: string;
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

  // --- Profile State ---
  readonly editingName = signal(false);
  readonly nameInput = signal('');
  readonly passwordError = signal<string | null>(null);
  readonly passwordSuccess = signal(false);
  readonly currentPassword = signal('');
  readonly newPassword = signal('');
  readonly confirmPassword = signal('');

  // --- Profile Methods ---
  startEditName(): void {
    this.nameInput.set(this.authService.currentUser()?.name ?? '');
    this.editingName.set(true);
  }

  saveName(): void {
    const name = this.nameInput().trim();
    if (name.length < 2) return;
    this.authService.updateName(name);
    this.editingName.set(false);
  }

  cancelEditName(): void {
    this.editingName.set(false);
  }

  onAvatarChange(event: Event): void {
    const file = (event.target as HTMLInputElement).files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = () => {
      this.authService.updateAvatar(reader.result as string);
    };
    reader.readAsDataURL(file);
  }

  savePassword(): void {
    this.passwordError.set(null);
    this.passwordSuccess.set(false);

    if (this.newPassword() !== this.confirmPassword()) {
      this.passwordError.set(this.i18nService.translate('profile.error_passwords_mismatch'));
      return;
    }
    if (this.newPassword().length < 6) {
      this.passwordError.set(this.i18nService.translate('profile.error_password_too_short'));
      return;
    }

    const error = this.authService.updatePassword(this.currentPassword(), this.newPassword());

    if (error) {
      this.passwordError.set(this.i18nService.translate('profile.error_current_password_wrong'));
    } else {
      this.passwordSuccess.set(true);
      this.currentPassword.set('');
      this.newPassword.set('');
      this.confirmPassword.set('');
    }
  }
}
