const express = require('express');
const router = express.Router();
const availabilityController = require('../controllers/availability.controller');
const { requireAuth, requireRole } = require('../middleware/auth.middleware');

router.use(requireAuth);

router.get('/me', availabilityController.getMyAvailability);
router.post('/', requireRole('student'), availabilityController.submitAvailability);
router.get('/dashboard-stats', availabilityController.getDashboardStats);
router.get('/profile', availabilityController.getProfile);
router.post('/profile', requireRole('student'), availabilityController.updateProfile);

module.exports = router;

