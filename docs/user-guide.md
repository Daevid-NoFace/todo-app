# User Guide

Welcome to the Todo App — a task management tool that works on desktop, tablet, and mobile.

**Live demo:** [https://daevid-noface.github.io/todo-app/](https://daevid-noface.github.io/todo-app/)

---

## Table of Contents

1. [Getting Started](#getting-started)
2. [The Layout](#the-layout)
3. [Managing Tasks](#managing-tasks)
4. [Subtasks](#subtasks)
5. [Projects](#projects)
6. [Filtering and Sorting](#filtering-and-sorting)
7. [Calendar](#calendar)
8. [Statistics](#statistics)
9. [Search](#search)
10. [Profile Settings](#profile-settings)
11. [Theme and Language](#theme-and-language)
12. [Mobile App](#mobile-app)

---

## Getting Started

### Creating an account

Open the app and click **Register**. Enter your name, email, and a password of at least 6 characters. Your data is stored locally in your browser — no server connection required.

### Demo account

You can try the app immediately with the pre-loaded demo account:

| Email | Password |
|---|---|
| `demo@demo.com` | `demo123` |

### Logging out

Click **Log out** at the bottom of the left sidebar (desktop) or in the **Profile** tab (mobile).

---

## The Layout

### Desktop and tablet

The app uses a three-column layout:

| Column | Content |
|---|---|
| **Left** | Sidebar — navigation, projects, theme/language controls |
| **Centre** | Main area — task form and task list |
| **Right** | Calendar, weekly chart, and statistics |

On tablets (screen width below 1280px), the right panel is hidden. On screens below 768px, the layout switches to the mobile view.

### Mobile

The mobile view uses a single-column layout with a **bottom navigation bar** containing five tabs:

| Tab | Content |
|---|---|
| **Home** | Task list and project shortcuts |
| **Search** | Full-text search |
| **+ (FAB)** | Quick add task (bottom sheet) |
| **Calendar** | Mini calendar and stats |
| **Profile** | Account settings |

---

## Managing Tasks

### Adding a task

1. Click the input field at the top of the main column (desktop) or the **+** button (mobile).
2. Type the task title and an optional description.
3. Optionally select a **Project**, **Due date**, and **Priority**.
4. Press **Add** or hit **Enter**.

### Priority levels

| Priority | Meaning | Colour |
|---|---|---|
| Low | Non-urgent | Green |
| Medium | Normal importance | Yellow/Amber |
| High | Urgent | Red |

### Due dates

Tasks with a due date are colour-coded:

| Colour | Meaning |
|---|---|
| Red badge | Overdue (past the due date) |
| Amber badge | Due today or within the next 2 days |
| Grey badge | On track |

### Editing a task

Click the **pencil icon** on any task card to open the edit form. Change any field and click **Save**.

### Completing a task

Click the **circle checkbox** on the left of a task to mark it as complete. Click again to mark it incomplete. Completed tasks show a strikethrough title.

### Deleting a task

Click the **trash icon** on a task card. A confirmation dialog appears before the task is permanently deleted.

---

## Subtasks

You can break a task into smaller steps using subtasks.

### Expanding subtasks

Click the **arrow** or the subtask count (e.g. "2/5") on a task card to expand the subtask list.

### Adding a subtask

1. Expand the task.
2. Click **Add subtask**.
3. Type the subtask title.
4. Press **Enter** or click the checkmark to confirm. Press **Escape** to cancel.

### Editing a subtask

Click the **pencil icon** next to a subtask title. Edit inline and press **Enter** or click away to save.

### Completing a subtask

Click the checkbox next to the subtask title. A progress bar at the top of the task card shows overall subtask completion.

### Deleting a subtask

Click the **X** icon next to a subtask.

---

## Projects

Projects let you group related tasks together.

### Creating a project

1. Click **New project** at the bottom of the sidebar (desktop) or the **+** button next to "Projects" in the mobile Home tab.
2. Enter a project name.
3. Choose a colour from the colour swatches.
4. Choose an icon.
5. Click **Save**.

### Editing a project

Click the **pencil icon** next to the project name in the sidebar.

### Deleting a project

Open the project edit form and click **Delete project**. This only deletes the project record — the tasks assigned to it are kept but become unassigned.

### Filtering by project

Click a project name in the sidebar to show only tasks from that project. The task form's project selector is pre-filled with the active project.

### Task count

Each project in the sidebar shows the number of active (incomplete) tasks.

---

## Filtering and Sorting

### View filters (sidebar navigation)

| View | Shows |
|---|---|
| **All Tasks** | Every task |
| **Today** | Tasks with a due date of today |
| **Upcoming** | Tasks with a future due date |
| **[Project name]** | Tasks in that project |

### Status filter

Above the task list, a segmented control filters by completion status:

| Option | Shows |
|---|---|
| **All** | All tasks |
| **Active** | Incomplete tasks only |
| **Completed** | Completed tasks only |

### Sorting

Click the **sort dropdown** next to the status filter to change the sort order:

| Option | Description |
|---|---|
| Newest | Most recently created tasks first |
| Oldest | Oldest tasks first |
| Priority ↑ | Low → Medium → High |
| Priority ↓ | High → Medium → Low |
| Due date ↑ | Earliest due date first |
| Due date ↓ | Latest due date first |

---

## Calendar

The calendar is in the **right panel** (desktop) or the **Calendar tab** (mobile).

### Navigating months

Use the **left/right chevron arrows** to move to the previous or next month.

### Date indicators

Days with at least one task assigned show a small **dot** below the date number.

### Filtering by date

Click any day in the calendar to filter the task list to tasks due on that date. Click the same day again to clear the filter.

---

## Statistics

The right panel (desktop) and Calendar tab (mobile) show three stats cards:

| Card | Meaning |
|---|---|
| **Streak** | How many consecutive days you have completed at least one task |
| **Today** | Tasks completed today vs. total tasks due today |
| **Weekly rate** | Percentage of the last 7 days on which you completed at least one task |

### Weekly activity chart

Below the calendar, a bar chart shows the number of tasks completed each day over the last 7 days. Bars are colour-coded by performance:

| Colour | Rate |
|---|---|
| Green | 80% or more of the busiest day |
| Purple | 50–79% |
| Amber | Below 50% |

---

## Search

### Desktop

Type in the **search bar** at the top of the right panel (if visible) or use the filter bar in the centre column.

### Mobile

Tap the **Search tab** in the bottom navigation bar. Type in the search field at the top.

Search matches against the task **title** and **description**. The results update as you type.

---

## Profile Settings

Open the profile on desktop via the sidebar footer, or on mobile via the **Profile tab**.

### Changing your name

Click on your name (or the pencil icon next to it) to edit it inline. Press **Enter** or click away to save.

### Uploading an avatar

Click on the avatar circle. Select an image from your device (JPEG, PNG, etc.). The image is stored locally in the browser.

### Changing your password

1. Enter your current password.
2. Enter the new password (minimum 6 characters).
3. Confirm the new password.
4. Click **Save password**.

---

## Theme and Language

### Switching themes

Click the **sun/moon icon** in the header or sidebar to toggle between Light and Dark mode. Your preference is saved and remembered on your next visit.

### Switching language

Click the **language button** (shows current language abbreviation) in the sidebar or profile to switch between **English** and **Português (PT)**. All UI text, date labels, calendar headers, and error messages update immediately — no page reload required.

---

## Data and Privacy

All data (tasks, projects, account information) is stored exclusively in your browser's **localStorage**. Nothing is sent to any server. Clearing your browser data will delete all tasks and your account.

Each registered account has its own separate task list. Switching accounts loads only that account's tasks.
