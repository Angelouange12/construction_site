const { Attachment, User } = require('../models');
const { getFileType, getFileUrl, deleteFile } = require('../config/upload');
const sharp = require('sharp');
const path = require('path');
const fs = require('fs');

class AttachmentService {
  /**
   * Create attachment record from uploaded file
   */
  async createAttachment(file, entityType, entityId, userId, category = 'other', description = '') {
    const fileType = getFileType(file.mimetype);
    const url = getFileUrl(file.filename, entityType);
    
    let thumbnailUrl = null;
    
    // Generate thumbnail for images
    if (fileType === 'image') {
      try {
        const thumbnailFilename = `thumb_${file.filename}`;
        const thumbnailPath = path.join(__dirname, '..', '..', 'uploads', 'thumbnails', thumbnailFilename);
        
        await sharp(file.path)
          .resize(200, 200, { fit: 'cover' })
          .toFile(thumbnailPath);
        
        thumbnailUrl = `/uploads/thumbnails/${thumbnailFilename}`;
      } catch (error) {
        console.error('Error generating thumbnail:', error);
      }
    }

    const attachment = await Attachment.create({
      filename: file.filename,
      originalName: file.originalname,
      mimeType: file.mimetype,
      size: file.size,
      url,
      thumbnailUrl,
      type: fileType,
      category,
      entityType,
      entityId,
      description,
      uploadedBy: userId
    });

    return this.getAttachmentById(attachment.id);
  }

  /**
   * Create multiple attachments
   */
  async createMultipleAttachments(files, entityType, entityId, userId, category = 'other') {
    const attachments = [];
    
    for (const file of files) {
      const attachment = await this.createAttachment(file, entityType, entityId, userId, category);
      attachments.push(attachment);
    }
    
    return attachments;
  }

  /**
   * Get attachment by ID
   */
  async getAttachmentById(id) {
    const attachment = await Attachment.findByPk(id, {
      include: [
        { model: User, as: 'uploader', attributes: ['id', 'name', 'email'] }
      ]
    });

    if (!attachment) {
      const error = new Error('Attachment not found');
      error.statusCode = 404;
      throw error;
    }

    return attachment;
  }

  /**
   * Get attachments by entity
   */
  async getAttachmentsByEntity(entityType, entityId, category = null) {
    const where = { entityType, entityId };
    if (category) where.category = category;

    return Attachment.findAll({
      where,
      include: [
        { model: User, as: 'uploader', attributes: ['id', 'name'] }
      ],
      order: [['createdAt', 'DESC']]
    });
  }

  /**
   * Get attachments grouped by category for an entity
   */
  async getAttachmentsGrouped(entityType, entityId) {
    const attachments = await this.getAttachmentsByEntity(entityType, entityId);
    
    const grouped = {
      images: attachments.filter(a => a.type === 'image'),
      documents: attachments.filter(a => a.type === 'document'),
      before: attachments.filter(a => a.category === 'before'),
      after: attachments.filter(a => a.category === 'after'),
      progress: attachments.filter(a => a.category === 'progress'),
      all: attachments
    };

    return grouped;
  }

  /**
   * Update attachment
   */
  async updateAttachment(id, updates) {
    const attachment = await Attachment.findByPk(id);

    if (!attachment) {
      const error = new Error('Attachment not found');
      error.statusCode = 404;
      throw error;
    }

    const allowedUpdates = ['category', 'description'];
    const filteredUpdates = {};

    allowedUpdates.forEach(field => {
      if (updates[field] !== undefined) {
        filteredUpdates[field] = updates[field];
      }
    });

    await attachment.update(filteredUpdates);
    return this.getAttachmentById(id);
  }

  /**
   * Delete attachment
   */
  async deleteAttachment(id) {
    const attachment = await Attachment.findByPk(id);

    if (!attachment) {
      const error = new Error('Attachment not found');
      error.statusCode = 404;
      throw error;
    }

    // Delete file from disk
    deleteFile(attachment.url);
    if (attachment.thumbnailUrl) {
      deleteFile(attachment.thumbnailUrl);
    }

    await attachment.destroy();
    return { message: 'Attachment deleted successfully' };
  }

  /**
   * Delete all attachments for an entity
   */
  async deleteAttachmentsByEntity(entityType, entityId) {
    const attachments = await Attachment.findAll({
      where: { entityType, entityId }
    });

    for (const attachment of attachments) {
      deleteFile(attachment.url);
      if (attachment.thumbnailUrl) {
        deleteFile(attachment.thumbnailUrl);
      }
      await attachment.destroy();
    }

    return { message: `Deleted ${attachments.length} attachments` };
  }

  /**
   * Get gallery for a site (before/after comparison)
   */
  async getSiteGallery(siteId) {
    const attachments = await this.getAttachmentsByEntity('site', siteId);
    
    return {
      before: attachments.filter(a => a.category === 'before'),
      after: attachments.filter(a => a.category === 'after'),
      progress: attachments.filter(a => a.category === 'progress'),
      other: attachments.filter(a => !['before', 'after', 'progress'].includes(a.category))
    };
  }
}

module.exports = new AttachmentService();

