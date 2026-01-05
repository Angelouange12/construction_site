const assignmentService = require('../services/assignmentService');
const { successResponse } = require('../utils/response');
const { asyncHandler } = require('../middleware/errorHandler');

/**
 * Create assignment
 * POST /api/assignments
 */
const createAssignment = asyncHandler(async (req, res) => {
  const assignment = await assignmentService.createAssignment(req.body, req.user.id);
  successResponse(res, assignment, 'Assignment created successfully', 201);
});

/**
 * Get all assignments
 * GET /api/assignments
 */
const getAssignments = asyncHandler(async (req, res) => {
  const result = await assignmentService.getAssignments(req.query);
  successResponse(res, result, 'Assignments retrieved successfully');
});

/**
 * Get assignment by ID
 * GET /api/assignments/:id
 */
const getAssignmentById = asyncHandler(async (req, res) => {
  const assignment = await assignmentService.getAssignmentById(req.params.id);
  successResponse(res, assignment, 'Assignment retrieved successfully');
});

/**
 * Get worker assignments
 * GET /api/assignments/worker/:workerId
 */
const getWorkerAssignments = asyncHandler(async (req, res) => {
  const assignments = await assignmentService.getWorkerAssignments(req.params.workerId);
  successResponse(res, assignments, 'Worker assignments retrieved');
});

/**
 * Get site assignments
 * GET /api/assignments/site/:siteId
 */
const getSiteAssignments = asyncHandler(async (req, res) => {
  const assignments = await assignmentService.getSiteAssignments(req.params.siteId);
  successResponse(res, assignments, 'Site assignments retrieved');
});

/**
 * Update assignment
 * PUT /api/assignments/:id
 */
const updateAssignment = asyncHandler(async (req, res) => {
  const assignment = await assignmentService.updateAssignment(req.params.id, req.body, req.user.id);
  successResponse(res, assignment, 'Assignment updated successfully');
});

/**
 * Complete assignment
 * PUT /api/assignments/:id/complete
 */
const completeAssignment = asyncHandler(async (req, res) => {
  const assignment = await assignmentService.completeAssignment(req.params.id, req.user.id);
  successResponse(res, assignment, 'Assignment completed');
});

/**
 * Cancel assignment
 * PUT /api/assignments/:id/cancel
 */
const cancelAssignment = asyncHandler(async (req, res) => {
  const { reason } = req.body;
  const assignment = await assignmentService.cancelAssignment(req.params.id, req.user.id, reason);
  successResponse(res, assignment, 'Assignment cancelled');
});

/**
 * Reassign
 * POST /api/assignments/:id/reassign
 */
const reassign = asyncHandler(async (req, res) => {
  const { newAssigneeId, reason } = req.body;
  const assignment = await assignmentService.reassign(req.params.id, newAssigneeId, req.user.id, reason);
  successResponse(res, assignment, 'Reassignment successful');
});

/**
 * Get assignment history
 * GET /api/assignments/:id/history
 */
const getAssignmentHistory = asyncHandler(async (req, res) => {
  const history = await assignmentService.getAssignmentHistory(req.params.id);
  successResponse(res, history, 'Assignment history retrieved');
});

/**
 * Get worker timeline
 * GET /api/assignments/worker/:workerId/timeline
 */
const getWorkerTimeline = asyncHandler(async (req, res) => {
  const { startDate, endDate } = req.query;
  const timeline = await assignmentService.getWorkerTimeline(req.params.workerId, startDate, endDate);
  successResponse(res, timeline, 'Worker timeline retrieved');
});

/**
 * Check conflicts
 * POST /api/assignments/check-conflicts
 */
const checkConflicts = asyncHandler(async (req, res) => {
  const conflicts = await assignmentService.checkConflicts(req.body);
  successResponse(res, { conflicts, hasConflicts: conflicts.length > 0 }, 'Conflict check complete');
});

module.exports = {
  createAssignment,
  getAssignments,
  getAssignmentById,
  getWorkerAssignments,
  getSiteAssignments,
  updateAssignment,
  completeAssignment,
  cancelAssignment,
  reassign,
  getAssignmentHistory,
  getWorkerTimeline,
  checkConflicts
};

