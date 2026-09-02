// Curated Lists Controller
const ListService = require('../services/listService');
const ApiResponse = require('../utils/apiResponse');
const catchAsync = require('../utils/asyncWrapper');

const getPublicLists = catchAsync(async (req, res) => {
  const { page, limit, search } = req.query;
  const result = await ListService.getPublicLists({ page, limit, search });
  return ApiResponse.success(res, { lists: result.lists }, 'Public collections fetched successfully', 200, result.meta);
});

const getListById = catchAsync(async (req, res) => {
  const { id } = req.params;
  const list = await ListService.getListById(id);
  return ApiResponse.success(res, { list }, 'Collection details retrieved successfully');
});

const createList = catchAsync(async (req, res) => {
  const userId = req.user.id;
  const { title, description, isPublic, animeIds } = req.body;
  const list = await ListService.createList(userId, { title, description, isPublic, animeIds });
  return ApiResponse.success(res, { list }, 'Collection created successfully', 201);
});

const deleteList = catchAsync(async (req, res) => {
  const userId = req.user.id;
  const { id } = req.params;
  const result = await ListService.deleteList(userId, id);
  return ApiResponse.success(res, result, 'Collection deleted successfully');
});

module.exports = {
  getPublicLists,
  getListById,
  createList,
  deleteList,
};
