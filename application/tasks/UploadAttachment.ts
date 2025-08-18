import { TaskRepository } from '../../domain/repositories/TaskRepository.js';
import { Task } from '../../domain/types/task.js';

export class UploadAttachment {
  constructor(private readonly repo: TaskRepository) {}

  async execute(input: { taskId: string; relativePath: string }): Promise<Task | null> {
    return this.repo.update({ id: input.taskId, attachmentPath: input.relativePath });
  }
}