const reportService = require('../services/reportService');
const { successResponse } = require('../utils/response');
const { asyncHandler } = require('../middleware/errorHandler');

/**
 * Get dashboard statistics
 * GET /api/reports/dashboard
 */
const getDashboardStats = asyncHandler(async (req, res) => {
  const stats = await reportService.getDashboardStats();
  successResponse(res, stats, 'Dashboard statistics retrieved successfully');
});

/**
 * Get site progress report
 * GET /api/reports/sites/progress
 */
const getSiteProgressReport = asyncHandler(async (req, res) => {
  const report = await reportService.getSiteProgressReport();
  successResponse(res, report, 'Site progress report retrieved successfully');
});

/**
 * Get expense report
 * GET /api/reports/expenses
 */
const getExpenseReport = asyncHandler(async (req, res) => {
  const report = await reportService.getExpenseReport(req.query);
  successResponse(res, report, 'Expense report retrieved successfully');
});

/**
 * Get worker productivity report
 * GET /api/reports/workers/productivity
 */
const getWorkerProductivityReport = asyncHandler(async (req, res) => {
  const report = await reportService.getWorkerProductivityReport(req.query);
  successResponse(res, report, 'Worker productivity report retrieved successfully');
});

/**
 * Get safety report
 * GET /api/reports/safety
 */
const getSafetyReport = asyncHandler(async (req, res) => {
  const report = await reportService.getSafetyReport(req.query);
  successResponse(res, report, 'Safety report retrieved successfully');
});

/**
 * Get budget vs actual report
 * GET /api/reports/budget-vs-actual
 */
const getBudgetVsActualReport = asyncHandler(async (req, res) => {
  const report = await reportService.getBudgetVsActualReport();
  successResponse(res, report, 'Budget vs actual report retrieved successfully');
});

/**
 * Get alerts summary
 * GET /api/reports/alerts
 */
const getAlertsSummary = asyncHandler(async (req, res) => {
  const alerts = await reportService.getAlertsSummary();
  successResponse(res, alerts, 'Alerts summary retrieved successfully');
});

module.exports = {
  getDashboardStats,
  getSiteProgressReport,
  getExpenseReport,
  getWorkerProductivityReport,
  getSafetyReport,
  getBudgetVsActualReport,
  getAlertsSummary
};

