const materialService = require('../services/materialService');
const { successResponse, paginatedResponse } = require('../utils/response');
const { asyncHandler } = require('../middleware/errorHandler');

/**
 * Get all materials
 * GET /api/materials
 */
const getAllMaterials = asyncHandler(async (req, res) => {
  const result = await materialService.getAllMaterials(req.query);
  paginatedResponse(res, result.materials, result.pagination, 'Materials retrieved successfully');
});

/**
 * Get material by ID
 * GET /api/materials/:id
 */
const getMaterialById = asyncHandler(async (req, res) => {
  const material = await materialService.getMaterialById(req.params.id);
  successResponse(res, material, 'Material retrieved successfully');
});

/**
 * Create a new material
 * POST /api/materials
 */
const createMaterial = asyncHandler(async (req, res) => {
  const material = await materialService.createMaterial(req.body);
  successResponse(res, material, 'Material created successfully', 201);
});

/**
 * Update material
 * PUT /api/materials/:id
 */
const updateMaterial = asyncHandler(async (req, res) => {
  const material = await materialService.updateMaterial(req.params.id, req.body);
  successResponse(res, material, 'Material updated successfully');
});

/**
 * Delete material
 * DELETE /api/materials/:id
 */
const deleteMaterial = asyncHandler(async (req, res) => {
  const result = await materialService.deleteMaterial(req.params.id);
  successResponse(res, result, 'Material deleted successfully');
});

/**
 * Add stock to material
 * POST /api/materials/:id/add-stock
 */
const addStock = asyncHandler(async (req, res) => {
  const { quantity } = req.body;
  const material = await materialService.addStock(req.params.id, quantity);
  successResponse(res, material, 'Stock added successfully');
});

/**
 * Record material usage
 * POST /api/materials/usage
 */
const recordUsage = asyncHandler(async (req, res) => {
  const usage = await materialService.recordUsage(req.body);
  successResponse(res, usage, 'Material usage recorded successfully', 201);
});

/**
 * Get low stock alerts
 * GET /api/materials/alerts/low-stock
 */
const getLowStockAlerts = asyncHandler(async (req, res) => {
  const materials = await materialService.getLowStockAlerts();
  successResponse(res, materials, 'Low stock alerts retrieved successfully');
});

/**
 * Get material usage by site
 * GET /api/materials/usage/site/:siteId
 */
const getUsageBySite = asyncHandler(async (req, res) => {
  const result = await materialService.getUsageBySite(req.params.siteId);
  successResponse(res, result, 'Material usage retrieved successfully');
});

/**
 * Upload material photo
 * POST /api/materials/:id/photo
 */
const uploadPhoto = asyncHandler(async (req, res) => {
  if (!req.file) {
    return res.status(400).json({ success: false, message: 'No file uploaded' });
  }
  
  const entityType = req.params.entityType || 'materials';
  const photoUrl = `/uploads/${entityType}/${req.file.filename}`;
  const material = await materialService.updateMaterial(req.params.id, { photo: photoUrl });
  successResponse(res, material, 'Photo uploaded successfully');
});

module.exports = {
  getAllMaterials,
  getMaterialById,
  createMaterial,
  updateMaterial,
  deleteMaterial,
  addStock,
  recordUsage,
  getLowStockAlerts,
  getUsageBySite,
  uploadPhoto
};

