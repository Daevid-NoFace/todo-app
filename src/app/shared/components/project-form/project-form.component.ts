import {
  Component,
  effect,
  input,
  output,
  signal,
  inject,
  ChangeDetectionStrategy,
} from '@angular/core';
import { Project } from '../../../core/models/project.model';
import {
  PROJECT_COLORS,
  PROJECT_DEFAULT_COLOR,
  PROJECT_DEFAULT_ICON,
  PROJECT_ICONS,
} from '../../../core/constants/project.constants';
import { LucideAngularModule } from 'lucide-angular';
import { TranslatePipe } from '../../pipes/translate.pipe';
import { ThemeService } from '../../../core/services/theme.service';

@Component({
  selector: 'app-project-form',
  imports: [LucideAngularModule, TranslatePipe],
  templateUrl: './project-form.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ProjectFormComponent {
  protected theme = inject(ThemeService);

  editingProject = input<Project | null>(null);
  variant = input<'sidebar' | 'sheet'>('sheet');

  saved = output<{ name: string; color: string; icon: string }>();
  cancelled = output<void>();
  deleted = output<string>();

  readonly name = signal('');
  readonly color = signal(PROJECT_DEFAULT_COLOR);
  readonly icon = signal(PROJECT_DEFAULT_ICON);

  readonly projectColors = PROJECT_COLORS;
  readonly projectIcons = PROJECT_ICONS;

  constructor() {
    effect(() => {
      const project = this.editingProject();
      if (project) {
        this.name.set(project.name);
        this.color.set(project.color);
        this.icon.set(project.icon);
      } else {
        this.name.set('');
        this.color.set(PROJECT_DEFAULT_COLOR);
        this.icon.set(PROJECT_DEFAULT_ICON);
      }
    });
  }

  onSave(): void {
    const trimmed = this.name().trim();
    if (!trimmed) {
      return;
    }
    this.saved.emit({
      name: trimmed,
      color: this.color(),
      icon: this.icon(),
    });
  }

  onCancel(): void {
    this.cancelled.emit();
  }

  onDelete(): void {
    this.deleted.emit(this.editingProject()!.id);
  }
}
