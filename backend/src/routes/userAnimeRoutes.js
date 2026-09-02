// User Anime List Routes (Mounted at /api/my-anime)
const express = require('express');
const router = express.Router();
const userAnimeController = require('../controllers/userAnimeController');
const { authMiddleware } = require('../middleware/authMiddleware');
const validate = require('../middleware/validateMiddleware');
const {
  createUserAnimeSchema,
  updateUserAnimeSchema,
  updateProgressSchema,
  updateScoreSchema,
  updateFavoriteSchema,
} = require('../validators/userAnimeValidator');

// All routes here require authentication
router.use(authMiddleware);

// Status-specific convenience endpoints
router.get('/watching', userAnimeController.getMyWatching);
router.get('/completed', userAnimeController.getMyCompleted);
router.get('/plan-to-watch', userAnimeController.getMyPlanToWatch);
router.get('/on-hold', userAnimeController.getMyOnHold);
router.get('/dropped', userAnimeController.getMyDropped);
router.get('/favorites', userAnimeController.getMyFavorites);

// Main collection endpoints
router.get('/', userAnimeController.getMyAnimeList);
router.post('/', validate(createUserAnimeSchema), userAnimeController.addOrUpdateMyAnime);

// Sub-actions on specific tracked anime
router.patch('/:animeId/progress', validate(updateProgressSchema), userAnimeController.updateProgress);
router.patch('/:animeId/score', validate(updateScoreSchema), userAnimeController.updateScore);
router.patch('/:animeId/favorite', validate(updateFavoriteSchema), userAnimeController.toggleFavorite);

// Item CRUD
router.get('/:animeId', userAnimeController.getMyAnimeEntry);
router.patch('/:animeId', validate(updateUserAnimeSchema), userAnimeController.addOrUpdateMyAnime);
router.delete('/:animeId', userAnimeController.removeMyAnime);

module.exports = router;
