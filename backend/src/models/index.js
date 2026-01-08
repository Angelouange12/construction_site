require('dotenv').config();
const { Sequelize } = require('sequelize');
const { sequelize } = require('../config/database'); // Import the sequelize instance from config

// Import models
const User = require('./User');
const Site = require('./Site');
const Project = require('./Project');
const Task = require('./Task');
const Assignment = require('./Assignment');
const AssignmentHistory = require('./AssignmentHistory');
const Notification = require('./Notification');

// Import model definitions
const UserModel = User(sequelize);
const SiteModel = Site(sequelize);
const ProjectModel = Project(sequelize);
const TaskModel = Task(sequelize);
const AssignmentModel = Assignment(sequelize);
const AssignmentHistoryModel = AssignmentHistory(sequelize);
const NotificationModel = Notification(sequelize);

// Define associations
// Site - Project (One-to-Many)
SiteModel.hasMany(ProjectModel, { foreignKey: 'siteId', as: 'projects' });
ProjectModel.belongsTo(SiteModel, { foreignKey: 'siteId', as: 'site' });

// Project - Task (One-to-Many)
ProjectModel.hasMany(TaskModel, { foreignKey: 'projectId', as: 'tasks' });
TaskModel.belongsTo(ProjectModel, { foreignKey: 'projectId', as: 'project' });

// User - Assignment (One-to-Many)
UserModel.hasMany(AssignmentModel, { foreignKey: 'userId', as: 'assignments' });
AssignmentModel.belongsTo(UserModel, { foreignKey: 'userId', as: 'user' });

// Task - Assignment (One-to-Many)
TaskModel.hasMany(AssignmentModel, { foreignKey: 'taskId', as: 'assignments' });
AssignmentModel.belongsTo(TaskModel, { foreignKey: 'taskId', as: 'task' });

// Assignment - AssignmentHistory (One-to-Many)
AssignmentModel.hasMany(AssignmentHistoryModel, { foreignKey: 'assignmentId', as: 'history' });
AssignmentHistoryModel.belongsTo(AssignmentModel, { foreignKey: 'assignmentId', as: 'assignment' });

// User - AssignmentHistory (Changed by)
UserModel.hasMany(AssignmentHistoryModel, { foreignKey: 'changedBy', as: 'assignmentChanges' });
AssignmentHistoryModel.belongsTo(UserModel, { foreignKey: 'changedBy', as: 'changer' });

// User - Notification (One-to-Many)
UserModel.hasMany(NotificationModel, { foreignKey: 'userId', as: 'notifications' });
NotificationModel.belongsTo(UserModel, { foreignKey: 'userId', as: 'user' });

// ============================================
// Database Sync Function
// ============================================
async function syncDatabase(force = false) {
  try {
    await sequelize.sync({ force });
    console.log('✅ Database synchronized successfully');
    return true;
  } catch (error) {
    console.error('❌ Error synchronizing database:', error);
    return false;
  }
}

module.exports = {
  sequelize,
  syncDatabase,
  User: UserModel,
  Site: SiteModel,
  Project: ProjectModel,
  Task: TaskModel,
  Assignment: AssignmentModel,
  AssignmentHistory: AssignmentHistoryModel,
  Notification: NotificationModel
};