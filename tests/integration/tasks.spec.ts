import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import request from 'supertest';
import app from '../../app.js';
import { prisma } from '../../infrastructure/prisma/client.js';

let token: string;
let createdTaskId: string;

beforeAll(async () => {
  await prisma.user.deleteMany();
  await prisma.task.deleteMany();

  await request(app)
    .post('/auth/register')
    .send({ email: 'test@example.com', password: 'testpass' });

  const res = await request(app)
    .post('/auth/login')
    .send({ email: 'test@example.com', password: 'testpass' });

  token = res.body.token;
});

afterAll(async () => {
  await prisma.$disconnect();
});

describe('Task API integration', () => {
  it('creates a new task', async () => {
    const res = await request(app)
      .post('/todos')
      .set('Authorization', `Bearer ${token}`)
      .send({ title: 'Integration Task', description: 'desc' });

    expect(res.status).toBe(201);
    expect(res.body.title).toBe('Integration Task');
    createdTaskId = res.body.id;
  });

  it('gets the created task', async () => {
    const res = await request(app)
      .get(`/todos/${createdTaskId}`)
      .set('Authorization', `Bearer ${token}`);

    expect(res.status).toBe(200);
    expect(res.body.id).toBe(createdTaskId);
    expect(res.body.title).toBe('Integration Task');
  });

  it('updates the task', async () => {
    const res = await request(app)
      .put(`/todos/${createdTaskId}`)
      .set('Authorization', `Bearer ${token}`)
      .send({ title: 'Updated Task', completed: true });

    expect(res.status).toBe(200);
    expect(res.body.title).toBe('Updated Task');
    expect(res.body.completed).toBe(true);
  });

  it('deletes the task', async () => {
    const res = await request(app)
      .delete(`/todos/${createdTaskId}`)
      .set('Authorization', `Bearer ${token}`);

    expect(res.status).toBe(200);
    expect(res.body.message).toBe('Task deleted successfully.');
  });

  it('returns 404 for deleted task', async () => {
    const res = await request(app)
      .get(`/todos/${createdTaskId}`)
      .set('Authorization', `Bearer ${token}`);

    expect(res.status).toBe(404);
  });
});