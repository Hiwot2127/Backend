import { Router } from 'express';
import multer from 'multer';
import path from 'node:path';
import fs from 'node:fs';
import { authenticateJWT } from '../../../middleware/auth.js';
import { TaskController } from '../TaskController.js';

export function bindTaskRoutes(controller: TaskController) {
  const router = Router();
  router.use(authenticateJWT);

  const uploadsDir = path.resolve(process.cwd(), 'uploads');
  fs.mkdirSync(uploadsDir, { recursive: true });
  const upload = multer({ dest: uploadsDir, limits: { fileSize: 5 * 1024 * 1024 } });

  router.get('/', controller.list);
  router.get('/:id', controller.get);
  router.post('/', controller.create);
  router.put('/:id', controller.update);
  router.delete('/:id', controller.delete);
  router.post('/:id/upload', upload.single('file'), controller.upload);

  return router;
}