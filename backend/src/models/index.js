const sequelize = require('../config/database');
const User = require('./User');
const Site = require('./Site');
const Task = require('./Task');
const Worker = require('./Worker');
const Attendance = require('./Attendance');
const Material = require('./Material');
const MaterialUsage = require('./MaterialUsage');
const Expense = require('./Expense');
const Incident = require('./Incident');
const Budget = require('./Budget');
const Attachment = require('./Attachment');
const Notification = require('./Notification');
const Assignment = require('./Assignment');
const AssignmentHistory = require('./AssignmentHistory');
const AuditLog = require('./AuditLog');
const CalendarEvent = require('./CalendarEvent');
const Timesheet = require('./Timesheet');

// ============================================
// Original Model Associations
// ============================================

// User - Site (Manager relationship)
User.hasMany(Site, { foreignKey: 'managerId', as: 'managedSites' });
Site.belongsTo(User, { foreignKey: 'managerId', as: 'manager' });

// Site - Task
Site.hasMany(Task, { foreignKey: 'siteId', as: 'tasks', onDelete: 'CASCADE' });
Task.belongsTo(Site, { foreignKey: 'siteId', as: 'site' });

// Site - Worker
Site.hasMany(Worker, { foreignKey: 'siteId', as: 'workers' });
Worker.belongsTo(Site, { foreignKey: 'siteId', as: 'site' });

// Worker - Task (Assignment)
Worker.hasMany(Task, { foreignKey: 'workerId', as: 'tasks' });
Task.belongsTo(Worker, { foreignKey: 'workerId', as: 'worker' });

// Worker - User (Optional link for ouvrier role)
User.hasOne(Worker, { foreignKey: 'userId', as: 'workerProfile' });
Worker.belongsTo(User, { foreignKey: 'userId', as: 'user' });

// Worker - Attendance
Worker.hasMany(Attendance, { foreignKey: 'workerId', as: 'attendance', onDelete: 'CASCADE' });
Attendance.belongsTo(Worker, { foreignKey: 'workerId', as: 'worker' });

// Site - Attendance
Site.hasMany(Attendance, { foreignKey: 'siteId', as: 'attendance' });
Attendance.belongsTo(Site, { foreignKey: 'siteId', as: 'site' });

// Material - MaterialUsage
Material.hasMany(MaterialUsage, { foreignKey: 'materialId', as: 'usage', onDelete: 'CASCADE' });
MaterialUsage.belongsTo(Material, { foreignKey: 'materialId', as: 'material' });

// Site - MaterialUsage
Site.hasMany(MaterialUsage, { foreignKey: 'siteId', as: 'materialUsage', onDelete: 'CASCADE' });
MaterialUsage.belongsTo(Site, { foreignKey: 'siteId', as: 'site' });

// Site - Expense
Site.hasMany(Expense, { foreignKey: 'siteId', as: 'expenses', onDelete: 'CASCADE' });
Expense.belongsTo(Site, { foreignKey: 'siteId', as: 'site' });

// User - Expense (Approved by)
User.hasMany(Expense, { foreignKey: 'approvedBy', as: 'approvedExpenses' });
Expense.belongsTo(User, { foreignKey: 'approvedBy', as: 'approver' });

// Site - Incident
Site.hasMany(Incident, { foreignKey: 'siteId', as: 'incidents', onDelete: 'CASCADE' });
Incident.belongsTo(Site, { foreignKey: 'siteId', as: 'site' });

// User - Incident (Reported by)
User.hasMany(Incident, { foreignKey: 'reportedBy', as: 'reportedIncidents' });
Incident.belongsTo(User, { foreignKey: 'reportedBy', as: 'reporter' });

// Site - Budget (One-to-One)
Site.hasOne(Budget, { foreignKey: 'siteId', as: 'budget', onDelete: 'CASCADE' });
Budget.belongsTo(Site, { foreignKey: 'siteId', as: 'site' });

// ============================================
// New Model Associations
// ============================================

// Attachment - User (Uploaded by)
User.hasMany(Attachment, { foreignKey: 'uploadedBy', as: 'uploadedAttachments' });
Attachment.belongsTo(User, { foreignKey: 'uploadedBy', as: 'uploader' });

// Notification - User
User.hasMany(Notification, { foreignKey: 'userId', as: 'notifications' });
Notification.belongsTo(User, { foreignKey: 'userId', as: 'user' });

// Assignment - User (Assigned by)
User.hasMany(Assignment, { foreignKey: 'assignedBy', as: 'createdAssignments' });
Assignment.belongsTo(User, { foreignKey: 'assignedBy', as: 'assigner' });

// Assignment - AssignmentHistory
Assignment.hasMany(AssignmentHistory, { foreignKey: 'assignmentId', as: 'history' });
AssignmentHistory.belongsTo(Assignment, { foreignKey: 'assignmentId', as: 'assignment' });

// AssignmentHistory - User (Changed by)
User.hasMany(AssignmentHistory, { foreignKey: 'changedBy', as: 'assignmentChanges' });
AssignmentHistory.belongsTo(User, { foreignKey: 'changedBy', as: 'changer' });

// AuditLog - User
User.hasMany(AuditLog, { foreignKey: 'userId', as: 'auditLogs' });
AuditLog.belongsTo(User, { foreignKey: 'userId', as: 'user' });

// CalendarEvent associations
Site.hasMany(CalendarEvent, { foreignKey: 'siteId', as: 'calendarEvents' });
CalendarEvent.belongsTo(Site, { foreignKey: 'siteId', as: 'site' });

Task.hasMany(CalendarEvent, { foreignKey: 'taskId', as: 'calendarEvents' });
CalendarEvent.belongsTo(Task, { foreignKey: 'taskId', as: 'task' });

Worker.hasMany(CalendarEvent, { foreignKey: 'workerId', as: 'calendarEvents' });
CalendarEvent.belongsTo(Worker, { foreignKey: 'workerId', as: 'worker' });

User.hasMany(CalendarEvent, { foreignKey: 'createdBy', as: 'createdEvents' });
CalendarEvent.belongsTo(User, { foreignKey: 'createdBy', as: 'creator' });

// Timesheet associations
Worker.hasMany(Timesheet, { foreignKey: 'workerId', as: 'timesheets' });
Timesheet.belongsTo(Worker, { foreignKey: 'workerId', as: 'worker' });

Site.hasMany(Timesheet, { foreignKey: 'siteId', as: 'timesheets' });
Timesheet.belongsTo(Site, { foreignKey: 'siteId', as: 'site' });

User.hasMany(Timesheet, { foreignKey: 'approvedBy', as: 'approvedTimesheets' });
Timesheet.belongsTo(User, { foreignKey: 'approvedBy', as: 'approver' });

// ============================================
// Database Sync Function
// ============================================
const syncDatabase = async (force = false) => {
  try {
    await sequelize.sync({ force });
    console.log('Database synchronized successfully');
  } catch (error) {
    console.error('Error synchronizing database:', error);
    throw error;
  }
};

module.exports = {
  sequelize,
  User,
  Site,
  Task,
  Worker,
  Attendance,
  Material,
  MaterialUsage,
  Expense,
  Incident,
  Budget,
  Attachment,
  Notification,
  Assignment,
  AssignmentHistory,
  AuditLog,
  CalendarEvent,
  Timesheet,
  syncDatabase
};
