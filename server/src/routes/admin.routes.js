const express = require('express');
const router = express.Router();
const adminController = require('../controllers/admin.controller');
const { requireAuth, requireRole } = require('../middleware/auth.middleware');

// All administrative endpoints require authentication and admin role
router.use(requireAuth, requireRole('admin'));

router.get('/dashboard', adminController.getAdminDashboard);
router.get('/users', adminController.listUsers);
router.post('/users', adminController.createUser);
router.patch('/users/:id/status', adminController.updateUserStatus);

router.get('/stops', adminController.listAllStops);
router.post('/stops', adminController.createStop);
router.put('/stops/:id', adminController.updateStop);

router.get('/routes', adminController.listAllRoutes);
router.post('/routes', adminController.createRoute);

router.get('/attendance', adminController.listAttendanceRecords);
router.get('/logs', adminController.listLogs);

module.exports = router;
