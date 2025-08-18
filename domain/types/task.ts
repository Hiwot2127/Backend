export type Task = {
  id: string;
  title: string;
  completed: boolean;
  createdAt: Date;
  description?: string | null;
  userId: string;
  attachmentPath?: string | null;
};

export type TaskSortBy = 'createdAt' | 'title' | 'completed';
export type TaskSortDir = 'asc' | 'desc';

export type TaskFilters = {
  userId?: string;
  includeAll?: boolean;
  q?: string;
  completed?: boolean;
  from?: string;
  to?: string;
  hasAttachment?: boolean;
};