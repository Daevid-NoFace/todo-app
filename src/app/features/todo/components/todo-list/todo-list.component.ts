import { Component, input, output } from "@angular/core";
import { Todo, Priority } from "../../../../core/models/todo.model";
import { TodoItemComponent } from "../todo-item/todo-item.component";
import { TranslatePipe } from '../../../../shared/pipes/translate.pipe';

@Component({
  selector: 'app-todo-list',
  imports: [TodoItemComponent, TranslatePipe],
  templateUrl: './todo-list.component.html',
})
export class TodoListComponent {
  todos = input<Todo[]>([]);

  toggled = output<string>();
  deleted = output<string>();
  edited = output<{ id: string; title: string; description?: string; priority: Priority }>();
}
