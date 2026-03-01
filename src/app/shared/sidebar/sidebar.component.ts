import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import { TodoService } from '../../core/services/todo.service';
import { ProjectService } from '../../core/services/project.service';
import { ThemeService } from '../../core/services/theme.service';
import { I18nService } from '../../core/services/i18n.service';
import { AuthService } from '../../core/services/auth.service';
import { LucideAngularModule } from 'lucide-angular';
import { TranslatePipe } from '../pipes/translate.pipe';
import { Project } from '../../core/models/project.model';
import { PROJECT_COLORS, PROJECT_DEFAULT_COLOR, PROJECT_DEFAULT_ICON, PROJECT_ICONS } from '../../core/constants/project.constants';

@Component({
  selector: 'app-sidebar',
  imports: [LucideAngularModule, TranslatePipe],
  templateUrl: './sidebar.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SidebarComponent {
  protected authService = inject(AuthService);
  protected todoService = inject(TodoService);
  protected projectService = inject(ProjectService);
  protected themeService = inject(ThemeService);
  protected i18nService = inject(I18nService);

  // --- Navigation counts ---
  protected todayCount = computed(() => {
    const today = new Date().toISOString().split('T')[0];
    return this.todoService.todos().filter((t) => t.dueDate === today && !t.completed).length;
  });

  protected upcomingCount = computed(() => {
    const today = new Date().toISOString().split('T')[0];
    return this.todoService.todos().filter((t) => t.dueDate && t.dueDate > today && !t.completed)
      .length;
  });

  protected projectTaskCounts = computed(() => {
    const counts = new Map<string, number>();

    for (const todo of this.todoService.todos()) {
      if (todo.projectId && !todo.completed) {
        const currentCount = counts.get(todo.projectId) ?? 0;
        counts.set(todo.projectId, currentCount + 1);
      }
    }
    return counts;
  });

  // --- Project form ---
  readonly showProjectForm = signal(false);
  readonly editingProject = signal<Project | null>(null);
  readonly projectFormName = signal('');
  readonly projectFormColor = signal(PROJECT_DEFAULT_COLOR);
  readonly projectFormIcon = signal(PROJECT_DEFAULT_ICON);

  readonly projectColors = PROJECT_COLORS;

  readonly projectIcons = PROJECT_ICONS;

  openNewProjectForm(): void {
    this.editingProject.set(null);
    this.projectFormName.set('');
    this.projectFormColor.set(PROJECT_DEFAULT_COLOR);
    this.projectFormIcon.set(PROJECT_DEFAULT_ICON);
    this.showProjectForm.set(!this.showProjectForm());
  }

  openEditProjectForm(project: Project, event: Event): void {
    event.stopPropagation();
    this.editingProject.set(project);
    this.projectFormName.set(project.name);
    this.projectFormColor.set(project.color);
    this.projectFormIcon.set(project.icon);
    this.showProjectForm.set(true);
  }

  saveProject(): void {
    const name = this.projectFormName().trim();
    if (!name) return;

    const editing = this.editingProject();
    if (editing) {
      this.projectService.update(editing.id, {
        name,
        color: this.projectFormColor(),
        icon: this.projectFormIcon(),
      });
    } else {
      this.projectService.addProject({
        name,
        color: this.projectFormColor(),
        icon: this.projectFormIcon(),
      });
    }
    this.showProjectForm.set(false);
  }

  cancelProjectForm(): void {
    this.showProjectForm.set(false);
  }

  deleteProject(id: string, event: Event): void {
    event.stopPropagation();
    this.projectService.delete(id);

    if (this.todoService.filter().projectId === id) {
      this.todoService.updateFilter({ view: 'all', projectId: undefined, dateFilter: undefined });
    }
    this.showProjectForm.set(false);
  }

  // --- Navigation ---
  selectView(view: 'all' | 'today' | 'upcoming'): void {
    this.todoService.updateFilter({ view, projectId: undefined, dateFilter: undefined });
  }

  selectProject(projectId: string): void {
    this.todoService.updateFilter({ view: 'project', projectId, dateFilter: undefined });
  }

  switchLanguage(): void {
    const nextLanguage = this.i18nService.currentLang() === 'en' ? 'pt' : 'en';
    this.i18nService.switchLanguage(nextLanguage);
  }
}
