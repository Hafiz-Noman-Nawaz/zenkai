// Notification Dispatch & Management Controller
const emailService = require('../services/emailService');
const radarService = require('../services/radarService');
const ApiResponse = require('../utils/apiResponse');
const catchAsync = require('../utils/asyncWrapper');

const getUserRadar = catchAsync(async (req, res) => {
  const feed = await radarService.getUserRadarFeed(req.user.id);
  return ApiResponse.success(res, feed, 'User radar notification feed fetched');
});

const dispatchRadarAlerts = catchAsync(async (req, res) => {
  const result = await radarService.dispatchRadarAlerts(req.user.id);
  return ApiResponse.success(res, result, 'Radar alerts dispatched to user');
});

const sendTestAiringEmail = catchAsync(async (req, res) => {
  const user = req.user;
  const result = await emailService.sendAiringAlertEmail(
    user,
    'Solo Leveling Season 2: Arise from the Shadow',
    8,
    'cmtj1naq6000euqtrvmxtdwut'
  );
  return ApiResponse.success(res, result, `Test anime airing notification email dispatched to ${user.email}`);
});

const sendTestAnnouncementEmail = catchAsync(async (req, res) => {
  const user = req.user;
  const result = await emailService.sendFranchiseAnnouncementEmail(
    user,
    'Demon Slayer: Kimetsu no Yaiba',
    'Demon Slayer: Kimetsu no Yaiba - Infinity Castle Arc Movie Trilogy',
    'Movie Trilogy',
    'cmtj1naq6000euqtrvmxtdwut'
  );
  return ApiResponse.success(res, result, `Test franchise announcement email dispatched to ${user.email}`);
});

module.exports = {
  getUserRadar,
  dispatchRadarAlerts,
  sendTestAiringEmail,
  sendTestAnnouncementEmail,
};
