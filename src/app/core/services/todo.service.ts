import { computed, effect, inject, Injectable, signal } from "@angular/core";
import { StorageService } from "./storage.service";
import { Todo, TodoFilter, Priority } from "../models/todo.model";
import { AuthService } from "./auth.service";

@Injectable({ providedIn: 'root' })
export class TodoService {
  private storage = inject(StorageService);
  private auth = inject(AuthService);

  private get storageKey(): string {
    return `todos_${this.auth.currentUser()?.id ?? 'guest'}`;
  }

  private _todos = signal<Todo[]>([]);

  constructor() {
    effect(() => {
      const todos = this.storage.get<Todo[]>(this.storageKey) ?? [];
      this._todos.set(todos);
    })
  }

  todos = this._todos.asReadonly();

  activeCount = computed(() => this.todos().filter((todo) => !todo.completed).length);
  completedCount = computed(() => this.todos().filter((todo) => todo.completed).length);

  private _filter = signal<TodoFilter>({
    status: 'all',
    searchTerm: '',
    sortBy: 'createdAt',
    sortOrder: 'desc',
  });

  filter = this._filter.asReadonly();

  filteredTodos = computed(() => {
    const todos = this._todos();
    const f = this._filter();

    return todos
      .filter((t) => {
        if (f.status === 'active') return !t.completed;
        if (f.status === 'completed') return t.completed;
        return true;
      })
      .filter((t) =>
        f.searchTerm
          ? t.title.toLowerCase().includes(f.searchTerm.toLowerCase()) ||
            (t.description?.toLowerCase().includes(f.searchTerm.toLowerCase()) ?? false)
          : true,
      )
      .sort((a, b) => {
        const order = f.sortOrder === 'asc' ? 1 : -1;

        if (f.sortBy === 'priority') {
          const priorityOrder = { low: 1, medium: 2, high: 3 };
          return (priorityOrder[a.priority] - priorityOrder[b.priority]) * order;
        }

        if (f.sortBy === 'dueDate') {
          if (!a.dueDate) return 1;
          if (!b.dueDate) return -1;
          return (new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime()) * order;
        }
        return (new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()) * order;
      });
  });

  private persist(): void {
    this.storage.set(this.storageKey, this._todos());
  }

  add(data: { title: string; description?: string; priority: Priority; dueDate?: string }): void {
    const newTodo: Todo = {
      id: crypto.randomUUID(),
      title: data.title,
      description: data.description,
      completed: false,
      priority: data.priority,
      dueDate: data.dueDate,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    this._todos.update((todos) => [newTodo, ...todos]);
    this.persist();
  }

  update(id: string, changes: Partial<Omit<Todo, 'id' | 'createdAt'>>): void {
    this._todos.update((todos) =>
      todos.map((t) =>
        t.id === id ? { ...t, ...changes, updatedAt: new Date().toISOString() } : t,
      ),
    );
    this.persist();
  }

  delete(id: string): void {
    this._todos.update((todos) => todos.filter((t) => t.id !== id));
    this.persist();
  }

  toggleComplete(id: string): void {
    this._todos.update(
      (todos) =>
        todos.map((t) =>
          t.id === id ? { ...t, completed: !t.completed, updatedAt: new Date().toISOString() } : t,
        ),
    );
    this.persist();
  }

  clearCompleted(): void {
    this._todos.update((todos) => todos.filter((t) => !t.completed));
    this.persist();
  }

  updateFilter(changes: Partial<TodoFilter>): void {
    this._filter.update((f) => ({ ...f, ...changes }));
  }
}
