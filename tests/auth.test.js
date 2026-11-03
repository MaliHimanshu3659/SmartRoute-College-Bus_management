const test = require('node:test');
const assert = require('node:assert/strict');
const request = require('supertest');
const app = require('../server/src/app');

test('Authentication Module Tests', async (t) => {
    await t.test('1. Valid student login should return 200 and session user object', async () => {
        const res = await request(app)
            .post('/api/auth/login')
            .send({
                username: 'student1',
                password: 'password123',
                role: 'student'
            });

        assert.equal(res.status, 200);
        assert.equal(res.body.success, true);
        assert.equal(res.body.user.username, 'student1');
        assert.equal(res.body.user.role, 'student');
    });

    await t.test('2. Valid driver login should return 200 and role driver', async () => {
        const res = await request(app)
            .post('/api/auth/login')
            .send({
                username: 'driver1',
                password: 'password123',
                role: 'driver'
            });

        assert.equal(res.status, 200);
        assert.equal(res.body.success, true);
        assert.equal(res.body.user.role, 'driver');
    });

    await t.test('3. Valid admin login should return 200 and role admin', async () => {
        const res = await request(app)
            .post('/api/auth/login')
            .send({
                username: 'admin',
                password: 'password123',
                role: 'admin'
            });

        assert.equal(res.status, 200);
        assert.equal(res.body.success, true);
        assert.equal(res.body.user.role, 'admin');
    });

    await t.test('4. Login with wrong password should return 401', async () => {
        const res = await request(app)
            .post('/api/auth/login')
            .send({
                username: 'student1',
                password: 'incorrectPassword'
            });

        assert.equal(res.status, 401);
        assert.equal(res.body.success, false);
    });

    await t.test('5. Login with role mismatch should return 403', async () => {
        const res = await request(app)
            .post('/api/auth/login')
            .send({
                username: 'student1',
                password: 'password123',
                role: 'driver'
            });

        assert.equal(res.status, 403);
        assert.equal(res.body.success, false);
    });

    await t.test('6. Public registration creates a student user with default student role', async () => {
        const randomUser = `test_stu_${Date.now()}`;
        const res = await request(app)
            .post('/api/auth/register')
            .send({
                username: randomUser,
                fullName: 'Test Automation Student',
                email: `${randomUser}@college.edu`,
                password: 'password123'
            });

        assert.equal(res.status, 201);
        assert.equal(res.body.success, true);
    });

    await t.test('7. Unauthenticated request to protected route returns 401', async () => {
        const res = await request(app).get('/api/availability/me');
        assert.equal(res.status, 401);
        assert.equal(res.body.success, false);
    });
});

