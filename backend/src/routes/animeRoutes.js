// Anime Catalog & Review Routes
const express = require('express');
const router = express.Router();
const animeController = require('../controllers/animeController');
const reviewController = require('../controllers/reviewController');
const { authMiddleware } = require('../middleware/authMiddleware');
const validate = require('../middleware/validateMiddleware');
const { animeQuerySchema, animeSearchQuerySchema } = require('../validators/animeValidator');
const { createReviewSchema } = require('../validators/reviewValidator');

// Genres listing
router.get('/genres/all', animeController.getAllGenres);
router.get('/genres', animeController.getAllGenres);

// Weekly Airing Schedule
router.get('/schedule', animeController.getWeeklySchedule);

// Personalized Recommendations
router.get('/recommendations', animeController.getRecommendations);

// Search & Catalog
router.get('/search', validate(animeSearchQuerySchema), animeController.searchAnime);
router.get('/', validate(animeQuerySchema), animeController.getAnimeList);

// Specific anime sub-resources
router.get('/:id/genres', animeController.getAnimeGenres);
router.get('/:id/stats', animeController.getAnimeStats);
router.get('/:id/relations', animeController.getFranchiseRelations);
router.get('/:animeId/reviews', reviewController.getAnimeReviews);
router.post('/:animeId/reviews', authMiddleware, validate(createReviewSchema), reviewController.createReview);

// Specific anime detail
router.get('/:id', animeController.getAnimeById);

module.exports = router;
