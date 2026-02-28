import { ChangeDetectionStrategy, Component, computed, inject } from '@angular/core';
import { TodoService } from '../../core/services/todo.service';
import { ProjectService } from '../../core/services/project.service';
import { ThemeService } from '../../core/services/theme.service';
import { I18nService } from '../../core/services/i18n.service';
import { AuthService } from '../../core/services/auth.service';
import { LucideAngularModule } from 'lucide-angular';
import { TranslatePipe } from '../pipes/translate.pipe';

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
