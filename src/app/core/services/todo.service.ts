import { computed, inject, Injectable, signal } from "@angular/core";
import { StorageService } from "./storage.service";
import { Todo, TodoFilter, Priority } from "../models/todo.model";

@Injectable({ providedIn: 'root' })
export class TodoService {
  private storage = inject(StorageService);
  private readonly storageKey = 'todos';

  private _todos = signal<Todo[]>(this.storage.get<Todo[]>(this.storageKey) ?? []);

  todos = this._todos.asReadonly(); // Expose as readonly to prevent external mutation

  activeCount = computed(() => this.todos().filter((todo) => !todo.completed).length); // Number of active (not completed) todos
  completedCount = computed(() => this.todos().filter((todo) => todo.completed).length); // Number of completed todos

  // Computed property to get filtered and sorted todos based on the current filter
  private _filter = signal<TodoFilter>({
    status: 'all',
    searchTerm: '',
    sortBy: 'createdAt',
    sortOrder: 'desc',
  });

  filter = this._filter.asReadonly(); // Expose filter as readonly to prevent external mutation

  filteredTodos = computed(() => {
    const todos = this._todos(); // Get the current list of todos
    const f = this._filter(); // Get the current filter settings

    return todos
      .filter((t) => {
        if (f.status === 'active') return !t.completed; // Show only active todos
        if (f.status === 'completed') return t.completed; // Show only completed todos
        return true; // Show all todos
      })
      .filter((t) =>
        f.searchTerm
          ? t.title.toLowerCase().includes(f.searchTerm.toLowerCase()) ||
            (t.description?.toLowerCase().includes(f.searchTerm.toLowerCase()) ?? false)
          : true,
      )
      .sort((a, b) => {
        const order = f.sortOrder === 'asc' ? 1 : -1; // Determine sort order

        if (f.sortBy === 'priority') {
          const priorityOrder = { low: 1, medium: 2, high: 3 }; // Define priority order
          return (priorityOrder[a.priority] - priorityOrder[b.priority]) * order; // Sort by priority
        }
        return (new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()) * order; // Sort by creation date
      });
  });

  // Method to update an existing todo
  private persist(): void {
    this.storage.set(this.storageKey, this._todos()); // Save the current list of todos to storage
  }

  add(data: { title: string; description?: string; priority: Priority }): void {
    const newTodo: Todo = {
      id: crypto.randomUUID(), // Generate a unique ID for the new todo
      title: data.title,
      description: data.description,
      completed: false,
      priority: data.priority,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    this._todos.update((todos) => [newTodo, ...todos]); // Add the new todo to the beginning of the list
    this.persist(); // Save the updated list to storage
  }

  update(id: string, changes: Partial<Omit<Todo, 'id' | 'createdAt'>>): void {
    this._todos.update((todos) =>
      todos.map((t) =>
        t.id === id ? { ...t, ...changes, updatedAt: new Date().toISOString() } : t,
      ),
    ); // Update the specified todo with the changes
    this.persist(); // Save the updated list to storage
  }

  delete(id: string): void {
    this._todos.update((todos) => todos.filter((t) => t.id !== id)); // Remove the specified todo from the list
    this.persist(); // Save the updated list to storage
  }

  toggleComplete(id: string): void {
    this._todos.update(
      (todos) =>
        todos.map((t) =>
          t.id === id ? { ...t, completed: !t.completed, updatedAt: new Date().toISOString() } : t,
        ), // Toggle the completion status of the specified todo
    );
    this.persist(); // Save the updated list to storage
  }

  clearCompleted(): void {
    this._todos.update((todos) => todos.filter((t) => !t.completed));
    this.persist(); // Save the updated list to storage
  }

  updateFilter(changes: Partial<TodoFilter>): void {
    this._filter.update((f) => ({ ...f, ...changes })); // Update the filter settings with the provided changes
  }
}
