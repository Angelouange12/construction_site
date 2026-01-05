const { Attendance, Worker, Site } = require('../models');
const { Op } = require('sequelize');

class AttendanceService {
  /**
   * Get attendance records with filters
   */
  async getAttendance(options = {}) {
    const { page = 1, limit = 10, workerId, siteId, date, startDate, endDate } = options;
    const offset = (page - 1) * limit;

    const where = {};
    
    if (workerId) where.workerId = workerId;
    if (siteId) where.siteId = siteId;
    if (date) where.date = date;
    
    if (startDate && endDate) {
      where.date = { [Op.between]: [startDate, endDate] };
    }

    const { count, rows } = await Attendance.findAndCountAll({
      where,
      limit: parseInt(limit),
      offset: parseInt(offset),
      order: [['date', 'DESC'], ['checkIn', 'ASC']],
      include: [
        { model: Worker, as: 'worker', attributes: ['id', 'name', 'specialty'] },
        { model: Site, as: 'site', attributes: ['id', 'name'] }
      ]
    });

    return {
      attendance: rows,
      pagination: {
        total: count,
        page: parseInt(page),
        limit: parseInt(limit),
        totalPages: Math.ceil(count / limit)
      }
    };
  }

  /**
   * Get attendance by ID
   */
  async getAttendanceById(id) {
    const attendance = await Attendance.findByPk(id, {
      include: [
        { model: Worker, as: 'worker' },
        { model: Site, as: 'site' }
      ]
    });

    if (!attendance) {
      const error = new Error('Attendance record not found');
      error.statusCode = 404;
      error.code = 'ATTENDANCE_NOT_FOUND';
      throw error;
    }

    return attendance;
  }

  /**
   * Create attendance record (check-in)
   */
  async checkIn(data) {
    const { workerId, siteId, date, checkIn, notes } = data;

    // Verify worker exists
    const worker = await Worker.findByPk(workerId);
    if (!worker) {
      const error = new Error('Worker not found');
      error.statusCode = 404;
      error.code = 'WORKER_NOT_FOUND';
      throw error;
    }

    // Use worker's assigned site if not provided
    const effectiveSiteId = siteId || worker.siteId;
    if (!effectiveSiteId) {
      const error = new Error('Site ID is required');
      error.statusCode = 400;
      error.code = 'SITE_REQUIRED';
      throw error;
    }

    // Check for existing attendance
    const today = date || new Date().toISOString().split('T')[0];
    const existing = await Attendance.findOne({
      where: { workerId, date: today }
    });

    if (existing) {
      const error = new Error('Attendance already recorded for this day');
      error.statusCode = 400;
      error.code = 'ATTENDANCE_EXISTS';
      throw error;
    }

    const attendance = await Attendance.create({
      workerId,
      siteId: effectiveSiteId,
      date: today,
      checkIn: checkIn || new Date().toTimeString().split(' ')[0].slice(0, 5),
      status: 'present',
      notes
    });

    return this.getAttendanceById(attendance.id);
  }

  /**
   * Update attendance (check-out)
   */
  async checkOut(id, checkOut) {
    const attendance = await Attendance.findByPk(id);

    if (!attendance) {
      const error = new Error('Attendance record not found');
      error.statusCode = 404;
      error.code = 'ATTENDANCE_NOT_FOUND';
      throw error;
    }

    await attendance.update({
      checkOut: checkOut || new Date().toTimeString().split(' ')[0].slice(0, 5)
    });

    return this.getAttendanceById(id);
  }

  /**
   * Update attendance record
   */
  async updateAttendance(id, updates) {
    const attendance = await Attendance.findByPk(id);

    if (!attendance) {
      const error = new Error('Attendance record not found');
      error.statusCode = 404;
      error.code = 'ATTENDANCE_NOT_FOUND';
      throw error;
    }

    const allowedUpdates = ['checkIn', 'checkOut', 'status', 'notes'];
    const filteredUpdates = {};

    allowedUpdates.forEach(field => {
      if (updates[field] !== undefined) {
        filteredUpdates[field] = updates[field];
      }
    });

    await attendance.update(filteredUpdates);
    return this.getAttendanceById(id);
  }

  /**
   * Delete attendance record
   */
  async deleteAttendance(id) {
    const attendance = await Attendance.findByPk(id);

    if (!attendance) {
      const error = new Error('Attendance record not found');
      error.statusCode = 404;
      error.code = 'ATTENDANCE_NOT_FOUND';
      throw error;
    }

    await attendance.destroy();
    return { message: 'Attendance record deleted successfully' };
  }

  /**
   * Get daily attendance for a site
   */
  async getDailyAttendance(siteId, date) {
    const targetDate = date || new Date().toISOString().split('T')[0];

    return Attendance.findAll({
      where: { siteId, date: targetDate },
      include: [
        { model: Worker, as: 'worker', attributes: ['id', 'name', 'specialty'] }
      ],
      order: [['checkIn', 'ASC']]
    });
  }

  /**
   * Get attendance summary for a site
   */
  async getAttendanceSummary(siteId, startDate, endDate) {
    const where = { siteId };
    if (startDate && endDate) {
      where.date = { [Op.between]: [startDate, endDate] };
    }

    const records = await Attendance.findAll({
      where,
      include: [{ model: Worker, as: 'worker' }]
    });

    const presentCount = records.filter(r => r.status === 'present').length;
    const absentCount = records.filter(r => r.status === 'absent').length;
    const lateCount = records.filter(r => r.status === 'late').length;
    const totalHours = records.reduce((sum, r) => sum + (parseFloat(r.hoursWorked) || 0), 0);

    return {
      totalRecords: records.length,
      presentCount,
      absentCount,
      lateCount,
      totalHours
    };
  }
}

module.exports = new AttendanceService();

