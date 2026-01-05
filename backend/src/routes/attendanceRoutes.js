const express = require('express');
const router = express.Router();
const attendanceController = require('../controllers/attendanceController');
const { authenticate, isAdminOrChef } = require('../middleware/auth');
const validate = require('../middleware/validate');
const { attendanceValidator, idParamValidator } = require('../utils/validators');

// All routes require authentication
router.use(authenticate);

// Special routes
router.get('/site/:siteId/daily', attendanceController.getDailyAttendance);
router.get('/site/:siteId/summary', attendanceController.getAttendanceSummary);

// Check-in/out
router.post('/check-in', attendanceValidator, validate, attendanceController.checkIn);
router.put('/:id/check-out', idParamValidator, validate, attendanceController.checkOut);

// Standard CRUD
router.get('/', attendanceController.getAttendance);
router.get('/:id', idParamValidator, validate, attendanceController.getAttendanceById);
router.put('/:id', isAdminOrChef, idParamValidator, validate, attendanceController.updateAttendance);
router.delete('/:id', isAdminOrChef, idParamValidator, validate, attendanceController.deleteAttendance);

module.exports = router;

