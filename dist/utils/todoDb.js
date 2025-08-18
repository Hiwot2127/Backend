var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __rest = (this && this.__rest) || function (s, e) {
    var t = {};
    for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p) && e.indexOf(p) < 0)
        t[p] = s[p];
    if (s != null && typeof Object.getOwnPropertySymbols === "function")
        for (var i = 0, p = Object.getOwnPropertySymbols(s); i < p.length; i++) {
            if (e.indexOf(p[i]) < 0 && Object.prototype.propertyIsEnumerable.call(s, p[i]))
                t[p[i]] = s[p[i]];
        }
    return t;
};
import { PrismaClient } from '@prisma/client';
export const prisma = new PrismaClient();
function resolveOrder(sortBy, sortDir) {
    const allowedBy = ['createdAt', 'title', 'completed'];
    const by = allowedBy.includes(String(sortBy)) ? sortBy : 'createdAt';
    const dir = sortDir === 'asc' ? 'asc' : 'desc';
    return { [by]: dir };
}
function resolveWhere(opts) {
    const { userId, includeAll, q, completed, from, to, hasAttachment } = opts;
    const where = {};
    if (!includeAll && userId)
        where.userId = userId;
    if (q && q.trim()) {
        where.OR = [
            { title: { contains: q.trim(), mode: 'insensitive' } },
            { description: { contains: q.trim(), mode: 'insensitive' } }
        ];
    }
    if (typeof completed === 'boolean')
        where.completed = completed;
    const createdAt = {};
    if (from) {
        const d = new Date(from);
        if (!isNaN(d.getTime()))
            createdAt.gte = d;
    }
    if (to) {
        const d = new Date(to);
        if (!isNaN(d.getTime()))
            createdAt.lte = d;
    }
    if (Object.keys(createdAt).length)
        where.createdAt = createdAt;
    if (hasAttachment === true)
        where.attachmentPath = { not: null };
    if (hasAttachment === false)
        where.attachmentPath = null;
    return Object.keys(where).length ? where : undefined;
}
export function getTasks(opts) {
    return __awaiter(this, void 0, void 0, function* () {
        const { userId, includeAll, skip, take, sortBy, sortDir, q, completed, from, to, hasAttachment } = opts;
        return prisma.task.findMany({
            where: resolveWhere({ userId, includeAll, q, completed, from, to, hasAttachment }),
            orderBy: resolveOrder(sortBy, sortDir),
            skip,
            take
        });
    });
}
export function countTasks(opts) {
    return __awaiter(this, void 0, void 0, function* () {
        const { userId, includeAll, q, completed, from, to, hasAttachment } = opts;
        return prisma.task.count({
            where: resolveWhere({ userId, includeAll, q, completed, from, to, hasAttachment })
        });
    });
}
export function getTask(id) {
    return __awaiter(this, void 0, void 0, function* () {
        return prisma.task.findUnique({ where: { id } });
    });
}
export function createTask(task) {
    return __awaiter(this, void 0, void 0, function* () {
        return prisma.task.create({ data: task });
    });
}
export function updateTask(update) {
    return __awaiter(this, void 0, void 0, function* () {
        const { id } = update, rest = __rest(update, ["id"]);
        if (!id)
            return null;
        const data = {};
        if (rest.title !== undefined)
            data.title = rest.title;
        if (rest.completed !== undefined)
            data.completed = rest.completed;
        if (rest.description !== undefined)
            data.description = rest.description;
        if (rest.attachmentPath !== undefined)
            data.attachmentPath = rest.attachmentPath;
        if (Object.keys(data).length === 0)
            return null;
        try {
            return yield prisma.task.update({ where: { id }, data });
        }
        catch (_a) {
            return null;
        }
    });
}
export function deleteTask(id) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const deleted = yield prisma.task.deleteMany({ where: { id } });
            return deleted.count > 0;
        }
        catch (_a) {
            return false;
        }
    });
}
