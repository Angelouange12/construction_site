const { Site, Task, Worker, Budget, Expense, Incident, User, MaterialUsage } = require('../models');
const { Op } = require('sequelize');

class SiteService {
  /**
   * Get all sites with pagination
   */
  async getAllSites(options = {}) {
    const { page = 1, limit = 10, status, search, managerId } = options;
    const offset = (page - 1) * limit;

    const where = {};
    
    if (status) {
      where.status = status;
    }
    
    if (managerId) {
      where.managerId = managerId;
    }
    
    if (search) {
      where[Op.or] = [
        { name: { [Op.like]: `%${search}%` } },
        { location: { [Op.like]: `%${search}%` } }
      ];
    }

    const { count, rows } = await Site.findAndCountAll({
      where,
      limit: parseInt(limit),
      offset: parseInt(offset),
      order: [['createdAt', 'DESC']],
      include: [
        { model: User, as: 'manager', attributes: ['id', 'name', 'email'] },
        { model: Budget, as: 'budget' }
      ]
    });

    return {
      sites: rows,
      pagination: {
        total: count,
        page: parseInt(page),
        limit: parseInt(limit),
        totalPages: Math.ceil(count / limit)
      }
    };
  }

  /**
   * Get site by ID with full details
   */
  async getSiteById(id) {
    const site = await Site.findByPk(id, {
      include: [
        { model: User, as: 'manager', attributes: ['id', 'name', 'email'] },
        { model: Task, as: 'tasks' },
        { model: Worker, as: 'workers' },
        { model: Budget, as: 'budget' },
        { model: Expense, as: 'expenses' },
        { model: Incident, as: 'incidents' }
      ]
    });

    if (!site) {
      const error = new Error('Site not found');
      error.statusCode = 404;
      error.code = 'SITE_NOT_FOUND';
      throw error;
    }

    return site;
  }

  /**
   * Create a new site
   */
  async createSite(siteData) {
    const site = await Site.create(siteData);
    
    // Create default budget if plannedBudget is provided
    if (siteData.plannedBudget) {
      await Budget.create({
        siteId: site.id,
        plannedAmount: siteData.plannedBudget
      });
    }

    return this.getSiteById(site.id);
  }

  /**
   * Update site
   */
  async updateSite(id, updates) {
    const site = await Site.findByPk(id);

    if (!site) {
      const error = new Error('Site not found');
      error.statusCode = 404;
      error.code = 'SITE_NOT_FOUND';
      throw error;
    }

    const allowedUpdates = ['name', 'description', 'location', 'status', 'startDate', 'endDate', 'managerId'];
    const filteredUpdates = {};

    allowedUpdates.forEach(field => {
      if (updates[field] !== undefined) {
        filteredUpdates[field] = updates[field];
      }
    });

    await site.update(filteredUpdates);
    return this.getSiteById(id);
  }

  /**
   * Delete site (soft delete)
   */
  async deleteSite(id) {
    const site = await Site.findByPk(id);

    if (!site) {
      const error = new Error('Site not found');
      error.statusCode = 404;
      error.code = 'SITE_NOT_FOUND';
      throw error;
    }

    // Check for incomplete tasks
    const incompleteTasks = await Task.count({
      where: {
        siteId: id,
        status: { [Op.notIn]: ['completed', 'cancelled'] }
      }
    });

    if (incompleteTasks > 0 && site.status !== 'completed') {
      const error = new Error('Cannot delete site with incomplete tasks');
      error.statusCode = 400;
      error.code = 'INCOMPLETE_TASKS';
      throw error;
    }

    await site.destroy();
    return { message: 'Site deleted successfully' };
  }

  /**
   * Calculate and update site progress based on tasks
   */
  async updateSiteProgress(siteId) {
    const tasks = await Task.findAll({
      where: { siteId, status: { [Op.ne]: 'cancelled' } }
    });

    if (tasks.length === 0) {
      return 0;
    }

    const totalProgress = tasks.reduce((sum, task) => sum + task.progress, 0);
    const averageProgress = Math.round(totalProgress / tasks.length);

    await Site.update({ progress: averageProgress }, { where: { id: siteId } });

    return averageProgress;
  }

  /**
   * Get site statistics
   */
  async getSiteStats(siteId) {
    const site = await Site.findByPk(siteId, {
      include: [
        { model: Task, as: 'tasks' },
        { model: Worker, as: 'workers' },
        { model: Expense, as: 'expenses' },
        { model: Budget, as: 'budget' }
      ]
    });

    if (!site) {
      const error = new Error('Site not found');
      error.statusCode = 404;
      error.code = 'SITE_NOT_FOUND';
      throw error;
    }

    const totalExpenses = site.expenses.reduce((sum, exp) => sum + parseFloat(exp.amount), 0);
    const completedTasks = site.tasks.filter(t => t.status === 'completed').length;
    const budgetRemaining = site.budget ? parseFloat(site.budget.plannedAmount) - totalExpenses : 0;

    return {
      progress: site.progress,
      totalTasks: site.tasks.length,
      completedTasks,
      pendingTasks: site.tasks.filter(t => t.status === 'pending').length,
      totalWorkers: site.workers.length,
      totalExpenses,
      plannedBudget: site.budget ? parseFloat(site.budget.plannedAmount) : 0,
      budgetRemaining,
      budgetUsedPercent: site.budget ? Math.round((totalExpenses / parseFloat(site.budget.plannedAmount)) * 100) : 0
    };
  }

  /**
   * Get sites for a specific manager
   */
  async getSitesByManager(managerId) {
    return Site.findAll({
      where: { managerId },
      include: [{ model: Budget, as: 'budget' }],
      order: [['createdAt', 'DESC']]
    });
  }
}

module.exports = new SiteService();

