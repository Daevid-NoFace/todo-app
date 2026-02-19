import { Component, input, output, signal } from "@angular/core";
import { Todo, Priority } from "../../../../core/models/todo.model";
import { TodoFormComponent } from "../todo-form/todo-form.component";

@Component({
  selector: 'app-todo-item',
  templateUrl: './todo-item.component.html',
  imports: [TodoFormComponent],
})
export class TodoItemComponent {
  todo = input.required<Todo>();

  toggled = output<string>();
  deleted = output<string>();
  edited = output<{ id: string; title: string; description?: string; priority: Priority }>();

  isEditing = signal(false);

  onEdit(data: { title: string; description?: string; priority: Priority }): void {
    this.edited.emit({ id: this.todo().id, ...data });
    this.isEditing.set(false);
  }

  priorityBorderClass(): string {
    const map: Record<Priority, string> = {
      low: 'border-l-green-500',
      medium: 'border-l-yellow-500',
      high: 'border-l-red-500',
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
}
