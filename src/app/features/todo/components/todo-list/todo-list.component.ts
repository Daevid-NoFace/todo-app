import { Component, input, output, ChangeDetectionStrategy } from '@angular/core';
import { Todo, Priority } from '../../../../core/models/todo.model';
import { TodoItemComponent } from '../todo-item/todo-item.component';
import { TranslatePipe } from '../../../../shared/pipes/translate.pipe';
import { fadeSlideIn, listStagger } from '../../../../shared/animations/todo.animations';

@Component({
  selector: 'app-todo-list',
  imports: [TodoItemComponent, TranslatePipe],
  templateUrl: './todo-list.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  animations: [fadeSlideIn, listStagger],
})
export class TodoListComponent {
  todos = input<Todo[]>([]);

  toggled = output<string>();
  deleted = output<string>();
  edited = output<{ id: string; title: string; description?: string; priority: Priority }>();
}
