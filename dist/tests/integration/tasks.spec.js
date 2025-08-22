var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import request from 'supertest';
import fs from 'node:fs';
import path from 'node:path';
import app from '../../app.js';
import { prisma } from '../../infrastructure/prisma/client.js';
function resetDatabase() {
    return __awaiter(this, void 0, void 0, function* () {
        yield prisma.task.deleteMany({});
        yield prisma.user.deleteMany({});
    });
}
function cleanupUploads() {
    const dir = path.resolve(process.cwd(), 'uploads');
    if (!fs.existsSync(dir))
        return;
    for (const name of fs.readdirSync(dir)) {
        try {
            fs.unlinkSync(path.join(dir, name));
        }
        catch (_a) { }
    }
}
describe('Task API integration', () => {
    let userToken = '';
    let adminToken = '';
    let taskId = '';
    beforeAll(() => __awaiter(void 0, void 0, void 0, function* () {
        yield resetDatabase();
        cleanupUploads();
        yield request(app).post('/auth/register').send({ email: 'user@test.com', password: 'Pass123!' });
        const loginRes = yield request(app).post('/auth/login').send({ email: 'user@test.com', password: 'Pass123!' });
        userToken = loginRes.body.token;
        const admin = yield prisma.user.create({ data: { email: 'admin@test.com', password: 'hashed', role: 'ADMIN' } });
        const jwt = yield import('jsonwebtoken');
        adminToken = jwt.sign({ userId: admin.id, role: 'ADMIN' }, process.env.JWT_SECRET || 'dev-secret', { expiresIn: '1h' });
    }));
    afterAll(() => __awaiter(void 0, void 0, void 0, function* () {
        cleanupUploads();
        yield resetDatabase();
        yield prisma.$disconnect();
    }));
    it('creates a task', () => __awaiter(void 0, void 0, void 0, function* () {
        const res = yield request(app)
            .post('/todos')
            .set('Authorization', `Bearer ${userToken}`)
            .send({ title: 'My Task', description: 'demo' });
        expect(res.status).toBe(201);
        expect(res.body.title).toBe('My Task');
        taskId = res.body.id;
    }));
    it('lists only own tasks for USER', () => __awaiter(void 0, void 0, void 0, function* () {
        var _a;
        const res = yield request(app)
            .get('/todos')
            .set('Authorization', `Bearer ${userToken}`);
        expect(res.status).toBe(200);
        expect(Array.isArray((_a = res.body.data) !== null && _a !== void 0 ? _a : res.body)).toBe(true);
        expect(res.body.data[0].title).toBe('My Task');
    }));
    it('updates a task', () => __awaiter(void 0, void 0, void 0, function* () {
        const res = yield request(app)
            .put(`/todos/${taskId}`)
            .set('Authorization', `Bearer ${userToken}`)
            .send({ completed: true });
        expect(res.status).toBe(200);
        expect(res.body.completed).toBe(true);
    }));
    it('uploads an attachment', () => __awaiter(void 0, void 0, void 0, function* () {
        const tmpFile = path.resolve(process.cwd(), 'uploads', 'test-upload.txt');
        fs.writeFileSync(tmpFile, 'hello upload');
        const res = yield request(app)
            .post(`/todos/${taskId}/upload`)
            .set('Authorization', `Bearer ${userToken}`)
            .attach('file', tmpFile);
        expect(res.status).toBe(200);
        expect(res.body).toHaveProperty('attachmentPath');
        expect(res.body).toHaveProperty('url');
        const rel = res.body.attachmentPath;
        const abs = path.resolve(process.cwd(), rel);
        expect(fs.existsSync(abs)).toBe(true);
    }));
    it('admin can list all tasks', () => __awaiter(void 0, void 0, void 0, function* () {
        var _a;
        const res = yield request(app)
            .get('/todos?all=1')
            .set('Authorization', `Bearer ${adminToken}`);
        expect(res.status).toBe(200);
        const data = ((_a = res.body.data) !== null && _a !== void 0 ? _a : res.body);
        expect(Array.isArray(data)).toBe(true);
        expect(data.length).toBeGreaterThan(0);
    }));
    it('deletes a task', () => __awaiter(void 0, void 0, void 0, function* () {
        const res = yield request(app)
            .delete(`/todos/${taskId}`)
            .set('Authorization', `Bearer ${userToken}`);
        expect(res.status).toBe(200);
        expect(res.body).toHaveProperty('message');
    }));
    it('rejects creating a task without a title', () => __awaiter(void 0, void 0, void 0, function* () {
        const res = yield request(app)
            .post('/todos')
            .set('Authorization', `Bearer ${userToken}`)
            .send({ description: 'no title' });
        expect(res.status).toBe(400);
        expect(res.body).toHaveProperty('error');
    }));
    it('rejects unauthorized access to another user\'s task', () => __awaiter(void 0, void 0, void 0, function* () {
        yield request(app).post('/auth/register').send({ email: 'other@test.com', password: 'Pass123!' });
        const loginRes = yield request(app).post('/auth/login').send({ email: 'other@test.com', password: 'Pass123!' });
        const otherToken = loginRes.body.token;
        const resCreate = yield request(app)
            .post('/todos')
            .set('Authorization', `Bearer ${otherToken}`)
            .send({ title: 'Other Task' });
        const otherTaskId = resCreate.body.id;
        const resGet = yield request(app)
            .get(`/todos/${otherTaskId}`)
            .set('Authorization', `Bearer ${userToken}`);
        expect(resGet.status).toBe(403);
        const resUpdate = yield request(app)
            .put(`/todos/${otherTaskId}`)
            .set('Authorization', `Bearer ${userToken}`)
            .send({ title: 'Hacked' });
        expect(resUpdate.status).toBe(403);
        const resDelete = yield request(app)
            .delete(`/todos/${otherTaskId}`)
            .set('Authorization', `Bearer ${userToken}`);
        expect(resDelete.status).toBe(403);
    }));
    it('returns 404 for non-existent task', () => __awaiter(void 0, void 0, void 0, function* () {
        const fakeId = '00000000-0000-0000-0000-000000000000';
        const resGet = yield request(app)
            .get(`/todos/${fakeId}`)
            .set('Authorization', `Bearer ${userToken}`);
        expect(resGet.status).toBe(404);
        const resUpdate = yield request(app)
            .put(`/todos/${fakeId}`)
            .set('Authorization', `Bearer ${userToken}`)
            .send({ title: 'Nope' });
        expect(resUpdate.status).toBe(404);
        const resDelete = yield request(app)
            .delete(`/todos/${fakeId}`)
            .set('Authorization', `Bearer ${userToken}`);
        expect(resDelete.status).toBe(404);
    }));
    it('rejects requests without a token', () => __awaiter(void 0, void 0, void 0, function* () {
        const res = yield request(app)
            .get('/todos');
        expect(res.status).toBe(401);
        expect(res.body).toHaveProperty('error');
    }));
    it('only admin can promote a user', () => __awaiter(void 0, void 0, void 0, function* () {
        var _a;
        yield request(app).post('/auth/register').send({ email: 'promote@test.com', password: 'Pass123!' });
        const loginRes = yield request(app).post('/auth/login').send({ email: 'promote@test.com', password: 'Pass123!' });
        const promoteUserId = loginRes.body.id || ((_a = (yield prisma.user.findUnique({ where: { email: 'promote@test.com' } }))) === null || _a === void 0 ? void 0 : _a.id);
        const resUser = yield request(app)
            .post(`/auth/promote/${promoteUserId}`)
            .set('Authorization', `Bearer ${userToken}`);
        expect(resUser.status).toBe(403);
        const resAdmin = yield request(app)
            .post(`/auth/promote/${promoteUserId}`)
            .set('Authorization', `Bearer ${adminToken}`);
        expect(resAdmin.status).toBe(200);
        expect(resAdmin.body.role).toBe('ADMIN');
    }));
    it('supports pagination and filtering', () => __awaiter(void 0, void 0, void 0, function* () {
        for (let i = 0; i < 15; i++) {
            yield request(app)
                .post('/todos')
                .set('Authorization', `Bearer ${userToken}`)
                .send({ title: `Task ${i}`, description: 'demo' });
        }
        const res = yield request(app)
            .get('/todos?page=2&limit=10')
            .set('Authorization', `Bearer ${userToken}`);
        expect(res.status).toBe(200);
        expect(res.body.meta.page).toBe(2);
        expect(res.body.data.length).toBeGreaterThan(0);
    }));
    it('returns health check', () => __awaiter(void 0, void 0, void 0, function* () {
        const res = yield request(app).get('/auth/health');
        expect(res.status).toBe(200);
        expect(res.body).toHaveProperty('ok', true);
    }));
});
