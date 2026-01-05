const budgetService = require('../services/budgetService');
const { successResponse } = require('../utils/response');
const { asyncHandler } = require('../middleware/errorHandler');

/**
 * Get budget by site
 * GET /api/budgets/site/:siteId
 */
const getBudgetBySite = asyncHandler(async (req, res) => {
  const budget = await budgetService.getBudgetBySite(req.params.siteId);
  successResponse(res, budget, 'Budget retrieved successfully');
});

/**
 * Create or update budget
 * POST /api/budgets/site/:siteId
 */
const upsertBudget = asyncHandler(async (req, res) => {
  const budget = await budgetService.upsertBudget(req.params.siteId, req.body);
  successResponse(res, budget, 'Budget saved successfully', 201);
});

/**
 * Update budget
 * PUT /api/budgets/:id
 */
const updateBudget = asyncHandler(async (req, res) => {
  const budget = await budgetService.updateBudget(req.params.id, req.body);
  successResponse(res, budget, 'Budget updated successfully');
});

/**
 * Get budget overview
 * GET /api/budgets/site/:siteId/overview
 */
const getBudgetOverview = asyncHandler(async (req, res) => {
  const overview = await budgetService.getBudgetOverview(req.params.siteId);
  successResponse(res, overview, 'Budget overview retrieved successfully');
});

/**
 * Delete budget
 * DELETE /api/budgets/:id
 */
const deleteBudget = asyncHandler(async (req, res) => {
  const result = await budgetService.deleteBudget(req.params.id);
  successResponse(res, result, 'Budget deleted successfully');
});

module.exports = {
  getBudgetBySite,
  upsertBudget,
  updateBudget,
  getBudgetOverview,
  deleteBudget
};

