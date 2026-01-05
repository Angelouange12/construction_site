const express = require('express');
const router = express.Router();
const calendarController = require('../controllers/calendarController');
const { authenticate, isAdminOrChef } = require('../middleware/auth');

// All routes require authentication
router.use(authenticate);

// Get calendar summary
router.get('/summary', calendarController.getCalendarSummary);

// Check conflicts
router.post('/check-conflicts', calendarController.checkConflicts);

// Get events
router.get('/events', calendarController.getEvents);

// Create event (admin/chef only)
router.post('/events', isAdminOrChef, calendarController.createEvent);

// Get site weekly schedule
router.get('/sites/:siteId/weekly', calendarController.getSiteWeeklySchedule);

// Sync tasks to calendar
router.post('/sites/:siteId/sync-tasks', isAdminOrChef, calendarController.syncTasksToCalendar);

// Get worker schedule
router.get('/workers/:workerId', calendarController.getWorkerSchedule);

// Get single event
router.get('/events/:id', calendarController.getEventById);

// Update event
router.put('/events/:id', isAdminOrChef, calendarController.updateEvent);

// Delete event
router.delete('/events/:id', isAdminOrChef, calendarController.deleteEvent);

module.exports = router;

