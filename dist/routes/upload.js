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
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import { authenticateJWT } from '../middleware/auth.js';
import { getTask, updateTask } from '../utils/todoDb.js';
const router = Router();
router.use(authenticateJWT);
const uploadsDir = path.join(process.cwd(), 'uploads');
fs.mkdirSync(uploadsDir, { recursive: true });
const upload = multer({
    dest: uploadsDir,
    limits: { fileSize: 5 * 1024 * 1024 }
});
router.post('/:id/upload', upload.single('file'), (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const user = req.user;
    const task = yield getTask(req.params.id);
    if (!task)
        return res.status(404).json({ error: 'Task not found' });
    if (task.userId !== user.userId && user.role !== 'ADMIN')
        return res.status(403).json({ error: 'Forbidden' });
    if (!req.file)
        return res.status(400).json({ error: 'No file uploaded.' });
    const relativePath = `uploads/${req.file.filename}`;
    const updated = yield updateTask({
        id: task.id,
        attachmentPath: relativePath
    });
    if (!updated)
        return res.status(500).json({ error: 'Failed to save attachment.' });
    const url = `${req.protocol}://${req.get('host')}/${relativePath}`;
    res.json({ message: 'File uploaded.', attachmentPath: relativePath, url });
}));
export default router;
