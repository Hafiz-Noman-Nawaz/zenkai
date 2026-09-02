// Review Controller
const ReviewService = require('../services/reviewService');
const ApiResponse = require('../utils/apiResponse');
const catchAsync = require('../utils/asyncWrapper');

const getRecentReviews = catchAsync(async (req, res) => {
  const { page, limit } = req.query;
  const result = await ReviewService.getRecentReviews({
    page: page ? parseInt(page, 10) : undefined,
    limit: limit ? parseInt(limit, 10) : undefined,
  });
  return ApiResponse.success(res, { reviews: result.reviews }, 'Recent reviews fetched', 200, result.meta);
});

const getAnimeReviews = catchAsync(async (req, res) => {
  const { animeId } = req.params;
  const { page, limit } = req.query;
  const result = await ReviewService.getAnimeReviews(animeId, {
    page: page ? parseInt(page, 10) : undefined,
    limit: limit ? parseInt(limit, 10) : undefined,
  });
  return ApiResponse.success(res, { reviews: result.reviews }, 'Anime reviews fetched', 200, result.meta);
});

const createReview = catchAsync(async (req, res) => {
  const { animeId } = req.params;
  const { title, content, rating } = req.body;
  const review = await ReviewService.createReview(req.user.id, animeId, { title, content, rating });
  return ApiResponse.created(res, { review }, 'Review published successfully');
});

const updateReview = catchAsync(async (req, res) => {
  const { reviewId } = req.params;
  const { title, content, rating } = req.body;
  const review = await ReviewService.updateReview(req.user.id, reviewId, { title, content, rating });
  return ApiResponse.success(res, { review }, 'Review updated successfully');
});

const deleteReview = catchAsync(async (req, res) => {
  const { reviewId } = req.params;
  const result = await ReviewService.deleteReview(req.user.id, reviewId);
  return ApiResponse.success(res, result, 'Review deleted successfully');
});

const voteHelpful = catchAsync(async (req, res) => {
  const { reviewId } = req.params;
  const result = await ReviewService.voteHelpful(req.user.id, reviewId);
  return ApiResponse.success(res, result, result.message);
});

module.exports = {
  getRecentReviews,
  getAnimeReviews,
  createReview,
  updateReview,
  deleteReview,
  voteHelpful,
};
