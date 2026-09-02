// Notification Routes
const express = require('express');
const router = express.Router();
const notificationController = require('../controllers/notificationController');
const { authMiddleware } = require('../middleware/authMiddleware');

router.get('/radar', authMiddleware, notificationController.getUserRadar);
router.post('/dispatch-radar-alerts', authMiddleware, notificationController.dispatchRadarAlerts);
router.post('/test-airing-email', authMiddleware, notificationController.sendTestAiringEmail);
router.post('/test-announcement-email', authMiddleware, notificationController.sendTestAnnouncementEmail);
router.post('/test-email', authMiddleware, notificationController.sendTestAiringEmail);

module.exports = router;
