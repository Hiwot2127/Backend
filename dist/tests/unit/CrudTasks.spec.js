var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
import { describe, it, expect, vi } from 'vitest';
import { CreateTask, GetTask, UpdateTask, DeleteTask } from '../../application/tasks/CrudTasks.js';
function makeMockRepo(overrides = {}) {
    return Object.assign({ list: vi.fn(), count: vi.fn(), findById: vi.fn(), create: vi.fn(), update: vi.fn(), delete: vi.fn() }, overrides);
}
describe('CreateTask', () => {
    it('creates a task with correct fields', () => __awaiter(void 0, void 0, void 0, function* () {
        const repo = makeMockRepo({ create: vi.fn((task) => __awaiter(void 0, void 0, void 0, function* () { return (Object.assign({}, task)); })) });
        const useCase = new CreateTask(repo);
        const input = { title: 'Test', userId: 'u1', description: 'desc' };
        const result = yield useCase.execute(input);
        expect(result.title).toBe('Test');
        expect(result.userId).toBe('u1');
        expect(result.description).toBe('desc');
        expect(repo.create).toHaveBeenCalledWith(expect.objectContaining(input));
    }));
});
describe('GetTask', () => {
    it('returns the task by id', () => __awaiter(void 0, void 0, void 0, function* () {
        const repo = makeMockRepo({ findById: vi.fn((id) => __awaiter(void 0, void 0, void 0, function* () { return ({ id, title: 'T', userId: 'u1', completed: false, createdAt: new Date() }); })) });
        const useCase = new GetTask(repo);
        const result = yield useCase.execute('abc');
        expect(result).not.toBeNull();
        expect(result.id).toBe('abc');
        expect(repo.findById).toHaveBeenCalledWith('abc');
    }));
});
describe('UpdateTask', () => {
    it('updates the task', () => __awaiter(void 0, void 0, void 0, function* () {
        const repo = makeMockRepo({ update: vi.fn((update) => __awaiter(void 0, void 0, void 0, function* () { return (Object.assign({}, update)); })) });
        const useCase = new UpdateTask(repo);
        const update = { id: 'abc', title: 'New', completed: true };
        const result = yield useCase.execute(update);
        expect(result).not.toBeNull();
        expect(result.id).toBe('abc');
        expect(result.title).toBe('New');
        expect(result.completed).toBe(true);
        expect(repo.update).toHaveBeenCalledWith(update);
    }));
});
describe('DeleteTask', () => {
    it('deletes the task by id', () => __awaiter(void 0, void 0, void 0, function* () {
        const repo = makeMockRepo({ delete: vi.fn((id) => __awaiter(void 0, void 0, void 0, function* () { return true; })) });
        const useCase = new DeleteTask(repo);
        const result = yield useCase.execute('abc');
        expect(result).toBe(true);
        expect(repo.delete).toHaveBeenCalledWith('abc');
    }));
});
