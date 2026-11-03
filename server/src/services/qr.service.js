const crypto = require('crypto');
const QRCode = require('qrcode');
const { query } = require('../config/database');

const QR_EXPIRY_SECONDS = parseInt(process.env.QR_EXPIRATION_SECONDS || '60', 10);

/**
 * Creates a SHA-256 hash of the token.
 */
function hashToken(token) {
    return crypto.createHash('sha256').update(token).digest('hex');
}

function getLocalDateString(d = new Date()) {
    return d.toLocaleDateString('en-CA');
}

/**
 * Generates an unpredictable attendance QR session for a driver and route.
 */
async function generateAttendanceSession(driverId, routeId) {
    // Generate 32 bytes of cryptographic randomness (64 hex characters)
    const rawToken = crypto.randomBytes(32).toString('hex');
    const tokenHash = hashToken(rawToken);

    const now = new Date();
    const expiresAt = new Date(now.getTime() + QR_EXPIRY_SECONDS * 1000);
    const todayDate = getLocalDateString(now);

    // Invalidate/revoke previous active sessions for this driver today to ensure single live session
    await query(
        `UPDATE attendance_sessions 
         SET is_revoked = 1 
         WHERE driver_id = ? AND session_date = ? AND is_revoked = 0`,
        [driverId, todayDate]
    );

    // Insert new session record including raw_token for seamless verification
    const result = await query(
        `INSERT INTO attendance_sessions 
         (driver_id, route_id, session_date, token_hash, raw_token, expires_at, is_revoked) 
         VALUES (?, ?, ?, ?, ?, ?, 0)`,
        [driverId, routeId, todayDate, tokenHash, rawToken, expiresAt]
    );

    // Generate QR code data URL containing JSON payload with token
    const qrPayload = JSON.stringify({
        sessionId: result.insertId,
        token: rawToken,
        routeId,
        date: todayDate,
        expiresAt: expiresAt.toISOString()
    });

    const qrDataUrl = await QRCode.toDataURL(qrPayload, {
        errorCorrectionLevel: 'M',
        margin: 2,
        width: 280,
        color: {
            dark: '#0d1f3c',
            light: '#ffffff'
        }
    });

    return {
        sessionId: result.insertId,
        token: rawToken,
        qrDataUrl,
        expiresAt: expiresAt.toISOString(),
        expiresInSeconds: QR_EXPIRY_SECONDS
    };
}

/**
 * Validates a submitted attendance token.
 */
async function validateAttendanceToken(token) {
    if (!token || typeof token !== 'string') {
        return { valid: false, reason: 'Invalid or missing QR token format.' };
    }

    const tokenHash = hashToken(token.trim());

    const sessions = await query(
        `SELECT s.*, r.route_name, r.bus_name, u.full_name as driver_name 
         FROM attendance_sessions s
         JOIN routes r ON s.route_id = r.id
         JOIN users u ON s.driver_id = u.id
         WHERE s.token_hash = ?`,
        [tokenHash]
    );

    if (sessions.length === 0) {
        return { valid: false, reason: 'QR code session does not exist or was forged.' };
    }

    const session = sessions[0];

    if (session.is_revoked) {
        return { valid: false, reason: 'This QR code has been superseded or revoked.' };
    }

    const sessionExpires = new Date(session.expires_at).getTime();
    if (Date.now() > sessionExpires) {
        return { valid: false, reason: 'QR code has expired. Please ask the driver to refresh the QR code.' };
    }

    const todayDate = getLocalDateString(new Date());
    const sessionDateStr = typeof session.session_date === 'string'
        ? session.session_date.split('T')[0].split(' ')[0]
        : getLocalDateString(new Date(session.session_date));

    if (sessionDateStr !== todayDate) {
        return { valid: false, reason: 'QR code is not valid for today.' };
    }

    return {
        valid: true,
        session
    };
}

module.exports = {
    hashToken,
    generateAttendanceSession,
    validateAttendanceToken,
    QR_EXPIRY_SECONDS
};
