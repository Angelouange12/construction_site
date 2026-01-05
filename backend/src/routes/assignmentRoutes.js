const express = require('express');
const router = express.Router();
const assignmentController = require('../controllers/assignmentController');
const { authenticate, isAdminOrChef } = require('../middleware/auth');

// All routes require authentication
router.use(authenticate);

// Check conflicts (before creating)
router.post('/check-conflicts', assignmentController.checkConflicts);

// Get worker assignments
router.get('/worker/:workerId', assignmentController.getWorkerAssignments);

// Get worker timeline
router.get('/worker/:workerId/timeline', assignmentController.getWorkerTimeline);

// Get site assignments
router.get('/site/:siteId', assignmentController.getSiteAssignments);

// Get all assignments
router.get('/', assignmentController.getAssignments);

// Create assignment (admin/chef only)
router.post('/', isAdminOrChef, assignmentController.createAssignment);

// Get assignment by ID
router.get('/:id', assignmentController.getAssignmentById);

// Get assignment history
router.get('/:id/history', assignmentController.getAssignmentHistory);

// Update assignment (admin/chef only)
router.put('/:id', isAdminOrChef, assignmentController.updateAssignment);

// Complete assignment
router.put('/:id/complete', isAdminOrChef, assignmentController.completeAssignment);

// Cancel assignment
router.put('/:id/cancel', isAdminOrChef, assignmentController.cancelAssignment);

// Reassign
router.post('/:id/reassign', isAdminOrChef, assignmentController.reassign);

module.exports = router;

