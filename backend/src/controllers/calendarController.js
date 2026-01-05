const calendarService = require('../services/calendarService');
const { successResponse } = require('../utils/response');
const { asyncHandler } = require('../middleware/errorHandler');

/**
 * Create calendar event
 * POST /api/calendar/events
 */
const createEvent = asyncHandler(async (req, res) => {
  const event = await calendarService.createEvent(req.body, req.user.id);
  successResponse(res, event, 'Event created successfully', 201);
});

/**
 * Get events
 * GET /api/calendar/events
 */
const getEvents = asyncHandler(async (req, res) => {
  const events = await calendarService.getEvents(req.query);
  successResponse(res, events, 'Events retrieved successfully');
});

/**
 * Get event by ID
 * GET /api/calendar/events/:id
 */
const getEventById = asyncHandler(async (req, res) => {
  const event = await calendarService.getEventById(req.params.id);
  successResponse(res, event, 'Event retrieved successfully');
});

/**
 * Get site weekly schedule
 * GET /api/calendar/sites/:siteId/weekly
 */
const getSiteWeeklySchedule = asyncHandler(async (req, res) => {
  const { weekStart } = req.query;
  const schedule = await calendarService.getSiteWeeklySchedule(req.params.siteId, weekStart);
  successResponse(res, schedule, 'Site schedule retrieved');
});

/**
 * Get worker schedule
 * GET /api/calendar/workers/:workerId
 */
const getWorkerSchedule = asyncHandler(async (req, res) => {
  const { startDate, endDate } = req.query;
  const schedule = await calendarService.getWorkerSchedule(req.params.workerId, startDate, endDate);
  successResponse(res, schedule, 'Worker schedule retrieved');
});

/**
 * Update event
 * PUT /api/calendar/events/:id
 */
const updateEvent = asyncHandler(async (req, res) => {
  const event = await calendarService.updateEvent(req.params.id, req.body);
  successResponse(res, event, 'Event updated successfully');
});

/**
 * Delete event
 * DELETE /api/calendar/events/:id
 */
const deleteEvent = asyncHandler(async (req, res) => {
  const result = await calendarService.deleteEvent(req.params.id);
  successResponse(res, result, 'Event deleted successfully');
});

/**
 * Sync tasks to calendar
 * POST /api/calendar/sites/:siteId/sync-tasks
 */
const syncTasksToCalendar = asyncHandler(async (req, res) => {
  const events = await calendarService.syncTasksToCalendar(req.params.siteId);
  successResponse(res, events, `Synced ${events.length} tasks to calendar`);
});

/**
 * Check conflicts
 * POST /api/calendar/check-conflicts
 */
const checkConflicts = asyncHandler(async (req, res) => {
  const conflicts = await calendarService.checkConflicts(req.body);
  successResponse(res, { conflicts, hasConflicts: conflicts.length > 0 }, 'Conflict check complete');
});

/**
 * Get calendar summary
 * GET /api/calendar/summary
 */
const getCalendarSummary = asyncHandler(async (req, res) => {
  const { days } = req.query;
  const summary = await calendarService.getCalendarSummary(days);
  successResponse(res, summary, 'Calendar summary retrieved');
});

module.exports = {
  createEvent,
  getEvents,
  getEventById,
  getSiteWeeklySchedule,
  getWorkerSchedule,
  updateEvent,
  deleteEvent,
  syncTasksToCalendar,
  checkConflicts,
  getCalendarSummary
};

