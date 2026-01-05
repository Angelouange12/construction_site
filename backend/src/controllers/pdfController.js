const pdfService = require('../services/pdfService');
const { successResponse } = require('../utils/response');
const { asyncHandler } = require('../middleware/errorHandler');
const path = require('path');
const fs = require('fs');

/**
 * Generate site report PDF
 * GET /api/reports/pdf/site/:siteId
 */
const generateSiteReport = asyncHandler(async (req, res) => {
  const { siteId } = req.params;
  const result = await pdfService.generateSiteReport(siteId);
  successResponse(res, result, 'Site report generated');
});

/**
 * Generate timesheet report PDF
 * GET /api/reports/pdf/timesheet/:workerId
 */
const generateTimesheetReport = asyncHandler(async (req, res) => {
  const { workerId } = req.params;
  const { startDate, endDate } = req.query;
  const result = await pdfService.generateTimesheetReport(workerId, startDate, endDate);
  successResponse(res, result, 'Timesheet report generated');
});

/**
 * Generate expense report PDF
 * GET /api/reports/pdf/expenses
 */
const generateExpenseReport = asyncHandler(async (req, res) => {
  const { siteId, startDate, endDate } = req.query;
  const result = await pdfService.generateExpenseReport(siteId, startDate, endDate);
  successResponse(res, result, 'Expense report generated');
});

/**
 * Generate incident report PDF
 * GET /api/reports/pdf/incidents
 */
const generateIncidentReport = asyncHandler(async (req, res) => {
  const { siteId } = req.query;
  const result = await pdfService.generateIncidentReport(siteId);
  successResponse(res, result, 'Incident report generated');
});

/**
 * Download PDF file
 * GET /api/reports/pdf/download/:filename
 */
const downloadPdf = asyncHandler(async (req, res) => {
  const { filename } = req.params;
  const filePath = path.join(__dirname, '..', '..', 'uploads', 'reports', filename);

  if (!fs.existsSync(filePath)) {
    return res.status(404).json({
      success: false,
      error: { message: 'File not found' }
    });
  }

  res.download(filePath, filename);
});

module.exports = {
  generateSiteReport,
  generateTimesheetReport,
  generateExpenseReport,
  generateIncidentReport,
  downloadPdf
};

