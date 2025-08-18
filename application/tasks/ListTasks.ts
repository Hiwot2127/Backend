import { Task } from '../../domain/types/task.js';
import { TaskRepository } from '../../domain/repositories/TaskRepository.js';
import { TaskFilters, TaskSortBy, TaskSortDir } from '../../domain/types/task.js';

export type PagedResult<T> = {
  data: T[];
  meta: { page: number; limit: number; total: number; totalPages: number; hasPrev: boolean; hasNext: boolean; sortBy: TaskSortBy; sortDir: TaskSortDir; };
};

export class ListTasks {
  constructor(private readonly repo: TaskRepository) {}
  async execute(input: { filters: TaskFilters; page?: number; limit?: number; sortBy?: TaskSortBy; sortDir?: TaskSortDir; }): Promise<PagedResult<Task>> {
    const page = Math.max(parseInt(String(input.page ?? '1'), 10) || 1, 1);
    const limit = Math.min(Math.max(parseInt(String(input.limit ?? '10'), 10) || 10, 1), 100);
    const skip = (page - 1) * limit;
    const sortBy = (input.sortBy ?? 'createdAt') as TaskSortBy;
    const sortDir = (input.sortDir ?? 'desc') as TaskSortDir;
    const [data, total] = await Promise.all([
      this.repo.list({ filters: input.filters, skip, take: limit, sortBy, sortDir }),
      this.repo.count(input.filters)
    ]);
    return { data, meta: { page, limit, total, totalPages: Math.max(Math.ceil(total / limit), 1), hasPrev: page > 1, hasNext: page * limit < total, sortBy, sortDir } };
  }
}