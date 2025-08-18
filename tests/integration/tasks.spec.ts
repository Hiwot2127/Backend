import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import request from 'supertest';
import fs from 'node:fs';
import path from 'node:path';
import app from '../../app.js';
import { prisma } from '../../infrastructure/prisma/client.js';

async function resetDatabase() {
  await prisma.task.deleteMany({});
  await prisma.user.deleteMany({});
}

function cleanupUploads() {
  const dir = path.resolve(process.cwd(), 'uploads');
  if (!fs.existsSync(dir)) return;
  for (const name of fs.readdirSync(dir)) {
    try { fs.unlinkSync(path.join(dir, name)); } catch {}
  }
}

describe('Task API integration', () => {
  let userToken = '';
  let adminToken = '';
  let taskId = '';

  beforeAll(async () => {
    await resetDatabase();
    cleanupUploads();

    await request(app).post('/auth/register').send({ email: 'user@test.com', password: 'Pass123!' });
    const loginRes = await request(app).post('/auth/login').send({ email: 'user@test.com', password: 'Pass123!' });
    userToken = loginRes.body.token;

    const admin = await prisma.user.create({ data: { email: 'admin@test.com', password: 'hashed', role: 'ADMIN' } });
    const jwt = await import('jsonwebtoken');
    adminToken = jwt.sign({ userId: admin.id, role: 'ADMIN' }, process.env.JWT_SECRET || 'dev-secret', { expiresIn: '1h' });
  });

  afterAll(async () => {
    cleanupUploads();
    await resetDatabase();
    await prisma.$disconnect();
  });

  it('creates a task', async () => {
    const res = await request(app)
      .post('/todos')
      .set('Authorization', `Bearer ${userToken}`)
      .send({ title: 'My Task', description: 'demo' });

    expect(res.status).toBe(201);
    expect(res.body.title).toBe('My Task');
    taskId = res.body.id;
  });

  it('lists only own tasks for USER', async () => {
    const res = await request(app)
      .get('/todos')
      .set('Authorization', `Bearer ${userToken}`);

    expect(res.status).toBe(200);
    expect(Array.isArray(res.body.data ?? res.body)).toBe(true);
    expect(res.body.data[0].title).toBe('My Task');
  });

  it('updates a task', async () => {
    const res = await request(app)
      .put(`/todos/${taskId}`)
      .set('Authorization', `Bearer ${userToken}`)
      .send({ completed: true });

    expect(res.status).toBe(200);
    expect(res.body.completed).toBe(true);
  });

  it('uploads an attachment', async () => {
    const tmpFile = path.resolve(process.cwd(), 'uploads', 'test-upload.txt');
    fs.writeFileSync(tmpFile, 'hello upload');

    const res = await request(app)
      .post(`/todos/${taskId}/upload`)
      .set('Authorization', `Bearer ${userToken}`)
      .attach('file', tmpFile);

    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty('attachmentPath');
    expect(res.body).toHaveProperty('url');
    const rel = res.body.attachmentPath as string;
    const abs = path.resolve(process.cwd(), rel);
    expect(fs.existsSync(abs)).toBe(true);
  });

  it('admin can list all tasks', async () => {
    const res = await request(app)
      .get('/todos?all=1')
      .set('Authorization', `Bearer ${adminToken}`);

    expect(res.status).toBe(200);
    const data = (res.body.data ?? res.body) as any[];
    expect(Array.isArray(data)).toBe(true);
    expect(data.length).toBeGreaterThan(0);
  });

  it('deletes a task', async () => {
    const res = await request(app)
      .delete(`/todos/${taskId}`)
      .set('Authorization', `Bearer ${userToken}`);

    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty('message');
  });
});