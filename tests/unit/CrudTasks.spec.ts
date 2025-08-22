import { describe, it, expect, vi } from 'vitest';
import { CreateTask, GetTask, UpdateTask, DeleteTask } from '../../application/tasks/CrudTasks.js';

function makeMockRepo(overrides: Partial<any> = {}) {
  return {
    list: vi.fn(),
    count: vi.fn(),
    findById: vi.fn(),
    create: vi.fn(),
    update: vi.fn(),
    delete: vi.fn(),
    ...overrides
  };
}

describe('CreateTask', () => {
  it('creates a task with trimmed title and default completed', async () => {
    const repo = makeMockRepo({
      create: vi.fn(async (task) => ({ ...task, id: 'id', createdAt: new Date() }))
    });
    const useCase = new CreateTask(repo);

    const input = { title: '  My Task  ', userId: 'u1', description: 'desc' };
    const result = await useCase.execute(input);

    expect(result.title).toBe('My Task');
    expect(result.completed).toBe(false);
    expect(result.userId).toBe('u1');
    expect(result.description).toBe('desc');
    expect(typeof result.id).toBe('string');
    expect(result.createdAt instanceof Date).toBe(true);
  });
});

describe('GetTask', () => {
  it('returns the task if found', async () => {
    const repo = makeMockRepo({
      findById: vi.fn(async (id) => ({ id, title: 'T', userId: 'u1', completed: false, createdAt: new Date() }))
    });
    const useCase = new GetTask(repo);

    const result = await useCase.execute('abc');
    expect(result).not.toBeNull();
    expect(result!.id).toBe('abc');
  });

  it('returns null if not found', async () => {
    const repo = makeMockRepo({
      findById: vi.fn(async () => null)
    });
    const useCase = new GetTask(repo);

    const result = await useCase.execute('missing');
    expect(result).toBeNull();
  });
});

describe('UpdateTask', () => {
  it('updates fields and returns updated task', async () => {
    const repo = makeMockRepo({
      update: vi.fn(async (update) => ({ ...update }))
    });
    const useCase = new UpdateTask(repo);

    const update = { id: 'abc', title: 'New', completed: true };
    const result = await useCase.execute(update);

    expect(result).not.toBeNull();
    expect(result!.title).toBe('New');
    expect(result!.completed).toBe(true);
  });

  it('returns null if no fields to update', async () => {
    const repo = makeMockRepo({
      update: vi.fn(async () => null)
    });
    const useCase = new UpdateTask(repo);

    const result = await useCase.execute({ id: 'abc' });
    expect(result).toBeNull();
  });
});

describe('DeleteTask', () => {
  it('returns true when delete succeeds', async () => {
    const repo = makeMockRepo({
      delete: vi.fn(async () => true)
    });
    const useCase = new DeleteTask(repo);

    const result = await useCase.execute('abc');
    expect(result).toBe(true);
  });

  it('returns false when delete fails', async () => {
    const repo = makeMockRepo({
      delete: vi.fn(async () => false)
    });
    const useCase = new DeleteTask(repo);

    const result = await useCase.execute('missing');
    expect(result).toBe(false);
  });
});