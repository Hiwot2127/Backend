var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
import { v4 as uuidv4 } from 'uuid';
export class GetTask {
    constructor(repo) {
        this.repo = repo;
    }
    execute(id) { return this.repo.findById(id); }
}
export class CreateTask {
    constructor(repo) {
        this.repo = repo;
    }
    execute(input) {
        return __awaiter(this, void 0, void 0, function* () {
            var _a;
            const task = { id: uuidv4(), title: input.title.trim(), completed: false, createdAt: new Date(), userId: input.userId, description: (_a = input.description) !== null && _a !== void 0 ? _a : undefined };
            return this.repo.create(task);
        });
    }
}
export class UpdateTask {
    constructor(repo) {
        this.repo = repo;
    }
    execute(update) { return this.repo.update(update); }
}
export class DeleteTask {
    constructor(repo) {
        this.repo = repo;
    }
    execute(id) { return this.repo.delete(id); }
}
