const siteService = require('../services/siteService');
const { successResponse, paginatedResponse } = require('../utils/response');
const { asyncHandler } = require('../middleware/errorHandler');

/**
 * Get all sites
 * GET /api/sites
 */
const getAllSites = asyncHandler(async (req, res) => {
  // If user is chef_chantier, only show their sites
  if (req.user.role === 'chef_chantier') {
    req.query.managerId = req.user.id;
  }
  
  const result = await siteService.getAllSites(req.query);
  paginatedResponse(res, result.sites, result.pagination, 'Sites retrieved successfully');
});

/**
 * Get site by ID
 * GET /api/sites/:id
 */
const getSiteById = asyncHandler(async (req, res) => {
  const site = await siteService.getSiteById(req.params.id);
  successResponse(res, site, 'Site retrieved successfully');
});

/**
 * Create a new site
 * POST /api/sites
 */
const createSite = asyncHandler(async (req, res) => {
  // Set current user as manager if not specified
  if (!req.body.managerId) {
    req.body.managerId = req.user.id;
  }
  
  const site = await siteService.createSite(req.body);
  successResponse(res, site, 'Site created successfully', 201);
});

/**
 * Update site
 * PUT /api/sites/:id
 */
const updateSite = asyncHandler(async (req, res) => {
  const site = await siteService.updateSite(req.params.id, req.body);
  successResponse(res, site, 'Site updated successfully');
});

/**
 * Delete site
 * DELETE /api/sites/:id
 */
const deleteSite = asyncHandler(async (req, res) => {
  const result = await siteService.deleteSite(req.params.id);
  successResponse(res, result, 'Site deleted successfully');
});

/**
 * Get site statistics
 * GET /api/sites/:id/stats
 */
const getSiteStats = asyncHandler(async (req, res) => {
  const stats = await siteService.getSiteStats(req.params.id);
  successResponse(res, stats, 'Site statistics retrieved successfully');
});

/**
 * Get sites for current manager
 * GET /api/sites/my-sites
 */
const getMySites = asyncHandler(async (req, res) => {
  const sites = await siteService.getSitesByManager(req.user.id);
  successResponse(res, sites, 'Sites retrieved successfully');
});

module.exports = {
  getAllSites,
  getSiteById,
  createSite,
  updateSite,
  deleteSite,
  getSiteStats,
  getMySites
};

