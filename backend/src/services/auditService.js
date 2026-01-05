const { AuditLog, User } = require('../models');
const { Op } = require('sequelize');

class AuditService {
  /**
   * Log an action
   */
  async log(data) {
    return AuditLog.create(data);
  }

  /**
   * Log create action
   */
  async logCreate(entityType, entityId, entityName, newValues, req) {
    return this.log({
      userId: req.user?.id,
      userEmail: req.user?.email,
      action: 'create',
      entityType,
      entityId,
      entityName,
      newValues,
      ipAddress: req.ip,
      userAgent: req.get('user-agent'),
      description: `Created ${entityType}: ${entityName}`
    });
  }

  /**
   * Log update action
   */
  async logUpdate(entityType, entityId, entityName, oldValues, newValues, req) {
    // Only log changed fields
    const changes = {};
    for (const key in newValues) {
      if (JSON.stringify(oldValues[key]) !== JSON.stringify(newValues[key])) {
        changes[key] = { old: oldValues[key], new: newValues[key] };
      }
    }

    if (Object.keys(changes).length === 0) return null;

    return this.log({
      userId: req.user?.id,
      userEmail: req.user?.email,
      action: 'update',
      entityType,
      entityId,
      entityName,
      oldValues: changes,
      newValues: changes,
      ipAddress: req.ip,
      userAgent: req.get('user-agent'),
      description: `Updated ${entityType}: ${entityName}`
    });
  }

  /**
   * Log delete action
   */
  async logDelete(entityType, entityId, entityName, oldValues, req) {
    return this.log({
      userId: req.user?.id,
      userEmail: req.user?.email,
      action: 'delete',
      entityType,
      entityId,
      entityName,
      oldValues,
      ipAddress: req.ip,
      userAgent: req.get('user-agent'),
      description: `Deleted ${entityType}: ${entityName}`
    });
  }

  /**
   * Log login
   */
  async logLogin(user, req) {
    return this.log({
      userId: user.id,
      userEmail: user.email,
      action: 'login',
      entityType: 'user',
      entityId: user.id,
      entityName: user.email,
      ipAddress: req.ip,
      userAgent: req.get('user-agent'),
      description: `User logged in: ${user.email}`
    });
  }

  /**
   * Log approval/rejection
   */
  async logApproval(entityType, entityId, entityName, approved, req) {
    return this.log({
      userId: req.user?.id,
      userEmail: req.user?.email,
      action: approved ? 'approve' : 'reject',
      entityType,
      entityId,
      entityName,
      ipAddress: req.ip,
      userAgent: req.get('user-agent'),
      description: `${approved ? 'Approved' : 'Rejected'} ${entityType}: ${entityName}`
    });
  }

  /**
   * Get audit logs with filters
   */
  async getAuditLogs(options = {}) {
    const { page = 1, limit = 50, userId, entityType, action, startDate, endDate, search } = options;
    const offset = (page - 1) * limit;

    const where = {};
    if (userId) where.userId = userId;
    if (entityType) where.entityType = entityType;
    if (action) where.action = action;
    
    if (startDate && endDate) {
      where.createdAt = { [Op.between]: [startDate, endDate] };
    }

    if (search) {
      where[Op.or] = [
        { entityName: { [Op.like]: `%${search}%` } },
        { description: { [Op.like]: `%${search}%` } }
      ];
    }

    const { count, rows } = await AuditLog.findAndCountAll({
      where,
      limit: parseInt(limit),
      offset: parseInt(offset),
      order: [['createdAt', 'DESC']],
      include: [
        { model: User, as: 'user', attributes: ['id', 'name', 'email'] }
      ]
    });

    return {
      logs: rows,
      pagination: {
        total: count,
        page: parseInt(page),
        limit: parseInt(limit),
        totalPages: Math.ceil(count / limit)
      }
    };
  }

  /**
   * Get entity history
   */
  async getEntityHistory(entityType, entityId) {
    return AuditLog.findAll({
      where: { entityType, entityId },
      order: [['createdAt', 'DESC']],
      include: [
        { model: User, as: 'user', attributes: ['id', 'name'] }
      ]
    });
  }

  /**
   * Get user activity
   */
  async getUserActivity(userId, limit = 50) {
    return AuditLog.findAll({
      where: { userId },
      limit,
      order: [['createdAt', 'DESC']]
    });
  }

  /**
   * Get recent activity summary
   */
  async getActivitySummary(days = 7) {
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);

    const logs = await AuditLog.findAll({
      where: {
        createdAt: { [Op.gte]: startDate }
      },
      attributes: ['action', 'entityType', 'createdAt']
    });

    // Group by action and entity type
    const summary = {
      byAction: {},
      byEntityType: {},
      byDay: {},
      total: logs.length
    };

    logs.forEach(log => {
      // By action
      summary.byAction[log.action] = (summary.byAction[log.action] || 0) + 1;
      
      // By entity type
      summary.byEntityType[log.entityType] = (summary.byEntityType[log.entityType] || 0) + 1;
      
      // By day
      const day = log.createdAt.toISOString().split('T')[0];
      summary.byDay[day] = (summary.byDay[day] || 0) + 1;
    });

    return summary;
  }
}

module.exports = new AuditService();

