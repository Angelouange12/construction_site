const express = require('express');
const router = express.Router();
const budgetController = require('../controllers/budgetController');
const { authenticate, isAdminOrChef } = require('../middleware/auth');
const validate = require('../middleware/validate');
const { budgetValidator, idParamValidator } = require('../utils/validators');

// All routes require authentication
router.use(authenticate);

// Site-based routes
router.get('/site/:siteId', budgetController.getBudgetBySite);
router.get('/site/:siteId/overview', budgetController.getBudgetOverview);
router.post('/site/:siteId', isAdminOrChef, budgetValidator, validate, budgetController.upsertBudget);

// Standard routes
router.put('/:id', isAdminOrChef, idParamValidator, validate, budgetController.updateBudget);
router.delete('/:id', isAdminOrChef, idParamValidator, validate, budgetController.deleteBudget);

module.exports = router;

