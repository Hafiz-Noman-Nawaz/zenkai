// Statistics Controller
const StatsService = require('../services/statsService');
const UserService = require('../services/userService');
const ApiResponse = require('../utils/apiResponse');
const catchAsync = require('../utils/asyncWrapper');

const getMyStatistics = catchAsync(async (req, res) => {
  const stats = await StatsService.getUserStatistics(req.user.id);
  return ApiResponse.success(res, { statistics: stats }, 'User anime statistics retrieved successfully');
});

const getUserStatisticsByUsername = catchAsync(async (req, res) => {
  const { username } = req.params;
  const user = await UserService.getUserByUsername(username);
  const stats = await StatsService.getUserStatistics(user.id);
  return ApiResponse.success(res, { statistics: stats }, 'User anime statistics retrieved successfully');
});

module.exports = {
  getMyStatistics,
  getUserStatisticsByUsername,
};
