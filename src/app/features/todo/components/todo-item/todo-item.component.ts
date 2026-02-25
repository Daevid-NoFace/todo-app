import { Component, input, output, signal, ChangeDetectionStrategy } from "@angular/core";
import { TranslatePipe } from "../../../../shared/pipes/translate.pipe";
import { Todo, Priority } from "../../../../core/models/todo.model";
import { TodoFormComponent } from "../todo-form/todo-form.component";
import { ConfirmDialog } from "../../../../shared/components/confirm-dialog/confirm-dialog/confirm-dialog";

@Component({
  selector: 'app-todo-item',
  templateUrl: './todo-item.component.html',
  imports: [TodoFormComponent, TranslatePipe, ConfirmDialog],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class TodoItemComponent {
  todo = input.required<Todo>();

  toggled = output<string>();
  deleted = output<string>();
  edited = output<{ id: string; title: string; description?: string; priority: Priority; dueDate?: string }>();

  isEditing = signal(false);
  showDeleteConfirm = signal(false);


  onEdit(data: { title: string; description?: string; priority: Priority; dueDate?: string }): void {
    this.edited.emit({ id: this.todo().id, ...data });
    this.isEditing.set(false);
  }

  dueDateClass(): string {
    const due = new Date(this.todo().dueDate!);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    due.setHours(0, 0, 0, 0);

    const diffDays = Math.ceil((due.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));

    if (diffDays < 0) return 'bg-red-100 text-red-800 dark:bg-red-900/40 dark:text-red-300';
    if (diffDays <= 2) return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/40 dark:text-yellow-300';

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
