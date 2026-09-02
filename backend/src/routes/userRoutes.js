// User Profile Routes
const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');
const statsController = require('../controllers/statsController');
const { authMiddleware } = require('../middleware/authMiddleware');
const validate = require('../middleware/validateMiddleware');
const { updateProfileSchema } = require('../validators/userValidator');

// Statistics endpoints
router.get('/me/statistics', authMiddleware, statsController.getMyStatistics);
router.get('/:username/statistics', statsController.getUserStatisticsByUsername);

// Profile endpoints
router.put('/me/pins', authMiddleware, userController.updateMyPins);
router.patch('/me', authMiddleware, validate(updateProfileSchema), userController.updateMe);
router.get('/:username', userController.getPublicProfile);

module.exports = router;
