const express = require('express');
const session = require('express-session');
const MySQLStore = require('express-mysql-session')(session);
const helmet = require('helmet');
const cors = require('cors');
const path = require('path');
require('dotenv').config();

const { pool } = require('./config/database');
const authRoutes = require('./routes/auth.routes');
const availabilityRoutes = require('./routes/availability.routes');
const stopsRoutes = require('./routes/stops.routes');
const driverRoutes = require('./routes/driver.routes');
const attendanceRoutes = require('./routes/attendance.routes');
const adminRoutes = require('./routes/admin.routes');

const app = express();

// Security HTTP headers (disable strict CSP so CDNs, map tiles, webcams, and inline events work seamlessly)
app.use(helmet({
    contentSecurityPolicy: false,
    crossOriginEmbedderPolicy: false,
    crossOriginResourcePolicy: false
}));

app.use(cors({
    origin: true,
    credentials: true
}));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// MySQL persistent session store
let sessionStore;
try {
    sessionStore = new MySQLStore({
        clearExpired: true,
        checkExpirationInterval: 900000, // Check every 15 min
        expiration: 86400000 // 1 day
    }, pool);
} catch (err) {
    console.warn('[Session Store] Could not initialize MySQL session store, falling back to memory store:', err.message);
}

app.use(session({
    key: 'smartroute_sid',
    secret: process.env.SESSION_SECRET || 'smartroute_dev_secret_key_change_me',
    store: sessionStore,
    resave: false,
    saveUninitialized: false,
    cookie: {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        maxAge: 24 * 60 * 60 * 1000 // 24 hours
    }
}));

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/availability', availabilityRoutes);
app.use('/api', stopsRoutes);
app.use('/api/driver', driverRoutes);
app.use('/api/attendance', attendanceRoutes);
app.use('/api/admin', adminRoutes);

// Health check endpoint
app.get('/api/health', (req, res) => {
    res.json({
        status: 'UP',
        service: 'SmartRoute Express API',
        timestamp: new Date().toISOString(),
        uptime: process.uptime()
    });
});

// Serve frontend static client
const clientPath = path.join(__dirname, '../../client');
app.use(express.static(clientPath));

// Backward compatibility redirects for direct legacy URLs
app.get('/dashboard', (req, res) => res.redirect('/student-dashboard.html'));
app.get('/driver_dashboard', (req, res) => res.redirect('/driver-dashboard.html'));
app.get('/time_table', (req, res) => res.redirect('/availability.html'));
app.get('/attendance-history', (req, res) => res.redirect('/attendance.html'));
app.get('/student-profile', (req, res) => res.redirect('/student-profile.html'));
app.get('/login', (req, res) => res.redirect('/login.html'));
app.get('/signup', (req, res) => res.redirect('/signup.html'));

// Fallback for HTML5 client routing
app.use((req, res, next) => {
    if (req.method === 'GET' && !req.path.startsWith('/api')) {
        return res.sendFile(path.join(clientPath, 'index.html'));
    }
    next();
});

// 404 handler for API routes
app.use('/api', (req, res) => {
    res.status(404).json({
        success: false,
        message: `API endpoint '${req.originalUrl}' not found.`
    });
});

// Global central error handler
app.use((err, req, res, next) => {
    console.error('[Global Error Handler]', err);
    res.status(err.status || 500).json({
        success: false,
        message: process.env.NODE_ENV === 'production'
            ? 'An unexpected internal server error occurred.'
            : (err.message || 'Internal server error')
    });
});

module.exports = app;
