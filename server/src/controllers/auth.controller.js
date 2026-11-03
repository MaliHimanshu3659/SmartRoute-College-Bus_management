const bcrypt = require('bcryptjs');
const { query } = require('../config/database');
const { recordAudit } = require('../middleware/auth.middleware');

/**
 * Handle user login
 */
async function login(req, res) {
    try {
        const { username, password, role } = req.body;

        if (!username || !password) {
            return res.status(400).json({
                success: false,
                message: 'Username and password are required.'
            });
        }

        const users = await query(
            `SELECT id, username, email, password_hash, role, full_name, account_status 
             FROM users 
             WHERE username = ?`,
            [username.trim()]
        );

        if (users.length === 0) {
            return res.status(401).json({
                success: false,
                message: 'Invalid username or password.'
            });
        }

        const user = users[0];

        if (user.account_status !== 'active') {
            return res.status(403).json({
                success: false,
                message: 'Your account is deactivated. Please contact the administrator.'
            });
        }

        const isMatch = await bcrypt.compare(password, user.password_hash);
        if (!isMatch) {
            return res.status(401).json({
                success: false,
                message: 'Invalid username or password.'
            });
        }

        // If specific role requested, verify it matches
        if (role && role !== user.role) {
            return res.status(403).json({
                success: false,
                message: `Account role mismatch: this account does not have '${role}' access.`
            });
        }

        // Regenerate session to prevent session fixation attacks
        req.session.regenerate((err) => {
            if (err) {
                return res.status(500).json({
                    success: false,
                    message: 'Session generation failed.'
                });
            }

            req.session.user = {
                id: user.id,
                username: user.username,
                email: user.email,
                role: user.role,
                fullName: user.full_name
            };

            recordAudit(user.id, 'USER_LOGIN', { role: user.role }, req.ip);

            return res.json({
                success: true,
                message: 'Login successful.',
                user: req.session.user
            });
        });
    } catch (err) {
        console.error('[Auth Controller] Login error:', err);
        return res.status(500).json({
            success: false,
            message: 'Server error during login. Please try again.'
        });
    }
}

/**
 * Handle user logout
 */
function logout(req, res) {
    if (req.session && req.session.user) {
        recordAudit(req.session.user.id, 'USER_LOGOUT', {}, req.ip);
    }
    req.session.destroy((err) => {
        if (err) {
            return res.status(500).json({
                success: false,
                message: 'Logout failed.'
            });
        }
        res.clearCookie('connect.sid');
        return res.json({
            success: true,
            message: 'Logged out successfully.'
        });
    });
}

/**
 * Handle student registration
 */
async function register(req, res) {
    try {
        const { username, password, email, fullName, enrollmentNumber } = req.body;

        if (!username || !password) {
            return res.status(400).json({
                success: false,
                message: 'Username and password are required.'
            });
        }

        if (username.length < 3 || username.length > 50) {
            return res.status(400).json({
                success: false,
                message: 'Username must be between 3 and 50 characters.'
            });
        }

        if (password.length < 6) {
            return res.status(400).json({
                success: false,
                message: 'Password must be at least 6 characters long.'
            });
        }

        const existing = await query(
            `SELECT id FROM users WHERE username = ? OR (email IS NOT NULL AND email = ?)`,
            [username.trim(), email ? email.trim() : null]
        );

        if (existing.length > 0) {
            return res.status(409).json({
                success: false,
                message: 'Username or email is already registered.'
            });
        }

        const passwordHash = await bcrypt.hash(password, 10);

        // Security rule: Public registration ONLY creates student role
        const result = await query(
            `INSERT INTO users (username, email, password_hash, role, full_name, account_status)
             VALUES (?, ?, ?, 'student', ?, 'active')`,
            [username.trim(), email ? email.trim() : null, passwordHash, fullName || username.trim()]
        );

        const newUserId = result.insertId;

        // Create student profile record
        await query(
            `INSERT INTO student_profiles (user_id, enrollment_number) VALUES (?, ?)`,
            [newUserId, enrollmentNumber || null]
        );

        recordAudit(newUserId, 'STUDENT_REGISTER', { username: username.trim() }, req.ip);

        return res.status(201).json({
            success: true,
            message: 'Registration successful! You may now log in.'
        });
    } catch (err) {
        console.error('[Auth Controller] Register error:', err);
        return res.status(500).json({
            success: false,
            message: 'Server error during registration.'
        });
    }
}

/**
 * Return currently authenticated user profile
 */
async function getMe(req, res) {
    if (!req.session || !req.session.user) {
        return res.status(401).json({
            success: false,
            authenticated: false,
            message: 'Not logged in.'
        });
    }

    try {
        const users = await query(
            `SELECT u.id, u.username, u.email, u.role, u.full_name, u.account_status,
                    p.enrollment_number, p.mobile_number, p.address, p.parent_name,
                    p.parent_mobile_number, p.study_year, p.branch, p.program, p.specialization
             FROM users u
             LEFT JOIN student_profiles p ON u.id = p.user_id
             WHERE u.id = ?`,
            [req.session.user.id]
        );

        if (users.length === 0) {
            return res.status(404).json({ success: false, message: 'User not found.' });
        }

        const user = users[0];
        return res.json({
            success: true,
            authenticated: true,
            user: {
                id: user.id,
                username: user.username,
                email: user.email,
                role: user.role,
                fullName: user.full_name,
                accountStatus: user.account_status,
                profile: user.role === 'student' ? {
                    enrollmentNumber: user.enrollment_number,
                    mobileNumber: user.mobile_number,
                    address: user.address,
                    parentName: user.parent_name,
                    parentMobileNumber: user.parent_mobile_number,
                    studyYear: user.study_year,
                    branch: user.branch,
                    program: user.program,
                    specialization: user.specialization
                } : null
            }
        });
    } catch (err) {
        console.error('[Auth Controller] getMe error:', err);
        return res.status(500).json({ success: false, message: 'Server error fetching user.' });
    }
}

module.exports = {
    login,
    logout,
    register,
    getMe
};
