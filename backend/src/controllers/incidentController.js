const incidentService = require('../services/incidentService');
const { successResponse, paginatedResponse } = require('../utils/response');
const { asyncHandler } = require('../middleware/errorHandler');

/**
 * Get all incidents
 * GET /api/incidents
 */
const getAllIncidents = asyncHandler(async (req, res) => {
  const result = await incidentService.getAllIncidents(req.query);
  paginatedResponse(res, result.incidents, result.pagination, 'Incidents retrieved successfully');
});

/**
 * Get incident by ID
 * GET /api/incidents/:id
 */
const getIncidentById = asyncHandler(async (req, res) => {
  const incident = await incidentService.getIncidentById(req.params.id);
  successResponse(res, incident, 'Incident retrieved successfully');
});

/**
 * Create a new incident
 * POST /api/incidents
 */
const createIncident = asyncHandler(async (req, res) => {
  const incident = await incidentService.createIncident(req.body, req.user.id);
  successResponse(res, incident, 'Incident reported successfully', 201);
});

/**
 * Update incident
 * PUT /api/incidents/:id
 */
const updateIncident = asyncHandler(async (req, res) => {
  const incident = await incidentService.updateIncident(req.params.id, req.body);
  successResponse(res, incident, 'Incident updated successfully');
});

/**
 * Delete incident
 * DELETE /api/incidents/:id
 */
const deleteIncident = asyncHandler(async (req, res) => {
  const result = await incidentService.deleteIncident(req.params.id);
  successResponse(res, result, 'Incident deleted successfully');
});

/**
 * Update incident status
 * PUT /api/incidents/:id/status
 */
const updateStatus = asyncHandler(async (req, res) => {
  const { status, actionTaken } = req.body;
  const incident = await incidentService.updateStatus(req.params.id, status, actionTaken);
  successResponse(res, incident, 'Incident status updated successfully');
});

/**
 * Get incidents by site
 * GET /api/incidents/site/:siteId
 */
const getIncidentsBySite = asyncHandler(async (req, res) => {
  const incidents = await incidentService.getIncidentsBySite(req.params.siteId);
  successResponse(res, incidents, 'Incidents retrieved successfully');
});

/**
 * Get incident statistics
 * GET /api/incidents/stats
 */
const getIncidentStats = asyncHandler(async (req, res) => {
  const stats = await incidentService.getIncidentStats(req.query);
  successResponse(res, stats, 'Incident statistics retrieved successfully');
});

module.exports = {
  getAllIncidents,
  getIncidentById,
  createIncident,
  updateIncident,
  deleteIncident,
  updateStatus,
  getIncidentsBySite,
  getIncidentStats
};

