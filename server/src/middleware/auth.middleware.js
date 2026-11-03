const { query } = require('../config/database');

/**
 * Ensures user is authenticated.
 */
function requireAuth(req, res, next) {
    if (!req.session || !req.session.user) {
        return res.status(401).json({
            success: false,
            message: 'Authentication required. Please log in.'
        });
    }
    next();
}

/**
 * Restricts access to specific roles (e.g. ['admin'], ['driver'], ['student', 'admin']).
 */
function requireRole(...allowedRoles) {
    return (req, res, next) => {
        if (!req.session || !req.session.user) {
            return res.status(401).json({
                success: false,
                message: 'Authentication required. Please log in.'
            });
        }

        const userRole = req.session.user.role;
        if (!allowedRoles.includes(userRole)) {
            return res.status(403).json({
                success: false,
                message: `Access denied. Requires one of [${allowedRoles.join(', ')}] role.`
            });
        }
        next();
    };
}

/**
 * Logs an administrative or critical security action into audit_logs.
 */
async function recordAudit(userId, action, details, ipAddress) {
    try {
        await query(
            `INSERT INTO audit_logs (user_id, action, details, ip_address) VALUES (?, ?, ?, ?)`,
            [userId || null, action, details ? JSON.stringify(details) : null, ipAddress || null]
        );
    } catch (err) {
        console.error('[Audit Log] Failed to record audit log:', err.message);
    }
}

module.exports = {
    requireAuth,
    requireRole,
    recordAudit
};

