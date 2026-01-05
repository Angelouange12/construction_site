const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Assignment = sequelize.define('Assignment', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  // What is being assigned (worker, material)
  assigneeType: {
    type: DataTypes.ENUM('worker', 'material'),
    allowNull: false
  },
  assigneeId: {
    type: DataTypes.INTEGER,
    allowNull: false
  },
  // What it's assigned to (site, task)
  entityType: {
    type: DataTypes.ENUM('site', 'task'),
    allowNull: false
  },
  entityId: {
    type: DataTypes.INTEGER,
    allowNull: false
  },
  startDate: {
    type: DataTypes.DATEONLY,
    allowNull: false
  },
  endDate: {
    type: DataTypes.DATEONLY,
    allowNull: true
  },
  status: {
    type: DataTypes.ENUM('active', 'completed', 'cancelled', 'reassigned'),
    defaultValue: 'active'
  },
  hoursPerDay: {
    type: DataTypes.DECIMAL(4, 2),
    defaultValue: 8
  },
  quantity: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: true // For material assignments
  },
  notes: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  assignedBy: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'users',
      key: 'id'
    }
  },
  reassignedFrom: {
    type: DataTypes.INTEGER,
    allowNull: true // Previous assignment if this is a reassignment
  }
}, {
  tableName: 'assignments'
});

module.exports = Assignment;

