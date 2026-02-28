export interface Todo {
  id: string;
  title: string;
  description?: string;
  completed: boolean;
  priority: Priority;
  dueDate?: string;
  projectId?: string;
  subtasks: Subtask[];
  completedAt?: string;
  createdAt: string;
  updatedAt: string;
}

export type Priority = 'low' | 'medium' | 'high';

export type FilterStatus = 'all' | 'active' | 'completed';
export type ViewFilter = 'all' | 'today' | 'upcoming' | 'project' | 'date';

export type SortField = 'createdAt' | 'priority' | 'dueDate';
export type SortOrder = 'asc' | 'desc';

export interface TodoFilter {
  status: FilterStatus;
  searchTerm: string;
  sortBy: SortField;
  sortOrder: SortOrder;
  view: ViewFilter;
  projectId?: string;
  dateFilter?: string;
}

export interface Subtask {
  id: string;
  title: string;
  completed: boolean;
  createdAt: string;
  updatedAt: string;
}
