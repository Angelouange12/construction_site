const { Task, Site, Worker } = require('../models');
const siteService = require('./siteService');
const { Op } = require('sequelize');

class TaskService {
  /**
   * Get all tasks with pagination and filters
   */
  async getAllTasks(options = {}) {
    const { page = 1, limit = 10, siteId, workerId, status, priority, search } = options;
    const offset = (page - 1) * limit;

    const where = {};
    
    if (siteId) where.siteId = siteId;
    if (workerId) where.workerId = workerId;
    if (status) where.status = status;
    if (priority) where.priority = priority;
    
    if (search) {
      where[Op.or] = [
        { title: { [Op.like]: `%${search}%` } },
        { description: { [Op.like]: `%${search}%` } }
      ];
    }

    const { count, rows } = await Task.findAndCountAll({
      where,
      limit: parseInt(limit),
      offset: parseInt(offset),
      order: [
        ['priority', 'DESC'],
        ['createdAt', 'DESC']
      ],
      include: [
        { model: Site, as: 'site', attributes: ['id', 'name'] },
        { model: Worker, as: 'worker', attributes: ['id', 'name'] }
      ]
    });

    return {
      tasks: rows,
      pagination: {
        total: count,
        page: parseInt(page),
        limit: parseInt(limit),
        totalPages: Math.ceil(count / limit)
      }
    };
  }

  /**
   * Get task by ID
   */
  async getTaskById(id) {
    const task = await Task.findByPk(id, {
      include: [
        { model: Site, as: 'site', attributes: ['id', 'name', 'status'] },
        { model: Worker, as: 'worker', attributes: ['id', 'name', 'specialty'] }
      ]
    });

    if (!task) {
      const error = new Error('Task not found');
      error.statusCode = 404;
      error.code = 'TASK_NOT_FOUND';
      throw error;
    }

    return task;
  }

  /**
   * Create a new task
   */
  async createTask(taskData) {
    // Verify site exists
    const site = await Site.findByPk(taskData.siteId);
    if (!site) {
      const error = new Error('Site not found');
      error.statusCode = 404;
      error.code = 'SITE_NOT_FOUND';
      throw error;
    }

    // Verify worker if assigned
    if (taskData.workerId) {
      const worker = await Worker.findByPk(taskData.workerId);
      if (!worker) {
        const error = new Error('Worker not found');
        error.statusCode = 404;
        error.code = 'WORKER_NOT_FOUND';
        throw error;
      }
    }

    const task = await Task.create(taskData);
    
    // Update site progress
    await siteService.updateSiteProgress(taskData.siteId);

    return this.getTaskById(task.id);
  }

  /**
   * Update task
   */
  async updateTask(id, updates) {
    const task = await Task.findByPk(id);

    if (!task) {
      const error = new Error('Task not found');
      error.statusCode = 404;
      error.code = 'TASK_NOT_FOUND';
      throw error;
    }

    const allowedUpdates = ['title', 'description', 'priority', 'status', 'progress', 'dueDate', 'workerId'];
    const filteredUpdates = {};

    allowedUpdates.forEach(field => {
      if (updates[field] !== undefined) {
        filteredUpdates[field] = updates[field];
      }
    });

    // If progress is 100, mark as completed
    if (filteredUpdates.progress === 100) {
      filteredUpdates.status = 'completed';
    }

    await task.update(filteredUpdates);
    
    // Update site progress
    await siteService.updateSiteProgress(task.siteId);

    return this.getTaskById(id);
  }

  /**
   * Delete task (soft delete)
   */
  async deleteTask(id) {
    const task = await Task.findByPk(id);

    if (!task) {
      const error = new Error('Task not found');
      error.statusCode = 404;
      error.code = 'TASK_NOT_FOUND';
      throw error;
    }

    const siteId = task.siteId;
    await task.destroy();
    
    // Update site progress
    await siteService.updateSiteProgress(siteId);

    return { message: 'Task deleted successfully' };
  }

  /**
   * Get tasks by site
   */
  async getTasksBySite(siteId) {
    return Task.findAll({
      where: { siteId },
      include: [{ model: Worker, as: 'worker', attributes: ['id', 'name'] }],
      order: [['priority', 'DESC'], ['createdAt', 'DESC']]
    });
  }

  /**
   * Get tasks assigned to a worker
   */
  async getTasksByWorker(workerId) {
    return Task.findAll({
      where: { workerId },
      include: [{ model: Site, as: 'site', attributes: ['id', 'name'] }],
      order: [['priority', 'DESC'], ['dueDate', 'ASC']]
    });
  }

  /**
   * Assign task to worker
   */
  async assignTask(taskId, workerId) {
    const task = await Task.findByPk(taskId);

    if (!task) {
      const error = new Error('Task not found');
      error.statusCode = 404;
      error.code = 'TASK_NOT_FOUND';
      throw error;
    }

    const worker = await Worker.findByPk(workerId);
    if (!worker) {
      const error = new Error('Worker not found');
      error.statusCode = 404;
      error.code = 'WORKER_NOT_FOUND';
      throw error;
    }

    await task.update({ workerId, status: 'in_progress' });
    return this.getTaskById(taskId);
  }

  /**
   * Get overdue tasks
   */
  async getOverdueTasks() {
    const today = new Date().toISOString().split('T')[0];
    
    return Task.findAll({
      where: {
        dueDate: { [Op.lt]: today },
        status: { [Op.notIn]: ['completed', 'cancelled'] }
      },
      include: [
        { model: Site, as: 'site', attributes: ['id', 'name'] },
        { model: Worker, as: 'worker', attributes: ['id', 'name'] }
      ],
      order: [['dueDate', 'ASC']]
    });
  }
}

module.exports = new TaskService();

