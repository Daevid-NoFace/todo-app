import {
  Component,
  input,
  output,
  signal,
  ChangeDetectionStrategy,
  inject,
  computed,
  DestroyRef,
} from '@angular/core';
import { TranslatePipe } from '../../../../shared/pipes/translate.pipe';
import { Todo, Priority } from '../../../../core/models/todo.model';
import { TodoFormComponent } from '../todo-form/todo-form.component';
import { ConfirmDialog } from '../../../../shared/components/confirm-dialog/confirm-dialog/confirm-dialog';
import { TodoService } from '../../../../core/services/todo.service';
import { ProjectService } from '../../../../core/services/project.service';
import { LucideAngularModule } from 'lucide-angular';
import { checkBounce, expandCollapse } from '../../../../shared/animations/todo.animations';

@Component({
  selector: 'app-todo-item',
  templateUrl: './todo-item.component.html',
  imports: [TodoFormComponent, TranslatePipe, ConfirmDialog, LucideAngularModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  animations: [expandCollapse, checkBounce],
})
export class TodoItemComponent {
  protected todoService = inject(TodoService);
  protected projectService = inject(ProjectService);
  private destroyRef = inject(DestroyRef);
  private readonly pendingTimers = new Set<ReturnType<typeof setTimeout>>();

  constructor() {
    this.destroyRef.onDestroy(() => {
      this.pendingTimers.forEach(clearTimeout);
      this.pendingTimers.clear();
    });
  }

  private safeTimeOut(fn: () => void, delay: number): void {
    const id = setTimeout(() => {
      this.pendingTimers.delete(id);
      fn();
    }, delay);
    this.pendingTimers.add(id);
  }

  todo = input.required<Todo>();

  toggled = output<string>();
  deleted = output<string>();
  edited = output<{
    id: string;
    title: string;
    description?: string;
    priority: Priority;
    dueDate?: string;
    projectId?: string;
  }>();

  isEditing = signal(false);
  showDeleteConfirm = signal(false);
  isExpanded = signal(false);
  showAddSubtask = signal(false);
  editingSubtaskId = signal<string | null>(null);

  project = computed(() =>
    this.todo().projectId
      ? this.projectService.projectMap().get(this.todo().projectId!)
      : undefined,
  );

  completedSubtasksCount = computed(() => this.todo().subtasks.filter((s) => s.completed).length);

  subtaskProgress = computed(() => {
    const subtasks = this.todo().subtasks;
    if (!subtasks.length) return 0;
    return Math.round((this.completedSubtasksCount() / subtasks.length) * 100);
  });

  borderColor = computed(() => {
    const project = this.project();
    if (project) return project.color;
    const priorityColors: Record<Priority, string> = {
      low: '#22C55E',
      medium: '#EAB308',
      high: '#EF4444',
    };
    return priorityColors[this.todo().priority];
  });

  onEdit(data: {
    title: string;
    description?: string;
    priority: Priority;
    dueDate?: string;
    projectId?: string;
  }): void {
    this.edited.emit({ id: this.todo().id, ...data });
    this.isEditing.set(false);
  }

  onSubtaskKeydown(event: KeyboardEvent, inputEl: HTMLInputElement): void {
    if (event.key === 'Enter' && inputEl.value.trim()) {
      this.todoService.addSubtask(this.todo().id, inputEl.value.trim());
      inputEl.value = '';
      this.showAddSubtask.set(false);
    }
    if (event.key === 'Escape') {
      this.showAddSubtask.set(false);
    }
  }

  onSubtaskConfirm(inputEl: HTMLInputElement): void {
    if (inputEl.value.trim()) {
      this.todoService.addSubtask(this.todo().id, inputEl.value.trim());
      inputEl.value = '';
    }
    this.showAddSubtask.set(false);
  }

  onSubtaskEditStart(subtaskId: string): void {
    this.showAddSubtask.set(false);
    this.editingSubtaskId.set(subtaskId);
  }

  onShowAddSubtask(): void {
    this.editingSubtaskId.set(null);
    this.isExpanded.set(true);
    this.showAddSubtask.set(true);
  }

  onAddSubtaskBlur(): void {
    this.safeTimeOut(() => this.showAddSubtask.set(false), 150);
  }

  onEditSubtaskBlur(subtaskId: string, inputEl: HTMLInputElement): void {
    this.safeTimeOut(() => {
      if (inputEl.value.trim()) {
        this.todoService.updateSubtask(this.todo().id, subtaskId, inputEl.value.trim());
      }
      this.editingSubtaskId.set(null);
    }, 150);
  }

  onSubtaskEditConfirm(subtaskId: string, inputEl: HTMLInputElement): void {
    if (inputEl.value.trim()) {
      this.todoService.updateSubtask(this.todo().id, subtaskId, inputEl.value.trim());
    }
    this.editingSubtaskId.set(null);
  }

  onSubtaskEditKeydown(event: KeyboardEvent, subtaskId: string, inputEl: HTMLInputElement): void {
    if (event.key === 'Enter' && inputEl.value.trim()) {
      this.todoService.updateSubtask(this.todo().id, subtaskId, inputEl.value.trim());
      this.editingSubtaskId.set(null);
    }
    if (event.key === 'Escape') {
      this.editingSubtaskId.set(null);
    }
  }

  dueDateClass(): string {
    const due = new Date(this.todo().dueDate!);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    due.setHours(0, 0, 0, 0);

    const diffDays = Math.ceil((due.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));

    if (diffDays < 0) return 'bg-red-100 text-red-800 dark:bg-red-900/40 dark:text-red-300';
    if (diffDays <= 2)
      return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/40 dark:text-yellow-300';

    return 'bg-surface-100 text-surface-600 dark:bg-surface-800 dark:text-surface-400';
  }

  formatDueDate(): string {
    const due = new Date(this.todo().dueDate! + 'T00:00:00');
    return due.toLocaleDateString(undefined, { day: 'numeric', month: 'short' });
  }

  priorityBorderClass(): string {
    const map: Record<Priority, string> = {
      low: '!border-l-green-500',
      medium: '!border-l-yellow-500',
      high: '!border-l-red-500',
    };
    return map[this.todo().priority];
  }

  priorityBadgeClass(): string {
    const map: Record<Priority, string> = {
      low: 'bg-green-100 text-green-800 dark:bg-green-900/40 dark:text-green-300',
      medium: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/40 dark:text-yellow-300',
      high: 'bg-red-100 text-red-800 dark:bg-red-900/40 dark:text-red-300',
    };
    return map[this.todo().priority];
  }

  onDelete(): void {
    this.deleted.emit(this.todo().id);
    this.showDeleteConfirm.set(false);
  }
}
