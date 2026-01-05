const attachmentService = require('../services/attachmentService');
const { successResponse } = require('../utils/response');
const { asyncHandler } = require('../middleware/errorHandler');

/**
 * Upload files to an entity
 * POST /api/attachments/:entityType/:entityId
 */
const uploadFiles = asyncHandler(async (req, res) => {
  const { entityType, entityId } = req.params;
  const { category, description } = req.body;
  
  if (!req.files || req.files.length === 0) {
    return res.status(400).json({
      success: false,
      error: { message: 'No files uploaded' }
    });
  }

  const attachments = await attachmentService.createMultipleAttachments(
    req.files,
    entityType,
    entityId,
    req.user.id,
    category || 'other'
  );

  successResponse(res, attachments, 'Files uploaded successfully', 201);
});

/**
 * Get attachments for an entity
 * GET /api/attachments/:entityType/:entityId
 */
const getAttachments = asyncHandler(async (req, res) => {
  const { entityType, entityId } = req.params;
  const { category, grouped } = req.query;
  
  let result;
  if (grouped === 'true') {
    result = await attachmentService.getAttachmentsGrouped(entityType, entityId);
  } else {
    result = await attachmentService.getAttachmentsByEntity(entityType, entityId, category);
  }
  
  successResponse(res, result, 'Attachments retrieved successfully');
});

/**
 * Get site gallery (before/after)
 * GET /api/attachments/sites/:siteId/gallery
 */
const getSiteGallery = asyncHandler(async (req, res) => {
  const { siteId } = req.params;
  const gallery = await attachmentService.getSiteGallery(siteId);
  successResponse(res, gallery, 'Gallery retrieved successfully');
});

/**
 * Get attachment by ID
 * GET /api/attachments/:id
 */
const getAttachmentById = asyncHandler(async (req, res) => {
  const attachment = await attachmentService.getAttachmentById(req.params.id);
  successResponse(res, attachment, 'Attachment retrieved successfully');
});

/**
 * Update attachment
 * PUT /api/attachments/:id
 */
const updateAttachment = asyncHandler(async (req, res) => {
  const attachment = await attachmentService.updateAttachment(req.params.id, req.body);
  successResponse(res, attachment, 'Attachment updated successfully');
});

/**
 * Delete attachment
 * DELETE /api/attachments/:id
 */
const deleteAttachment = asyncHandler(async (req, res) => {
  const result = await attachmentService.deleteAttachment(req.params.id);
  successResponse(res, result, 'Attachment deleted successfully');
});

/**
 * Delete all attachments for an entity
 * DELETE /api/attachments/:entityType/:entityId/all
 */
const deleteAllAttachments = asyncHandler(async (req, res) => {
  const { entityType, entityId } = req.params;
  const result = await attachmentService.deleteAttachmentsByEntity(entityType, entityId);
  successResponse(res, result, 'All attachments deleted successfully');
});

module.exports = {
  uploadFiles,
  getAttachments,
  getSiteGallery,
  getAttachmentById,
  updateAttachment,
  deleteAttachment,
  deleteAllAttachments
};

