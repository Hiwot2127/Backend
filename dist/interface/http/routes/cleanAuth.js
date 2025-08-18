import { Router } from 'express';
import { authenticateJWT, authorizeRoles } from '../../../middleware/auth.js';
export function bindAuthRoutes(controller) {
    const router = Router();
    router.post('/register', controller.register);
    router.post('/login', controller.login);
    router.get('/me', authenticateJWT, (req, res) => {
        res.json({ id: req.user.userId, role: req.user.role });
    });
    router.post('/promote/:id', authenticateJWT, authorizeRoles('ADMIN'), controller.promote);
    router.get('/health', (_req, res) => res.json({ ok: true }));
    return router;
}
