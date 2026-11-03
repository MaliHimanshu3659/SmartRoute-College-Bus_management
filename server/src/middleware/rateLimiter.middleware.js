const rateLimit = require('express-rate-limit');

const loginLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 20, // limit each IP to 20 login attempts per window
    message: {
        success: false,
        message: 'Too many login attempts from this IP, please try again after 15 minutes.'
    },
    standardHeaders: true,
    legacyHeaders: false
});

const scanLimiter = rateLimit({
    windowMs: 1 * 60 * 1000, // 1 minute
    max: 30, // 30 scans per minute
    message: {
        success: false,
        message: 'Too many attendance scan attempts. Please wait a few seconds and try again.'
    },
    standardHeaders: true,
    legacyHeaders: false
});

module.exports = {
    loginLimiter,
    scanLimiter
};

