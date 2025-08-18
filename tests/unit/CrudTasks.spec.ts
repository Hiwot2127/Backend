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
  it('creates a task with correct fields', async () => {
    const repo = makeMockRepo({ create: vi.fn(async (task) => ({ ...task })) });
    const useCase = new CreateTask(repo);

    const input = { title: 'Test', userId: 'u1', description: 'desc' };
    const result = await useCase.execute(input);

    expect(result.title).toBe('Test');
    expect(result.userId).toBe('u1');
    expect(result.description).toBe('desc');
    expect(repo.create).toHaveBeenCalledWith(expect.objectContaining(input));
  });
});

describe('GetTask', () => {
  it('returns the task by id', async () => {
    const repo = makeMockRepo({ findById: vi.fn(async (id) => ({ id, title: 'T', userId: 'u1', completed: false, createdAt: new Date() })) });
    const useCase = new GetTask(repo);

    const result = await useCase.execute('abc');
    expect(result).not.toBeNull();
    expect(result!.id).toBe('abc');
    expect(repo.findById).toHaveBeenCalledWith('abc');
  });
});

describe('UpdateTask', () => {
  it('updates the task', async () => {
    const repo = makeMockRepo({ update: vi.fn(async (update) => ({ ...update })) });
    const useCase = new UpdateTask(repo);

    const update = { id: 'abc', title: 'New', completed: true };
    const result = await useCase.execute(update);

    expect(result).not.toBeNull();
    expect(result!.id).toBe('abc');
    expect(result!.title).toBe('New');
    expect(result!.completed).toBe(true);
    expect(repo.update).toHaveBeenCalledWith(update);
  });
});

describe('DeleteTask', () => {
  it('deletes the task by id', async () => {
    const repo = makeMockRepo({ delete: vi.fn(async (id) => true) });
    const useCase = new DeleteTask(repo);

    const result = await useCase.execute('abc');
    expect(result).toBe(true);
    expect(repo.delete).toHaveBeenCalledWith('abc');
  });
});