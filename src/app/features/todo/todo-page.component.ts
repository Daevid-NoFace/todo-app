import { Component, inject } from "@angular/core";
import { TodoService } from "../../core/services/todo.service";
import { TodoFormComponent } from "./components/todo-form/todo-form.component";
import { TodoListComponent } from "./components/todo-list/todo-list.component";
import { Priority } from "../../core/models/todo.model";

@Component({
  selector: 'app-todo-page',
  imports: [TodoFormComponent, TodoListComponent],
  templateUrl: './todo-page.component.html',
})
export class TodoPageComponent {
  protected todoService = inject(TodoService);

  onTodoCreated(data: { title: string; description?: string; priority: Priority }): void {
    this.todoService.add(data);
  }

  onTodoEdited(data: { id: string; title: string; description?: string; priority: Priority }): void {
    const { id, ...updateData } = data;
    this.todoService.update(id, updateData);
  }

  onTodoDeleted(id: string): void {
    this.todoService.delete(id);
  }

  onTodoToggled(id: string): void {
    this.todoService.toogleCompletion(id);
  }
}
