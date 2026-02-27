import { Component, inject, ChangeDetectionStrategy } from '@angular/core';
import { TodoService } from '../../core/services/todo.service';
import { TodoFormComponent } from './components/todo-form/todo-form.component';
import { TodoListComponent } from './components/todo-list/todo-list.component';
import { Priority } from '../../core/models/todo.model';
import { TranslatePipe } from '../../shared/pipes/translate.pipe';
import { TodoFiltersComponent } from './components/todo-filters/todo-filters.component';
import { ToastService } from '../../core/services/toast.service';
import { I18nService } from '../../core/services/i18n.service';
import { SidebarComponent } from '../../shared/sidebar/sidebar.component';
import { RightPanelComponent } from '../../shared/right-panel/right-panel.component';
import { BottomNavComponent } from './components/bottom-nav/bottom-nav.component';

@Component({
  selector: 'app-todo-page',
  imports: [
    TodoFormComponent,
    TodoListComponent,
    TranslatePipe,
    TodoFiltersComponent,
    SidebarComponent,
    RightPanelComponent,
    BottomNavComponent,
  ],
  templateUrl: './todo-page.component.html',
  styleUrl: './todo-page.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class TodoPageComponent {
  protected todoService = inject(TodoService);

  private toast = inject(ToastService);
  private i18n = inject(I18nService);

  onTodoCreated(data: {
    title: string;
    description?: string;
    priority: Priority;
    dueDate?: string;
  }): void {
    this.todoService.add(data);
    this.toast.show(this.i18n.translate('todo.created'), 'success');
  }

  onTodoEdited(data: {
    id: string;
    title: string;
    description?: string;
    priority: Priority;
    dueDate?: string;
  }): void {
    const { id, ...updateData } = data;
    this.todoService.update(id, updateData);
    this.toast.show(this.i18n.translate('todo.updated'), 'success');
  }

  onTodoDeleted(id: string): void {
    this.todoService.delete(id);
    this.toast.show(this.i18n.translate('todo.deleted'), 'success');
  }

  onTodoToggled(id: string): void {
    this.todoService.toggleComplete(id);
  }
}
