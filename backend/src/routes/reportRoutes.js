const express = require('express');
const router = express.Router();
const reportController = require('../controllers/reportController');
const { authenticate, isAdminOrChef } = require('../middleware/auth');

// All routes require authentication
router.use(authenticate);

// Dashboard
router.get('/dashboard', reportController.getDashboardStats);

// Alerts
router.get('/alerts', reportController.getAlertsSummary);

// Reports (admin and chef_chantier only)
router.get('/sites/progress', isAdminOrChef, reportController.getSiteProgressReport);
router.get('/expenses', isAdminOrChef, reportController.getExpenseReport);
router.get('/workers/productivity', isAdminOrChef, reportController.getWorkerProductivityReport);
router.get('/safety', isAdminOrChef, reportController.getSafetyReport);
router.get('/budget-vs-actual', isAdminOrChef, reportController.getBudgetVsActualReport);

module.exports = router;

