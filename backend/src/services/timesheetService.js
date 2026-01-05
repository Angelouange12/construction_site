const { Timesheet, Worker, Site, Attendance, User } = require('../models');
const { Op } = require('sequelize');

class TimesheetService {
  /**
   * Generate timesheet for a worker for a week
   */
  async generateTimesheet(workerId, siteId, weekStartDate) {
    const worker = await Worker.findByPk(workerId);
    if (!worker) {
      const error = new Error('Worker not found');
      error.statusCode = 404;
      throw error;
    }

    const weekStart = new Date(weekStartDate);
    const weekEnd = new Date(weekStart);
    weekEnd.setDate(weekEnd.getDate() + 6);

    // Check if timesheet already exists
    const existing = await Timesheet.findOne({
      where: { workerId, weekStartDate }
    });

    if (existing) {
      return this.getTimesheetById(existing.id);
    }

    // Get attendance records for the week
    const attendance = await Attendance.findAll({
      where: {
        workerId,
        siteId,
        date: {
          [Op.between]: [weekStartDate, weekEnd.toISOString().split('T')[0]]
        }
      },
      order: [['date', 'ASC']]
    });

    // Calculate hours
    let regularHours = 0;
    let overtimeHours = 0;
    const dailyBreakdown = [];
    const REGULAR_HOURS_PER_DAY = 8;

    attendance.forEach(record => {
      const hours = parseFloat(record.hoursWorked) || 0;
      const dayRegular = Math.min(hours, REGULAR_HOURS_PER_DAY);
      const dayOvertime = Math.max(0, hours - REGULAR_HOURS_PER_DAY);

      regularHours += dayRegular;
      overtimeHours += dayOvertime;

      dailyBreakdown.push({
        date: record.date,
        checkIn: record.checkIn,
        checkOut: record.checkOut,
        totalHours: hours,
        regularHours: dayRegular,
        overtimeHours: dayOvertime,
        status: record.status
      });
    });

    const totalHours = regularHours + overtimeHours;
    const hourlyRate = parseFloat(worker.hourlyRate) || 0;
    const overtimeRate = hourlyRate * 1.5;

    const regularPay = regularHours * hourlyRate;
    const overtimePay = overtimeHours * overtimeRate;
    const totalPay = regularPay + overtimePay;

    const timesheet = await Timesheet.create({
      workerId,
      siteId,
      weekStartDate,
      weekEndDate: weekEnd.toISOString().split('T')[0],
      regularHours,
      overtimeHours,
      totalHours,
      regularPay,
      overtimePay,
      totalPay,
      dailyBreakdown,
      status: 'draft'
    });

    return this.getTimesheetById(timesheet.id);
  }

  /**
   * Get timesheet by ID
   */
  async getTimesheetById(id) {
    const timesheet = await Timesheet.findByPk(id, {
      include: [
        { model: Worker, as: 'worker', attributes: ['id', 'name', 'specialty', 'hourlyRate'] },
        { model: Site, as: 'site', attributes: ['id', 'name'] },
        { model: User, as: 'approver', attributes: ['id', 'name'] }
      ]
    });

    if (!timesheet) {
      const error = new Error('Timesheet not found');
      error.statusCode = 404;
      throw error;
    }

    return timesheet;
  }

  /**
   * Get timesheets with filters
   */
  async getTimesheets(options = {}) {
    const { page = 1, limit = 10, workerId, siteId, status, startDate, endDate } = options;
    const offset = (page - 1) * limit;

    const where = {};
    if (workerId) where.workerId = workerId;
    if (siteId) where.siteId = siteId;
    if (status) where.status = status;
    
    if (startDate && endDate) {
      where.weekStartDate = { [Op.between]: [startDate, endDate] };
    }

    const { count, rows } = await Timesheet.findAndCountAll({
      where,
      limit: parseInt(limit),
      offset: parseInt(offset),
      order: [['weekStartDate', 'DESC']],
      include: [
        { model: Worker, as: 'worker', attributes: ['id', 'name'] },
        { model: Site, as: 'site', attributes: ['id', 'name'] }
      ]
    });

    return {
      timesheets: rows,
      pagination: {
        total: count,
        page: parseInt(page),
        limit: parseInt(limit),
        totalPages: Math.ceil(count / limit)
      }
    };
  }

  /**
   * Submit timesheet for approval
   */
  async submitTimesheet(id) {
    const timesheet = await Timesheet.findByPk(id);

    if (!timesheet) {
      const error = new Error('Timesheet not found');
      error.statusCode = 404;
      throw error;
    }

    if (timesheet.status !== 'draft') {
      const error = new Error('Timesheet already submitted');
      error.statusCode = 400;
      throw error;
    }

    await timesheet.update({
      status: 'submitted',
      submittedAt: new Date()
    });

    return this.getTimesheetById(id);
  }

  /**
   * Approve timesheet
   */
  async approveTimesheet(id, userId) {
    const timesheet = await Timesheet.findByPk(id);

    if (!timesheet) {
      const error = new Error('Timesheet not found');
      error.statusCode = 404;
      throw error;
    }

    if (timesheet.status !== 'submitted') {
      const error = new Error('Timesheet must be submitted before approval');
      error.statusCode = 400;
      throw error;
    }

    await timesheet.update({
      status: 'approved',
      approvedBy: userId,
      approvedAt: new Date()
    });

    return this.getTimesheetById(id);
  }

  /**
   * Reject timesheet
   */
  async rejectTimesheet(id, userId, reason) {
    const timesheet = await Timesheet.findByPk(id);

    if (!timesheet) {
      const error = new Error('Timesheet not found');
      error.statusCode = 404;
      throw error;
    }

    await timesheet.update({
      status: 'rejected',
      approvedBy: userId,
      rejectionReason: reason
    });

    return this.getTimesheetById(id);
  }

  /**
   * Update timesheet notes
   */
  async updateTimesheet(id, updates) {
    const timesheet = await Timesheet.findByPk(id);

    if (!timesheet) {
      const error = new Error('Timesheet not found');
      error.statusCode = 404;
      throw error;
    }

    if (timesheet.status !== 'draft') {
      const error = new Error('Cannot update submitted timesheet');
      error.statusCode = 400;
      throw error;
    }

    await timesheet.update({ notes: updates.notes });
    return this.getTimesheetById(id);
  }

  /**
   * Get timesheet summary for a site
   */
  async getSiteSummary(siteId, weekStartDate) {
    const timesheets = await Timesheet.findAll({
      where: { siteId, weekStartDate },
      include: [
        { model: Worker, as: 'worker', attributes: ['id', 'name', 'specialty'] }
      ]
    });

    const summary = {
      totalWorkers: timesheets.length,
      totalRegularHours: 0,
      totalOvertimeHours: 0,
      totalHours: 0,
      totalPay: 0,
      byStatus: { draft: 0, submitted: 0, approved: 0, rejected: 0 }
    };

    timesheets.forEach(ts => {
      summary.totalRegularHours += parseFloat(ts.regularHours) || 0;
      summary.totalOvertimeHours += parseFloat(ts.overtimeHours) || 0;
      summary.totalHours += parseFloat(ts.totalHours) || 0;
      summary.totalPay += parseFloat(ts.totalPay) || 0;
      summary.byStatus[ts.status] = (summary.byStatus[ts.status] || 0) + 1;
    });

    return { summary, timesheets };
  }

  /**
   * Generate timesheets for all workers on a site
   */
  async generateSiteTimesheets(siteId, weekStartDate) {
    const workers = await Worker.findAll({
      where: { siteId, isActive: true }
    });

    const timesheets = [];

    for (const worker of workers) {
      try {
        const timesheet = await this.generateTimesheet(worker.id, siteId, weekStartDate);
        timesheets.push(timesheet);
      } catch (error) {
        console.error(`Error generating timesheet for worker ${worker.id}:`, error);
      }
    }

    return timesheets;
  }
}

module.exports = new TimesheetService();

