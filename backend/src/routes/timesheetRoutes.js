const express = require('express');
const router = express.Router();
const timesheetController = require('../controllers/timesheetController');
const { authenticate, isAdminOrChef } = require('../middleware/auth');

// All routes require authentication
router.use(authenticate);

// Generate single timesheet
router.post('/generate', isAdminOrChef, timesheetController.generateTimesheet);

// Get timesheets
router.get('/', timesheetController.getTimesheets);

// Get site summary
router.get('/sites/:siteId/summary', timesheetController.getSiteSummary);

// Generate timesheets for all site workers
router.post('/sites/:siteId/generate', isAdminOrChef, timesheetController.generateSiteTimesheets);

// Get single timesheet
router.get('/:id', timesheetController.getTimesheetById);

// Update timesheet
router.put('/:id', timesheetController.updateTimesheet);

// Submit timesheet
router.put('/:id/submit', timesheetController.submitTimesheet);

// Approve timesheet (admin/chef only)
router.put('/:id/approve', isAdminOrChef, timesheetController.approveTimesheet);

// Reject timesheet (admin/chef only)
router.put('/:id/reject', isAdminOrChef, timesheetController.rejectTimesheet);

module.exports = router;

