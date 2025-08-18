var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
export class ListTasks {
    constructor(repo) {
        this.repo = repo;
    }
    execute(input) {
        return __awaiter(this, void 0, void 0, function* () {
            var _a, _b, _c, _d;
            const page = Math.max(parseInt(String((_a = input.page) !== null && _a !== void 0 ? _a : '1'), 10) || 1, 1);
            const limit = Math.min(Math.max(parseInt(String((_b = input.limit) !== null && _b !== void 0 ? _b : '10'), 10) || 10, 1), 100);
            const skip = (page - 1) * limit;
            const sortBy = ((_c = input.sortBy) !== null && _c !== void 0 ? _c : 'createdAt');
            const sortDir = ((_d = input.sortDir) !== null && _d !== void 0 ? _d : 'desc');
            const [data, total] = yield Promise.all([
                this.repo.list({ filters: input.filters, skip, take: limit, sortBy, sortDir }),
                this.repo.count(input.filters)
            ]);
            return { data, meta: { page, limit, total, totalPages: Math.max(Math.ceil(total / limit), 1), hasPrev: page > 1, hasNext: page * limit < total, sortBy, sortDir } };
        });
    }
}
