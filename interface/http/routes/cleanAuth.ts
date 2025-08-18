import { Router, Request, Response } from 'express';
import { authenticateJWT, authorizeRoles } from '../../../middleware/auth.js';
import { AuthController } from '../AuthController.js';

export function bindAuthRoutes(controller: AuthController) {
  const router = Router();

  router.post('/register', controller.register);
  router.post('/login', controller.login);

  router.get('/me', authenticateJWT, (req: Request, res: Response) => {
    res.json({ id: req.user!.userId, role: req.user!.role });
  });

  router.post('/promote/:id', authenticateJWT, authorizeRoles('ADMIN'), controller.promote);

  router.get('/health', (_req, res) => res.json({ ok: true }));

  return router;
}