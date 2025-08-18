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
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { prisma } from '../utils/todoDb.js';
import { authenticateJWT, authorizeRoles } from '../middleware/auth.js';
const router = Router();
router.post('/register', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { email, password } = req.body;
    if (!email || !password)
        return res.status(400).json({ error: 'Email and password required.' });
    const existing = yield prisma.user.findUnique({ where: { email } });
    if (existing)
        return res.status(409).json({ error: 'User already exists.' });
    const hashed = yield bcrypt.hash(password, 10);
    const user = yield prisma.user.create({ data: { email, password: hashed } });
    res.status(201).json({ id: user.id, email: user.email, role: user.role });
}));
router.post('/login', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { email, password } = req.body;
    if (!email || !password)
        return res.status(400).json({ error: 'Email and password required.' });
    const user = yield prisma.user.findUnique({ where: { email } });
    if (!user)
        return res.status(401).json({ error: 'Invalid credentials.' });
    const valid = yield bcrypt.compare(password, user.password);
    if (!valid)
        return res.status(401).json({ error: 'Invalid credentials.' });
    const token = jwt.sign({ userId: user.id, role: user.role }, process.env.JWT_SECRET, { expiresIn: '1h' });
    res.json({ token, role: user.role });
}));
router.post('/promote/:id', authenticateJWT, authorizeRoles('ADMIN'), (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const updated = yield prisma.user.update({ where: { id: req.params.id }, data: { role: 'ADMIN' } }).catch(() => null);
    if (!updated)
        return res.status(404).json({ error: 'User not found.' });
    res.json({ id: updated.id, email: updated.email, role: updated.role });
}));
export default router;
