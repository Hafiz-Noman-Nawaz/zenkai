// Review Routes (Mounted at /api/reviews)
const express = require('express');
const router = express.Router();
const reviewController = require('../controllers/reviewController');
const { authMiddleware } = require('../middleware/authMiddleware');
const validate = require('../middleware/validateMiddleware');
const { updateReviewSchema } = require('../validators/reviewValidator');

// Public: Get global recent reviews
router.get('/', reviewController.getRecentReviews);

// Protected: Update, Delete or Vote user review
router.patch('/:reviewId', authMiddleware, validate(updateReviewSchema), reviewController.updateReview);
router.delete('/:reviewId', authMiddleware, reviewController.deleteReview);
router.post('/:reviewId/helpful', authMiddleware, reviewController.voteHelpful);

module.exports = router;
