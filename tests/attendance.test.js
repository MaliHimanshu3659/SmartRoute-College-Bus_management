const test = require('node:test');
const assert = require('node:assert/strict');
const request = require('supertest');
const app = require('../server/src/app');
const { query } = require('../server/src/config/database');

test('QR-Code Attendance Module Tests', async (t) => {
    // 1. Clean today's attendance records for student2 to have an isolated run
    const todayDate = new Date().toISOString().split('T')[0];
    await query(`DELETE FROM attendance_records WHERE student_id = 4 AND attendance_date = ?`, [todayDate]);

    // Driver agent
    const driverAgent = request.agent(app);
    await driverAgent
        .post('/api/auth/login')
        .send({ username: 'driver1', password: 'password123', role: 'driver' });

    // Student agent
    const studentAgent = request.agent(app);
    await studentAgent
        .post('/api/auth/login')
        .send({ username: 'student2', password: 'password123', role: 'student' });

    let liveToken = null;

    await t.test('1. Driver generates a dynamic 60-second QR session', async () => {
        const res = await driverAgent
            .post('/api/attendance/sessions')
            .send({ routeId: 1 });

        assert.equal(res.status, 201);
        assert.equal(res.body.success, true);
        assert(res.body.token);
        assert(res.body.qrDataUrl.startsWith('data:image/png;base64,'));
        assert.equal(res.body.expiresInSeconds, 60);

        liveToken = res.body.token;
    });

    await t.test('2. Student scans valid live QR token and marks attendance', async () => {
        assert(liveToken, 'Live token must be present');

        const res = await studentAgent
            .post('/api/attendance/scan')
            .send({ token: liveToken });

        assert.equal(res.status, 201);
        assert.equal(res.body.success, true);
        assert(res.body.attendance.markedAt);
    });

    await t.test('3. Student attempting duplicate attendance scan on same day is rejected with 409 Conflict', async () => {
        const res = await studentAgent
            .post('/api/attendance/scan')
            .send({ token: liveToken });

        assert.equal(res.status, 409);
        assert.equal(res.body.success, false);
        assert.equal(res.body.alreadyMarked, true);
    });

    await t.test('4. Submitting invalid or forged token fails with 400', async () => {
        const res = await studentAgent
            .post('/api/attendance/scan')
            .send({ token: 'forged_fake_token_1234567890' });

        assert.equal(res.status, 400);
        assert.equal(res.body.success, false);
    });

    await t.test('5. Submitting expired QR session token is rejected with 400 Expired message', async () => {
        // Manually insert an expired session in database with a fresh unique token
        const expiredToken = 'expired_test_' + Date.now() + '_' + Math.random().toString(36).substring(2);
        const crypto = require('crypto');
        const tokenHash = crypto.createHash('sha256').update(expiredToken).digest('hex');

        await query(
            `INSERT INTO attendance_sessions (driver_id, route_id, session_date, token_hash, expires_at, is_revoked)
             VALUES (2, 1, CURDATE(), ?, DATE_SUB(NOW(), INTERVAL 5 MINUTE), 0)`,
            [tokenHash]
        );

        const res = await studentAgent
            .post('/api/attendance/scan')
            .send({ token: expiredToken });

        assert.equal(res.status, 400);
        assert.equal(res.body.success, false);
        assert(res.body.message.toLowerCase().includes('expired'));
    });

    await t.test('6. Student retrieves personal attendance history', async () => {
        const res = await studentAgent.get('/api/attendance/history');

        assert.equal(res.status, 200);
        assert.equal(res.body.success, true);
        assert(Array.isArray(res.body.history));
        assert(res.body.totalPresent >= 1);
    });
});
