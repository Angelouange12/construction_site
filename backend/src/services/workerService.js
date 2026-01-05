const { Worker, Site, Attendance, Task, User } = require('../models');
const { Op } = require('sequelize');

class WorkerService {
  /**
   * Get all workers with pagination
   */
  async getAllWorkers(options = {}) {
    const { page = 1, limit = 10, siteId, specialty, search, isActive = true } = options;
    const offset = (page - 1) * limit;

    const where = { isActive };
    
    if (siteId) where.siteId = siteId;
    if (specialty) where.specialty = specialty;
    
    if (search) {
      where[Op.or] = [
        { name: { [Op.like]: `%${search}%` } },
        { phone: { [Op.like]: `%${search}%` } }
      ];
    }

    const { count, rows } = await Worker.findAndCountAll({
      where,
      limit: parseInt(limit),
      offset: parseInt(offset),
      order: [['name', 'ASC']],
      include: [
        { model: Site, as: 'site', attributes: ['id', 'name'] }
      ]
    });

    return {
      workers: rows,
      pagination: {
        total: count,
        page: parseInt(page),
        limit: parseInt(limit),
        totalPages: Math.ceil(count / limit)
      }
    };
  }

  /**
   * Get worker by ID
   */
  async getWorkerById(id) {
    const worker = await Worker.findByPk(id, {
      include: [
        { model: Site, as: 'site', attributes: ['id', 'name', 'location'] },
        { model: Task, as: 'tasks' },
        { model: User, as: 'user', attributes: ['id', 'name', 'email'] }
      ]
    });

    if (!worker) {
      const error = new Error('Worker not found');
      error.statusCode = 404;
      error.code = 'WORKER_NOT_FOUND';
      throw error;
    }

    return worker;
  }

  /**
   * Create a new worker
   */
  async createWorker(workerData) {
    // Verify site if provided
    if (workerData.siteId) {
      const site = await Site.findByPk(workerData.siteId);
      if (!site) {
        const error = new Error('Site not found');
        error.statusCode = 404;
        error.code = 'SITE_NOT_FOUND';
        throw error;
      }
    }

    const worker = await Worker.create(workerData);
    return this.getWorkerById(worker.id);
  }

  /**
   * Update worker
   */
  async updateWorker(id, updates) {
    const worker = await Worker.findByPk(id);

    if (!worker) {
      const error = new Error('Worker not found');
      error.statusCode = 404;
      error.code = 'WORKER_NOT_FOUND';
      throw error;
    }

    const allowedUpdates = ['name', 'phone', 'email', 'specialty', 'hourlyRate', 'siteId', 'isActive'];
    const filteredUpdates = {};

    allowedUpdates.forEach(field => {
      if (updates[field] !== undefined) {
        filteredUpdates[field] = updates[field];
      }
    });

    await worker.update(filteredUpdates);
    return this.getWorkerById(id);
  }

  /**
   * Delete worker (soft delete)
   */
  async deleteWorker(id) {
    const worker = await Worker.findByPk(id);

    if (!worker) {
      const error = new Error('Worker not found');
      error.statusCode = 404;
      error.code = 'WORKER_NOT_FOUND';
      throw error;
    }

    await worker.destroy();
    return { message: 'Worker deleted successfully' };
  }

  /**
   * Assign worker to site
   */
  async assignToSite(workerId, siteId) {
    const worker = await Worker.findByPk(workerId);

    if (!worker) {
      const error = new Error('Worker not found');
      error.statusCode = 404;
      error.code = 'WORKER_NOT_FOUND';
      throw error;
    }

    const site = await Site.findByPk(siteId);
    if (!site) {
      const error = new Error('Site not found');
      error.statusCode = 404;
      error.code = 'SITE_NOT_FOUND';
      throw error;
    }

    await worker.update({ siteId });
    return this.getWorkerById(workerId);
  }

  /**
   * Get workers by site
   */
  async getWorkersBySite(siteId) {
    return Worker.findAll({
      where: { siteId, isActive: true },
      order: [['name', 'ASC']]
    });
  }

  /**
   * Get worker productivity stats
   */
  async getWorkerStats(workerId, startDate, endDate) {
    const worker = await Worker.findByPk(workerId);

    if (!worker) {
      const error = new Error('Worker not found');
      error.statusCode = 404;
      error.code = 'WORKER_NOT_FOUND';
      throw error;
    }

    const whereClause = { workerId };
    if (startDate && endDate) {
      whereClause.date = {
        [Op.between]: [startDate, endDate]
      };
    }

    const attendance = await Attendance.findAll({ where: whereClause });
    const tasks = await Task.findAll({ where: { workerId } });

    const totalHours = attendance.reduce((sum, att) => sum + (parseFloat(att.hoursWorked) || 0), 0);
    const daysWorked = attendance.filter(a => a.status === 'present').length;
    const completedTasks = tasks.filter(t => t.status === 'completed').length;

    return {
      totalHours,
      daysWorked,
      totalTasks: tasks.length,
      completedTasks,
      laborCost: totalHours * parseFloat(worker.hourlyRate)
    };
  }
}

module.exports = new WorkerService();

