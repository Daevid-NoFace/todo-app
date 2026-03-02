import { computed, effect, inject, Injectable, signal } from '@angular/core';
import { StorageService } from './storage.service';
import { Todo, TodoFilter, Priority } from '../models/todo.model';
import { AuthService } from './auth.service';
import { I18nService } from './i18n.service';

/**
 * Central service for all todo operations.
 *
 * State management strategy:
 * - `_todos` is the private writable signal; exposed as readonly via `todos`.
 * - `_filter` follows the same pattern.
 * - All derived state (filteredTodos, counts, chart data) are computed signals
 *   that recalculate automatically when their dependencies change — no manual subscriptions.
 * - Persistence is synchronous (localStorage) and called after every mutation.
 */
@Injectable({ providedIn: 'root' })
export class TodoService {
  private storage = inject(StorageService);
  private auth = inject(AuthService);
  private i18nService = inject(I18nService);

  private get storageKey(): string {
    return `todos_${this.auth.currentUser()?.id ?? 'guest'}`;
  }

  private _todos = signal<Todo[]>([]);

  constructor() {
    // Load todos from localStorage whenever the active user changes.
    // `storageKey` reads `auth.currentUser()` — a signal — so Angular registers it
    // as a reactive dependency. The effect re-runs automatically on login/logout,
    // loading the correct todo list for each user without any manual wiring.
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
    view: 'all',
  });

  filter = this._filter.asReadonly();

  // Read-only computed that applies 3 filter passes + sorting.
  // Recalculates automatically whenever `_todos` or `_filter` changes.
  filteredTodos = computed(() => {
    const todos = this._todos();
    const f = this._filter();
    const d = new Date();
    const today = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(
      2,
      '0',
    )}-${String(d.getDate()).padStart(2, '0')}`;

    return (
      todos
        // Pass 1: view filter (Today / Upcoming / Project / Date / All).
        // ISO date comparisons (YYYY-MM-DD) work lexicographically.
        // `today` uses local date (not toISOString/UTC) to match dueDates
        // stored as local date from the date picker.
        .filter((t) => {
          switch (f.view) {
            case 'today':
              return t.dueDate === today;
            case 'upcoming':
              return !!t.dueDate && t.dueDate > today;
            case 'project':
              return f.projectId ? t.projectId === f.projectId : true;
            case 'date':
              return f.dateFilter ? t.dueDate === f.dateFilter : true;
            default:
              return true;
          }
        })
        // Pass 2: status filter (All / Active / Completed).
        .filter((t) => {
          if (f.status === 'active') return !t.completed;
          if (f.status === 'completed') return t.completed;
          return true;
        })
        // Pass 3: text search in title and description.
        .filter((t) =>
          f.searchTerm
            ? t.title.toLowerCase().includes(f.searchTerm.toLowerCase()) ||
              (t.description?.toLowerCase().includes(f.searchTerm.toLowerCase()) ?? false)
            : true,
        )
        // Sorting: priority uses a numeric map; dates use getTime() for
        // safe comparison. Tasks without dueDate go at the end in order by date
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
        })
    );
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

  /**
   * Last 7 days with the number of tasks completed each day and a relative rate
   * for the busiest day (0–100). Feeds the weekly activity chart.
   *
   * Note: `completedAt` is stored as ISO UTC (toISOString()). `dateStr` also
   * uses toISOString() to maintain consistency — both are UTC, so
   * startsWith() works correctly.
   * `Math.max(..., 1)` prevents division by zero when there are no completed tasks.
   */
  readonly completionByDay = computed(() => {
    const todos = this.todos();
    const locale = this.i18nService.currentLang() === 'en' ? 'en-US' : 'pt-PT';

    const raw = Array.from({ length: 7 }, (_, i) => {
      const date = new Date();
      date.setDate(date.getDate() - (6 - i));
      const dateStr = date.toISOString().split('T')[0];
      const completed = todos.filter((t) => t.completedAt?.startsWith(dateStr)).length;
      const s = new Intl.DateTimeFormat(locale, { weekday: 'short' }).format(date).slice(0, 3);
      const label = s.charAt(0).toUpperCase() + s.slice(1);
      return { label, date: dateStr, completed };
    });

    const maxCompleted = Math.max(...raw.map((d) => d.completed), 1);
    return raw.map((d) => ({ ...d, rate: Math.round((d.completed / maxCompleted) * 100) }));
  });

  /**
   * Counts the consecutive days (backward from today) on which at least one task was completed.
   * Stops on the first day without any completed tasks.
   * Limited to 30 days to narrow down the iteration.
   */
  readonly streak = computed(() => {
    const todos = this.todos();
    let count = 0;
    const d = new Date();

    for (let i = 0; i < 30; i++) {
      // Check up to the last 30 days
      const dateStr = d.toISOString().split('T')[0];

      if (!todos.some((t) => t.completedAt?.startsWith(dateStr))) break;

      count++;
      d.setDate(d.getDate() - 1);
    }

    return count;
  });
}
