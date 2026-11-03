const test = require('node:test');
const assert = require('node:assert/strict');
const request = require('supertest');
const app = require('../server/src/app');

test('Student Availability Module Tests', async (t) => {
    // Authenticate student session
    const agent = request.agent(app);
    await agent
        .post('/api/auth/login')
        .send({ username: 'student1', password: 'password123', role: 'student' });

    await t.test('1. Student submits availability YES with valid bus stop', async () => {
        const res = await agent
            .post('/api/availability')
            .send({
                useBus: 'YES',
                stopId: 3 // Chetak Circle
            });

        assert.equal(res.status, 200);
        assert.equal(res.body.success, true);
        assert.equal(res.body.data.useBus, 'YES');
        assert.equal(res.body.data.stopId, 3);
    });

    await t.test('2. Student updates availability to NO (skips stop)', async () => {
        const res = await agent
            .post('/api/availability')
            .send({
                useBus: 'NO'
            });

        assert.equal(res.status, 200);
        assert.equal(res.body.success, true);
        assert.equal(res.body.data.useBus, 'NO');
        assert.equal(res.body.data.stopId, null);
    });

    await t.test('3. Re-marking YES with different stop does not duplicate daily row', async () => {
        const res = await agent
            .post('/api/availability')
            .send({
                useBus: 'YES',
                stopId: 5 // Shastri Circle
            });

        assert.equal(res.status, 200);
        assert.equal(res.body.success, true);
        assert.equal(res.body.data.stopId, 5);
    });

    await t.test('4. Submitting invalid stop ID fails with 400', async () => {
        const res = await agent
            .post('/api/availability')
            .send({
                useBus: 'YES',
                stopId: 999999
            });

        assert.equal(res.status, 400);
        assert.equal(res.body.success, false);
    });

    await t.test('5. Student retrieves dashboard stats successfully', async () => {
        const res = await agent.get('/api/availability/dashboard-stats');

        assert.equal(res.status, 200);
        assert.equal(res.body.success, true);
        assert(typeof res.body.attendanceRate === 'number');
        assert(Array.isArray(res.body.weekCards));
    });
});
