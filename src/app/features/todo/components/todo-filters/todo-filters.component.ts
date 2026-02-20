import { ChangeDetectionStrategy, Component, inject } from "@angular/core";
import { TodoService } from "../../../../core/services/todo.service";
import { FilterStatus } from "../../../../core/models/todo.model";
import { TranslatePipe } from "../../../../shared/pipes/translate.pipe";

@Component({
  selector: 'app-todo-filters',
  imports: [TranslatePipe],
  templateUrl: './todo-filters.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class TodoFiltersComponent {
  protected todoService = inject(TodoService);

  readonly filterOptions: FilterStatus[] = ['all', 'active', 'completed'];

  setStatusFilter(status: FilterStatus): void {
    this.todoService.updateFilter({ status });
  }

  onSearch(event: Event): void {
    const value = (event.target as HTMLInputElement).value;
    this.todoService.updateFilter({ searchTerm: value });
  }
}

