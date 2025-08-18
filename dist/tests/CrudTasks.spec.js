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
import { CreateTask } from '../../application/tasks/CrudTasks.js';
describe('CreateTask', () => {
    it('creates a task with correct fields', () => __awaiter(void 0, void 0, void 0, function* () {
        const repo = { create: vi.fn((task) => __awaiter(void 0, void 0, void 0, function* () { return (Object.assign({}, task)); })) };
        const useCase = new CreateTask(repo);
        const input = { title: 'Test', userId: 'u1', description: 'desc' };
        const result = yield useCase.execute(input);
        expect(result.title).toBe('Test');
        expect(result.userId).toBe('u1');
        expect(result.description).toBe('desc');
        expect(repo.create).toHaveBeenCalledWith(expect.objectContaining(input));
    }));
});
