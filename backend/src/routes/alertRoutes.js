const express = require('express');
const router = express.Router();
const alertController = require('../controllers/alertController');
const { authenticate, isAdminOrChef } = require('../middleware/auth');

// All routes require authentication
router.use(authenticate);

// Get alerts
router.get('/', alertController.getAlerts);

// Run alert checks (admin/chef only)
router.post('/check', isAdminOrChef, alertController.runAlertChecks);

// Check if site can be closed
router.get('/sites/:siteId/can-close', isAdminOrChef, alertController.canCloseSite);

// Get site suggestions
router.get('/sites/:siteId/suggestions', alertController.getSiteSuggestions);

module.exports = router;

