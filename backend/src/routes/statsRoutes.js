// Statistics Routes (Mounted at /api/statistics)
const express = require('express');
const router = express.Router();
const statsController = require('../controllers/statsController');
const { authMiddleware } = require('../middleware/authMiddleware');

router.get('/me', authMiddleware, statsController.getMyStatistics);
router.get('/users/:username', statsController.getUserStatisticsByUsername);

module.exports = router;
