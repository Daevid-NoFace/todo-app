# TodoApp — Angular 21 + TailwindCSS v4

A modern, full-featured task management application built as a technical assessment for **Domoweb / NHCLIMA**.

[Live Demo](https://daevid-noface.github.io/todo-app/)

![Light Mode](screenshots/light.png)
![Dark Mode](screenshots/dark.png)

---

## Features

### Task Management
- Full CRUD — create, edit, delete, and toggle tasks
- Subtasks with inline add/edit, progress bar, and individual completion
- Priority levels (Low / Medium / High) with color-coded badges
- Due dates with adaptive color coding: overdue (red), due soon (amber), on time (neutral)
- Assign tasks to projects

### Organisation & Filtering
- Filter by view: All, Today, Upcoming, by Project, or by calendar date
- Filter by status: All / Active / Completed
- Full-text search across title and description
- Sort by creation date, priority, or due date (ascending/descending)

### Projects
- Create, edit, and delete projects with a custom name, color, and icon
- Project task counters in the sidebar
- Project filter chips in the mobile Home tab

### Interface
- Responsive 3-column layout: Sidebar + Main + Right Panel (desktop), 2-column (tablet), single-column with Bottom Nav (mobile)
- Glassmorphism design with mesh gradient background
- Personalized time-based greeting (Good morning / afternoon / evening)
- Dark / Light theme with smooth toggle
- Scroll-independent main column: form stays fixed, only the task list scrolls
- Fade mask on the scrollable task list

### Right Panel (desktop / Calendar tab on mobile)
- Mini calendar (Monday-first, dot indicators for days with tasks, date filter on click)
- Weekly activity bar chart with relative rates and locale-aware day labels
- Stats cards: daily streak 🔥, today's completed/total, weekly completion rate

### Mobile
- Bottom navigation with 5 tabs: Home, Search, FAB (+), Calendar, Profile
- Bottom Sheet for creating tasks (spring animation)
- Profile tab: avatar upload, inline name editing, password change, theme and language settings

### i18n
- English and Portuguese (PT-PT)
- Runtime language switching — no rebuild required
- Locale-aware calendar: month names and day abbreviations via `Intl.DateTimeFormat`
- All UI strings, validation messages, and placeholders translated

### Data & Auth
- Mock authentication with per-user task isolation (namespaced localStorage keys)
- Route guards (`authGuard`, `guestGuard`) redirect unauthenticated users
- Persistent data via localStorage — tasks survive page reloads
- Avatar stored as base64 via FileReader

### Quality
- Zoneless change detection (`provideZonelessChangeDetection`) — no Zone.js
- `ChangeDetectionStrategy.OnPush` on every component
- Timer leak prevention with `DestroyRef` + `Set<ReturnType<typeof setTimeout>>`
- Toast auto-dismiss with safe manual override (no orphan timers)
- Timezone-safe date handling — local dates, not UTC, for all calendar comparisons
- Angular Animations: `fadeSlideIn`, `sheetSlideUp`, `listStagger`, `checkBounce`, `expandCollapse`
- Unit tests with Vitest

---

## Tech Stack

| Technology | Version | Purpose |
|---|---|---|
| Angular | 21 | Frontend framework |
| TypeScript | Strict mode | Type safety |
| TailwindCSS | v4 | Utility-first CSS with `@theme` design tokens |
| Angular Signals | Built-in | Reactive state — no NgRx, no RxJS |
| Angular Animations | Built-in | Declarative enter/leave transitions |
| Lucide Angular | Latest | Icon library (tree-shaken via `.pick({})`) |
| Vitest | Built-in | Unit testing |

---

## Architecture

### State management

All state lives in Angular services as signals. There is no external state library.

```
TodoService        — todo CRUD, filter, completionByDay, streak
ProjectService     — project CRUD, projectMap (id → Project)
AuthService        — login, register, updateName, updateAvatar, updatePassword
I18nService        — currentLang signal, translate(), switchLanguage()
ThemeService       — dark/light toggle, persists to localStorage
ToastService       — show/dismiss toasts with safe timer management
MobileNavService   — shared active tab signal for bottom navigation
```

### Component tree

```
AppComponent
├── HeaderComponent          (logo, theme toggle, language toggle)
└── TodoPageComponent        [Smart — orchestrates all state]
    ├── SidebarComponent     (nav links, project list, project form, theme/lang)
    ├── TodoFormComponent    (reactive form, due date, project selector, priority)
    ├── TodoFiltersComponent (segmented status control, sort selector)
    ├── TodoListComponent
    │   └── TodoItemComponent × N  (subtasks, animations, timer-safe blur)
    ├── RightPanelComponent  (calendar, weekly chart, stats)
    ├── BottomNavComponent   (mobile 5-tab nav with FAB)
    ├── ProjectFormComponent [Reusable — sidebar & mobile sheet]
    └── ThemeToggleComponent [Reusable — header, sidebar, profile row]
```

### Smart vs Presentational components

| Component | Type | Responsibility |
|---|---|---|
| `TodoPageComponent` | Smart | Orchestrates all state, injects services |
| `SidebarComponent` | Smart | Reads filter/project signals, manages project form |
| `TodoFiltersComponent` | Smart | Directly updates `TodoService` filter |
| `RightPanelComponent` | Smart | Calendar state, reads todoService signals |
| `TodoFormComponent` | Presentational | Receives inputs, emits outputs |
| `TodoItemComponent` | Presentational | Displays a single todo, emits events |
| `TodoListComponent` | Presentational | Renders the list with stagger animation |
| `ProjectFormComponent` | Presentational | Reusable project form (sidebar & sheet variant) |
| `ThemeToggleComponent` | Presentational | Reusable theme button (3 visual variants) |

---

## Technical Decisions

### Why Angular 21 instead of 18?

The requirement states "Angular 18+". Angular 21 is the current stable version and brings significant improvements:

- **Zoneless by default** — No Zone.js overhead; signals drive all change detection
- **Vitest** — Modern test runner replacing Karma
- **Signal-based reactivity** — Granular updates, no unnecessary re-renders
- **New control flow** (`@if`, `@for`, `@switch`) — Replaces structural directives

### Why Signals instead of NgRx/RxJS?

For a single-entity app, Signals provide:

- **Simpler API** — No boilerplate (actions, reducers, effects)
- **Built-in to Angular** — No extra dependencies
- **Granular reactivity** — Only affected computed signals and components update
- **`computed()`** — Derived state (filtered/sorted todos) recalculates automatically

NgRx would be overkill here. Signals are the right tool for this scope.

### Why custom i18n instead of `@angular/localize`?

- **Runtime language switching** — `@angular/localize` requires a full rebuild per language
- **Lightweight** — One service + one impure pipe, no complex setup
- **Interpolation support** — `{{count}} items left` works natively with params
- **`Intl.DateTimeFormat`** for calendar labels — locale-aware day/month names without hardcoding

### Why `pure: false` on `TranslatePipe`?

A pure pipe only re-evaluates when its input (the translation key) changes. Language is internal service state, not a pipe input. Setting `pure: false` makes Angular re-run the pipe on every change detection cycle, so translated text updates immediately when the language switches. The cost is negligible — `translate()` is a synchronous object lookup.

### Why `DestroyRef` + `Set<timeout>` in `TodoItemComponent`?

Blur events on subtask inputs need a 150ms delay to let click events on action buttons fire first (blur fires before click). If the component is destroyed during that delay, Angular emits a warning about writing to a signal on a destroyed view. `DestroyRef.onDestroy()` cancels all pending timers, preventing the warning and the memory leak.

### Why mock auth instead of JWT?

- **No backend required** — Fully client-side, deployable as a static site
- **Demonstrates Angular patterns** — Route guards, services, reactive state
- **Per-user isolation** — Each user has separate todos via namespaced localStorage keys (`todos_{userId}`)

### Why TailwindCSS v4?

- **CSS-first configuration** — No `tailwind.config.js` needed
- **`@theme` directive** — Custom design tokens (color palette, fonts) directly in CSS
- **`@custom-variant dark`** — Dark mode without JavaScript
- **`@layer components`** — Reusable utility classes (`.input-field`, `.btn-primary`, `.glass`)

---

## Project Structure

```
src/
├── app/
│   ├── app.config.ts          # provideZonelessChangeDetection, Lucide icon registration
│   ├── app.routes.ts          # Lazy-loaded routes with authGuard / guestGuard
│   ├── core/
│   │   ├── constants/
│   │   │   └── project.constants.ts   # Shared project colors and icons
│   │   ├── guards/
│   │   │   ├── auth.guard.ts          # Redirects unauthenticated users to /login
│   │   │   └── guest.guard.ts         # Redirects authenticated users to /
│   │   ├── models/
│   │   │   ├── todo.model.ts          # Todo, Subtask, TodoFilter, Priority types
│   │   │   ├── project.model.ts       # Project interface
│   │   │   ├── user.model.ts          # User interface
│   │   │   └── toast.model.ts         # Toast interface with timeoutId
│   │   └── services/
│   │       ├── todo.service.ts        # Core todo state + filteredTodos + chart data
│   │       ├── project.service.ts     # Project CRUD + projectMap computed
│   │       ├── auth.service.ts        # Mock auth, per-user storage
│   │       ├── theme.service.ts       # Dark/light toggle
│   │       ├── i18n.service.ts        # Runtime i18n, translate(), currentLang signal
│   │       ├── toast.service.ts       # Toast notifications with safe timer management
│   │       ├── mobile-nav.service.ts  # Shared active tab signal for Bottom Nav
│   │       └── storage.service.ts     # localStorage wrapper
│   ├── features/
│   │   └── todo/
│   │       ├── todo-page.component.*  # Smart root component, 3-col layout
│   │       ├── todo-page.component.css # Responsive CSS Grid
│   │       ├── auth/
│   │       │   ├── login/
│   │       │   └── register/
│   │       └── components/
│   │           ├── bottom-nav/        # Mobile 5-tab navigation with FAB
│   │           ├── todo-filters/      # Segmented status control + sort selector
│   │           ├── todo-form/         # Reactive form (create & edit)
│   │           ├── todo-item/         # Card with subtasks, animations, DestroyRef timers
│   │           └── todo-list/         # List with listStagger animation
│   └── shared/
│       ├── animations/
│       │   └── todo.animations.ts     # fadeSlideIn, sheetSlideUp, listStagger, checkBounce, expandCollapse
│       ├── components/
│       │   ├── confirm-dialog/        # Reusable confirmation modal
│       │   ├── header/                # App header with logo and controls
│       │   ├── project-form/          # Reusable project form (sidebar & sheet variants)
│       │   └── theme-toggle/          # Reusable theme button (icon-only / icon-label / row)
│       ├── pipes/
│       │   └── translate.pipe.ts      # Impure pipe for runtime i18n
│       ├── right-panel/               # Calendar, weekly chart, stats
│       ├── sidebar/                   # Desktop/tablet navigation
│       └── toast/                     # Toast notification display
└── styles.css                         # @theme tokens, glassmorphism utilities, @layer components
```

---

## Getting Started

### Prerequisites

- Node.js 18+
- npm 9+

### Installation

```bash
git clone https://github.com/daevid-noface/todo-app.git
cd todo-app
npm install
```

### Development

```bash
ng serve
```

Open [http://localhost:4200](http://localhost:4200)

### Tests

```bash
ng test
```

### Build

```bash
ng build
```

### Deploy

The app deploys automatically to GitHub Pages on every push to the `development` branch via `.github/workflows/deploy.yml`.

---

## Demo Credentials

The app uses mock authentication. You can register any email/password, or use:

| Email | Password |
|---|---|
| `demo@demo.com` | `demo123` |
