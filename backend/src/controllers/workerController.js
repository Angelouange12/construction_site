const workerService = require('../services/workerService');
const { successResponse, paginatedResponse } = require('../utils/response');
const { asyncHandler } = require('../middleware/errorHandler');

/**
 * Get all workers
 * GET /api/workers
 */
const getAllWorkers = asyncHandler(async (req, res) => {
  const result = await workerService.getAllWorkers(req.query);
  paginatedResponse(res, result.workers, result.pagination, 'Workers retrieved successfully');
});

/**
 * Get worker by ID
 * GET /api/workers/:id
 */
const getWorkerById = asyncHandler(async (req, res) => {
  const worker = await workerService.getWorkerById(req.params.id);
  successResponse(res, worker, 'Worker retrieved successfully');
});

/**
 * Create a new worker
 * POST /api/workers
 */
const createWorker = asyncHandler(async (req, res) => {
  const worker = await workerService.createWorker(req.body);
  successResponse(res, worker, 'Worker created successfully', 201);
});

/**
 * Update worker
 * PUT /api/workers/:id
 */
const updateWorker = asyncHandler(async (req, res) => {
  const worker = await workerService.updateWorker(req.params.id, req.body);
  successResponse(res, worker, 'Worker updated successfully');
});

/**
 * Delete worker
 * DELETE /api/workers/:id
 */
const deleteWorker = asyncHandler(async (req, res) => {
  const result = await workerService.deleteWorker(req.params.id);
  successResponse(res, result, 'Worker deleted successfully');
});

/**
 * Assign worker to site
 * POST /api/workers/:id/assign
 */
const assignToSite = asyncHandler(async (req, res) => {
  const { siteId } = req.body;
  const worker = await workerService.assignToSite(req.params.id, siteId);
  successResponse(res, worker, 'Worker assigned to site successfully');
});

/**
 * Get workers by site
 * GET /api/workers/site/:siteId
 */
const getWorkersBySite = asyncHandler(async (req, res) => {
  const workers = await workerService.getWorkersBySite(req.params.siteId);
  successResponse(res, workers, 'Workers retrieved successfully');
});

/**
 * Get worker statistics
 * GET /api/workers/:id/stats
 */
const getWorkerStats = asyncHandler(async (req, res) => {
  const { startDate, endDate } = req.query;
  const stats = await workerService.getWorkerStats(req.params.id, startDate, endDate);
  successResponse(res, stats, 'Worker statistics retrieved successfully');
});

/**
 * Upload worker profile photo
 * POST /api/workers/:id/photo
 */
const uploadPhoto = asyncHandler(async (req, res) => {
  if (!req.file) {
    return res.status(400).json({ success: false, message: 'No file uploaded' });
  }
  
  const photoUrl = `/uploads/profiles/${req.file.filename}`;
  const worker = await workerService.updateWorker(req.params.id, { profilePhoto: photoUrl });
  successResponse(res, worker, 'Photo uploaded successfully');
});

module.exports = {
  getAllWorkers,
  getWorkerById,
  createWorker,
  updateWorker,
  deleteWorker,
  assignToSite,
  getWorkersBySite,
  getWorkerStats,
  uploadPhoto
};

