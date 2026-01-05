const notificationService = require('../services/notificationService');
const { successResponse } = require('../utils/response');
const { asyncHandler } = require('../middleware/errorHandler');

/**
 * Get user notifications
 * GET /api/notifications
 */
const getNotifications = asyncHandler(async (req, res) => {
  const { page, limit, unreadOnly } = req.query;
  const result = await notificationService.getUserNotifications(req.user.id, {
    page,
    limit,
    unreadOnly: unreadOnly === 'true'
  });
  successResponse(res, result, 'Notifications retrieved successfully');
});

/**
 * Get unread count
 * GET /api/notifications/unread-count
 */
const getUnreadCount = asyncHandler(async (req, res) => {
  const count = await notificationService.getUnreadCount(req.user.id);
  successResponse(res, { count }, 'Unread count retrieved');
});

/**
 * Mark notification as read
 * PUT /api/notifications/:id/read
 */
const markAsRead = asyncHandler(async (req, res) => {
  const notification = await notificationService.markAsRead(req.params.id, req.user.id);
  successResponse(res, notification, 'Notification marked as read');
});

/**
 * Mark all notifications as read
 * PUT /api/notifications/read-all
 */
const markAllAsRead = asyncHandler(async (req, res) => {
  const result = await notificationService.markAllAsRead(req.user.id);
  successResponse(res, result, 'All notifications marked as read');
});

/**
 * Delete notification
 * DELETE /api/notifications/:id
 */
const deleteNotification = asyncHandler(async (req, res) => {
  const result = await notificationService.deleteNotification(req.params.id, req.user.id);
  successResponse(res, result, 'Notification deleted');
});

module.exports = {
  getNotifications,
  getUnreadCount,
  markAsRead,
  markAllAsRead,
  deleteNotification
};

