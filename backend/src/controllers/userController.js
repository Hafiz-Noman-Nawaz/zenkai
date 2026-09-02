// User Profile Controller
const UserService = require('../services/userService');
const ApiResponse = require('../utils/apiResponse');
const catchAsync = require('../utils/asyncWrapper');

const getPublicProfile = catchAsync(async (req, res) => {
  const { username } = req.params;
  const profile = await UserService.getUserByUsername(username);
  return ApiResponse.success(res, { profile }, 'User profile retrieved successfully');
});

const updateMe = catchAsync(async (req, res) => {
  const { displayName, bio, avatar, username } = req.body;
  const updatedUser = await UserService.updateProfile(req.user.id, {
    displayName,
    bio,
    avatar,
    username,
  });
  return ApiResponse.success(res, { user: updatedUser }, 'Profile updated successfully');
});

module.exports = {
  getPublicProfile,
  updateMe,
};
