const express = require('express');
const router = express.Router();
const pdfController = require('../controllers/pdfController');
const { authenticate, isAdminOrChef } = require('../middleware/auth');

// All routes require authentication
router.use(authenticate);

// Generate site report
router.get('/site/:siteId', isAdminOrChef, pdfController.generateSiteReport);

// Generate timesheet report
router.get('/timesheet/:workerId', isAdminOrChef, pdfController.generateTimesheetReport);

// Generate expense report
router.get('/expenses', isAdminOrChef, pdfController.generateExpenseReport);

// Generate incident report
router.get('/incidents', isAdminOrChef, pdfController.generateIncidentReport);

// Download PDF
router.get('/download/:filename', pdfController.downloadPdf);

module.exports = router;

