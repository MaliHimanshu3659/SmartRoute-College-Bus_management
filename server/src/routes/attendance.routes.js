const express = require('express');
const router = express.Router();
const attendanceController = require('../controllers/attendance.controller');
const { requireAuth, requireRole } = require('../middleware/auth.middleware');
const { scanLimiter } = require('../middleware/rateLimiter.middleware');

router.use(requireAuth);

router.post('/sessions', requireRole('driver', 'admin'), attendanceController.createAttendanceSession);
router.get('/sessions/active', requireRole('driver', 'admin'), attendanceController.getActiveSession);
router.post('/scan', scanLimiter, requireRole('student', 'admin'), attendanceController.scanAttendance);
router.get('/history', requireRole('student', 'admin'), attendanceController.getStudentAttendanceHistory);

module.exports = router;
