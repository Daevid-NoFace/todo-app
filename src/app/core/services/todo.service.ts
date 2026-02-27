import { computed, effect, inject, Injectable, signal } from '@angular/core';
import { StorageService } from './storage.service';
import { Todo, TodoFilter, Priority } from '../models/todo.model';
import { AuthService } from './auth.service';

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
    });
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

  add(data: {
    title: string;
    description?: string;
    priority: Priority;
    dueDate?: string;
    projectId?: string;
  }): void {
    const now = new Date().toISOString();
    const newTodo: Todo = {
      id: crypto.randomUUID(),
      title: data.title,
      description: data.description,
      completed: false,
      priority: data.priority,
      dueDate: data.dueDate,
      projectId: data.projectId,
      subtasks: [],
      createdAt: now,
      updatedAt: now,
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
    const now = new Date().toISOString();
    this._todos.update((todos) =>
      todos.map((t) =>
        t.id === id
          ? {
              ...t,
              completed: !t.completed,
              completedAt: !t.completed ? now : undefined,
              updatedAt: now,
            }
          : t,
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

  addSubtask(todoId: string, title: string): void {
    const now = new Date().toISOString();
    this._todos.update((todos) =>
      todos.map((t) =>
        t.id === todoId
          ? {
              ...t,
              subtasks: [
                ...t.subtasks,
                {
                  id: crypto.randomUUID(),
                  title,
                  completed: false,
                  createdAt: now,
                  updatedAt: now,
                },
              ],
              updatedAt: now,
            }
          : t,
      ),
    );
    this.persist();
  }

  toggleSubtaskComplete(todoId: string, subtaskId: string): void {
    const now = new Date().toISOString();
    this._todos.update((todos) =>
      todos.map((t) =>
        t.id === todoId
          ? {
              ...t,
              subtasks: t.subtasks.map((s) =>
                s.id === subtaskId
                  ? {
                      ...s,
                      completed: !s.completed,
                      updatedAt: now,
                    }
                  : s,
              ),
              updatedAt: now,
            }
          : t,
      ),
    );
    this.persist();
  }

  deleteSubtask(todoId: string, subtaskId: string): void {
    const now = new Date().toISOString();
    this._todos.update((todos) =>
      todos.map((t) =>
        t.id === todoId
          ? {
              ...t,
              subtasks: t.subtasks.filter((s) => s.id !== subtaskId),
              updatedAt: now,
            }
          : t,
      ),
    );
    this.persist();
  }

  updateSubtask(todoId: string, subtaskId: string, title: string): void {
    const now = new Date().toISOString();
    this._todos.update((todos) =>
      todos.map((t) =>
        t.id === todoId
          ? {
              ...t,
              subtasks: t.subtasks.map((s) =>
                s.id === subtaskId ? { ...s, title, updatedAt: now } : s,
              ),
              updatedAt: now,
            }
          : t,
      ),
    );
    this.persist();
  }

  /** Last 7 days: completed that day + rate relative to the busiest day */
  readonly completionByDay = computed(() => {
    const todos = this.todos();
    const dayLabels = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

    const raw = Array.from({ length: 7}, (_, i) => {
      const date = new Date();
      date.setDate(date.getDate() - (6 - i));
      const dateStr = date.toISOString().split('T')[0];
      const completed = todos.filter(t => t.completedAt?.startsWith(dateStr)).length;

      return { label: dayLabels[date.getDay()], date: dateStr, completed };
    });

    const maxCompleted = Math.max(...raw.map(d => d.completed), 1); // Avoid division by zero
    return raw.map(d => ({ ...d, rate: Math.round((d.completed / maxCompleted) * 100) }));
  });

  /** Consecutive days with at least 1 task completed (counting backwards from today) */
  readonly streak = computed(() => {
    const todos = this.todos();
    let count = 0;
    const d = new Date();

    for (let i = 0; i < 30; i++) { // Check up to the last 30 days
      const dateStr = d.toISOString().split('T')[0];

      if (!todos.some(t => t.completedAt?.startsWith(dateStr))) break;

      count++;
      d.setDate(d.getDate() - 1);
    }

    return count;
  });
}
