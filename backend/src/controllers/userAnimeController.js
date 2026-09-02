// User Anime List Controller
const UserAnimeService = require('../services/userAnimeService');
const ApiResponse = require('../utils/apiResponse');
const catchAsync = require('../utils/asyncWrapper');
const { WATCH_STATUS } = require('../config/constants');

const getMyAnimeList = catchAsync(async (req, res) => {
  const { status, isFavorite, page, limit, sortBy, sortOrder, search } = req.query;
  const result = await UserAnimeService.getUserAnimeList(req.user.id, {
    status,
    isFavorite,
    page: page ? parseInt(page, 10) : undefined,
    limit: limit ? parseInt(limit, 10) : undefined,
    sortBy,
    sortOrder,
    search,
  });
  return ApiResponse.success(res, { list: result.entries }, 'User anime list fetched successfully', 200, result.meta);
});

const getMyWatching = catchAsync(async (req, res) => {
  const { page, limit, sortBy, sortOrder, search } = req.query;
  const result = await UserAnimeService.getUserAnimeList(req.user.id, {
    status: WATCH_STATUS.WATCHING,
    page: page ? parseInt(page, 10) : undefined,
    limit: limit ? parseInt(limit, 10) : undefined,
    sortBy,
    sortOrder,
    search,
  });
  return ApiResponse.success(res, { list: result.entries }, 'Currently watching list fetched successfully', 200, result.meta);
});

const getMyCompleted = catchAsync(async (req, res) => {
  const { page, limit, sortBy, sortOrder, search } = req.query;
  const result = await UserAnimeService.getUserAnimeList(req.user.id, {
    status: WATCH_STATUS.COMPLETED,
    page: page ? parseInt(page, 10) : undefined,
    limit: limit ? parseInt(limit, 10) : undefined,
    sortBy,
    sortOrder,
    search,
  });
  return ApiResponse.success(res, { list: result.entries }, 'Completed anime list fetched successfully', 200, result.meta);
});

const getMyPlanToWatch = catchAsync(async (req, res) => {
  const { page, limit, sortBy, sortOrder, search } = req.query;
  const result = await UserAnimeService.getUserAnimeList(req.user.id, {
    status: WATCH_STATUS.PLAN_TO_WATCH,
    page: page ? parseInt(page, 10) : undefined,
    limit: limit ? parseInt(limit, 10) : undefined,
    sortBy,
    sortOrder,
    search,
  });
  return ApiResponse.success(res, { list: result.entries }, 'Plan-to-watch anime list fetched successfully', 200, result.meta);
});

const getMyOnHold = catchAsync(async (req, res) => {
  const { page, limit, sortBy, sortOrder, search } = req.query;
  const result = await UserAnimeService.getUserAnimeList(req.user.id, {
    status: WATCH_STATUS.ON_HOLD,
    page: page ? parseInt(page, 10) : undefined,
    limit: limit ? parseInt(limit, 10) : undefined,
    sortBy,
    sortOrder,
    search,
  });
  return ApiResponse.success(res, { list: result.entries }, 'On-hold anime list fetched successfully', 200, result.meta);
});

const getMyDropped = catchAsync(async (req, res) => {
  const { page, limit, sortBy, sortOrder, search } = req.query;
  const result = await UserAnimeService.getUserAnimeList(req.user.id, {
    status: WATCH_STATUS.DROPPED,
    page: page ? parseInt(page, 10) : undefined,
    limit: limit ? parseInt(limit, 10) : undefined,
    sortBy,
    sortOrder,
    search,
  });
  return ApiResponse.success(res, { list: result.entries }, 'Dropped anime list fetched successfully', 200, result.meta);
});

const getMyFavorites = catchAsync(async (req, res) => {
  const { page, limit, sortBy, sortOrder, search } = req.query;
  const result = await UserAnimeService.getUserAnimeList(req.user.id, {
    isFavorite: true,
    page: page ? parseInt(page, 10) : undefined,
    limit: limit ? parseInt(limit, 10) : undefined,
    sortBy,
    sortOrder,
    search,
  });
  return ApiResponse.success(res, { list: result.entries }, 'Favorite anime list fetched successfully', 200, result.meta);
});

const getMyAnimeEntry = catchAsync(async (req, res) => {
  const { animeId } = req.params;
  const entry = await UserAnimeService.getUserAnimeEntry(req.user.id, animeId);
  return ApiResponse.success(res, { entry }, 'Anime tracking details fetched');
});

const addOrUpdateMyAnime = catchAsync(async (req, res) => {
  const animeId = req.params.animeId || req.body.animeId;
  const entry = await UserAnimeService.upsertUserAnime(req.user.id, animeId, req.body);
  return ApiResponse.success(res, { entry }, 'Anime tracking list updated successfully');
});

const updateProgress = catchAsync(async (req, res) => {
  const { animeId } = req.params;
  const { progress } = req.body;
  const entry = await UserAnimeService.updateProgress(req.user.id, animeId, progress);
  return ApiResponse.success(res, { entry }, `Progress updated to episode ${progress}`);
});

const updateScore = catchAsync(async (req, res) => {
  const { animeId } = req.params;
  const { score } = req.body;
  const entry = await UserAnimeService.updateScore(req.user.id, animeId, score);
  return ApiResponse.success(res, { entry }, `Personal score updated to ${score}`);
});

const toggleFavorite = catchAsync(async (req, res) => {
  const { animeId } = req.params;
  const { isFavorite } = req.body;
  const entry = await UserAnimeService.toggleFavorite(req.user.id, animeId, isFavorite);
  return ApiResponse.success(res, { entry }, isFavorite ? 'Added to favorites' : 'Removed from favorites');
});

const removeMyAnime = catchAsync(async (req, res) => {
  const { animeId } = req.params;
  const result = await UserAnimeService.removeUserAnime(req.user.id, animeId);
  return ApiResponse.success(res, result, 'Anime removed from tracking list successfully');
});

module.exports = {
  getMyAnimeList,
  getMyWatching,
  getMyCompleted,
  getMyPlanToWatch,
  getMyOnHold,
  getMyDropped,
  getMyFavorites,
  getMyAnimeEntry,
  addOrUpdateMyAnime,
  updateProgress,
  updateScore,
  toggleFavorite,
  removeMyAnime,
};
