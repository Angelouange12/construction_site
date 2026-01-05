const { Assignment, AssignmentHistory, Worker, Site, Task, Material, User } = require('../models');
const { Op } = require('sequelize');

class AssignmentService {
  /**
   * Create a new assignment
   */
  async createAssignment(data, userId) {
    // Check for conflicts
    const conflicts = await this.checkConflicts(data);
    if (conflicts.length > 0) {
      const error = new Error('Assignment conflicts detected');
      error.statusCode = 400;
      error.conflicts = conflicts;
      throw error;
    }

    const assignment = await Assignment.create({
      ...data,
      assignedBy: userId
    });

    // Log history
    await AssignmentHistory.create({
      assignmentId: assignment.id,
      action: 'created',
      newStatus: 'active',
      changedBy: userId,
      metadata: data
    });

    return this.getAssignmentById(assignment.id);
  }

  /**
   * Get assignment by ID
   */
  async getAssignmentById(id) {
    const assignment = await Assignment.findByPk(id, {
      include: [
        { model: User, as: 'assigner', attributes: ['id', 'name'] },
        { model: AssignmentHistory, as: 'history', limit: 10, order: [['createdAt', 'DESC']] }
      ]
    });

    if (!assignment) {
      const error = new Error('Assignment not found');
      error.statusCode = 404;
      throw error;
    }

    return assignment;
  }

  /**
   * Get all assignments with filters
   */
  async getAssignments(options = {}) {
    const { page = 1, limit = 10, assigneeType, entityType, status, startDate, endDate } = options;
    const offset = (page - 1) * limit;

    const where = {};
    if (assigneeType) where.assigneeType = assigneeType;
    if (entityType) where.entityType = entityType;
    if (status) where.status = status;
    
    if (startDate && endDate) {
      where[Op.or] = [
        { startDate: { [Op.between]: [startDate, endDate] } },
        { endDate: { [Op.between]: [startDate, endDate] } }
      ];
    }

    const { count, rows } = await Assignment.findAndCountAll({
      where,
      limit: parseInt(limit),
      offset: parseInt(offset),
      order: [['startDate', 'DESC']],
      include: [
        { model: User, as: 'assigner', attributes: ['id', 'name'] }
      ]
    });

    return {
      assignments: rows,
      pagination: {
        total: count,
        page: parseInt(page),
        limit: parseInt(limit),
        totalPages: Math.ceil(count / limit)
      }
    };
  }

  /**
   * Get assignments for a worker
   */
  async getWorkerAssignments(workerId, includeHistory = false) {
    const where = {
      assigneeType: 'worker',
      assigneeId: workerId
    };

    const include = [
      { model: User, as: 'assigner', attributes: ['id', 'name'] }
    ];

    if (includeHistory) {
      include.push({ model: AssignmentHistory, as: 'history' });
    }

    return Assignment.findAll({
      where,
      include,
      order: [['startDate', 'DESC']]
    });
  }

  /**
   * Get assignments for a site
   */
  async getSiteAssignments(siteId) {
    return Assignment.findAll({
      where: {
        entityType: 'site',
        entityId: siteId,
        status: 'active'
      },
      include: [
        { model: User, as: 'assigner', attributes: ['id', 'name'] }
      ],
      order: [['startDate', 'ASC']]
    });
  }

  /**
   * Check for assignment conflicts
   */
  async checkConflicts(data) {
    const conflicts = [];

    if (data.assigneeType === 'worker') {
      // Check if worker is already assigned elsewhere during this period
      const existing = await Assignment.findAll({
        where: {
          assigneeType: 'worker',
          assigneeId: data.assigneeId,
          status: 'active',
          [Op.or]: [
            {
              startDate: { [Op.lte]: data.endDate || '9999-12-31' },
              endDate: { [Op.gte]: data.startDate }
            },
            {
              startDate: { [Op.lte]: data.startDate },
              endDate: null
            }
          ]
        }
      });

      if (existing.length > 0) {
        conflicts.push({
          type: 'worker_overlap',
          message: 'Worker is already assigned to another task/site during this period',
          existing: existing.map(a => ({ id: a.id, entityType: a.entityType, entityId: a.entityId }))
        });
      }
    }

    return conflicts;
  }

  /**
   * Update assignment
   */
  async updateAssignment(id, updates, userId) {
    const assignment = await Assignment.findByPk(id);

    if (!assignment) {
      const error = new Error('Assignment not found');
      error.statusCode = 404;
      throw error;
    }

    const previousStatus = assignment.status;
    const allowedUpdates = ['startDate', 'endDate', 'status', 'hoursPerDay', 'quantity', 'notes'];
    const filteredUpdates = {};

    allowedUpdates.forEach(field => {
      if (updates[field] !== undefined) {
        filteredUpdates[field] = updates[field];
      }
    });

    await assignment.update(filteredUpdates);

    // Log history
    await AssignmentHistory.create({
      assignmentId: id,
      action: 'updated',
      previousStatus,
      newStatus: assignment.status,
      changedBy: userId,
      metadata: filteredUpdates
    });

    return this.getAssignmentById(id);
  }

  /**
   * Complete assignment
   */
  async completeAssignment(id, userId) {
    return this.updateAssignment(id, { status: 'completed', endDate: new Date() }, userId);
  }

  /**
   * Cancel assignment
   */
  async cancelAssignment(id, userId, reason) {
    const assignment = await Assignment.findByPk(id);

    if (!assignment) {
      const error = new Error('Assignment not found');
      error.statusCode = 404;
      throw error;
    }

    await assignment.update({ status: 'cancelled' });

    await AssignmentHistory.create({
      assignmentId: id,
      action: 'cancelled',
      previousStatus: assignment.status,
      newStatus: 'cancelled',
      changedBy: userId,
      reason
    });

    return this.getAssignmentById(id);
  }

  /**
   * Reassign to another worker
   */
  async reassign(id, newAssigneeId, userId, reason) {
    const oldAssignment = await Assignment.findByPk(id);

    if (!oldAssignment) {
      const error = new Error('Assignment not found');
      error.statusCode = 404;
      throw error;
    }

    // Mark old assignment as reassigned
    await oldAssignment.update({ status: 'reassigned' });

    await AssignmentHistory.create({
      assignmentId: id,
      action: 'reassigned',
      previousStatus: 'active',
      newStatus: 'reassigned',
      changedBy: userId,
      reason,
      metadata: { reassignedTo: newAssigneeId }
    });

    // Create new assignment
    const newAssignment = await this.createAssignment({
      assigneeType: oldAssignment.assigneeType,
      assigneeId: newAssigneeId,
      entityType: oldAssignment.entityType,
      entityId: oldAssignment.entityId,
      startDate: new Date().toISOString().split('T')[0],
      endDate: oldAssignment.endDate,
      hoursPerDay: oldAssignment.hoursPerDay,
      notes: `Reassigned from assignment #${id}. Reason: ${reason}`,
      reassignedFrom: id
    }, userId);

    return newAssignment;
  }

  /**
   * Get assignment history
   */
  async getAssignmentHistory(assignmentId) {
    return AssignmentHistory.findAll({
      where: { assignmentId },
      include: [
        { model: User, as: 'changer', attributes: ['id', 'name'] }
      ],
      order: [['createdAt', 'DESC']]
    });
  }

  /**
   * Get worker assignment timeline
   */
  async getWorkerTimeline(workerId, startDate, endDate) {
    return Assignment.findAll({
      where: {
        assigneeType: 'worker',
        assigneeId: workerId,
        [Op.or]: [
          {
            startDate: { [Op.between]: [startDate, endDate] }
          },
          {
            endDate: { [Op.between]: [startDate, endDate] }
          },
          {
            startDate: { [Op.lte]: startDate },
            [Op.or]: [
              { endDate: { [Op.gte]: endDate } },
              { endDate: null }
            ]
          }
        ]
      },
      order: [['startDate', 'ASC']]
    });
  }

  /**
   * Auto-reassign on worker absence
   */
  async handleWorkerAbsence(workerId, absentDate, availableWorkers) {
    // Find active assignments for the absent worker
    const activeAssignments = await Assignment.findAll({
      where: {
        assigneeType: 'worker',
        assigneeId: workerId,
        status: 'active',
        startDate: { [Op.lte]: absentDate },
        [Op.or]: [
          { endDate: { [Op.gte]: absentDate } },
          { endDate: null }
        ]
      }
    });

    const reassignments = [];

    for (const assignment of activeAssignments) {
      // Find an available worker
      for (const availableWorkerId of availableWorkers) {
        const conflicts = await this.checkConflicts({
          assigneeType: 'worker',
          assigneeId: availableWorkerId,
          entityType: assignment.entityType,
          entityId: assignment.entityId,
          startDate: absentDate,
          endDate: absentDate
        });

        if (conflicts.length === 0) {
          // Reassign to this worker
          const newAssignment = await this.reassign(
            assignment.id,
            availableWorkerId,
            1, // System user
            `Auto-reassigned due to worker absence on ${absentDate}`
          );
          reassignments.push(newAssignment);
          break;
        }
      }
    }

    return reassignments;
  }
}

module.exports = new AssignmentService();

