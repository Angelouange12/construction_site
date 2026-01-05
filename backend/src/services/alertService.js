const { Site, Task, Worker, Material, Budget, Expense, Incident } = require('../models');
const notificationService = require('./notificationService');
const { Op } = require('sequelize');

class AlertService {
  /**
   * Run all alert checks
   */
  async runAllChecks() {
    const alerts = [];
    
    alerts.push(...await this.checkDelayedSites());
    alerts.push(...await this.checkOverdueTasks());
    alerts.push(...await this.checkLowStock());
    alerts.push(...await this.checkBudgetExceeded());
    alerts.push(...await this.checkUnresolvedIncidents());
    
    return alerts;
  }

  /**
   * Check for delayed sites
   */
  async checkDelayedSites() {
    const alerts = [];
    const today = new Date().toISOString().split('T')[0];

    const sites = await Site.findAll({
      where: {
        status: { [Op.notIn]: ['completed', 'cancelled'] },
        endDate: { [Op.lt]: today }
      }
    });

    for (const site of sites) {
      alerts.push({
        type: 'site_delayed',
        severity: 'high',
        title: 'Site Behind Schedule',
        message: `${site.name} has passed its end date and is not complete`,
        entityType: 'site',
        entityId: site.id,
        link: `/sites/${site.id}`,
        suggestion: 'Consider adding more workers or extending the deadline'
      });

      // Auto-update site status
      if (site.status !== 'delayed') {
        await site.update({ status: 'delayed' });
        await notificationService.notifySiteDelayed(site);
      }
    }

    return alerts;
  }

  /**
   * Check for overdue tasks
   */
  async checkOverdueTasks() {
    const alerts = [];
    const today = new Date().toISOString().split('T')[0];

    const tasks = await Task.findAll({
      where: {
        status: { [Op.notIn]: ['completed', 'cancelled'] },
        dueDate: { [Op.lt]: today }
      },
      include: [{ model: Site, as: 'site' }]
    });

    for (const task of tasks) {
      alerts.push({
        type: 'task_overdue',
        severity: 'medium',
        title: 'Task Overdue',
        message: `Task "${task.title}" is overdue`,
        entityType: 'task',
        entityId: task.id,
        siteId: task.siteId,
        siteName: task.site?.name,
        link: `/tasks`,
        suggestion: 'Reassign the task or update the due date'
      });
    }

    return alerts;
  }

  /**
   * Check for low stock materials
   */
  async checkLowStock() {
    const alerts = [];

    const materials = await Material.findAll({
      where: {
        stockQuantity: { [Op.lte]: Op.col('alertThreshold') }
      }
    });

    for (const material of materials) {
      alerts.push({
        type: 'low_stock',
        severity: material.stockQuantity === 0 ? 'critical' : 'high',
        title: 'Low Stock Alert',
        message: `${material.name} is running low (${material.stockQuantity} ${material.unit} remaining)`,
        entityType: 'material',
        entityId: material.id,
        link: `/materials`,
        suggestion: `Order more ${material.name} to avoid work interruptions`
      });
    }

    return alerts;
  }

  /**
   * Check for budget exceeded
   */
  async checkBudgetExceeded() {
    const alerts = [];

    const budgets = await Budget.findAll({
      include: [{ model: Site, as: 'site' }]
    });

    for (const budget of budgets) {
      const planned = parseFloat(budget.plannedAmount) || 0;
      const actual = parseFloat(budget.actualAmount) || 0;
      
      if (actual > planned && planned > 0) {
        const percent = ((actual - planned) / planned * 100).toFixed(1);
        alerts.push({
          type: 'budget_exceeded',
          severity: 'critical',
          title: 'Budget Exceeded',
          message: `${budget.site?.name || 'Site'} is over budget by ${percent}%`,
          entityType: 'budget',
          entityId: budget.id,
          siteId: budget.siteId,
          link: `/expenses`,
          suggestion: 'Review expenses and consider cost-cutting measures',
          data: { planned, actual, overage: actual - planned }
        });
      } else if (actual > planned * 0.9 && planned > 0) {
        // Warning at 90%
        alerts.push({
          type: 'budget_warning',
          severity: 'medium',
          title: 'Budget Warning',
          message: `${budget.site?.name || 'Site'} has used 90% of budget`,
          entityType: 'budget',
          entityId: budget.id,
          siteId: budget.siteId,
          link: `/expenses`,
          suggestion: 'Monitor spending closely'
        });
      }
    }

    return alerts;
  }

  /**
   * Check for unresolved incidents
   */
  async checkUnresolvedIncidents() {
    const alerts = [];
    const threeDaysAgo = new Date();
    threeDaysAgo.setDate(threeDaysAgo.getDate() - 3);

    const incidents = await Incident.findAll({
      where: {
        status: { [Op.ne]: 'resolved' },
        createdAt: { [Op.lt]: threeDaysAgo }
      },
      include: [{ model: Site, as: 'site' }]
    });

    for (const incident of incidents) {
      const daysOld = Math.floor((new Date() - new Date(incident.createdAt)) / (1000 * 60 * 60 * 24));
      alerts.push({
        type: 'incident_unresolved',
        severity: incident.severity === 'critical' ? 'critical' : 'high',
        title: 'Unresolved Incident',
        message: `${incident.severity.toUpperCase()} incident "${incident.title}" is unresolved for ${daysOld} days`,
        entityType: 'incident',
        entityId: incident.id,
        siteId: incident.siteId,
        siteName: incident.site?.name,
        link: `/incidents`,
        suggestion: 'Investigate and resolve the incident as soon as possible'
      });
    }

    return alerts;
  }

  /**
   * Check if site can be closed
   */
  async canCloseSite(siteId) {
    const issues = [];

    // Check for incomplete tasks
    const incompleteTasks = await Task.count({
      where: {
        siteId,
        status: { [Op.notIn]: ['completed', 'cancelled'] }
      }
    });

    if (incompleteTasks > 0) {
      issues.push({
        type: 'incomplete_tasks',
        message: `${incompleteTasks} tasks are not completed`,
        blocking: true
      });
    }

    // Check for unresolved incidents
    const unresolvedIncidents = await Incident.count({
      where: {
        siteId,
        status: { [Op.ne]: 'resolved' }
      }
    });

    if (unresolvedIncidents > 0) {
      issues.push({
        type: 'unresolved_incidents',
        message: `${unresolvedIncidents} incidents are unresolved`,
        blocking: true
      });
    }

    // Check for pending expenses
    const pendingExpenses = await Expense.count({
      where: {
        siteId,
        status: 'pending'
      }
    });

    if (pendingExpenses > 0) {
      issues.push({
        type: 'pending_expenses',
        message: `${pendingExpenses} expenses are pending approval`,
        blocking: false
      });
    }

    return {
      canClose: issues.filter(i => i.blocking).length === 0,
      issues
    };
  }

  /**
   * Get suggestions for a site
   */
  async getSiteSuggestions(siteId) {
    const suggestions = [];
    const site = await Site.findByPk(siteId, {
      include: [
        { model: Task, as: 'tasks' },
        { model: Worker, as: 'workers' },
        { model: Budget, as: 'budget' }
      ]
    });

    if (!site) return suggestions;

    // Check progress vs timeline
    if (site.endDate) {
      const daysRemaining = Math.ceil((new Date(site.endDate) - new Date()) / (1000 * 60 * 60 * 24));
      const tasksRemaining = (site.tasks || []).filter(t => t.status !== 'completed').length;
      const totalTasks = (site.tasks || []).length;
      const completionRate = totalTasks > 0 ? ((totalTasks - tasksRemaining) / totalTasks * 100) : 0;

      if (daysRemaining > 0 && daysRemaining < 7 && completionRate < 80) {
        suggestions.push({
          type: 'add_workers',
          priority: 'high',
          title: 'Add More Workers',
          message: `Only ${daysRemaining} days remaining with ${completionRate.toFixed(0)}% completion. Consider adding more workers.`
        });
      }
    }

    // Check worker utilization
    const workerCount = (site.workers || []).length;
    const activeTasks = (site.tasks || []).filter(t => t.status === 'in_progress').length;
    
    if (workerCount > 0 && activeTasks > workerCount * 2) {
      suggestions.push({
        type: 'understaffed',
        priority: 'medium',
        title: 'Site May Be Understaffed',
        message: `${activeTasks} active tasks for ${workerCount} workers. Consider adding more workers.`
      });
    }

    // Budget suggestions
    if (site.budget) {
      const planned = parseFloat(site.budget.plannedAmount) || 0;
      const actual = parseFloat(site.budget.actualAmount) || 0;
      const remaining = planned - actual;
      
      if (remaining < planned * 0.1 && remaining > 0) {
        suggestions.push({
          type: 'budget_low',
          priority: 'medium',
          title: 'Budget Running Low',
          message: `Only €${remaining.toFixed(2)} remaining in budget (${(remaining/planned*100).toFixed(0)}%)`
        });
      }
    }

    return suggestions;
  }

  /**
   * Get dashboard alerts
   */
  async getDashboardAlerts() {
    const alerts = await this.runAllChecks();
    
    // Sort by severity
    const severityOrder = { critical: 0, high: 1, medium: 2, low: 3 };
    alerts.sort((a, b) => severityOrder[a.severity] - severityOrder[b.severity]);

    return {
      critical: alerts.filter(a => a.severity === 'critical'),
      high: alerts.filter(a => a.severity === 'high'),
      medium: alerts.filter(a => a.severity === 'medium'),
      all: alerts,
      summary: {
        total: alerts.length,
        critical: alerts.filter(a => a.severity === 'critical').length,
        high: alerts.filter(a => a.severity === 'high').length,
        medium: alerts.filter(a => a.severity === 'medium').length
      }
    };
  }
}

module.exports = new AlertService();

