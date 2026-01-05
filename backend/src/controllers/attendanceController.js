const attendanceService = require('../services/attendanceService');
const { successResponse, paginatedResponse } = require('../utils/response');
const { asyncHandler } = require('../middleware/errorHandler');

/**
 * Get attendance records
 * GET /api/attendance
 */
const getAttendance = asyncHandler(async (req, res) => {
  const result = await attendanceService.getAttendance(req.query);
  paginatedResponse(res, result.attendance, result.pagination, 'Attendance records retrieved successfully');
});

/**
 * Get attendance by ID
 * GET /api/attendance/:id
 */
const getAttendanceById = asyncHandler(async (req, res) => {
  const attendance = await attendanceService.getAttendanceById(req.params.id);
  successResponse(res, attendance, 'Attendance record retrieved successfully');
});

/**
 * Check in worker
 * POST /api/attendance/check-in
 */
const checkIn = asyncHandler(async (req, res) => {
  const attendance = await attendanceService.checkIn(req.body);
  successResponse(res, attendance, 'Check-in recorded successfully', 201);
});

/**
 * Check out worker
 * PUT /api/attendance/:id/check-out
 */
const checkOut = asyncHandler(async (req, res) => {
  const { checkOut: checkOutTime } = req.body;
  const attendance = await attendanceService.checkOut(req.params.id, checkOutTime);
  successResponse(res, attendance, 'Check-out recorded successfully');
});

/**
 * Update attendance record
 * PUT /api/attendance/:id
 */
const updateAttendance = asyncHandler(async (req, res) => {
  const attendance = await attendanceService.updateAttendance(req.params.id, req.body);
  successResponse(res, attendance, 'Attendance record updated successfully');
});

/**
 * Delete attendance record
 * DELETE /api/attendance/:id
 */
const deleteAttendance = asyncHandler(async (req, res) => {
  const result = await attendanceService.deleteAttendance(req.params.id);
  successResponse(res, result, 'Attendance record deleted successfully');
});

/**
 * Get daily attendance for a site
 * GET /api/attendance/site/:siteId/daily
 */
const getDailyAttendance = asyncHandler(async (req, res) => {
  const { date } = req.query;
  const attendance = await attendanceService.getDailyAttendance(req.params.siteId, date);
  successResponse(res, attendance, 'Daily attendance retrieved successfully');
});

/**
 * Get attendance summary for a site
 * GET /api/attendance/site/:siteId/summary
 */
const getAttendanceSummary = asyncHandler(async (req, res) => {
  const { startDate, endDate } = req.query;
  const summary = await attendanceService.getAttendanceSummary(req.params.siteId, startDate, endDate);
  successResponse(res, summary, 'Attendance summary retrieved successfully');
});

module.exports = {
  getAttendance,
  getAttendanceById,
  checkIn,
  checkOut,
  updateAttendance,
  deleteAttendance,
  getDailyAttendance,
  getAttendanceSummary
};

