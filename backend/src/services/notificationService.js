const { Notification, User } = require('../models');
const { Op } = require('sequelize');

class NotificationService {
  /**
   * Create a notification
   */
  async createNotification(data) {
    const notification = await Notification.create(data);
    return notification;
  }

  /**
   * Create notifications for multiple users
   */
  async createBulkNotifications(userIds, notificationData) {
    const notifications = userIds.map(userId => ({
      ...notificationData,
      userId
    }));
    
    return Notification.bulkCreate(notifications);
  }

  /**
   * Send notification to users by role
   */
  async notifyByRole(role, notificationData) {
    const users = await User.findAll({
      where: { role, isActive: true },
      attributes: ['id']
    });

    const userIds = users.map(u => u.id);
    return this.createBulkNotifications(userIds, notificationData);
  }

  /**
   * Get notifications for a user
   */
  async getUserNotifications(userId, options = {}) {
    const { page = 1, limit = 20, unreadOnly = false } = options;
    const offset = (page - 1) * limit;

    const where = { userId };
    if (unreadOnly) where.isRead = false;

    const { count, rows } = await Notification.findAndCountAll({
      where,
      limit: parseInt(limit),
      offset: parseInt(offset),
      order: [['createdAt', 'DESC']]
    });

    return {
      notifications: rows,
      pagination: {
        total: count,
        page: parseInt(page),
        limit: parseInt(limit),
        totalPages: Math.ceil(count / limit)
      }
    };
  }

  /**
   * Get unread count for a user
   */
  async getUnreadCount(userId) {
    return Notification.count({
      where: { userId, isRead: false }
    });
  }

  /**
   * Mark notification as read
   */
  async markAsRead(id, userId) {
    const notification = await Notification.findOne({
      where: { id, userId }
    });

    if (!notification) {
      const error = new Error('Notification not found');
      error.statusCode = 404;
      throw error;
    }

    await notification.update({ isRead: true });
    return notification;
  }

  /**
   * Mark all notifications as read for a user
   */
  async markAllAsRead(userId) {
    await Notification.update(
      { isRead: true },
      { where: { userId, isRead: false } }
    );
    return { message: 'All notifications marked as read' };
  }

  /**
   * Delete notification
   */
  async deleteNotification(id, userId) {
    const notification = await Notification.findOne({
      where: { id, userId }
    });

    if (!notification) {
      const error = new Error('Notification not found');
      error.statusCode = 404;
      throw error;
    }

    await notification.destroy();
    return { message: 'Notification deleted' };
  }

  /**
   * Delete old notifications (cleanup)
   */
  async cleanupOldNotifications(daysOld = 30) {
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - daysOld);

    const deleted = await Notification.destroy({
      where: {
        createdAt: { [Op.lt]: cutoffDate },
        isRead: true
      }
    });

    return { deleted };
  }

  // ============================================
  // Notification Triggers
  // ============================================

  async notifyTaskAssigned(task, worker, assignedBy) {
    // Notify the worker
    if (worker.userId) {
      await this.createNotification({
        userId: worker.userId,
        type: 'task_assigned',
        title: 'New Task Assigned',
        message: `You have been assigned to task: ${task.title}`,
        priority: task.priority === 'high' ? 'high' : 'medium',
        data: { taskId: task.id, siteId: task.siteId },
        link: `/tasks`
      });
    }
  }

  async notifyIncidentReported(incident, site) {
    // Notify admins and site manager
    await this.notifyByRole('admin', {
      type: 'incident_reported',
      title: 'Incident Reported',
      message: `${incident.severity.toUpperCase()} incident at ${site.name}: ${incident.title}`,
      priority: incident.severity === 'critical' ? 'urgent' : 'high',
      data: { incidentId: incident.id, siteId: site.id },
      link: `/incidents`
    });

    if (site.managerId) {
      await this.createNotification({
        userId: site.managerId,
        type: 'incident_reported',
        title: 'Incident Reported',
        message: `${incident.severity.toUpperCase()} incident: ${incident.title}`,
        priority: incident.severity === 'critical' ? 'urgent' : 'high',
        data: { incidentId: incident.id, siteId: site.id },
        link: `/incidents`
      });
    }
  }

  async notifyLowStock(material) {
    await this.notifyByRole('admin', {
      type: 'low_stock',
      title: 'Low Stock Alert',
      message: `${material.name} is running low (${material.stockQuantity} remaining)`,
      priority: 'high',
      data: { materialId: material.id },
      link: `/materials`
    });
  }

  async notifyExpensePending(expense, site) {
    await this.notifyByRole('admin', {
      type: 'expense_pending',
      title: 'Expense Pending Approval',
      message: `€${expense.amount} expense for ${site.name} needs approval`,
      priority: 'medium',
      data: { expenseId: expense.id, siteId: site.id },
      link: `/expenses`
    });
  }

  async notifySiteDelayed(site) {
    await this.notifyByRole('admin', {
      type: 'site_delayed',
      title: 'Site Delayed',
      message: `${site.name} is behind schedule`,
      priority: 'high',
      data: { siteId: site.id },
      link: `/sites/${site.id}`
    });

    if (site.managerId) {
      await this.createNotification({
        userId: site.managerId,
        type: 'site_delayed',
        title: 'Your Site is Delayed',
        message: `${site.name} is behind schedule`,
        priority: 'high',
        data: { siteId: site.id },
        link: `/sites/${site.id}`
      });
    }
  }

  async notifyBudgetExceeded(site, budget, spent) {
    await this.notifyByRole('admin', {
      type: 'budget_exceeded',
      title: 'Budget Exceeded',
      message: `${site.name} has exceeded its budget (€${spent} / €${budget})`,
      priority: 'urgent',
      data: { siteId: site.id },
      link: `/expenses`
    });
  }
}

module.exports = new NotificationService();

