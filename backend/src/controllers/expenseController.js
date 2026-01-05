const expenseService = require('../services/expenseService');
const { successResponse, paginatedResponse } = require('../utils/response');
const { asyncHandler } = require('../middleware/errorHandler');

/**
 * Get all expenses
 * GET /api/expenses
 */
const getAllExpenses = asyncHandler(async (req, res) => {
  const result = await expenseService.getAllExpenses(req.query);
  paginatedResponse(res, result.expenses, result.pagination, 'Expenses retrieved successfully');
});

/**
 * Get expense by ID
 * GET /api/expenses/:id
 */
const getExpenseById = asyncHandler(async (req, res) => {
  const expense = await expenseService.getExpenseById(req.params.id);
  successResponse(res, expense, 'Expense retrieved successfully');
});

/**
 * Create a new expense
 * POST /api/expenses
 */
const createExpense = asyncHandler(async (req, res) => {
  const expense = await expenseService.createExpense(req.body);
  successResponse(res, expense, 'Expense created successfully', 201);
});

/**
 * Update expense
 * PUT /api/expenses/:id
 */
const updateExpense = asyncHandler(async (req, res) => {
  const expense = await expenseService.updateExpense(req.params.id, req.body);
  successResponse(res, expense, 'Expense updated successfully');
});

/**
 * Delete expense
 * DELETE /api/expenses/:id
 */
const deleteExpense = asyncHandler(async (req, res) => {
  const result = await expenseService.deleteExpense(req.params.id);
  successResponse(res, result, 'Expense deleted successfully');
});

/**
 * Approve expense
 * POST /api/expenses/:id/approve
 */
const approveExpense = asyncHandler(async (req, res) => {
  const expense = await expenseService.approveExpense(req.params.id, req.user.id);
  successResponse(res, expense, 'Expense approved successfully');
});

/**
 * Get expenses by site
 * GET /api/expenses/site/:siteId
 */
const getExpensesBySite = asyncHandler(async (req, res) => {
  const result = await expenseService.getExpensesBySite(req.params.siteId);
  successResponse(res, result, 'Expenses retrieved successfully');
});

/**
 * Get budget comparison for a site
 * GET /api/expenses/site/:siteId/budget-comparison
 */
const getBudgetComparison = asyncHandler(async (req, res) => {
  const comparison = await expenseService.getBudgetComparison(req.params.siteId);
  successResponse(res, comparison, 'Budget comparison retrieved successfully');
});

/**
 * Get expense summary
 * GET /api/expenses/summary
 */
const getExpenseSummary = asyncHandler(async (req, res) => {
  const summary = await expenseService.getExpenseSummary(req.query);
  successResponse(res, summary, 'Expense summary retrieved successfully');
});

module.exports = {
  getAllExpenses,
  getExpenseById,
  createExpense,
  updateExpense,
  deleteExpense,
  approveExpense,
  getExpensesBySite,
  getBudgetComparison,
  getExpenseSummary
};

