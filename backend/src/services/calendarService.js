const { CalendarEvent, Site, Task, Worker, User } = require('../models');
const { Op } = require('sequelize');

class CalendarService {
  /**
   * Create a calendar event
   */
  async createEvent(data, userId) {
    const event = await CalendarEvent.create({
      ...data,
      createdBy: userId
    });
    return this.getEventById(event.id);
  }

  /**
   * Get event by ID
   */
  async getEventById(id) {
    const event = await CalendarEvent.findByPk(id, {
      include: [
        { model: Site, as: 'site', attributes: ['id', 'name'] },
        { model: Task, as: 'task', attributes: ['id', 'title'] },
        { model: Worker, as: 'worker', attributes: ['id', 'name'] },
        { model: User, as: 'creator', attributes: ['id', 'name'] }
      ]
    });

    if (!event) {
      const error = new Error('Event not found');
      error.statusCode = 404;
      throw error;
    }

    return event;
  }

  /**
   * Get events for a date range
   */
  async getEvents(options = {}) {
    const { startDate, endDate, siteId, workerId, eventType } = options;

    const where = {};
    
    if (startDate && endDate) {
      where[Op.or] = [
        { startDate: { [Op.between]: [startDate, endDate] } },
        { endDate: { [Op.between]: [startDate, endDate] } },
        {
          startDate: { [Op.lte]: startDate },
          endDate: { [Op.gte]: endDate }
        }
      ];
    }

    if (siteId) where.siteId = siteId;
    if (workerId) where.workerId = workerId;
    if (eventType) where.eventType = eventType;

    return CalendarEvent.findAll({
      where,
      include: [
        { model: Site, as: 'site', attributes: ['id', 'name'] },
        { model: Task, as: 'task', attributes: ['id', 'title'] },
        { model: Worker, as: 'worker', attributes: ['id', 'name'] }
      ],
      order: [['startDate', 'ASC']]
    });
  }

  /**
   * Get weekly events for a site
   */
  async getSiteWeeklySchedule(siteId, weekStart) {
    const weekEnd = new Date(weekStart);
    weekEnd.setDate(weekEnd.getDate() + 7);

    return this.getEvents({
      siteId,
      startDate: weekStart,
      endDate: weekEnd.toISOString()
    });
  }

  /**
   * Get worker schedule
   */
  async getWorkerSchedule(workerId, startDate, endDate) {
    return this.getEvents({ workerId, startDate, endDate });
  }

  /**
   * Check for scheduling conflicts
   */
  async checkConflicts(data) {
    const conflicts = [];

    // Check worker conflicts
    if (data.workerId) {
      const workerEvents = await CalendarEvent.findAll({
        where: {
          workerId: data.workerId,
          id: { [Op.ne]: data.id || 0 },
          status: { [Op.ne]: 'cancelled' },
          [Op.or]: [
            {
              startDate: { [Op.lt]: data.endDate },
              endDate: { [Op.gt]: data.startDate }
            }
          ]
        }
      });

      if (workerEvents.length > 0) {
        conflicts.push({
          type: 'worker_conflict',
          message: 'Worker is already scheduled during this time',
          events: workerEvents.map(e => ({ id: e.id, title: e.title, startDate: e.startDate }))
        });
      }
    }

    return conflicts;
  }

  /**
   * Update event
   */
  async updateEvent(id, updates) {
    const event = await CalendarEvent.findByPk(id);

    if (!event) {
      const error = new Error('Event not found');
      error.statusCode = 404;
      throw error;
    }

    // Check conflicts if dates or worker changed
    if (updates.startDate || updates.endDate || updates.workerId) {
      const conflicts = await this.checkConflicts({
        ...event.toJSON(),
        ...updates,
        id
      });

      if (conflicts.length > 0) {
        const error = new Error('Schedule conflict detected');
        error.statusCode = 400;
        error.conflicts = conflicts;
        throw error;
      }
    }

    await event.update(updates);
    return this.getEventById(id);
  }

  /**
   * Delete event
   */
  async deleteEvent(id) {
    const event = await CalendarEvent.findByPk(id);

    if (!event) {
      const error = new Error('Event not found');
      error.statusCode = 404;
      throw error;
    }

    await event.destroy();
    return { message: 'Event deleted successfully' };
  }

  /**
   * Create events from tasks
   */
  async syncTasksToCalendar(siteId) {
    const tasks = await Task.findAll({
      where: { siteId, dueDate: { [Op.ne]: null } },
      include: [{ model: Worker, as: 'worker' }]
    });

    const events = [];

    for (const task of tasks) {
      // Check if event already exists for this task
      const existing = await CalendarEvent.findOne({
        where: { taskId: task.id }
      });

      if (!existing) {
        const event = await CalendarEvent.create({
          title: task.title,
          description: task.description,
          eventType: 'task',
          startDate: task.dueDate,
          endDate: task.dueDate,
          allDay: true,
          siteId,
          taskId: task.id,
          workerId: task.workerId,
          createdBy: 1, // System
          color: task.priority === 'high' ? '#ef4444' : task.priority === 'medium' ? '#f59e0b' : '#3b82f6'
        });
        events.push(event);
      }
    }

    return events;
  }

  /**
   * Get calendar summary for dashboard
   */
  async getCalendarSummary(days = 7) {
    const startDate = new Date();
    const endDate = new Date();
    endDate.setDate(endDate.getDate() + days);

    const events = await this.getEvents({
      startDate: startDate.toISOString(),
      endDate: endDate.toISOString()
    });

    const byType = {};
    const byDay = {};

    events.forEach(event => {
      // By type
      byType[event.eventType] = (byType[event.eventType] || 0) + 1;
      
      // By day
      const day = new Date(event.startDate).toISOString().split('T')[0];
      byDay[day] = (byDay[day] || 0) + 1;
    });

    return {
      total: events.length,
      byType,
      byDay,
      upcoming: events.slice(0, 5)
    };
  }
}

module.exports = new CalendarService();

