const { query } = require('../config/database');
const { generateAttendanceSession, validateAttendanceToken, QR_EXPIRY_SECONDS } = require('../services/qr.service');
const { recordAudit } = require('../middleware/auth.middleware');

/**
 * Driver generates a live QR session
 */
async function createAttendanceSession(req, res) {
    try {
        const driverId = req.session.user.id;
        const { routeId } = req.body;

        // Default to route 1 if not provided
        let targetRouteId = parseInt(routeId, 10);
        if (isNaN(targetRouteId)) {
            const routes = await query(`SELECT id FROM routes WHERE is_active = 1 LIMIT 1`);
            if (routes.length === 0) {
                return res.status(400).json({ success: false, message: 'No active route found.' });
            }
            targetRouteId = routes[0].id;
        }

        const sessionData = await generateAttendanceSession(driverId, targetRouteId);

        recordAudit(driverId, 'QR_SESSION_CREATED', { routeId: targetRouteId, sessionId: sessionData.sessionId }, req.ip);

        return res.status(201).json({
            success: true,
            message: `Attendance QR code generated. Valid for ${QR_EXPIRY_SECONDS} seconds.`,
            ...sessionData
        });
    } catch (err) {
        console.error('[Attendance Controller] createAttendanceSession error:', err);
        return res.status(500).json({ success: false, message: 'Server error generating QR session.' });
    }
}

/**
 * Check active session status for driver
 */
async function getActiveSession(req, res) {
    try {
        const driverId = req.session.user.id;
        const todayDate = new Date().toISOString().split('T')[0];

        const sessions = await query(
            `SELECT id, route_id, expires_at, created_at, is_revoked 
             FROM attendance_sessions 
             WHERE driver_id = ? AND session_date = ? AND is_revoked = 0 AND expires_at > NOW()
             ORDER BY id DESC LIMIT 1`,
            [driverId, todayDate]
        );

        if (sessions.length === 0) {
            return res.json({ success: true, hasActiveSession: false });
        }

        const session = sessions[0];
        const remainingSeconds = Math.max(0, Math.round((new Date(session.expires_at).getTime() - Date.now()) / 1000));

        return res.json({
            success: true,
            hasActiveSession: remainingSeconds > 0,
            sessionId: session.id,
            remainingSeconds,
            expiresAt: session.expires_at
        });
    } catch (err) {
        console.error('[Attendance Controller] getActiveSession error:', err);
        return res.status(500).json({ success: false, message: 'Server error checking session.' });
    }
}

/**
 * Retrieve the active driver QR token for 1-click scanning on same machine
 */
async function getActiveLiveToken(req, res) {
    try {
        const todayDate = new Date().toLocaleDateString('en-CA');
        const sessions = await query(
            `SELECT id, raw_token, expires_at, route_id 
             FROM attendance_sessions 
             WHERE session_date = ? AND is_revoked = 0 AND expires_at > NOW() 
             ORDER BY id DESC LIMIT 1`,
            [todayDate]
        );

        if (sessions.length === 0 || !sessions[0].raw_token) {
            return res.status(404).json({
                success: false,
                message: 'No live driver QR session is currently active. Ask the driver to generate a QR code first.'
            });
        }

        return res.json({
            success: true,
            token: sessions[0].raw_token,
            expiresAt: sessions[0].expires_at
        });
    } catch (err) {
        console.error('[Attendance Controller] getActiveLiveToken error:', err);
        return res.status(500).json({ success: false, message: 'Server error retrieving live token.' });
    }
}

/**
 * Student scans or submits QR token to claim attendance
 */
async function scanAttendance(req, res) {
    try {
        const studentId = req.session.user.id;
        const { token } = req.body;

        if (!token) {
            return res.status(400).json({
                success: false,
                message: 'QR token is required.'
            });
        }

        // 1. Validate token with server-side hash and expiration
        const validation = await validateAttendanceToken(token);
        if (!validation.valid) {
            return res.status(400).json({
                success: false,
                message: validation.reason
            });
        }

        const session = validation.session;
        const todayDate = new Date().toISOString().split('T')[0];

        // 2. Check if attendance already recorded today for this student
        const existingAttendance = await query(
            `SELECT id, marked_at, source FROM attendance_records 
             WHERE student_id = ? AND attendance_date = ?`,
            [studentId, todayDate]
        );

        if (existingAttendance.length > 0) {
            const existing = existingAttendance[0];
            return res.status(409).json({
                success: false,
                alreadyMarked: true,
                message: `Attendance has already been marked today at ${new Date(existing.marked_at).toLocaleTimeString()}.`,
                markedAt: existing.marked_at
            });
        }

        // 3. Check student availability record for stop information
        const availRows = await query(
            `SELECT bus_stop_id, use_bus FROM student_availability 
             WHERE student_id = ? AND availability_date = ?`,
            [studentId, todayDate]
        );

        let stopId = availRows[0]?.bus_stop_id || null;

        // 4. Record attendance with server-generated timestamp
        const result = await query(
            `INSERT INTO attendance_records 
             (student_id, attendance_session_id, route_id, bus_stop_id, attendance_date, marked_at, source)
             VALUES (?, ?, ?, ?, ?, CURRENT_TIMESTAMP, 'QR_SCAN')`,
            [studentId, session.id, session.route_id, stopId, todayDate]
        );

        // 5. Ensure student availability marks YES for today
        await query(
            `INSERT INTO student_availability 
             (student_id, availability_date, use_bus, bus_stop_id)
             VALUES (?, ?, 'YES', ?)
             ON DUPLICATE KEY UPDATE use_bus = 'YES', bus_stop_id = COALESCE(bus_stop_id, VALUES(bus_stop_id))`,
            [studentId, todayDate, stopId]
        );

        recordAudit(studentId, 'ATTENDANCE_MARKED', {
            sessionId: session.id,
            routeId: session.route_id,
            driverId: session.driver_id
        }, req.ip);

        return res.status(201).json({
            success: true,
            message: 'Boarding attendance verified and marked successfully!',
            attendance: {
                id: result.insertId,
                date: todayDate,
                markedAt: new Date().toISOString(),
                routeName: session.route_name,
                busName: session.bus_name,
                driverName: session.driver_name
            }
        });
    } catch (err) {
        console.error('[Attendance Controller] scanAttendance error:', err);
        return res.status(500).json({ success: false, message: 'Server error marking attendance.' });
    }
}

/**
 * Get attendance history for the authenticated student
 * Integrates daily availability declarations with verified QR boarding records
 */
async function getStudentAttendanceHistory(req, res) {
    try {
        const studentId = req.session.user.id;

        const records = await query(
            `SELECT 
                COALESCE(sa.availability_date, att.attendance_date) as record_date,
                sa.use_bus,
                sa.created_at as avail_created_at,
                sa.updated_at as avail_updated_at,
                att.id as attendance_id,
                att.marked_at as scan_marked_at,
                att.source as scan_source,
                COALESCE(s_att.stop_name, s_sa.stop_name, 'Campus Route Stop') as stop_name,
                COALESCE(r.route_name, 'Rampura to Campus') as route_name,
                COALESCE(r.bus_name, 'Campus Route 01') as bus_name
             FROM student_availability sa
             LEFT JOIN attendance_records att 
                ON att.student_id = sa.student_id AND att.attendance_date = sa.availability_date
             LEFT JOIN bus_stops s_sa ON sa.bus_stop_id = s_sa.id
             LEFT JOIN bus_stops s_att ON att.bus_stop_id = s_att.id
             LEFT JOIN routes r ON COALESCE(att.route_id, 1) = r.id
             WHERE sa.student_id = ?

             UNION

             SELECT 
                att.attendance_date as record_date,
                'YES' as use_bus,
                att.marked_at as avail_created_at,
                att.marked_at as avail_updated_at,
                att.id as attendance_id,
                att.marked_at as scan_marked_at,
                att.source as scan_source,
                COALESCE(s.stop_name, 'Campus Route Stop') as stop_name,
                COALESCE(r.route_name, 'Rampura to Campus') as route_name,
                COALESCE(r.bus_name, 'Campus Route 01') as bus_name
             FROM attendance_records att
             LEFT JOIN student_availability sa 
                ON sa.student_id = att.student_id AND sa.availability_date = att.attendance_date
             LEFT JOIN bus_stops s ON att.bus_stop_id = s.id
             LEFT JOIN routes r ON att.route_id = r.id
             WHERE att.student_id = ? AND sa.id IS NULL

             ORDER BY record_date DESC`,
            [studentId, studentId]
        );

        let totalPresent = 0;
        let totalAbsent = 0;

        const formattedHistory = records.map(r => {
            const hasQrScan = !!r.attendance_id;
            const isTakingBus = r.use_bus === 'YES';
            let status = 'Taking Bus (YES)';
            let statusBadge = 'badge-teal';
            let source = 'Daily Availability';
            let markedAt = r.scan_marked_at || r.avail_updated_at || r.avail_created_at;

            if (hasQrScan) {
                status = 'Verified Boarding';
                statusBadge = 'badge-green';
                source = r.scan_source || 'QR Code Scan';
                totalPresent++;
            } else if (isTakingBus) {
                status = 'Taking Bus (YES)';
                statusBadge = 'badge-teal';
                source = 'Daily Availability';
                totalPresent++;
            } else {
                status = 'Skipped (Absent)';
                statusBadge = 'badge-red';
                source = 'Daily Availability';
                totalAbsent++;
            }

            return {
                id: r.attendance_id || `avail_${r.record_date}`,
                date: r.record_date,
                markedAt: markedAt,
                source: source,
                routeName: r.route_name || 'Rampura to Campus',
                busName: r.bus_name || 'Campus Route 01',
                stopName: isTakingBus || hasQrScan ? r.stop_name : 'Skipped (Not Taking Bus)',
                status: status,
                statusBadge: statusBadge,
                isVerified: hasQrScan
            };
        });

        return res.json({
            success: true,
            totalPresent,
            totalAbsent,
            history: formattedHistory
        });
    } catch (err) {
        console.error('[Attendance Controller] getStudentAttendanceHistory error:', err);
        return res.status(500).json({ success: false, message: 'Server error retrieving attendance history.' });
    }
}

module.exports = {
    createAttendanceSession,
    getActiveSession,
    getActiveLiveToken,
    scanAttendance,
    getStudentAttendanceHistory
};

