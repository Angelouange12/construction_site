const { Site, Task, Worker, Expense, Incident, Attendance, Material, Budget } = require('../models');
const { Op } = require('sequelize');
const sequelize = require('../config/database');

class ReportService {
  /**
   * Get dashboard statistics
   */
  async getDashboardStats() {
    // Get counts
    const totalSites = await Site.count();
    const activeSites = await Site.count({ where: { status: 'in_progress' } });
    const totalWorkers = await Worker.count({ where: { isActive: true } });
    const totalTasks = await Task.count();
    const completedTasks = await Task.count({ where: { status: 'completed' } });
    const pendingTasks = await Task.count({ where: { status: 'pending' } });

    // Get expenses total
    const expenses = await Expense.findAll();
    const totalExpenses = expenses.reduce((sum, exp) => sum + parseFloat(exp.amount), 0);

    // Get incident count
    const openIncidents = await Incident.count({
      where: { status: { [Op.notIn]: ['resolved', 'closed'] } }
    });

    // Get low stock materials count
    const materials = await Material.findAll({ where: { isActive: true } });
    const lowStockCount = materials.filter(m => m.stockQuantity <= m.alertThreshold).length;

    // Get overdue tasks
    const today = new Date().toISOString().split('T')[0];
    const overdueTasks = await Task.count({
      where: {
        dueDate: { [Op.lt]: today },
        status: { [Op.notIn]: ['completed', 'cancelled'] }
      }
    });

    return {
      sites: { total: totalSites, active: activeSites },
      workers: { total: totalWorkers },
      tasks: { total: totalTasks, completed: completedTasks, pending: pendingTasks, overdue: overdueTasks },
      expenses: { total: totalExpenses },
      incidents: { open: openIncidents },
      materials: { lowStock: lowStockCount }
    };
  }

  /**
   * Get site progress report
   */
  async getSiteProgressReport() {
    const sites = await Site.findAll({
      where: { status: { [Op.ne]: 'completed' } },
      include: [
        { model: Task, as: 'tasks' },
        { model: Budget, as: 'budget' }
      ],
      order: [['progress', 'DESC']]
    });

    return sites.map(site => ({
      id: site.id,
      name: site.name,
      status: site.status,
      progress: site.progress,
      startDate: site.startDate,
      endDate: site.endDate,
      totalTasks: site.tasks.length,
      completedTasks: site.tasks.filter(t => t.status === 'completed').length,
      budget: site.budget ? parseFloat(site.budget.plannedAmount) : 0
    }));
  }

  /**
   * Get expense report by site
   */
  async getExpenseReport(options = {}) {
    const { startDate, endDate, siteId } = options;

    const where = {};
    if (siteId) where.siteId = siteId;
    if (startDate && endDate) {
      where.expenseDate = { [Op.between]: [startDate, endDate] };
    }

    const expenses = await Expense.findAll({
      where,
      include: [{ model: Site, as: 'site', attributes: ['id', 'name'] }],
      order: [['expenseDate', 'DESC']]
    });

    // Group by site
    const bySite = {};
    const byCategory = {};
    let grandTotal = 0;

    expenses.forEach(exp => {
      const siteName = exp.site ? exp.site.name : 'Unknown';
      bySite[siteName] = (bySite[siteName] || 0) + parseFloat(exp.amount);
      byCategory[exp.category] = (byCategory[exp.category] || 0) + parseFloat(exp.amount);
      grandTotal += parseFloat(exp.amount);
    });

    return {
      expenses,
      bySite,
      byCategory,
      grandTotal,
      count: expenses.length
    };
  }

  /**
   * Get worker productivity report
   */
  async getWorkerProductivityReport(options = {}) {
    const { startDate, endDate, siteId } = options;

    const whereAttendance = {};
    if (startDate && endDate) {
      whereAttendance.date = { [Op.between]: [startDate, endDate] };
    }
    if (siteId) whereAttendance.siteId = siteId;

    const workers = await Worker.findAll({
      where: { isActive: true },
      include: [
        { 
          model: Attendance, 
          as: 'attendance',
          where: Object.keys(whereAttendance).length > 0 ? whereAttendance : undefined,
          required: false
        },
        { model: Task, as: 'tasks' }
      ]
    });

    return workers.map(worker => {
      const totalHours = worker.attendance.reduce((sum, att) => sum + (parseFloat(att.hoursWorked) || 0), 0);
      const completedTasks = worker.tasks.filter(t => t.status === 'completed').length;
      const laborCost = totalHours * parseFloat(worker.hourlyRate);

      return {
        id: worker.id,
        name: worker.name,
        specialty: worker.specialty,
        daysWorked: worker.attendance.length,
        totalHours,
        hourlyRate: parseFloat(worker.hourlyRate),
        laborCost,
        tasksAssigned: worker.tasks.length,
        tasksCompleted: completedTasks,
        productivity: worker.tasks.length > 0 ? Math.round((completedTasks / worker.tasks.length) * 100) : 0
      };
    });
  }

  /**
   * Get safety report
   */
  async getSafetyReport(options = {}) {
    const { startDate, endDate, siteId } = options;

    const where = {};
    if (siteId) where.siteId = siteId;
    if (startDate && endDate) {
      where.incidentDate = { [Op.between]: [startDate, endDate] };
    }

    const incidents = await Incident.findAll({
      where,
      include: [{ model: Site, as: 'site', attributes: ['id', 'name'] }],
      order: [['incidentDate', 'DESC']]
    });

    // Statistics
    const bySeverity = { low: 0, medium: 0, high: 0, critical: 0 };
    const byStatus = { reported: 0, investigating: 0, resolved: 0, closed: 0 };
    let totalInjuries = 0;

    incidents.forEach(inc => {
      bySeverity[inc.severity] = (bySeverity[inc.severity] || 0) + 1;
      byStatus[inc.status] = (byStatus[inc.status] || 0) + 1;
      totalInjuries += inc.injuriesCount || 0;
    });

    return {
      incidents,
      summary: {
        total: incidents.length,
        bySeverity,
        byStatus,
        totalInjuries
      }
    };
  }

  /**
   * Get budget vs actual report
   */
  async getBudgetVsActualReport() {
    const sites = await Site.findAll({
      include: [
        { model: Budget, as: 'budget' },
        { model: Expense, as: 'expenses' }
      ]
    });

    return sites.map(site => {
      const plannedBudget = site.budget ? parseFloat(site.budget.plannedAmount) : 0;
      const actualSpent = site.expenses.reduce((sum, exp) => sum + parseFloat(exp.amount), 0);
      const variance = plannedBudget - actualSpent;
      const variancePercent = plannedBudget > 0 ? Math.round((variance / plannedBudget) * 100) : 0;

      return {
        siteId: site.id,
        siteName: site.name,
        status: site.status,
        plannedBudget,
        actualSpent,
        variance,
        variancePercent,
        isOverBudget: actualSpent > plannedBudget
      };
    });
  }

  /**
   * Get alerts summary
   */
  async getAlertsSummary() {
    const today = new Date().toISOString().split('T')[0];

    // Overdue tasks
    const overdueTasks = await Task.findAll({
      where: {
        dueDate: { [Op.lt]: today },
        status: { [Op.notIn]: ['completed', 'cancelled'] }
      },
      include: [{ model: Site, as: 'site', attributes: ['id', 'name'] }],
      limit: 10
    });

    // Low stock materials
    const materials = await Material.findAll({ where: { isActive: true } });
    const lowStockMaterials = materials.filter(m => m.stockQuantity <= m.alertThreshold);

    // Open critical incidents
    const criticalIncidents = await Incident.findAll({
      where: {
        severity: 'critical',
        status: { [Op.notIn]: ['resolved', 'closed'] }
      },
      include: [{ model: Site, as: 'site', attributes: ['id', 'name'] }]
    });

    // Sites over budget
    const sitesWithBudget = await Site.findAll({
      include: [
        { model: Budget, as: 'budget' },
        { model: Expense, as: 'expenses' }
      ]
    });

    const overBudgetSites = sitesWithBudget.filter(site => {
      if (!site.budget) return false;
      const spent = site.expenses.reduce((sum, exp) => sum + parseFloat(exp.amount), 0);
      return spent > parseFloat(site.budget.plannedAmount);
    });

    return {
      overdueTasks: overdueTasks.map(t => ({
        id: t.id,
        title: t.title,
        dueDate: t.dueDate,
        site: t.site ? t.site.name : 'Unknown'
      })),
      lowStockMaterials: lowStockMaterials.map(m => ({
        id: m.id,
        name: m.name,
        stock: m.stockQuantity,
        threshold: m.alertThreshold
      })),
      criticalIncidents: criticalIncidents.map(i => ({
        id: i.id,
        title: i.title,
        date: i.incidentDate,
        site: i.site ? i.site.name : 'Unknown'
      })),
      overBudgetSites: overBudgetSites.map(s => ({
        id: s.id,
        name: s.name,
        budget: parseFloat(s.budget.plannedAmount),
        spent: s.expenses.reduce((sum, exp) => sum + parseFloat(exp.amount), 0)
      }))
    };
  }
}

module.exports = new ReportService();

