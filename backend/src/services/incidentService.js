const { Incident, Site, User } = require('../models');
const { Op } = require('sequelize');

class IncidentService {
  /**
   * Get all incidents with pagination
   */
  async getAllIncidents(options = {}) {
    const { page = 1, limit = 10, siteId, severity, status, startDate, endDate } = options;
    const offset = (page - 1) * limit;

    const where = {};
    
    if (siteId) where.siteId = siteId;
    if (severity) where.severity = severity;
    if (status) where.status = status;
    
    if (startDate && endDate) {
      where.incidentDate = { [Op.between]: [startDate, endDate] };
    }

    const { count, rows } = await Incident.findAndCountAll({
      where,
      limit: parseInt(limit),
      offset: parseInt(offset),
      order: [['incidentDate', 'DESC'], ['severity', 'DESC']],
      include: [
        { model: Site, as: 'site', attributes: ['id', 'name'] },
        { model: User, as: 'reporter', attributes: ['id', 'name'] }
      ]
    });

    return {
      incidents: rows,
      pagination: {
        total: count,
        page: parseInt(page),
        limit: parseInt(limit),
        totalPages: Math.ceil(count / limit)
      }
    };
  }

  /**
   * Get incident by ID
   */
  async getIncidentById(id) {
    const incident = await Incident.findByPk(id, {
      include: [
        { model: Site, as: 'site', attributes: ['id', 'name', 'location'] },
        { model: User, as: 'reporter', attributes: ['id', 'name', 'email'] }
      ]
    });

    if (!incident) {
      const error = new Error('Incident not found');
      error.statusCode = 404;
      error.code = 'INCIDENT_NOT_FOUND';
      throw error;
    }

    return incident;
  }

  /**
   * Create a new incident
   */
  async createIncident(incidentData, reporterId) {
    // Verify site exists
    const site = await Site.findByPk(incidentData.siteId);
    if (!site) {
      const error = new Error('Site not found');
      error.statusCode = 404;
      error.code = 'SITE_NOT_FOUND';
      throw error;
    }

    const incident = await Incident.create({
      ...incidentData,
      reportedBy: reporterId,
      incidentDate: incidentData.incidentDate || new Date().toISOString().split('T')[0]
    });

    return this.getIncidentById(incident.id);
  }

  /**
   * Update incident
   */
  async updateIncident(id, updates) {
    const incident = await Incident.findByPk(id);

    if (!incident) {
      const error = new Error('Incident not found');
      error.statusCode = 404;
      error.code = 'INCIDENT_NOT_FOUND';
      throw error;
    }

    const allowedUpdates = ['title', 'description', 'severity', 'status', 'actionTaken', 'injuriesCount'];
    const filteredUpdates = {};

    allowedUpdates.forEach(field => {
      if (updates[field] !== undefined) {
        filteredUpdates[field] = updates[field];
      }
    });

    await incident.update(filteredUpdates);
    return this.getIncidentById(id);
  }

  /**
   * Delete incident (soft delete)
   */
  async deleteIncident(id) {
    const incident = await Incident.findByPk(id);

    if (!incident) {
      const error = new Error('Incident not found');
      error.statusCode = 404;
      error.code = 'INCIDENT_NOT_FOUND';
      throw error;
    }

    await incident.destroy();
    return { message: 'Incident deleted successfully' };
  }

  /**
   * Update incident status
   */
  async updateStatus(id, status, actionTaken) {
    const incident = await Incident.findByPk(id);

    if (!incident) {
      const error = new Error('Incident not found');
      error.statusCode = 404;
      error.code = 'INCIDENT_NOT_FOUND';
      throw error;
    }

    const updates = { status };
    if (actionTaken) updates.actionTaken = actionTaken;

    await incident.update(updates);
    return this.getIncidentById(id);
  }

  /**
   * Get incidents by site
   */
  async getIncidentsBySite(siteId) {
    return Incident.findAll({
      where: { siteId },
      include: [{ model: User, as: 'reporter', attributes: ['id', 'name'] }],
      order: [['incidentDate', 'DESC']]
    });
  }

  /**
   * Get incident statistics
   */
  async getIncidentStats(options = {}) {
    const { siteId, startDate, endDate } = options;
    
    const where = {};
    if (siteId) where.siteId = siteId;
    if (startDate && endDate) {
      where.incidentDate = { [Op.between]: [startDate, endDate] };
    }

    const incidents = await Incident.findAll({ where });

    const bySeverity = {};
    const byStatus = {};
    let totalInjuries = 0;

    incidents.forEach(inc => {
      bySeverity[inc.severity] = (bySeverity[inc.severity] || 0) + 1;
      byStatus[inc.status] = (byStatus[inc.status] || 0) + 1;
      totalInjuries += inc.injuriesCount || 0;
    });

    return {
      total: incidents.length,
      bySeverity,
      byStatus,
      totalInjuries,
      criticalCount: bySeverity.critical || 0
    };
  }
}

module.exports = new IncidentService();

