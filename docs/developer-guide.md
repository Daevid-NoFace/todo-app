# Developer Guide

This guide is intended for developers who need to understand, maintain, or extend this codebase.

---

## Table of Contents

1. [Prerequisites](#prerequisites)
2. [Project Setup](#project-setup)
3. [Architecture Overview](#architecture-overview)
4. [State Management with Signals](#state-management-with-signals)
5. [Adding a New Feature](#adding-a-new-feature)
6. [Adding Translations](#adding-translations)
7. [Adding a New Icon](#adding-a-new-icon)
8. [Date Handling Rules](#date-handling-rules)
9. [Timer Safety Pattern](#timer-safety-pattern)
10. [Component Patterns](#component-patterns)
11. [Styling Conventions](#styling-conventions)
12. [Testing](#testing)
13. [Common Pitfalls](#common-pitfalls)

---

## Prerequisites

| Tool | Version |
|---|---|
| Node.js | 18+ |
| npm | 9+ |
| Angular CLI | 21+ (`npm i -g @angular/cli`) |

---

## Project Setup

```bash
git clone https://github.com/daevid-noface/todo-app.git
cd todo-app
npm install
ng serve           # dev server at http://localhost:4200
ng test            # run unit tests with Vitest
ng build           # production build
```

---

## Architecture Overview

### Technology choices

- **Angular 21** — Standalone components, new control flow (`@if`, `@for`), zoneless.
- **Signals** — All reactive state. No RxJS, no NgRx, no BehaviorSubjects.
- **`ChangeDetectionStrategy.OnPush`** — On every component. Angular only re-renders when a signal the component reads changes.
- **`provideZonelessChangeDetection()`** — Zone.js is not loaded. Every state change must go through a signal, `markForCheck()`, or Angular animation.
- **TailwindCSS v4** — CSS-first, no `tailwind.config.js`. Design tokens live in `src/styles.css` inside `@theme {}`.

### Folder layout

```
src/app/
├── core/
│   ├── constants/      ← shared constants (project colors/icons)
│   ├── guards/         ← authGuard, guestGuard
│   ├── models/         ← TypeScript interfaces (Todo, Project, User, Toast, TodoFilter)
│   └── services/       ← all application state (injectable, providedIn: 'root')
├── features/
│   └── todo/
│       ├── auth/       ← login and register pages
│       ├── components/ ← bottom-nav, todo-filters, todo-form, todo-item, todo-list
│       ├── todo-page.component.*   ← smart root component, 3-column layout
│       └── todo-page.component.css ← responsive CSS Grid
└── shared/
    ├── animations/     ← all Angular animation triggers (centralised)
    ├── components/     ← confirm-dialog, header, project-form, theme-toggle
    ├── pipes/          ← translate.pipe
    ├── right-panel/    ← calendar, weekly chart, stats
    ├── sidebar/        ← desktop/tablet navigation
    └── toast/          ← toast notification display
```

### Service responsibilities

| Service | Responsibility |
|---|---|
| `TodoService` | Todo CRUD, filter state, `filteredTodos`, `completionByDay`, `streak` |
| `ProjectService` | Project CRUD, `projectMap` (id → Project computed) |
| `AuthService` | Login, register, logout, `updateName`, `updateAvatar`, `updatePassword` |
| `I18nService` | `currentLang` signal, `translate()`, `switchLanguage()` |
| `ThemeService` | Dark/light toggle, persists to localStorage |
| `ToastService` | Show/dismiss toasts with safe timer management |
| `MobileNavService` | Shared `activeTab` signal for the bottom navigation bar |
| `StorageService` | Typed `get/set/remove` wrappers over `localStorage` |

---

## State Management with Signals

All state lives in services as `signal()`. Components read it via `computed()` or directly.

### Pattern: private writable + public readonly

```typescript
// In a service
private _todos = signal<Todo[]>([]);
todos = this._todos.asReadonly(); // expose as readonly

// Mutation only through service methods
add(data: ...) {
  this._todos.update(todos => [newTodo, ...todos]);
  this.persist();
}
```

Components never write to service signals directly. They call service methods.

### Pattern: derived state with computed()

```typescript
filteredTodos = computed(() => {
  const todos = this._todos();   // reactive dependency
  const f = this._filter();      // reactive dependency
  // ...filter and sort...
  return result;
});
```

`filteredTodos` automatically recalculates whenever `_todos` or `_filter` changes. No subscriptions, no manual `markForCheck()` needed.

### Pattern: reactive effect for side effects

```typescript
constructor() {
  effect(() => {
    // This re-runs whenever auth.currentUser() changes (login/logout).
    const todos = this.storage.get<Todo[]>(this.storageKey) ?? [];
    this._todos.set(todos);
  });
}
```

Use `effect()` for side effects that must react to signal changes (loading from storage, syncing to DOM). Avoid writing to signals inside `effect()` unless wrapped with `untracked()` or `allowSignalWrites: true`.

---

## Adding a New Feature

### Example: add a "tags" field to todos

**1. Update the model** — `src/app/core/models/todo.model.ts`

```typescript
export interface Todo {
  // ... existing fields
  tags?: string[];
}
```

**2. Update `TodoService`** — add the field in `add()` and `update()`:

```typescript
add(data: { ..., tags?: string[] }): void {
  const newTodo: Todo = {
    // ...
    tags: data.tags ?? [],
  };
  // ...
}
```

**3. Update `TodoFormComponent`** — add the form control, pass via the `saved` output.

**4. Update `TodoItemComponent`** — display the tags in the template.

**5. Add translations** — add any new UI labels in `public/i18n/en.json` and `public/i18n/pt.json`.

**6. Write a unit test** — add a spec in `todo.service.spec.ts` covering the new field.

### Example: add a new view filter (e.g. "No due date")

**1. Extend the type** in `todo.model.ts`:
```typescript
export type ViewFilter = 'all' | 'today' | 'upcoming' | 'project' | 'date' | 'no-date';
```

**2. Add the filter case** in `TodoService.filteredTodos`:
```typescript
case 'no-date':
  return !t.dueDate;
```

**3. Add a sidebar/nav link** in `sidebar.component.html` that calls `todoService.updateFilter({ view: 'no-date' })`.

**4. Add translation keys** — `"nav_no_date": "No due date"` in both JSON files.

---

## Adding Translations

All translation files are in `public/i18n/`:

```
public/i18n/
├── en.json   ← English (default)
└── pt.json   ← Portuguese (PT)
```

### File structure

Keys are grouped by feature. Always use the same structure in both files.

```json
{
  "nav": { "all": "All Tasks", "today": "Today" },
  "todo": { "add_placeholder": "Add a new task..." },
  "profile": { "title": "Profile" }
}
```

### Using translations in templates

```html
{{ 'nav.all' | translate }}
```

### Using translations in component code

```typescript
private i18nService = inject(I18nService);

// In a method or computed:
const message = this.i18nService.translate('todo.saved');
```

### Interpolation

```json
{ "items_left": "{{count}} tasks remaining" }
```

```html
{{ 'items_left' | translate : { count: activeCount() } }}
```

### Why `TranslatePipe` is impure

The `@Pipe({ pure: false })` flag makes Angular re-run the pipe on every change detection cycle. This is required because the language is service-internal state — not a pipe input — so a pure pipe would never know when to update. The overhead is negligible since `translate()` is a synchronous object lookup.

### Adding a new language

1. Copy `en.json` to `public/i18n/xx.json` (e.g. `es.json`).
2. Translate all values.
3. In `i18n.service.ts`, extend the `Language` type: `export type Language = 'en' | 'pt' | 'es';`
4. Import the new file: `import es from '../../../../public/i18n/es.json';`
5. Add it to `allTranslations`: `const allTranslations = { en, pt, es };`
6. Update `loadLang()` to recognise the browser locale if desired.

---

## Adding a New Icon

Icons come from [Lucide Angular](https://lucide.dev/). The library is tree-shaken via `.pick({})` in `app.config.ts`.

**Steps:**

1. Find the icon name on [lucide.dev](https://lucide.dev/).
2. Import it in `src/app/app.config.ts`:
   ```typescript
   import { Rocket } from 'lucide-angular';
   ```
3. Add it to the `LucideAngularModule.pick({})` call:
   ```typescript
   LucideAngularModule.pick({ ..., Rocket })
   ```
4. Use it in any template that imports `LucideAngularModule`:
   ```html
   <lucide-icon name="rocket" [size]="16" />
   ```

> Icon names in templates use kebab-case (`rocket`, `chevron-down`). Import names use PascalCase (`ChevronDown`).

---

## Date Handling Rules

This is the most important section for avoiding bugs.

### Rule 1: `dueDate` is always a local date string (`YYYY-MM-DD`)

`dueDate` is set from the `<input type="date">` element in the browser, which always returns a local date string. It must be compared using local date strings — never `toISOString()`.

**Correct:**
```typescript
const d = new Date();
const today = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
// Compare: t.dueDate === today
```

**Wrong:**
```typescript
const today = new Date().toISOString().split('T')[0]; // BUG: UTC date, wrong in UTC+ timezones
```

### Rule 2: `createdAt`, `updatedAt`, `completedAt` are UTC ISO strings

These are set with `new Date().toISOString()`. The `completionByDay` chart and `streak` service compare them using `startsWith(dateStr)` where `dateStr` is also a UTC date — this is intentionally consistent.

### Rule 3: displaying `completedAt` as a local date requires conversion

When you need to compare or display `completedAt` as a local calendar day:

```typescript
private toDateStr(d: Date): string {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}

// Convert UTC ISO → local date string before comparing
const localDate = this.toDateStr(new Date(todo.completedAt));
```

### Rule 4: prevent UTC date picker offset

When setting `min` on `<input type="date">`, compute the date locally:

```typescript
private today = (() => {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
})();
```

### Rule 5: prevent UTC display offset when formatting `dueDate`

```typescript
// Force local-timezone parsing by appending the time part
const due = new Date(todo.dueDate + 'T00:00:00');
return due.toLocaleDateString(undefined, { day: 'numeric', month: 'short' });
```

Without the `T00:00:00`, `new Date('2026-03-01')` is parsed as UTC midnight and displays as February 28 in UTC+ timezones.

---

## Timer Safety Pattern

Any component that uses `setTimeout` inside a callback that writes to a signal must clean up on destroy.

**Why:** Angular (zoneless) emits a warning if a signal is written after the component's view is destroyed.

**Pattern used in `TodoItemComponent`:**

```typescript
private destroyRef = inject(DestroyRef);
private readonly pendingTimers = new Set<ReturnType<typeof setTimeout>>();

constructor() {
  this.destroyRef.onDestroy(() => {
    this.pendingTimers.forEach(clearTimeout);
    this.pendingTimers.clear();
  });
}

private safeTimeOut(fn: () => void, delay: number): void {
  const id = setTimeout(() => {
    this.pendingTimers.delete(id); // self-cleaning
    fn();
  }, delay);
  this.pendingTimers.add(id);
}
```

Use `safeTimeOut` instead of `setTimeout` for any delayed signal writes inside components.

---

## Component Patterns

### Smart vs Presentational

| Type | Injects services? | Emits outputs? | Examples |
|---|---|---|---|
| Smart | Yes | Rarely | `TodoPageComponent`, `SidebarComponent`, `RightPanelComponent` |
| Presentational | No (or minimal) | Yes | `TodoFormComponent`, `TodoItemComponent`, `ProjectFormComponent` |

Presentational components receive data via `input()` and report user actions via `output()`. They do not mutate global state directly.

### OnPush everywhere

Every component uses `changeDetection: ChangeDetectionStrategy.OnPush`. Angular only re-renders a component when:
- An `input()` reference changes.
- A signal read inside the template fires a notification.
- `markForCheck()` is called explicitly.

Do not use `setTimeout(()=> cdr.detectChanges())` patterns — they defeat the purpose of OnPush and zoneless.

### Standalone components

All components are standalone (`standalone: true` is the default in Angular 19+). Import exactly what each component needs in its own `imports: []` array.

### New control flow

Use `@if`, `@for`, `@switch` instead of `*ngIf`, `*ngFor`, `ngSwitch`:

```html
@if (todo().completed) {
  <span>Done</span>
}

@for (task of filteredTodos(); track task.id) {
  <app-todo-item [todo]="task" />
}
```

---

## Styling Conventions

### Design tokens

All custom tokens are defined in `src/styles.css` inside `@theme {}`:

```css
@theme {
  --color-primary-500: oklch(57% 0.22 270);
  --color-surface-100: oklch(96% 0.005 260);
  /* ... */
}
```

Reference them in templates via Tailwind utilities: `bg-primary-500`, `text-surface-100`.

### Utility classes

`@layer components` in `styles.css` defines reusable patterns:

| Class | Usage |
|---|---|
| `.glass` | Glassmorphism card background |
| `.input-field` | Text inputs (add `px-4 py-2.5` for padding) |
| `.btn-primary` | Primary action button (add `px-4 py-2` for padding) |
| `.btn-ghost` | Icon / secondary buttons |
| `.btn-danger-ghost` | Delete / destructive icon buttons |
| `.scroll-fade` | Fade mask on scrollable lists |

### Dark mode

Use the `dark:` prefix. The `dark` variant is applied by the `dark` class on `<html>` — no `prefers-color-scheme` query. `ThemeService` toggles this class.

```html
<div class="bg-white dark:bg-surface-900 text-surface-900 dark:text-surface-100">
```

### Responsive layout

The 3-column layout uses a named CSS Grid in `todo-page.component.css`:

```
Mobile (<768px):     1 column, bottom nav
Tablet (768–1279px): 2 columns (main + right panel hidden)
Desktop (1280px+):   3 columns (sidebar + main + right panel)
```

Use `md:` for tablet breakpoints and `xl:` or `2xl:` for desktop breakpoints.

---

## Testing

Tests use **Vitest** (built into Angular 21's test runner).

```bash
ng test             # watch mode
ng test --run       # single run, CI-friendly
```

Test files live next to the files they test: `*.spec.ts`.

### What is tested

Currently covered:
- `StorageService` — get/set/remove wrappers
- `I18nService` — translate(), switchLanguage(), interpolation
- `ThemeService` — toggle, persistence
- `TodoService` — add, update, delete, toggle, filter, sort

### Writing a new test

```typescript
import { TestBed } from '@angular/core/testing';
import { TodoService } from './todo.service';

describe('TodoService', () => {
  let service: TodoService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(TodoService);
  });

  it('should add a todo', () => {
    service.add({ title: 'Test', priority: 'medium' });
    expect(service.todos().length).toBe(1);
    expect(service.todos()[0].title).toBe('Test');
  });
});
```

---

## Common Pitfalls

### 1. Reading a signal in a template without `()`

Signals must be called to read their value:

```html
<!-- Wrong: renders [object Object] -->
@for (day of weekDays; track day) { ... }

<!-- Correct -->
@for (day of weekDays(); track day) { ... }
```

### 2. Using `toISOString()` to compare local dates

See [Date Handling Rules](#date-handling-rules). `toISOString()` returns UTC and will produce wrong results in UTC+ timezones when comparing against `dueDate` strings from the date picker.

### 3. Writing to a signal in an `effect()` without `allowSignalWrites`

```typescript
effect(() => {
  this.someSignal.set(this.otherSignal()); // Error in dev mode
});

// Fix:
effect(() => {
  const value = this.otherSignal();
  untracked(() => this.someSignal.set(value));
});
```

### 4. Forgetting to register a new Lucide icon in `app.config.ts`

The icon will silently render nothing. Always add new icon imports to `app.config.ts` before using them in templates.

### 5. Adding a translation key to only one language file

Always update both `en.json` and `pt.json`. The `translate()` service returns the key string if a translation is missing, which makes missing keys easy to spot in the UI.

### 6. Using `setTimeout` directly in a component

Wrap with `safeTimeOut()` (see [Timer Safety Pattern](#timer-safety-pattern)) to prevent memory leaks and destroyed-view warnings.

### 7. Modifying a signal from outside the service that owns it

Services expose `.asReadonly()`. If you find yourself needing to cast away the readonly to write, this is a design smell — add a method to the service instead.
