const bcrypt = require('bcryptjs');
const { query } = require('../config/database');
const { recordAudit } = require('../middleware/auth.middleware');

/**
 * Admin Dashboard statistics overview
 */
async function getAdminDashboard(req, res) {
    try {
        const todayDate = new Date().toISOString().split('T')[0];

        const [userCounts] = await query(
            `SELECT 
                COUNT(*) as total_users,
                SUM(CASE WHEN role = 'student' THEN 1 ELSE 0 END) as total_students,
                SUM(CASE WHEN role = 'driver' THEN 1 ELSE 0 END) as total_drivers,
                SUM(CASE WHEN account_status = 'active' THEN 1 ELSE 0 END) as active_accounts
             FROM users`
        );

        const [stopCounts] = await query(
            `SELECT COUNT(*) as total_stops, SUM(CASE WHEN is_active = 1 THEN 1 ELSE 0 END) as active_stops FROM bus_stops`
        );

        const [routeCounts] = await query(
            `SELECT COUNT(*) as total_routes, SUM(CASE WHEN is_active = 1 THEN 1 ELSE 0 END) as active_routes FROM routes`
        );

        const [todayAvail] = await query(
            `SELECT 
                SUM(CASE WHEN use_bus = 'YES' THEN 1 ELSE 0 END) as yes_count,
                SUM(CASE WHEN use_bus = 'NO' THEN 1 ELSE 0 END) as no_count
             FROM student_availability
             WHERE availability_date = ?`,
            [todayDate]
        );

        const [todayAtt] = await query(
            `SELECT COUNT(*) as attendance_count FROM attendance_records WHERE attendance_date = ?`,
            [todayDate]
        );

        return res.json({
            success: true,
            stats: {
                totalUsers: userCounts.total_users || 0,
                totalStudents: userCounts.total_students || 0,
                totalDrivers: userCounts.total_drivers || 0,
                activeAccounts: userCounts.active_accounts || 0,
                totalStops: stopCounts.total_stops || 0,
                activeStops: stopCounts.active_stops || 0,
                totalRoutes: routeCounts.total_routes || 0,
                activeRoutes: routeCounts.active_routes || 0,
                todayYes: todayAvail.yes_count || 0,
                todayNo: todayAvail.no_count || 0,
                todayAttendance: todayAtt.attendance_count || 0
            }
        });
    } catch (err) {
        console.error('[Admin Controller] getAdminDashboard error:', err);
        return res.status(500).json({ success: false, message: 'Server error retrieving dashboard statistics.' });
    }
}

/**
 * Manage Users
 */
async function listUsers(req, res) {
    try {
        const { role, status, search } = req.query;

        let sql = `SELECT id, username, email, role, full_name, account_status, created_at, updated_at FROM users WHERE 1=1`;
        const params = [];

        if (role) {
            sql += ` AND role = ?`;
            params.push(role);
        }
        if (status) {
            sql += ` AND account_status = ?`;
            params.push(status);
        }
        if (search) {
            sql += ` AND (username LIKE ? OR full_name LIKE ? OR email LIKE ?)`;
            const term = `%${search.trim()}%`;
            params.push(term, term, term);
        }

        sql += ` ORDER BY id DESC`;

        const users = await query(sql, params);
        return res.json({ success: true, users });
    } catch (err) {
        console.error('[Admin Controller] listUsers error:', err);
        return res.status(500).json({ success: false, message: 'Server error retrieving users.' });
    }
}

async function createUser(req, res) {
    try {
        const { username, password, email, role, fullName } = req.body;

        if (!username || !password || !role) {
            return res.status(400).json({ success: false, message: 'Username, password, and role are required.' });
        }

        if (!['student', 'driver', 'admin'].includes(role)) {
            return res.status(400).json({ success: false, message: 'Invalid role specified.' });
        }

        const existing = await query(`SELECT id FROM users WHERE username = ? OR (email IS NOT NULL AND email = ?)`, [username.trim(), email || null]);
        if (existing.length > 0) {
            return res.status(409).json({ success: false, message: 'Username or email already exists.' });
        }

        const passwordHash = await bcrypt.hash(password, 10);
        const result = await query(
            `INSERT INTO users (username, email, password_hash, role, full_name, account_status)
             VALUES (?, ?, ?, ?, ?, 'active')`,
            [username.trim(), email ? email.trim() : null, passwordHash, role, fullName || username.trim()]
        );

        if (role === 'student') {
            await query(`INSERT INTO student_profiles (user_id) VALUES (?)`, [result.insertId]);
        }

        recordAudit(req.session.user.id, 'ADMIN_USER_CREATED', { newUserId: result.insertId, role }, req.ip);

        return res.status(201).json({ success: true, message: 'User created successfully.', userId: result.insertId });
    } catch (err) {
        console.error('[Admin Controller] createUser error:', err);
        return res.status(500).json({ success: false, message: 'Server error creating user.' });
    }
}

async function updateUserStatus(req, res) {
    try {
        const userId = parseInt(req.params.id, 10);
        const { status } = req.body;

        if (!['active', 'inactive'].includes(status)) {
            return res.status(400).json({ success: false, message: "Status must be 'active' or 'inactive'." });
        }

        // Prevent admin from deactivating themselves
        if (userId === req.session.user.id && status === 'inactive') {
            return res.status(400).json({ success: false, message: 'Cannot deactivate your own administrator account.' });
        }

        await query(`UPDATE users SET account_status = ? WHERE id = ?`, [status, userId]);
        recordAudit(req.session.user.id, 'ADMIN_USER_STATUS_UPDATE', { targetUserId: userId, newStatus: status }, req.ip);

        return res.json({ success: true, message: `Account status set to ${status}.` });
    } catch (err) {
        console.error('[Admin Controller] updateUserStatus error:', err);
        return res.status(500).json({ success: false, message: 'Server error updating user status.' });
    }
}

/**
 * Manage Bus Stops
 */
async function listAllStops(req, res) {
    try {
        const stops = await query(`SELECT * FROM bus_stops ORDER BY id ASC`);
        return res.json({ success: true, stops });
    } catch (err) {
        console.error('[Admin Controller] listAllStops error:', err);
        return res.status(500).json({ success: false, message: 'Server error fetching stops.' });
    }
}

async function createStop(req, res) {
    try {
        const { stopName, latitude, longitude, scheduledTime } = req.body;

        if (!stopName || latitude == null || longitude == null) {
            return res.status(400).json({ success: false, message: 'Stop name, latitude, and longitude are required.' });
        }

        const lat = parseFloat(latitude);
        const lng = parseFloat(longitude);
        if (isNaN(lat) || isNaN(lng)) {
            return res.status(400).json({ success: false, message: 'Latitude and longitude must be valid numbers.' });
        }

        const result = await query(
            `INSERT INTO bus_stops (stop_name, latitude, longitude, scheduled_time, is_active)
             VALUES (?, ?, ?, ?, 1)`,
            [stopName.trim(), lat, lng, scheduledTime ? scheduledTime.trim() : null]
        );

        recordAudit(req.session.user.id, 'ADMIN_STOP_CREATED', { stopId: result.insertId, stopName }, req.ip);

        return res.status(201).json({ success: true, message: 'Bus stop created successfully.', stopId: result.insertId });
    } catch (err) {
        console.error('[Admin Controller] createStop error:', err);
        return res.status(500).json({ success: false, message: 'Server error creating stop.' });
    }
}

async function updateStop(req, res) {
    try {
        const stopId = parseInt(req.params.id, 10);
        const { stopName, latitude, longitude, scheduledTime, isActive } = req.body;

        const updates = [];
        const params = [];

        if (stopName) {
            updates.push('stop_name = ?');
            params.push(stopName.trim());
        }
        if (latitude != null) {
            updates.push('latitude = ?');
            params.push(parseFloat(latitude));
        }
        if (longitude != null) {
            updates.push('longitude = ?');
            params.push(parseFloat(longitude));
        }
        if (scheduledTime !== undefined) {
            updates.push('scheduled_time = ?');
            params.push(scheduledTime ? scheduledTime.trim() : null);
        }
        if (isActive !== undefined) {
            updates.push('is_active = ?');
            params.push(isActive ? 1 : 0);
        }

        if (updates.length === 0) {
            return res.status(400).json({ success: false, message: 'No fields to update.' });
        }

        params.push(stopId);
        await query(`UPDATE bus_stops SET ${updates.join(', ')} WHERE id = ?`, params);

        recordAudit(req.session.user.id, 'ADMIN_STOP_UPDATED', { stopId }, req.ip);

        return res.json({ success: true, message: 'Bus stop updated successfully.' });
    } catch (err) {
        console.error('[Admin Controller] updateStop error:', err);
        return res.status(500).json({ success: false, message: 'Server error updating stop.' });
    }
}

/**
 * Manage Routes
 */
async function listAllRoutes(req, res) {
    try {
        const routes = await query(`SELECT * FROM routes ORDER BY id ASC`);
        return res.json({ success: true, routes });
    } catch (err) {
        console.error('[Admin Controller] listAllRoutes error:', err);
        return res.status(500).json({ success: false, message: 'Server error fetching routes.' });
    }
}

async function createRoute(req, res) {
    try {
        const { routeName, routeCode, busName, description } = req.body;

        if (!routeName || !routeCode) {
            return res.status(400).json({ success: false, message: 'Route name and route code are required.' });
        }

        const result = await query(
            `INSERT INTO routes (route_name, route_code, bus_name, description, is_active)
             VALUES (?, ?, ?, ?, 1)`,
            [routeName.trim(), routeCode.trim(), busName || 'Campus Route', description || null]
        );

        recordAudit(req.session.user.id, 'ADMIN_ROUTE_CREATED', { routeId: result.insertId, routeName }, req.ip);

        return res.status(201).json({ success: true, message: 'Route created successfully.', routeId: result.insertId });
    } catch (err) {
        console.error('[Admin Controller] createRoute error:', err);
        return res.status(500).json({ success: false, message: 'Server error creating route.' });
    }
}

/**
 * View Attendance Records with filters
 */
async function listAttendanceRecords(req, res) {
    try {
        const { date, studentId, routeId, stopId } = req.query;

        let sql = `
            SELECT att.id, att.attendance_date, att.marked_at, att.source,
                   u.username, u.full_name as student_name, p.enrollment_number,
                   r.route_name, r.bus_name, s.stop_name
            FROM attendance_records att
            JOIN users u ON att.student_id = u.id
            LEFT JOIN student_profiles p ON u.id = p.user_id
            LEFT JOIN routes r ON att.route_id = r.id
            LEFT JOIN bus_stops s ON att.bus_stop_id = s.id
            WHERE 1=1
        `;
        const params = [];

        if (date) {
            sql += ` AND att.attendance_date = ?`;
            params.push(date);
        }
        if (studentId) {
            sql += ` AND att.student_id = ?`;
            params.push(parseInt(studentId, 10));
        }
        if (routeId) {
            sql += ` AND att.route_id = ?`;
            params.push(parseInt(routeId, 10));
        }
        if (stopId) {
            sql += ` AND att.bus_stop_id = ?`;
            params.push(parseInt(stopId, 10));
        }

        sql += ` ORDER BY att.attendance_date DESC, att.marked_at DESC LIMIT 200`;

        const records = await query(sql, params);
        return res.json({ success: true, count: records.length, records });
    } catch (err) {
        console.error('[Admin Controller] listAttendanceRecords error:', err);
        return res.status(500).json({ success: false, message: 'Server error retrieving attendance records.' });
    }
}

/**
 * View System Audit Logs
 */
async function listLogs(req, res) {
    try {
        const logs = await query(
            `SELECT l.*, u.username, u.role
             FROM audit_logs l
             LEFT JOIN users u ON l.user_id = u.id
             ORDER BY l.id DESC LIMIT 100`
        );
        return res.json({ success: true, logs });
    } catch (err) {
        console.error('[Admin Controller] listLogs error:', err);
        return res.status(500).json({ success: false, message: 'Server error retrieving audit logs.' });
    }
}

module.exports = {
    getAdminDashboard,
    listUsers,
    createUser,
    updateUserStatus,
    listAllStops,
    createStop,
    updateStop,
    listAllRoutes,
    createRoute,
    listAttendanceRecords,
    listLogs
};
