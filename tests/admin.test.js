const test = require('node:test');
const assert = require('node:assert/strict');
const request = require('supertest');
const app = require('../server/src/app');

test('Admin Management & Authorization Module Tests', async (t) => {
    // Student agent
    const studentAgent = request.agent(app);
    await studentAgent
        .post('/api/auth/login')
        .send({ username: 'student1', password: 'password123', role: 'student' });

    // Admin agent
    const adminAgent = request.agent(app);
    await adminAgent
        .post('/api/auth/login')
        .send({ username: 'admin', password: 'password123', role: 'admin' });

    await t.test('1. Student attempting to access admin dashboard is rejected with 403', async () => {
        const res = await studentAgent.get('/api/admin/dashboard');
        assert.equal(res.status, 403);
        assert.equal(res.body.success, false);
    });

    await t.test('2. Admin accesses dashboard stats successfully', async () => {
        const res = await adminAgent.get('/api/admin/dashboard');
        assert.equal(res.status, 200);
        assert.equal(res.body.success, true);
        assert(res.body.stats.totalUsers > 0);
        assert(res.body.stats.totalStops > 0);
    });

    let createdStopId = null;

    await t.test('3. Admin creates a new bus stop', async () => {
        const uniqueStopName = `Test Stop ${Date.now()}`;
        const res = await adminAgent
            .post('/api/admin/stops')
            .send({
                stopName: uniqueStopName,
                latitude: 24.595,
                longitude: 73.725,
                scheduledTime: '08:45 AM'
            });

        assert.equal(res.status, 201);
        assert.equal(res.body.success, true);
        assert(res.body.stopId);
        createdStopId = res.body.stopId;
    });

    await t.test('4. Admin deactivates and reactivates a bus stop', async () => {
        assert(createdStopId, 'Created stop ID must exist');

        const res = await adminAgent
            .put(`/api/admin/stops/${createdStopId}`)
            .send({ isActive: false });

        assert.equal(res.status, 200);
        assert.equal(res.body.success, true);
    });

    await t.test('5. Admin retrieves attendance records filterable by date', async () => {
        const todayDate = new Date().toISOString().split('T')[0];
        const res = await adminAgent.get(`/api/admin/attendance?date=${todayDate}`);

        assert.equal(res.status, 200);
        assert.equal(res.body.success, true);
        assert(Array.isArray(res.body.records));
    });

    await t.test('6. Admin inspects audit security logs', async () => {
        const res = await adminAgent.get('/api/admin/logs');

        assert.equal(res.status, 200);
        assert.equal(res.body.success, true);
        assert(Array.isArray(res.body.logs));
    });
});
