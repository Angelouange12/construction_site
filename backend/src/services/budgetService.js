const { Budget, Site, Expense } = require('../models');

class BudgetService {
  /**
   * Get budget by site ID
   */
  async getBudgetBySite(siteId) {
    const budget = await Budget.findOne({
      where: { siteId },
      include: [{ model: Site, as: 'site', attributes: ['id', 'name'] }]
    });

    if (!budget) {
      const error = new Error('Budget not found for this site');
      error.statusCode = 404;
      error.code = 'BUDGET_NOT_FOUND';
      throw error;
    }

    // Get expenses for the site
    const expenses = await Expense.findAll({ where: { siteId } });
    const totalSpent = expenses.reduce((sum, exp) => sum + parseFloat(exp.amount), 0);

    return {
      ...budget.toJSON(),
      totalSpent,
      remaining: parseFloat(budget.plannedAmount) - totalSpent,
      percentUsed: Math.round((totalSpent / parseFloat(budget.plannedAmount)) * 100)
    };
  }

  /**
   * Create or update budget for a site
   */
  async upsertBudget(siteId, budgetData) {
    // Verify site exists
    const site = await Site.findByPk(siteId);
    if (!site) {
      const error = new Error('Site not found');
      error.statusCode = 404;
      error.code = 'SITE_NOT_FOUND';
      throw error;
    }

    // Check if budget exists
    let budget = await Budget.findOne({ where: { siteId } });

    if (budget) {
      // Update existing budget
      await budget.update({
        plannedAmount: budgetData.plannedAmount,
        materialBudget: budgetData.materialBudget || budget.materialBudget,
        laborBudget: budgetData.laborBudget || budget.laborBudget,
        equipmentBudget: budgetData.equipmentBudget || budget.equipmentBudget,
        contingency: budgetData.contingency || budget.contingency,
        notes: budgetData.notes || budget.notes
      });
    } else {
      // Create new budget
      budget = await Budget.create({
        siteId,
        ...budgetData
      });
    }

    return this.getBudgetBySite(siteId);
  }

  /**
   * Update budget
   */
  async updateBudget(id, updates) {
    const budget = await Budget.findByPk(id);

    if (!budget) {
      const error = new Error('Budget not found');
      error.statusCode = 404;
      error.code = 'BUDGET_NOT_FOUND';
      throw error;
    }

    const allowedUpdates = ['plannedAmount', 'materialBudget', 'laborBudget', 'equipmentBudget', 'contingency', 'notes'];
    const filteredUpdates = {};

    allowedUpdates.forEach(field => {
      if (updates[field] !== undefined) {
        filteredUpdates[field] = updates[field];
      }
    });

    await budget.update(filteredUpdates);
    return this.getBudgetBySite(budget.siteId);
  }

  /**
   * Get budget overview with expenses breakdown
   */
  async getBudgetOverview(siteId) {
    const budget = await Budget.findOne({ where: { siteId } });
    
    if (!budget) {
      return null;
    }

    const expenses = await Expense.findAll({ where: { siteId } });

    // Calculate spending by category
    const spentByCategory = expenses.reduce((acc, exp) => {
      acc[exp.category] = (acc[exp.category] || 0) + parseFloat(exp.amount);
      return acc;
    }, {});

    const totalSpent = Object.values(spentByCategory).reduce((sum, val) => sum + val, 0);
    const plannedAmount = parseFloat(budget.plannedAmount);

    return {
      budget: {
        planned: plannedAmount,
        material: parseFloat(budget.materialBudget) || 0,
        labor: parseFloat(budget.laborBudget) || 0,
        equipment: parseFloat(budget.equipmentBudget) || 0,
        contingency: parseFloat(budget.contingency) || 0
      },
      spent: spentByCategory,
      totalSpent,
      remaining: plannedAmount - totalSpent,
      isOverBudget: totalSpent > plannedAmount,
      percentUsed: Math.round((totalSpent / plannedAmount) * 100)
    };
  }

  /**
   * Delete budget
   */
  async deleteBudget(id) {
    const budget = await Budget.findByPk(id);

    if (!budget) {
      const error = new Error('Budget not found');
      error.statusCode = 404;
      error.code = 'BUDGET_NOT_FOUND';
      throw error;
    }

    await budget.destroy();
    return { message: 'Budget deleted successfully' };
  }
}

module.exports = new BudgetService();

