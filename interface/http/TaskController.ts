import { Request, Response } from 'express';
import { ListTasks } from '../../application/tasks/ListTasks.js';
import { GetTask, CreateTask, UpdateTask, DeleteTask } from '../../application/tasks/CrudTasks.js';
import { UploadAttachment } from '../../application/tasks/UploadAttachment.js';
import { LocalFileStorage } from '../../infrastructure/storage/LocalFileStorage.js';

export class TaskController {
  constructor(
    private readonly listTasks: ListTasks,
    private readonly getTaskUC: GetTask,
    private readonly createTaskUC: CreateTask,
    private readonly updateTaskUC: UpdateTask,
    private readonly deleteTaskUC: DeleteTask,
    private readonly uploadUC: UploadAttachment,
    private readonly storage = new LocalFileStorage()
  ) {}

  list = async (req: Request, res: Response) => {
    const user = req.user!;
    const includeAll = user.role === 'ADMIN' && req.query.all === '1';
    const completed = req.query.completed === 'true' ? true : req.query.completed === 'false' ? false : undefined;
    const result = await this.listTasks.execute({
      filters: {
        userId: user.userId,
        includeAll,
        q: typeof req.query.q === 'string' ? req.query.q : undefined,
        completed,
        from: typeof req.query.from === 'string' ? req.query.from : undefined,
        to: typeof req.query.to === 'string' ? req.query.to : undefined,
        hasAttachment: req.query.hasAttachment === 'true' ? true : req.query.hasAttachment === 'false' ? false : undefined
      },
      page: parseInt(String(req.query.page ?? '1'), 10),
      limit: parseInt(String(req.query.limit ?? '10'), 10),
      sortBy: (req.query.sortBy as any) ?? 'createdAt',
      sortDir: (req.query.sortDir as any) ?? 'desc'
    });
    res.json({ data: result.data.map(t => ({ ...t, createdAt: t.createdAt.toISOString() })), meta: result.meta });
  };

  get = async (req: Request, res: Response) => {
    const user = req.user!;
    const task = await this.getTaskUC.execute(req.params.id);
    if (!task) return res.status(404).json({ error: 'Task not found' });
    if (task.userId !== user.userId && user.role !== 'ADMIN') return res.status(403).json({ error: 'Forbidden' });
    res.json({ ...task, createdAt: task.createdAt.toISOString() });
  };

  create = async (req: Request, res: Response) => {
    const { title, description } = req.body;
    if (typeof title !== 'string' || !title.trim()) return res.status(400).json({ error: 'Title required.' });
    const created = await this.createTaskUC.execute({ title, description, userId: req.user!.userId });
    res.status(201).json({ ...created, createdAt: created.createdAt.toISOString() });
  };

  update = async (req: Request, res: Response) => {
    const user = req.user!;
    const existing = await this.getTaskUC.execute(req.params.id);
    if (!existing) return res.status(404).json({ error: 'Task not found.' });
    if (existing.userId !== user.userId && user.role !== 'ADMIN') return res.status(403).json({ error: 'Forbidden' });
    const { title, completed, description } = req.body;
    const update: any = { id: existing.id };
    if (title !== undefined) update.title = title;
    if (completed !== undefined) update.completed = completed;
    if (description !== undefined) update.description = description;
    const updated = await this.updateTaskUC.execute(update);
    if (!updated) return res.status(400).json({ error: 'No valid fields.' });
    res.json({ ...updated, createdAt: updated.createdAt.toISOString() });
  };

  delete = async (req: Request, res: Response) => {
    const user = req.user!;
    const existing = await this.getTaskUC.execute(req.params.id);
    if (!existing) return res.status(404).json({ error: 'Task not found' });
    if (existing.userId !== user.userId && user.role !== 'ADMIN') return res.status(403).json({ error: 'Forbidden' });
    const ok = await this.deleteTaskUC.execute(req.params.id);
    if (!ok) return res.status(404).json({ error: 'Task not found' });
    res.json({ message: 'Task deleted successfully.' });
  };

  upload = async (req: Request, res: Response) => {
    const user = req.user!;
    const existing = await this.getTaskUC.execute(req.params.id);
    if (!existing) return res.status(404).json({ error: 'Task not found' });
    if (existing.userId !== user.userId && user.role !== 'ADMIN') return res.status(403).json({ error: 'Forbidden' });
    if (!req.file) return res.status(400).json({ error: 'No file uploaded.' });
    const relative = this.storage.toRelative(req.file.path);
    const updated = await this.uploadUC.execute({ taskId: existing.id, relativePath: relative });
    if (!updated) return res.status(500).json({ error: 'Failed to save attachment.' });
    const url = this.storage.toPublicUrl(`${req.protocol}://${req.get('host')}`, relative);
    res.json({ message: 'File uploaded.', attachmentPath: relative, url });
  };
}