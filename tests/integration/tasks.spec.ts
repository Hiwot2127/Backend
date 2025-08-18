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

it('rejects creating a task without a title', async () => {
  const res = await request(app)
    .post('/todos')
    .set('Authorization', `Bearer ${userToken}`)
    .send({ description: 'no title' });

  expect(res.status).toBe(400);
  expect(res.body).toHaveProperty('error');
});

it('rejects unauthorized access to another user\'s task', async () => {
  await request(app).post('/auth/register').send({ email: 'other@test.com', password: 'Pass123!' });
  const loginRes = await request(app).post('/auth/login').send({ email: 'other@test.com', password: 'Pass123!' });
  const otherToken = loginRes.body.token;

  const resCreate = await request(app)
    .post('/todos')
    .set('Authorization', `Bearer ${otherToken}`)
    .send({ title: 'Other Task' });

  const otherTaskId = resCreate.body.id;

  const resGet = await request(app)
    .get(`/todos/${otherTaskId}`)
    .set('Authorization', `Bearer ${userToken}`);

  expect(resGet.status).toBe(403);

  const resUpdate = await request(app)
    .put(`/todos/${otherTaskId}`)
    .set('Authorization', `Bearer ${userToken}`)
    .send({ title: 'Hacked' });

  expect(resUpdate.status).toBe(403);

  const resDelete = await request(app)
    .delete(`/todos/${otherTaskId}`)
    .set('Authorization', `Bearer ${userToken}`);

  expect(resDelete.status).toBe(403);
});

it('returns 404 for non-existent task', async () => {
  const fakeId = '00000000-0000-0000-0000-000000000000';

  const resGet = await request(app)
    .get(`/todos/${fakeId}`)
    .set('Authorization', `Bearer ${userToken}`);
  expect(resGet.status).toBe(404);

  const resUpdate = await request(app)
    .put(`/todos/${fakeId}`)
    .set('Authorization', `Bearer ${userToken}`)
    .send({ title: 'Nope' });
  expect(resUpdate.status).toBe(404);

  const resDelete = await request(app)
    .delete(`/todos/${fakeId}`)
    .set('Authorization', `Bearer ${userToken}`);
  expect(resDelete.status).toBe(404);
});

it('rejects requests without a token', async () => {
  const res = await request(app)
    .get('/todos');
  expect(res.status).toBe(401);
  expect(res.body).toHaveProperty('error');
});

it('only admin can promote a user', async () => {
  await request(app).post('/auth/register').send({ email: 'promote@test.com', password: 'Pass123!' });
  const loginRes = await request(app).post('/auth/login').send({ email: 'promote@test.com', password: 'Pass123!' });
  const promoteUserId = loginRes.body.id || (await prisma.user.findUnique({ where: { email: 'promote@test.com' } }))?.id;

  const resUser = await request(app)
    .post(`/auth/promote/${promoteUserId}`)
    .set('Authorization', `Bearer ${userToken}`);
  expect(resUser.status).toBe(403);

  const resAdmin = await request(app)
    .post(`/auth/promote/${promoteUserId}`)
    .set('Authorization', `Bearer ${adminToken}`);
  expect(resAdmin.status).toBe(200);
  expect(resAdmin.body.role).toBe('ADMIN');
});

it('supports pagination and filtering', async () => {
  for (let i = 0; i < 15; i++) {
    await request(app)
      .post('/todos')
      .set('Authorization', `Bearer ${userToken}`)
      .send({ title: `Task ${i}`, description: 'demo' });
  }
  const res = await request(app)
    .get('/todos?page=2&limit=10')
    .set('Authorization', `Bearer ${userToken}`);
  expect(res.status).toBe(200);
  expect(res.body.meta.page).toBe(2);
  expect(res.body.data.length).toBeGreaterThan(0);
});

it('returns health check', async () => {
  const res = await request(app).get('/auth/health');
  expect(res.status).toBe(200);
  expect(res.body).toHaveProperty('ok', true);
});
});

