const express = require('express');
const router = express.Router();
const auditController = require('../controllers/auditController');
const { authenticate, isAdmin } = require('../middleware/auth');

// All routes require admin authentication
router.use(authenticate);
router.use(isAdmin);

// Get audit logs
router.get('/', auditController.getAuditLogs);

// Get activity summary
router.get('/summary', auditController.getActivitySummary);

// Get entity history
router.get('/entity/:entityType/:entityId', auditController.getEntityHistory);

// Get user activity
router.get('/user/:userId', auditController.getUserActivity);

module.exports = router;

