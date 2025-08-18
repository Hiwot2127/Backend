import { v4 as uuidv4 } from 'uuid';
import { Task } from '../../domain/types/task.js';
import { TaskRepository } from '../../domain/repositories/TaskRepository.js';

export class GetTask { constructor(private readonly repo: TaskRepository) {} execute(id: string) { return this.repo.findById(id); } }

export class CreateTask {
  constructor(private readonly repo: TaskRepository) {}
  async execute(input: { title: string; description?: string | null; userId: string }): Promise<Task> {
    const task: Task = { id: uuidv4(), title: input.title.trim(), completed: false, createdAt: new Date(), userId: input.userId, description: input.description ?? undefined };
    return this.repo.create(task);
  }
}

export class UpdateTask { constructor(private readonly repo: TaskRepository) {} execute(update: Partial<Task> & { id: string }) { return this.repo.update(update); } }

export class DeleteTask { constructor(private readonly repo: TaskRepository) {} execute(id: string) { return this.repo.delete(id); } }