const express = require('express');
const router = express.Router();
const stopsController = require('../controllers/stops.controller');

router.get('/stops', stopsController.getAllStops);
router.get('/routes', stopsController.getAllRoutes);
router.get('/routes/:id/stops', stopsController.getRouteStops);

module.exports = router;

