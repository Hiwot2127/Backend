import { PrismaClient } from '@prisma/client';
import { TaskRepository } from '../../domain/repositories/TaskRepository.js';
import { Task, TaskFilters, TaskSortBy, TaskSortDir } from '../../domain/types/task.js';

export class PrismaTaskRepository implements TaskRepository {
  constructor(private readonly prisma: PrismaClient) {}

  private resolveOrder(sortBy?: TaskSortBy, sortDir?: TaskSortDir) {
    const by: TaskSortBy = ['createdAt', 'title', 'completed'].includes(String(sortBy)) ? (sortBy as TaskSortBy) : 'createdAt';
    const dir: TaskSortDir = sortDir === 'asc' ? 'asc' : 'desc';
    return { [by]: dir } as Record<string, 'asc' | 'desc'>;
  }

  private resolveWhere(filters: TaskFilters) {
    const { userId, includeAll, q, completed, from, to, hasAttachment } = filters;
    const where: Record<string, any> = {};
    if (!includeAll && userId) where.userId = userId;
    if (q && q.trim()) where.OR = [
      { title: { contains: q.trim(), mode: 'insensitive' } },
      { description: { contains: q.trim(), mode: 'insensitive' } }
    ];
    if (typeof completed === 'boolean') where.completed = completed;
    const createdAt: Record<string, Date> = {};
    if (from) { const d = new Date(from); if (!isNaN(d.getTime())) createdAt.gte = d; }
    if (to) { const d = new Date(to); if (!isNaN(d.getTime())) createdAt.lte = d; }
    if (Object.keys(createdAt).length) where.createdAt = createdAt;
    if (hasAttachment === true) where.attachmentPath = { not: null };
    if (hasAttachment === false) where.attachmentPath = null;
    return Object.keys(where).length ? where : undefined;
  }

  list(opts: { filters: TaskFilters; skip?: number; take?: number; sortBy?: TaskSortBy; sortDir?: TaskSortDir }): Promise<Task[]> {
    const { filters, skip, take, sortBy, sortDir } = opts;
    return this.prisma.task.findMany({
      where: this.resolveWhere(filters),
      orderBy: this.resolveOrder(sortBy, sortDir),
      skip, take
    }) as unknown as Promise<Task[]>;
  }

  count(filters: TaskFilters) {
    return this.prisma.task.count({ where: this.resolveWhere(filters) });
  }

  findById(id: string) {
    return this.prisma.task.findUnique({ where: { id } }) as unknown as Promise<Task | null>;
  }

  create(task: Task) {
    return this.prisma.task.create({ data: task }) as unknown as Promise<Task>;
  }

  async update(update: Partial<Task> & { id: string }) {
    const { id, ...rest } = update;
    const data: any = {};
    if (rest.title !== undefined) data.title = rest.title;
    if (rest.completed !== undefined) data.completed = rest.completed;
    if (rest.description !== undefined) data.description = rest.description;
    if (rest.attachmentPath !== undefined) data.attachmentPath = rest.attachmentPath;
    if (Object.keys(data).length === 0) return null;
    try { return (await this.prisma.task.update({ where: { id }, data })) as unknown as Task; }
    catch { return null; }
  }

  async delete(id: string) {
    try { await this.prisma.task.delete({ where: { id } }); return true; }
    catch { return false; }
  }
}