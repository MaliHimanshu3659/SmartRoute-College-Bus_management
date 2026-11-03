const { query } = require('../config/database');

/**
 * Get all active bus stops
 */
async function getAllStops(req, res) {
    try {
        const stops = await query(
            `SELECT id, stop_name, latitude, longitude, scheduled_time, is_active 
             FROM bus_stops 
             WHERE is_active = 1 
             ORDER BY id ASC`
        );

        return res.json({
            success: true,
            stops
        });
    } catch (err) {
        console.error('[Stops Controller] getAllStops error:', err);
        return res.status(500).json({ success: false, message: 'Server error retrieving stops.' });
    }
}

/**
 * Get all active routes
 */
async function getAllRoutes(req, res) {
    try {
        const routes = await query(
            `SELECT id, route_name, route_code, bus_name, description, is_active 
             FROM routes 
             WHERE is_active = 1`
        );

        return res.json({
            success: true,
            routes
        });
    } catch (err) {
        console.error('[Stops Controller] getAllRoutes error:', err);
        return res.status(500).json({ success: false, message: 'Server error retrieving routes.' });
    }
}

/**
 * Get stops for a specific route in sequential order
 */
async function getRouteStops(req, res) {
    try {
        const routeId = parseInt(req.params.id, 10);
        if (isNaN(routeId)) {
            return res.status(400).json({ success: false, message: 'Invalid route ID.' });
        }

        const stops = await query(
            `SELECT rs.stop_order, rs.scheduled_time as route_time, s.id as stop_id,
                    s.stop_name, s.latitude, s.longitude, s.scheduled_time as default_time
             FROM route_stops rs
             JOIN bus_stops s ON rs.bus_stop_id = s.id
             WHERE rs.route_id = ? AND s.is_active = 1
             ORDER BY rs.stop_order ASC`,
            [routeId]
        );

        return res.json({
            success: true,
            routeId,
            stops: stops.map(s => ({
                id: s.stop_id,
                stopOrder: s.stop_order,
                name: s.stop_name,
                time: s.route_time || s.default_time,
                lat: parseFloat(s.latitude),
                lng: parseFloat(s.longitude)
            }))
        });
    } catch (err) {
        console.error('[Stops Controller] getRouteStops error:', err);
        return res.status(500).json({ success: false, message: 'Server error retrieving route stops.' });
    }
}

module.exports = {
    getAllStops,
    getAllRoutes,
    getRouteStops
};

