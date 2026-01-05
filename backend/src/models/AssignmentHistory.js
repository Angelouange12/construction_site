const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const AssignmentHistory = sequelize.define('AssignmentHistory', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  assignmentId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'assignments',
      key: 'id'
    }
  },
  action: {
    type: DataTypes.ENUM('created', 'updated', 'completed', 'cancelled', 'reassigned'),
    allowNull: false
  },
  previousStatus: {
    type: DataTypes.STRING(50),
    allowNull: true
  },
  newStatus: {
    type: DataTypes.STRING(50),
    allowNull: true
  },
  changedBy: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'users',
      key: 'id'
    }
  },
  reason: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  metadata: {
    type: DataTypes.JSON,
    allowNull: true
  }
}, {
  tableName: 'assignment_history'
});

module.exports = AssignmentHistory;

