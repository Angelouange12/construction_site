const express = require('express');
const router = express.Router();
const attachmentController = require('../controllers/attachmentController');
const { authenticate, isAdminOrChef } = require('../middleware/auth');
const { upload } = require('../config/upload');

// All routes require authentication
router.use(authenticate);

// Upload files to an entity
router.post(
  '/:entityType/:entityId',
  upload.array('files', 10),
  attachmentController.uploadFiles
);

// Get site gallery
router.get('/sites/:siteId/gallery', attachmentController.getSiteGallery);

// Get attachments for an entity
router.get('/:entityType/:entityId', attachmentController.getAttachments);

// Get single attachment
router.get('/file/:id', attachmentController.getAttachmentById);

// Update attachment
router.put('/file/:id', attachmentController.updateAttachment);

// Delete attachment
router.delete('/file/:id', attachmentController.deleteAttachment);

// Delete all attachments for an entity
router.delete('/:entityType/:entityId/all', isAdminOrChef, attachmentController.deleteAllAttachments);

module.exports = router;

