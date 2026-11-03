const express = require('express');
const router = express.Router();
const authController = require('../controllers/auth.controller');
const { loginLimiter } = require('../middleware/rateLimiter.middleware');
const { requireAuth } = require('../middleware/auth.middleware');

router.post('/login', loginLimiter, authController.login);
router.post('/logout', requireAuth, authController.logout);
router.post('/register', authController.register);
router.get('/me', authController.getMe);

module.exports = router;

