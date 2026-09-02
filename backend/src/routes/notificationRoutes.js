// Notification Routes
const express = require('express');
const router = express.Router();
const notificationController = require('../controllers/notificationController');
const { authMiddleware } = require('../middleware/authMiddleware');

router.post('/test-email', authMiddleware, notificationController.sendTestEmail);

module.exports = router;
