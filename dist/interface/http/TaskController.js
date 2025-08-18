var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
import { LocalFileStorage } from '../../infrastructure/storage/LocalFileStorage.js';
export class TaskController {
    constructor(listTasks, getTaskUC, createTaskUC, updateTaskUC, deleteTaskUC, uploadUC, storage = new LocalFileStorage()) {
        this.listTasks = listTasks;
        this.getTaskUC = getTaskUC;
        this.createTaskUC = createTaskUC;
        this.updateTaskUC = updateTaskUC;
        this.deleteTaskUC = deleteTaskUC;
        this.uploadUC = uploadUC;
        this.storage = storage;
        this.list = (req, res) => __awaiter(this, void 0, void 0, function* () {
            var _a, _b, _c, _d;
            const user = req.user;
            const includeAll = user.role === 'ADMIN' && req.query.all === '1';
            const completed = req.query.completed === 'true' ? true : req.query.completed === 'false' ? false : undefined;
            const result = yield this.listTasks.execute({
                filters: {
                    userId: user.userId,
                    includeAll,
                    q: typeof req.query.q === 'string' ? req.query.q : undefined,
                    completed,
                    from: typeof req.query.from === 'string' ? req.query.from : undefined,
                    to: typeof req.query.to === 'string' ? req.query.to : undefined,
                    hasAttachment: req.query.hasAttachment === 'true' ? true : req.query.hasAttachment === 'false' ? false : undefined
                },
                page: parseInt(String((_a = req.query.page) !== null && _a !== void 0 ? _a : '1'), 10),
                limit: parseInt(String((_b = req.query.limit) !== null && _b !== void 0 ? _b : '10'), 10),
                sortBy: (_c = req.query.sortBy) !== null && _c !== void 0 ? _c : 'createdAt',
                sortDir: (_d = req.query.sortDir) !== null && _d !== void 0 ? _d : 'desc'
            });
            res.json({ data: result.data.map(t => (Object.assign(Object.assign({}, t), { createdAt: t.createdAt.toISOString() }))), meta: result.meta });
        });
        this.get = (req, res) => __awaiter(this, void 0, void 0, function* () {
            const user = req.user;
            const task = yield this.getTaskUC.execute(req.params.id);
            if (!task)
                return res.status(404).json({ error: 'Task not found' });
            if (task.userId !== user.userId && user.role !== 'ADMIN')
                return res.status(403).json({ error: 'Forbidden' });
            res.json(Object.assign(Object.assign({}, task), { createdAt: task.createdAt.toISOString() }));
        });
        this.create = (req, res) => __awaiter(this, void 0, void 0, function* () {
            const { title, description } = req.body;
            if (typeof title !== 'string' || !title.trim())
                return res.status(400).json({ error: 'Title required.' });
            const created = yield this.createTaskUC.execute({ title, description, userId: req.user.userId });
            res.status(201).json(Object.assign(Object.assign({}, created), { createdAt: created.createdAt.toISOString() }));
        });
        this.update = (req, res) => __awaiter(this, void 0, void 0, function* () {
            const user = req.user;
            const existing = yield this.getTaskUC.execute(req.params.id);
            if (!existing)
                return res.status(404).json({ error: 'Task not found.' });
            if (existing.userId !== user.userId && user.role !== 'ADMIN')
                return res.status(403).json({ error: 'Forbidden' });
            const { title, completed, description } = req.body;
            const update = { id: existing.id };
            if (title !== undefined)
                update.title = title;
            if (completed !== undefined)
                update.completed = completed;
            if (description !== undefined)
                update.description = description;
            const updated = yield this.updateTaskUC.execute(update);
            if (!updated)
                return res.status(400).json({ error: 'No valid fields.' });
            res.json(Object.assign(Object.assign({}, updated), { createdAt: updated.createdAt.toISOString() }));
        });
        this.delete = (req, res) => __awaiter(this, void 0, void 0, function* () {
            const user = req.user;
            const existing = yield this.getTaskUC.execute(req.params.id);
            if (!existing)
                return res.status(404).json({ error: 'Task not found' });
            if (existing.userId !== user.userId && user.role !== 'ADMIN')
                return res.status(403).json({ error: 'Forbidden' });
            const ok = yield this.deleteTaskUC.execute(req.params.id);
            if (!ok)
                return res.status(404).json({ error: 'Task not found' });
            res.json({ message: 'Task deleted successfully.' });
        });
        this.upload = (req, res) => __awaiter(this, void 0, void 0, function* () {
            const user = req.user;
            const existing = yield this.getTaskUC.execute(req.params.id);
            if (!existing)
                return res.status(404).json({ error: 'Task not found' });
            if (existing.userId !== user.userId && user.role !== 'ADMIN')
                return res.status(403).json({ error: 'Forbidden' });
            if (!req.file)
                return res.status(400).json({ error: 'No file uploaded.' });
            const relative = this.storage.toRelative(req.file.path);
            const updated = yield this.uploadUC.execute({ taskId: existing.id, relativePath: relative });
            if (!updated)
                return res.status(500).json({ error: 'Failed to save attachment.' });
            const url = this.storage.toPublicUrl(`${req.protocol}://${req.get('host')}`, relative);
            res.json({ message: 'File uploaded.', attachmentPath: relative, url });
        });
    }
}
