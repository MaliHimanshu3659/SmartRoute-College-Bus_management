const { query } = require('../config/database');

/**
 * Driver Dashboard summary: Route, stops with live student counts, rider list, scan progress
 */
async function getDriverDashboard(req, res) {
    try {
        const driverId = req.session.user.id;
        const todayDate = new Date().toLocaleDateString('en-CA');

        // 1. Get driver's assigned route or default route
        const assignments = await query(
            `SELECT r.* 
             FROM driver_assignments da
             JOIN routes r ON da.route_id = r.id
             WHERE da.driver_id = ? AND da.assigned_date = ? AND da.is_active = 1`,
            [driverId, todayDate]
        );

        let route = assignments[0];
        if (!route) {
            const fallbackRoutes = await query(`SELECT * FROM routes WHERE is_active = 1 LIMIT 1`);
            route = fallbackRoutes[0];
        }

        if (!route) {
            return res.status(404).json({ success: false, message: 'No route assigned.' });
        }

        // 2. Get route stops in sequential order
        const routeStops = await query(
            `SELECT rs.stop_order, rs.scheduled_time, s.id as stop_id, s.stop_name, s.latitude, s.longitude
             FROM route_stops rs
             JOIN bus_stops s ON rs.bus_stop_id = s.id
             WHERE rs.route_id = ? AND s.is_active = 1
             ORDER BY rs.stop_order ASC`,
            [route.id]
        );

        // 3. Count students who marked YES today per stop
        const stopCountsRows = await query(
            `SELECT bus_stop_id, COUNT(*) as waiting_count
             FROM student_availability
             WHERE availability_date = ? AND use_bus = 'YES' AND bus_stop_id IS NOT NULL
             GROUP BY bus_stop_id`,
            [todayDate]
        );

        const stopCountsMap = new Map();
        stopCountsRows.forEach(row => {
            stopCountsMap.set(row.bus_stop_id, row.waiting_count);
        });

        // 4. Annotate each stop with waiting student count and skip guidance
        const stopsWithCounts = routeStops.map(stop => {
            const waitingCount = stopCountsMap.get(stop.stop_id) || 0;
            const isCampus = stop.stop_order === routeStops.length;
            const isDeparture = stop.stop_order === 1;

            let actionStatus = 'skip';
            if (isDeparture) actionStatus = 'start';
            else if (isCampus) actionStatus = 'final';
            else if (waitingCount > 0) actionStatus = 'pickup';

            return {
                stopId: stop.stop_id,
                stopOrder: stop.stop_order,
                stopName: stop.stop_name,
                scheduledTime: stop.scheduled_time,
                latitude: parseFloat(stop.latitude),
                longitude: parseFloat(stop.longitude),
                waitingCount,
                actionStatus,
                detail: waitingCount > 0
                    ? `${waitingCount} student${waitingCount > 1 ? 's' : ''} waiting`
                    : (isDeparture ? 'Route Departure Point' : (isCampus ? 'Campus Destination' : 'No students (Can Skip)'))
            };
        });

        // 5. Calculate overview statistics
        const availabilitySummary = await query(
            `SELECT 
                SUM(CASE WHEN use_bus = 'YES' THEN 1 ELSE 0 END) as active_riders,
                SUM(CASE WHEN use_bus = 'NO' THEN 1 ELSE 0 END) as skipped_riders
             FROM student_availability 
             WHERE availability_date = ?`,
            [todayDate]
        );

        const activeRiders = parseInt(availabilitySummary[0]?.active_riders || '0', 10);
        const skippedRiders = parseInt(availabilitySummary[0]?.skipped_riders || '0', 10);

        // 6. Attendance scan progress
        const scansSummary = await query(
            `SELECT COUNT(*) as scanned_count 
             FROM attendance_records 
             WHERE attendance_date = ?`,
            [todayDate]
        );
        const qrScanned = parseInt(scansSummary[0]?.scanned_count || '0', 10);
        const pendingScans = Math.max(activeRiders - qrScanned, 0);
        const scanProgressPercent = activeRiders > 0 ? Math.round((qrScanned / activeRiders) * 100) : 0;

        // 7. Get today's riders list - both YES and NO
        const ridersList = await query(
            `SELECT u.username, u.full_name, p.enrollment_number, s.stop_name,
                    a.use_bus, a.latitude, a.longitude, att.id as attendance_id, att.marked_at
             FROM student_availability a
             JOIN users u ON a.student_id = u.id
             LEFT JOIN student_profiles p ON u.id = p.user_id
             LEFT JOIN bus_stops s ON a.bus_stop_id = s.id
             LEFT JOIN attendance_records att ON att.student_id = a.student_id AND att.attendance_date = a.availability_date
             WHERE a.availability_date = ?
             ORDER BY (a.use_bus = 'YES') DESC, u.username ASC`,
            [todayDate]
        );

        const stopsToVisit = stopsWithCounts.filter(s => s.actionStatus === 'pickup' || s.actionStatus === 'start' || s.actionStatus === 'final').length;
        const stopsToSkip = stopsWithCounts.filter(s => s.actionStatus === 'skip').length;

        return res.json({
            success: true,
            route: {
                id: route.id,
                name: route.route_name,
                code: route.route_code,
                busName: route.bus_name,
                description: route.description,
                departureTime: routeStops[0]?.scheduled_time || '08:10 AM',
                arrivalTime: routeStops[routeStops.length - 1]?.scheduled_time || '09:20 AM'
            },
            stats: {
                activeRiders,
                skippedRiders,
                totalStops: routeStops.length,
                stopsToVisit,
                stopsToSkip,
                qrScanned,
                pendingScans,
                scanProgressPercent
            },
            stops: stopsWithCounts,
            riders: ridersList.map(r => ({
                username: r.username,
                displayName: r.full_name || r.username,
                enrollment: r.enrollment_number || 'N/A',
                useBus: r.use_bus,
                stopName: r.use_bus === 'YES' ? (r.stop_name || 'Designated Stop') : 'Marked Not Coming (Skip)',
                latitude: r.latitude ? parseFloat(r.latitude) : null,
                longitude: r.longitude ? parseFloat(r.longitude) : null,
                isScanned: Boolean(r.attendance_id),
                markedAt: r.marked_at
            }))
        });
    } catch (err) {
        console.error('[Driver Controller] getDriverDashboard error:', err);
        return res.status(500).json({ success: false, message: 'Server error retrieving driver dashboard.' });
    }
}

/**
 * Get student availability list for today
 */
async function getDriverAvailability(req, res) {
    try {
        const todayDate = new Date().toISOString().split('T')[0];
        const records = await query(
            `SELECT u.username, u.full_name, a.use_bus, a.latitude, a.longitude, s.stop_name, att.marked_at
             FROM student_availability a
             JOIN users u ON a.student_id = u.id
             LEFT JOIN bus_stops s ON a.bus_stop_id = s.id
             LEFT JOIN attendance_records att ON att.student_id = a.student_id AND att.attendance_date = a.availability_date
             WHERE a.availability_date = ?
             ORDER BY u.username ASC`,
            [todayDate]
        );

        return res.json({
            success: true,
            date: todayDate,
            records: records.map(r => ({
                username: r.username,
                displayName: r.full_name || r.username,
                status: r.use_bus,
                stopName: r.stop_name || 'Stop not selected',
                lat: r.latitude ? parseFloat(r.latitude) : null,
                lng: r.longitude ? parseFloat(r.longitude) : null,
                attendanceMarkedAt: r.marked_at
            }))
        });
    } catch (err) {
        console.error('[Driver Controller] getDriverAvailability error:', err);
        return res.status(500).json({ success: false, message: 'Server error fetching availability list.' });
    }
}

/**
 * Save driver bus GPS location
 */
async function updateBusLocation(req, res) {
    try {
        const driverId = req.session.user.id;
        const { latitude, longitude, routeId } = req.body;

        const lat = parseFloat(latitude);
        const lng = parseFloat(longitude);
        if (isNaN(lat) || isNaN(lng)) {
            return res.status(400).json({ success: false, message: 'Valid latitude and longitude are required.' });
        }

        await query(
            `INSERT INTO bus_live_locations (driver_id, route_id, latitude, longitude)
             VALUES (?, ?, ?, ?)`,
            [driverId, routeId || 1, lat, lng]
        );

        return res.json({ success: true, message: 'Bus location updated.' });
    } catch (err) {
        console.error('[Driver Controller] updateBusLocation error:', err);
        return res.status(500).json({ success: false, message: 'Server error updating location.' });
    }
}

/**
 * Get latest live bus location
 */
async function getLatestBusLocation(req, res) {
    try {
        const locations = await query(
            `SELECT b.latitude, b.longitude, b.recorded_at, u.full_name as driver_name, r.bus_name
             FROM bus_live_locations b
             JOIN users u ON b.driver_id = u.id
             LEFT JOIN routes r ON b.route_id = r.id
             WHERE b.recorded_at >= NOW() - INTERVAL 15 MINUTE
             ORDER BY b.recorded_at DESC
             LIMIT 1`
        );

        if (locations.length === 0) {
            return res.json({ success: true, live: false, message: 'No live bus location within last 15 minutes.' });
        }

        const loc = locations[0];
        return res.json({
            success: true,
            live: true,
            location: {
                lat: parseFloat(loc.latitude),
                lng: parseFloat(loc.longitude),
                driverName: loc.driver_name,
                busName: loc.bus_name,
                updatedAt: loc.recorded_at
            }
        });
    } catch (err) {
        console.error('[Driver Controller] getLatestBusLocation error:', err);
        return res.status(500).json({ success: false, message: 'Server error retrieving bus location.' });
    }
}

module.exports = {
    getDriverDashboard,
    getDriverAvailability,
    updateBusLocation,
    getLatestBusLocation
};

