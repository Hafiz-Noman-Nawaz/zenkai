// Anime Catalog Controller
const AnimeService = require('../services/animeService');
const ApiResponse = require('../utils/apiResponse');
const catchAsync = require('../utils/asyncWrapper');

const getAnimeList = catchAsync(async (req, res) => {
  const { page, limit, q, genre, status, season, seasonYear, type, letter, sortBy, sortOrder } = req.query;
  const result = await AnimeService.getAnimeList({
    page,
    limit,
    q,
    genre,
    status,
    season,
    seasonYear,
    type,
    letter,
    sortBy,
    sortOrder,
  });
  return ApiResponse.success(res, { anime: result.animes }, 'Anime catalog fetched successfully', 200, result.meta);
});

const searchAnime = catchAsync(async (req, res) => {
  const { q, page, limit } = req.query;
  const result = await AnimeService.searchAnime({ q, page, limit });
  return ApiResponse.success(res, { anime: result.animes }, 'Anime search results', 200, result.meta);
});

const getAnimeById = catchAsync(async (req, res) => {
  const { id } = req.params;
  const anime = await AnimeService.getAnimeById(id);
  return ApiResponse.success(res, { anime }, 'Anime details retrieved successfully');
});

const getAnimeGenres = catchAsync(async (req, res) => {
  const { id } = req.params;
  const genres = await AnimeService.getAnimeGenres(id);
  return ApiResponse.success(res, { genres }, 'Anime genres retrieved successfully');
});

const getAnimeStats = catchAsync(async (req, res) => {
  const { id } = req.params;
  const stats = await AnimeService.getAnimeStats(id);
  return ApiResponse.success(res, { stats }, 'Anime statistics retrieved successfully');
});

const getAllGenres = catchAsync(async (req, res) => {
  const genres = await AnimeService.getAllGenres();
  return ApiResponse.success(res, { genres }, 'Genres fetched successfully');
});

const getWeeklySchedule = catchAsync(async (req, res) => {
  const schedule = await AnimeService.getWeeklySchedule();
  return ApiResponse.success(res, { schedule }, 'Weekly airing schedule fetched successfully');
});

const getRecommendations = catchAsync(async (req, res) => {
  const userId = req.user?.id || null;
  const limit = parseInt(req.query.limit, 10) || 12;
  const recommendations = await AnimeService.getRecommendations(userId, limit);
  return ApiResponse.success(res, { recommendations }, 'Personalized anime recommendations fetched successfully');
});

const getFranchiseRelations = catchAsync(async (req, res) => {
  const { id } = req.params;
  const relations = await AnimeService.getFranchiseRelations(id);
  return ApiResponse.success(res, { relations }, 'Franchise watch order retrieved successfully');
});

module.exports = {
  getAnimeList,
  searchAnime,
  getAnimeById,
  getAnimeGenres,
  getAnimeStats,
  getAllGenres,
  getWeeklySchedule,
  getRecommendations,
  getFranchiseRelations,
};
