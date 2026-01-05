const alertService = require('../services/alertService');
const { successResponse } = require('../utils/response');
const { asyncHandler } = require('../middleware/errorHandler');

/**
 * Get all alerts
 * GET /api/alerts
 */
const getAlerts = asyncHandler(async (req, res) => {
  const alerts = await alertService.getDashboardAlerts();
  successResponse(res, alerts, 'Alerts retrieved successfully');
});

/**
 * Run alert checks
 * POST /api/alerts/check
 */
const runAlertChecks = asyncHandler(async (req, res) => {
  const alerts = await alertService.runAllChecks();
  successResponse(res, alerts, `Found ${alerts.length} alerts`);
});

/**
 * Check if site can be closed
 * GET /api/alerts/sites/:siteId/can-close
 */
const canCloseSite = asyncHandler(async (req, res) => {
  const result = await alertService.canCloseSite(req.params.siteId);
  successResponse(res, result, 'Site closure check complete');
});

/**
 * Get suggestions for a site
 * GET /api/alerts/sites/:siteId/suggestions
 */
const getSiteSuggestions = asyncHandler(async (req, res) => {
  const suggestions = await alertService.getSiteSuggestions(req.params.siteId);
  successResponse(res, suggestions, 'Suggestions retrieved');
});

module.exports = {
  getAlerts,
  runAlertChecks,
  canCloseSite,
  getSiteSuggestions
};

