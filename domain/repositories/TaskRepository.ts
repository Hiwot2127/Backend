import { Task, TaskFilters, TaskSortBy, TaskSortDir } from '../types/task.js';

export interface TaskRepository {
  list(opts: { filters: TaskFilters; skip?: number; take?: number; sortBy?: TaskSortBy; sortDir?: TaskSortDir }): Promise<Task[]>;
  count(filters: TaskFilters): Promise<number>;
  findById(id: string): Promise<Task | null>;
  create(task: Task): Promise<Task>;
  update(update: Partial<Task> & { id: string }): Promise<Task | null>;
  delete(id: string): Promise<boolean>;
}