const express = require('express');
const router = express.Router();

const authRoutes = require('./authRoutes');
const userRoutes = require('./userRoutes');
const siteRoutes = require('./siteRoutes');
const taskRoutes = require('./taskRoutes');
const workerRoutes = require('./workerRoutes');
const attendanceRoutes = require('./attendanceRoutes');
const materialRoutes = require('./materialRoutes');
const expenseRoutes = require('./expenseRoutes');
const incidentRoutes = require('./incidentRoutes');
const budgetRoutes = require('./budgetRoutes');
const reportRoutes = require('./reportRoutes');
const pdfRoutes = require('./pdfRoutes');
const attachmentRoutes = require('./attachmentRoutes');
const notificationRoutes = require('./notificationRoutes');
const assignmentRoutes = require('./assignmentRoutes');
const auditRoutes = require('./auditRoutes');
const calendarRoutes = require('./calendarRoutes');
const timesheetRoutes = require('./timesheetRoutes');
const alertRoutes = require('./alertRoutes');

// API Routes
router.use('/auth', authRoutes);
router.use('/users', userRoutes);
router.use('/sites', siteRoutes);
router.use('/tasks', taskRoutes);
router.use('/workers', workerRoutes);
router.use('/attendance', attendanceRoutes);
router.use('/materials', materialRoutes);
router.use('/expenses', expenseRoutes);
router.use('/incidents', incidentRoutes);
router.use('/budgets', budgetRoutes);
router.use('/reports', reportRoutes);
router.use('/reports/pdf', pdfRoutes);
router.use('/attachments', attachmentRoutes);
router.use('/notifications', notificationRoutes);
router.use('/assignments', assignmentRoutes);
router.use('/audit-logs', auditRoutes);
router.use('/calendar', calendarRoutes);
router.use('/timesheets', timesheetRoutes);
router.use('/alerts', alertRoutes);

// Health check
router.get('/health', (req, res) => {
  res.json({ 
    success: true, 
    message: 'API is running',
    timestamp: new Date().toISOString()
  });
});

module.exports = router;
