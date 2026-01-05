const PDFDocument = require('pdfkit');
const fs = require('fs');
const path = require('path');
const { Site, Task, Worker, Expense, Incident, Attendance, Timesheet, Budget, MaterialUsage, Material } = require('../models');

class PDFService {
  constructor() {
    this.outputDir = path.join(__dirname, '..', '..', 'uploads', 'reports');
    if (!fs.existsSync(this.outputDir)) {
      fs.mkdirSync(this.outputDir, { recursive: true });
    }
  }

  /**
   * Create a new PDF document
   */
  createDocument() {
    return new PDFDocument({
      size: 'A4',
      margins: { top: 50, bottom: 50, left: 50, right: 50 }
    });
  }

  /**
   * Add header to PDF
   */
  addHeader(doc, title, subtitle = '') {
    doc
      .fontSize(24)
      .fillColor('#1e3a5f')
      .text(title, { align: 'center' })
      .moveDown(0.3);
    
    if (subtitle) {
      doc
        .fontSize(12)
        .fillColor('#666')
        .text(subtitle, { align: 'center' })
        .moveDown(0.3);
    }
    
    doc
      .fontSize(10)
      .fillColor('#888')
      .text(`Generated: ${new Date().toLocaleString()}`, { align: 'center' })
      .moveDown(1);

    // Divider line
    doc
      .strokeColor('#ddd')
      .lineWidth(1)
      .moveTo(50, doc.y)
      .lineTo(545, doc.y)
      .stroke()
      .moveDown(1);

    return doc;
  }

  /**
   * Add section title
   */
  addSectionTitle(doc, title) {
    doc
      .fontSize(14)
      .fillColor('#1e3a5f')
      .text(title)
      .moveDown(0.5);
    return doc;
  }

  /**
   * Add key-value row
   */
  addKeyValue(doc, key, value) {
    doc
      .fontSize(11)
      .fillColor('#333')
      .text(`${key}: `, { continued: true })
      .fillColor('#666')
      .text(value || 'N/A')
      .moveDown(0.3);
    return doc;
  }

  /**
   * Add table
   */
  addTable(doc, headers, rows, options = {}) {
    const { columnWidths = [] } = options;
    const startX = 50;
    const startY = doc.y;
    const cellPadding = 8;
    const defaultWidth = (495 / headers.length);

    // Header row
    doc.fontSize(10).fillColor('#fff');
    let x = startX;
    headers.forEach((header, i) => {
      const width = columnWidths[i] || defaultWidth;
      doc
        .rect(x, startY, width, 25)
        .fill('#1e3a5f');
      doc
        .fillColor('#fff')
        .text(header, x + cellPadding, startY + cellPadding, { width: width - cellPadding * 2 });
      x += width;
    });

    // Data rows
    let y = startY + 25;
    doc.fillColor('#333');
    
    rows.forEach((row, rowIndex) => {
      x = startX;
      const bgColor = rowIndex % 2 === 0 ? '#f8f9fa' : '#fff';
      
      headers.forEach((_, i) => {
        const width = columnWidths[i] || defaultWidth;
        doc.rect(x, y, width, 25).fill(bgColor);
        doc
          .fillColor('#333')
          .fontSize(9)
          .text(String(row[i] || ''), x + cellPadding, y + cellPadding, { width: width - cellPadding * 2 });
        x += width;
      });
      y += 25;
      
      // New page if needed
      if (y > 750) {
        doc.addPage();
        y = 50;
      }
    });

    doc.y = y + 10;
    return doc;
  }

  /**
   * Generate Site Progress Report
   */
  async generateSiteReport(siteId) {
    const site = await Site.findByPk(siteId, {
      include: [
        { model: Task, as: 'tasks' },
        { model: Worker, as: 'workers' },
        { model: Incident, as: 'incidents' },
        { model: Expense, as: 'expenses' },
        { model: Budget, as: 'budget' }
      ]
    });

    if (!site) throw new Error('Site not found');

    const doc = this.createDocument();
    const filename = `site_report_${siteId}_${Date.now()}.pdf`;
    const filePath = path.join(this.outputDir, filename);
    const stream = fs.createWriteStream(filePath);

    doc.pipe(stream);

    // Header
    this.addHeader(doc, 'Site Progress Report', site.name);

    // Site Info
    this.addSectionTitle(doc, 'Site Information');
    this.addKeyValue(doc, 'Location', site.location);
    this.addKeyValue(doc, 'Status', site.status);
    this.addKeyValue(doc, 'Start Date', site.startDate);
    this.addKeyValue(doc, 'End Date', site.endDate);
    this.addKeyValue(doc, 'Progress', `${site.progress || 0}%`);
    doc.moveDown();

    // Tasks Summary
    this.addSectionTitle(doc, 'Tasks Summary');
    const tasks = site.tasks || [];
    const taskStats = {
      total: tasks.length,
      completed: tasks.filter(t => t.status === 'completed').length,
      inProgress: tasks.filter(t => t.status === 'in_progress').length,
      pending: tasks.filter(t => t.status === 'pending').length
    };
    this.addKeyValue(doc, 'Total Tasks', String(taskStats.total));
    this.addKeyValue(doc, 'Completed', String(taskStats.completed));
    this.addKeyValue(doc, 'In Progress', String(taskStats.inProgress));
    this.addKeyValue(doc, 'Pending', String(taskStats.pending));
    doc.moveDown();

    // Workers
    this.addSectionTitle(doc, 'Workers');
    const workerRows = (site.workers || []).map(w => [w.name, w.specialty, w.phone]);
    if (workerRows.length > 0) {
      this.addTable(doc, ['Name', 'Specialty', 'Phone'], workerRows, {
        columnWidths: [180, 180, 135]
      });
    } else {
      doc.text('No workers assigned').moveDown();
    }

    // Budget
    if (site.budget) {
      this.addSectionTitle(doc, 'Budget Summary');
      this.addKeyValue(doc, 'Planned Budget', `€${site.budget.plannedAmount || 0}`);
      this.addKeyValue(doc, 'Actual Spent', `€${site.budget.actualAmount || 0}`);
      const variance = (site.budget.plannedAmount || 0) - (site.budget.actualAmount || 0);
      this.addKeyValue(doc, 'Variance', `€${variance}`);
      doc.moveDown();
    }

    // Incidents
    if (site.incidents && site.incidents.length > 0) {
      this.addSectionTitle(doc, 'Incidents');
      const incidentRows = site.incidents.map(i => [
        i.title,
        i.severity,
        i.status,
        new Date(i.incidentDate).toLocaleDateString()
      ]);
      this.addTable(doc, ['Title', 'Severity', 'Status', 'Date'], incidentRows, {
        columnWidths: [180, 90, 90, 135]
      });
    }

    doc.end();

    return new Promise((resolve, reject) => {
      stream.on('finish', () => {
        resolve({
          filename,
          path: `/uploads/reports/${filename}`,
          fullPath: filePath
        });
      });
      stream.on('error', reject);
    });
  }

  /**
   * Generate Worker Timesheet Report
   */
  async generateTimesheetReport(workerId, startDate, endDate) {
    const worker = await Worker.findByPk(workerId, {
      include: [{ model: Site, as: 'site' }]
    });

    if (!worker) throw new Error('Worker not found');

    const timesheets = await Timesheet.findAll({
      where: { workerId },
      order: [['weekStartDate', 'DESC']],
      limit: 10
    });

    const doc = this.createDocument();
    const filename = `timesheet_${workerId}_${Date.now()}.pdf`;
    const filePath = path.join(this.outputDir, filename);
    const stream = fs.createWriteStream(filePath);

    doc.pipe(stream);

    // Header
    this.addHeader(doc, 'Worker Timesheet Report', worker.name);

    // Worker Info
    this.addSectionTitle(doc, 'Worker Information');
    this.addKeyValue(doc, 'Name', worker.name);
    this.addKeyValue(doc, 'Specialty', worker.specialty);
    this.addKeyValue(doc, 'Hourly Rate', `€${worker.hourlyRate || 0}`);
    this.addKeyValue(doc, 'Current Site', worker.site?.name || 'Not assigned');
    doc.moveDown();

    // Timesheets
    this.addSectionTitle(doc, 'Recent Timesheets');
    const rows = timesheets.map(ts => [
      ts.weekStartDate,
      String(ts.regularHours),
      String(ts.overtimeHours),
      String(ts.totalHours),
      `€${ts.totalPay}`,
      ts.status
    ]);

    if (rows.length > 0) {
      this.addTable(doc, ['Week Start', 'Regular', 'Overtime', 'Total', 'Pay', 'Status'], rows, {
        columnWidths: [90, 70, 70, 70, 85, 110]
      });
    } else {
      doc.text('No timesheets found').moveDown();
    }

    // Summary
    const totals = timesheets.reduce((acc, ts) => ({
      regular: acc.regular + parseFloat(ts.regularHours || 0),
      overtime: acc.overtime + parseFloat(ts.overtimeHours || 0),
      pay: acc.pay + parseFloat(ts.totalPay || 0)
    }), { regular: 0, overtime: 0, pay: 0 });

    doc.moveDown();
    this.addSectionTitle(doc, 'Period Summary');
    this.addKeyValue(doc, 'Total Regular Hours', String(totals.regular.toFixed(2)));
    this.addKeyValue(doc, 'Total Overtime Hours', String(totals.overtime.toFixed(2)));
    this.addKeyValue(doc, 'Total Pay', `€${totals.pay.toFixed(2)}`);

    doc.end();

    return new Promise((resolve, reject) => {
      stream.on('finish', () => {
        resolve({
          filename,
          path: `/uploads/reports/${filename}`,
          fullPath: filePath
        });
      });
      stream.on('error', reject);
    });
  }

  /**
   * Generate Expense Report
   */
  async generateExpenseReport(siteId, startDate, endDate) {
    const where = {};
    if (siteId) where.siteId = siteId;

    const expenses = await Expense.findAll({
      where,
      include: [{ model: Site, as: 'site' }],
      order: [['expenseDate', 'DESC']]
    });

    const site = siteId ? await Site.findByPk(siteId) : null;

    const doc = this.createDocument();
    const filename = `expense_report_${siteId || 'all'}_${Date.now()}.pdf`;
    const filePath = path.join(this.outputDir, filename);
    const stream = fs.createWriteStream(filePath);

    doc.pipe(stream);

    // Header
    this.addHeader(doc, 'Expense Report', site ? site.name : 'All Sites');

    // Summary
    const total = expenses.reduce((sum, e) => sum + parseFloat(e.amount || 0), 0);
    const approved = expenses.filter(e => e.status === 'approved');
    const pending = expenses.filter(e => e.status === 'pending');

    this.addSectionTitle(doc, 'Summary');
    this.addKeyValue(doc, 'Total Expenses', `€${total.toFixed(2)}`);
    this.addKeyValue(doc, 'Number of Expenses', String(expenses.length));
    this.addKeyValue(doc, 'Approved', String(approved.length));
    this.addKeyValue(doc, 'Pending', String(pending.length));
    doc.moveDown();

    // Expense List
    this.addSectionTitle(doc, 'Expense Details');
    const rows = expenses.map(e => [
      e.site?.name || 'N/A',
      e.category || 'Other',
      e.description?.substring(0, 30) || '',
      `€${e.amount}`,
      e.status,
      new Date(e.expenseDate).toLocaleDateString()
    ]);

    if (rows.length > 0) {
      this.addTable(doc, ['Site', 'Category', 'Description', 'Amount', 'Status', 'Date'], rows, {
        columnWidths: [80, 70, 100, 70, 75, 100]
      });
    }

    // By Category
    const byCategory = {};
    expenses.forEach(e => {
      const cat = e.category || 'Other';
      byCategory[cat] = (byCategory[cat] || 0) + parseFloat(e.amount || 0);
    });

    doc.moveDown();
    this.addSectionTitle(doc, 'By Category');
    Object.entries(byCategory).forEach(([cat, amount]) => {
      this.addKeyValue(doc, cat, `€${amount.toFixed(2)}`);
    });

    doc.end();

    return new Promise((resolve, reject) => {
      stream.on('finish', () => {
        resolve({
          filename,
          path: `/uploads/reports/${filename}`,
          fullPath: filePath
        });
      });
      stream.on('error', reject);
    });
  }

  /**
   * Generate Safety/Incident Report
   */
  async generateIncidentReport(siteId) {
    const where = {};
    if (siteId) where.siteId = siteId;

    const incidents = await Incident.findAll({
      where,
      include: [{ model: Site, as: 'site' }],
      order: [['incidentDate', 'DESC']]
    });

    const site = siteId ? await Site.findByPk(siteId) : null;

    const doc = this.createDocument();
    const filename = `incident_report_${siteId || 'all'}_${Date.now()}.pdf`;
    const filePath = path.join(this.outputDir, filename);
    const stream = fs.createWriteStream(filePath);

    doc.pipe(stream);

    // Header
    this.addHeader(doc, 'Safety & Incident Report', site ? site.name : 'All Sites');

    // Summary
    const bySeverity = { low: 0, medium: 0, high: 0, critical: 0 };
    const byStatus = { reported: 0, investigating: 0, resolved: 0 };

    incidents.forEach(i => {
      if (bySeverity[i.severity] !== undefined) bySeverity[i.severity]++;
      if (byStatus[i.status] !== undefined) byStatus[i.status]++;
    });

    this.addSectionTitle(doc, 'Summary');
    this.addKeyValue(doc, 'Total Incidents', String(incidents.length));
    doc.moveDown(0.5);
    
    this.addKeyValue(doc, 'Critical', String(bySeverity.critical));
    this.addKeyValue(doc, 'High', String(bySeverity.high));
    this.addKeyValue(doc, 'Medium', String(bySeverity.medium));
    this.addKeyValue(doc, 'Low', String(bySeverity.low));
    doc.moveDown();

    // Incident List
    this.addSectionTitle(doc, 'Incident Details');
    const rows = incidents.map(i => [
      i.site?.name || 'N/A',
      i.title.substring(0, 25),
      i.severity,
      i.status,
      new Date(i.incidentDate).toLocaleDateString()
    ]);

    if (rows.length > 0) {
      this.addTable(doc, ['Site', 'Title', 'Severity', 'Status', 'Date'], rows, {
        columnWidths: [100, 140, 75, 85, 95]
      });
    }

    doc.end();

    return new Promise((resolve, reject) => {
      stream.on('finish', () => {
        resolve({
          filename,
          path: `/uploads/reports/${filename}`,
          fullPath: filePath
        });
      });
      stream.on('error', reject);
    });
  }
}

module.exports = new PDFService();

