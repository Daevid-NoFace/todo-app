export interface Todo {
  id: string;
  title: string;
  description?: string;
  completed: boolean;
  priority: Priority;
  createdAt: string;
  updatedAt: string;
}

export type Priority = 'low' | 'medium' | 'high';

export type FilterStatus = 'all' | 'active' | 'completed';

export type SortField = 'createdAt' | 'priority';
export type SortOrder = 'asc' | 'desc';

export interface TodoFilter {
  status: FilterStatus;
  searchTerm: string;
  sortBy: SortField;
  sortOrder: SortOrder;
}
