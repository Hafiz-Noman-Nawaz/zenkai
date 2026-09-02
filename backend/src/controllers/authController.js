// Authentication Controller
const AuthService = require('../services/authService');
const ApiResponse = require('../utils/apiResponse');
const catchAsync = require('../utils/asyncWrapper');

const register = catchAsync(async (req, res) => {
  const { username, email, password, displayName } = req.body;
  const result = await AuthService.registerUser({ username, email, password, displayName });
  return ApiResponse.created(res, result, 'User registered successfully');
});

const login = catchAsync(async (req, res) => {
  const { email, username, password } = req.body;
  const result = await AuthService.loginUser({ email, username, password });
  return ApiResponse.success(res, result, 'Login successful');
});

const getMe = catchAsync(async (req, res) => {
  const user = await AuthService.getCurrentUser(req.user.id);
  return ApiResponse.success(res, { user }, 'Current user retrieved successfully');
});

module.exports = {
  register,
  login,
  getMe,
};
