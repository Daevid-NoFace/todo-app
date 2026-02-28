import {
  Component,
  inject,
  input,
  output,
  signal,
  effect,
  ChangeDetectionStrategy,
} from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { TranslatePipe } from '../../../../shared/pipes/translate.pipe';
import { Priority } from '../../../../core/models/todo.model';
import { ProjectService } from '../../../../core/services/project.service';

@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
  selector: 'app-todo-form',
  templateUrl: './todo-form.component.html',
  imports: [ReactiveFormsModule, TranslatePipe],
})
export class TodoFormComponent {
  private fb = inject(FormBuilder);
  protected projectService = inject(ProjectService);

  submitted = signal(false);

  editTodo = input<{
    title: string;
    description?: string;
    priority: Priority;
    dueDate?: string;
    projectId?: string;
  } | null>(null);

  preselectedProjectId = input<string | null>(null);

  todoCreated = output<{
    title: string;
    description?: string;
    priority: Priority;
    dueDate?: string;
    projectId?: string;
  }>();

  cancelled = output<void>();

  private today = new Date().toISOString().split('T')[0];

  form = this.fb.nonNullable.group({
    title: ['', [Validators.required, Validators.minLength(3)]],
    description: [''],
    priority: ['medium' as Priority],
    dueDate: [this.today, Validators.required],
    projectId: [''],
  });

  constructor() {
    effect(() => {
      const todo = this.editTodo();

      if (todo) {
        this.form.patchValue({
          title: todo.title,
          description: todo.description ?? '',
          priority: todo.priority,
          dueDate: todo.dueDate ?? '',
          projectId: todo.projectId ?? '',
        });
      }
    });

    effect(() => {
      const pre = this.preselectedProjectId();
      if (!this.editTodo()) {
        this.form.patchValue({ projectId: pre ?? '' });
      }
    });
  }

  onSubmit(): void {
    this.submitted.set(true);

    if (this.form.invalid) {
      return;
    }

    this.todoCreated.emit({
      title: this.form.value.title!,
      description: this.form.value.description || undefined,
      priority: this.form.value.priority!,
      dueDate: this.form.value.dueDate || undefined,
      projectId: this.form.value.projectId || undefined,
    });

    if (!this.editTodo()) {
      this.form.reset({
        title: '',
        description: '',
        priority: 'medium',
        dueDate: this.today,
        projectId: this.preselectedProjectId() ?? '',
      });
      this.submitted.set(false);
    }
  }
}
