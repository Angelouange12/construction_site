const express = require('express');
const router = express.Router();
const expenseController = require('../controllers/expenseController');
const { authenticate, isAdminOrChef } = require('../middleware/auth');
const validate = require('../middleware/validate');
const { expenseValidator, idParamValidator } = require('../utils/validators');

// All routes require authentication
router.use(authenticate);

// Special routes
router.get('/summary', expenseController.getExpenseSummary);
router.get('/site/:siteId', expenseController.getExpensesBySite);
router.get('/site/:siteId/budget-comparison', expenseController.getBudgetComparison);

// Standard CRUD
router.get('/', expenseController.getAllExpenses);
router.post('/', isAdminOrChef, expenseValidator, validate, expenseController.createExpense);
router.get('/:id', idParamValidator, validate, expenseController.getExpenseById);
router.put('/:id', isAdminOrChef, idParamValidator, validate, expenseController.updateExpense);
router.delete('/:id', isAdminOrChef, idParamValidator, validate, expenseController.deleteExpense);
router.post('/:id/approve', isAdminOrChef, idParamValidator, validate, expenseController.approveExpense);

module.exports = router;

