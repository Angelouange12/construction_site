const auditService = require('../services/auditService');
const { successResponse } = require('../utils/response');
const { asyncHandler } = require('../middleware/errorHandler');

/**
 * Get audit logs
 * GET /api/audit-logs
 */
const getAuditLogs = asyncHandler(async (req, res) => {
  const result = await auditService.getAuditLogs(req.query);
  successResponse(res, result, 'Audit logs retrieved successfully');
});

/**
 * Get entity history
 * GET /api/audit-logs/entity/:entityType/:entityId
 */
const getEntityHistory = asyncHandler(async (req, res) => {
  const { entityType, entityId } = req.params;
  const history = await auditService.getEntityHistory(entityType, entityId);
  successResponse(res, history, 'Entity history retrieved');
});

/**
 * Get user activity
 * GET /api/audit-logs/user/:userId
 */
const getUserActivity = asyncHandler(async (req, res) => {
  const { limit } = req.query;
  const activity = await auditService.getUserActivity(req.params.userId, limit);
  successResponse(res, activity, 'User activity retrieved');
});

/**
 * Get activity summary
 * GET /api/audit-logs/summary
 */
const getActivitySummary = asyncHandler(async (req, res) => {
  const { days } = req.query;
  const summary = await auditService.getActivitySummary(days);
  successResponse(res, summary, 'Activity summary retrieved');
});

module.exports = {
  getAuditLogs,
  getEntityHistory,
  getUserActivity,
  getActivitySummary
};

