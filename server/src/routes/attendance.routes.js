const express = require('express');
const router = express.Router();
const attendanceController = require('../controllers/attendance.controller');
const { requireAuth, requireRole } = require('../middleware/auth.middleware');
const { scanLimiter } = require('../middleware/rateLimiter.middleware');

router.use(requireAuth);

router.post('/sessions', requireRole('driver'), attendanceController.createAttendanceSession);
router.get('/sessions/active', requireRole('driver'), attendanceController.getActiveSession);
router.get('/live-token', requireRole('student', 'driver'), attendanceController.getActiveLiveToken);
router.post('/scan', scanLimiter, requireRole('student'), attendanceController.scanAttendance);
router.get('/history', requireRole('student'), attendanceController.getStudentAttendanceHistory);

module.exports = router;

