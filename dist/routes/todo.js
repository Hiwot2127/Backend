var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
import { Router } from 'express';
import { getTasks, getTask, createTask, updateTask, deleteTask, countTasks } from '../utils/todoDb.js';
import { v4 as uuidv4 } from 'uuid';
import { authenticateJWT } from '../middleware/auth.js';
const router = Router();
router.use(authenticateJWT);
router.get('/', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a, _b;
    const user = req.user;
    const includeAll = user.role === 'ADMIN' && req.query.all === '1';
    const page = Math.max(parseInt(String((_a = req.query.page) !== null && _a !== void 0 ? _a : '1'), 10) || 1, 1);
    const limit = Math.min(Math.max(parseInt(String((_b = req.query.limit) !== null && _b !== void 0 ? _b : '10'), 10) || 10, 1), 100);
    const skip = (page - 1) * limit;
    const sortBy = typeof req.query.sortBy === 'string' ? req.query.sortBy : undefined;
    const sortDir = req.query.sortDir === 'asc' || req.query.sortDir === 'desc' ? req.query.sortDir : undefined;
    const q = typeof req.query.q === 'string' ? req.query.q : undefined;
    const completed = req.query.completed === 'true' ? true :
        req.query.completed === 'false' ? false : undefined;
    const from = typeof req.query.from === 'string' ? req.query.from : undefined;
    const to = typeof req.query.to === 'string' ? req.query.to : undefined;
    const hasAttachment = req.query.hasAttachment === 'true' ? true :
        req.query.hasAttachment === 'false' ? false : undefined;
    const [tasks, total] = yield Promise.all([
        getTasks({ userId: user.userId, includeAll, skip, take: limit, sortBy, sortDir, q, completed, from, to, hasAttachment }),
        countTasks({ userId: user.userId, includeAll, q, completed, from, to, hasAttachment })
    ]);
    res.json({
        data: tasks.map(t => (Object.assign(Object.assign({}, t), { createdAt: t.createdAt.toISOString() }))),
        meta: {
            page,
            limit,
            total,
            totalPages: Math.max(Math.ceil(total / limit), 1),
            hasPrev: page > 1,
            hasNext: page * limit < total,
            sortBy: sortBy !== null && sortBy !== void 0 ? sortBy : 'createdAt',
            sortDir: sortDir !== null && sortDir !== void 0 ? sortDir : 'desc'
        }
    });
}));
router.get('/:id', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const user = req.user;
    const task = yield getTask(req.params.id);
    if (!task)
        return res.status(404).json({ error: 'Task not found' });
    if (task.userId !== user.userId && user.role !== 'ADMIN')
        return res.status(403).json({ error: 'Forbidden' });
    res.json(Object.assign(Object.assign({}, task), { createdAt: task.createdAt.toISOString() }));
}));
router.post('/', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { title, description } = req.body;
    if (typeof title !== 'string' || !title.trim())
        return res.status(400).json({ error: 'Title required.' });
    const user = req.user;
    const task = {
        id: uuidv4(),
        title: title.trim(),
        completed: false,
        createdAt: new Date(),
        userId: user.userId,
        description: typeof description === 'string' ? description : undefined
    };
    const created = yield createTask(task);
    res.status(201).json(Object.assign(Object.assign({}, created), { createdAt: created.createdAt.toISOString() }));
}));
router.put('/:id', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const user = req.user;
    const existing = yield getTask(req.params.id);
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
    const updated = yield updateTask(update);
    if (!updated)
        return res.status(400).json({ error: 'No valid fields.' });
    res.json(Object.assign(Object.assign({}, updated), { createdAt: updated.createdAt.toISOString() }));
}));
router.delete('/:id', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const user = req.user;
    const existing = yield getTask(req.params.id);
    if (!existing)
        return res.status(404).json({ error: 'Task not found' });
    if (existing.userId !== user.userId && user.role !== 'ADMIN')
        return res.status(403).json({ error: 'Forbidden' });
    const ok = yield deleteTask(req.params.id);
    if (!ok)
        return res.status(404).json({ error: 'Task not found' });
    res.json({ message: 'Task deleted successfully.' });
}));
export default router;
