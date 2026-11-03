const express = require('express');
const router = express.Router();
const driverController = require('../controllers/driver.controller');
const { requireAuth, requireRole } = require('../middleware/auth.middleware');

router.use(requireAuth);

router.get('/dashboard', requireRole('driver'), driverController.getDriverDashboard);
router.get('/availability', requireRole('driver'), driverController.getDriverAvailability);
router.post('/location', requireRole('driver'), driverController.updateBusLocation);
router.get('/latest-location', driverController.getLatestBusLocation);

module.exports = router;

