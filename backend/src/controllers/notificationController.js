// Notification Dispatch & Management Controller
const emailService = require('../services/emailService');
const ApiResponse = require('../utils/apiResponse');
const catchAsync = require('../utils/asyncWrapper');

const sendTestEmail = catchAsync(async (req, res) => {
  const user = req.user;
  const result = await emailService.sendAiringAlertEmail(
    user,
    'Solo Leveling Season 2: Arise from the Shadow',
    8,
    'cmtj1naq6000euqtrvmxtdwut'
  );
  return ApiResponse.success(res, result, `Test anime notification email dispatched to ${user.email}`);
});

module.exports = {
  sendTestEmail,
};
