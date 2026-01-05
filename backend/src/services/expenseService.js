const { Expense, Site, User, Budget } = require('../models');
const { Op } = require('sequelize');

class ExpenseService {
  /**
   * Get all expenses with pagination
   */
  async getAllExpenses(options = {}) {
    const { page = 1, limit = 10, siteId, category, startDate, endDate, isApproved } = options;
    const offset = (page - 1) * limit;

    const where = {};
    
    if (siteId) where.siteId = siteId;
    if (category) where.category = category;
    if (isApproved !== undefined) where.isApproved = isApproved;
    
    if (startDate && endDate) {
      where.expenseDate = { [Op.between]: [startDate, endDate] };
    }

    const { count, rows } = await Expense.findAndCountAll({
      where,
      limit: parseInt(limit),
      offset: parseInt(offset),
      order: [['expenseDate', 'DESC']],
      include: [
        { model: Site, as: 'site', attributes: ['id', 'name'] },
        { model: User, as: 'approver', attributes: ['id', 'name'] }
      ]
    });

    return {
      expenses: rows,
      pagination: {
        total: count,
        page: parseInt(page),
        limit: parseInt(limit),
        totalPages: Math.ceil(count / limit)
      }
    };
  }

  /**
   * Get expense by ID
   */
  async getExpenseById(id) {
    const expense = await Expense.findByPk(id, {
      include: [
        { model: Site, as: 'site', attributes: ['id', 'name'] },
        { model: User, as: 'approver', attributes: ['id', 'name'] }
      ]
    });

    if (!expense) {
      const error = new Error('Expense not found');
      error.statusCode = 404;
      error.code = 'EXPENSE_NOT_FOUND';
      throw error;
    }

    return expense;
  }

  /**
   * Create a new expense
   */
  async createExpense(expenseData) {
    // Verify site exists
    const site = await Site.findByPk(expenseData.siteId);
    if (!site) {
      const error = new Error('Site not found');
      error.statusCode = 404;
      error.code = 'SITE_NOT_FOUND';
      throw error;
    }

    const expense = await Expense.create({
      ...expenseData,
      expenseDate: expenseData.expenseDate || new Date().toISOString().split('T')[0]
    });

    return this.getExpenseById(expense.id);
  }

  /**
   * Update expense
   */
  async updateExpense(id, updates) {
    const expense = await Expense.findByPk(id);

    if (!expense) {
      const error = new Error('Expense not found');
      error.statusCode = 404;
      error.code = 'EXPENSE_NOT_FOUND';
      throw error;
    }

    const allowedUpdates = ['description', 'amount', 'category', 'expenseDate', 'receipt'];
    const filteredUpdates = {};

    allowedUpdates.forEach(field => {
      if (updates[field] !== undefined) {
        filteredUpdates[field] = updates[field];
      }
    });

    await expense.update(filteredUpdates);
    return this.getExpenseById(id);
  }

  /**
   * Delete expense (soft delete)
   */
  async deleteExpense(id) {
    const expense = await Expense.findByPk(id);

    if (!expense) {
      const error = new Error('Expense not found');
      error.statusCode = 404;
      error.code = 'EXPENSE_NOT_FOUND';
      throw error;
    }

    await expense.destroy();
    return { message: 'Expense deleted successfully' };
  }

  /**
   * Approve expense
   */
  async approveExpense(id, userId) {
    const expense = await Expense.findByPk(id);

    if (!expense) {
      const error = new Error('Expense not found');
      error.statusCode = 404;
      error.code = 'EXPENSE_NOT_FOUND';
      throw error;
    }

    await expense.update({
      isApproved: true,
      approvedBy: userId
    });

    return this.getExpenseById(id);
  }

  /**
   * Get expenses by site
   */
  async getExpensesBySite(siteId) {
    const expenses = await Expense.findAll({
      where: { siteId },
      order: [['expenseDate', 'DESC']]
    });

    // Calculate totals by category
    const byCategory = expenses.reduce((acc, exp) => {
      acc[exp.category] = (acc[exp.category] || 0) + parseFloat(exp.amount);
      return acc;
    }, {});

    const total = expenses.reduce((sum, exp) => sum + parseFloat(exp.amount), 0);

    return { expenses, byCategory, total };
  }

  /**
   * Get budget comparison for a site
   */
  async getBudgetComparison(siteId) {
    const budget = await Budget.findOne({ where: { siteId } });
    const expenses = await Expense.findAll({ where: { siteId } });

    const totalExpenses = expenses.reduce((sum, exp) => sum + parseFloat(exp.amount), 0);
    const plannedAmount = budget ? parseFloat(budget.plannedAmount) : 0;
    const remaining = plannedAmount - totalExpenses;
    const percentUsed = plannedAmount > 0 ? Math.round((totalExpenses / plannedAmount) * 100) : 0;

    // Check if over budget
    const isOverBudget = totalExpenses > plannedAmount;

    return {
      plannedAmount,
      totalExpenses,
      remaining,
      percentUsed,
      isOverBudget
    };
  }

  /**
   * Get expense summary
   */
  async getExpenseSummary(options = {}) {
    const { startDate, endDate, siteId } = options;
    
    const where = {};
    if (siteId) where.siteId = siteId;
    if (startDate && endDate) {
      where.expenseDate = { [Op.between]: [startDate, endDate] };
    }

    const expenses = await Expense.findAll({ where });

    const byCategory = {};
    let total = 0;

    expenses.forEach(exp => {
      byCategory[exp.category] = (byCategory[exp.category] || 0) + parseFloat(exp.amount);
      total += parseFloat(exp.amount);
    });

    return { byCategory, total, count: expenses.length };
  }
}

module.exports = new ExpenseService();

