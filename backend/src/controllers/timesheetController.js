const timesheetService = require('../services/timesheetService');
const { successResponse } = require('../utils/response');
const { asyncHandler } = require('../middleware/errorHandler');

/**
 * Generate timesheet
 * POST /api/timesheets/generate
 */
const generateTimesheet = asyncHandler(async (req, res) => {
  const { workerId, siteId, weekStartDate } = req.body;
  const timesheet = await timesheetService.generateTimesheet(workerId, siteId, weekStartDate);
  successResponse(res, timesheet, 'Timesheet generated successfully', 201);
});

/**
 * Get timesheets
 * GET /api/timesheets
 */
const getTimesheets = asyncHandler(async (req, res) => {
  const result = await timesheetService.getTimesheets(req.query);
  successResponse(res, result, 'Timesheets retrieved successfully');
});

/**
 * Get timesheet by ID
 * GET /api/timesheets/:id
 */
const getTimesheetById = asyncHandler(async (req, res) => {
  const timesheet = await timesheetService.getTimesheetById(req.params.id);
  successResponse(res, timesheet, 'Timesheet retrieved successfully');
});

/**
 * Submit timesheet
 * PUT /api/timesheets/:id/submit
 */
const submitTimesheet = asyncHandler(async (req, res) => {
  const timesheet = await timesheetService.submitTimesheet(req.params.id);
  successResponse(res, timesheet, 'Timesheet submitted for approval');
});

/**
 * Approve timesheet
 * PUT /api/timesheets/:id/approve
 */
const approveTimesheet = asyncHandler(async (req, res) => {
  const timesheet = await timesheetService.approveTimesheet(req.params.id, req.user.id);
  successResponse(res, timesheet, 'Timesheet approved');
});

/**
 * Reject timesheet
 * PUT /api/timesheets/:id/reject
 */
const rejectTimesheet = asyncHandler(async (req, res) => {
  const { reason } = req.body;
  const timesheet = await timesheetService.rejectTimesheet(req.params.id, req.user.id, reason);
  successResponse(res, timesheet, 'Timesheet rejected');
});

/**
 * Update timesheet notes
 * PUT /api/timesheets/:id
 */
const updateTimesheet = asyncHandler(async (req, res) => {
  const timesheet = await timesheetService.updateTimesheet(req.params.id, req.body);
  successResponse(res, timesheet, 'Timesheet updated');
});

/**
 * Get site timesheet summary
 * GET /api/timesheets/sites/:siteId/summary
 */
const getSiteSummary = asyncHandler(async (req, res) => {
  const { weekStartDate } = req.query;
  const summary = await timesheetService.getSiteSummary(req.params.siteId, weekStartDate);
  successResponse(res, summary, 'Site timesheet summary retrieved');
});

/**
 * Generate timesheets for all site workers
 * POST /api/timesheets/sites/:siteId/generate
 */
const generateSiteTimesheets = asyncHandler(async (req, res) => {
  const { weekStartDate } = req.body;
  const timesheets = await timesheetService.generateSiteTimesheets(req.params.siteId, weekStartDate);
  successResponse(res, timesheets, `Generated ${timesheets.length} timesheets`);
});

module.exports = {
  generateTimesheet,
  getTimesheets,
  getTimesheetById,
  submitTimesheet,
  approveTimesheet,
  rejectTimesheet,
  updateTimesheet,
  getSiteSummary,
  generateSiteTimesheets
};

