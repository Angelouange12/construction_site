const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Timesheet = sequelize.define('Timesheet', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  workerId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'workers',
      key: 'id'
    }
  },
  siteId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'sites',
      key: 'id'
    }
  },
  weekStartDate: {
    type: DataTypes.DATEONLY,
    allowNull: false
  },
  weekEndDate: {
    type: DataTypes.DATEONLY,
    allowNull: false
  },
  regularHours: {
    type: DataTypes.DECIMAL(6, 2),
    defaultValue: 0
  },
  overtimeHours: {
    type: DataTypes.DECIMAL(6, 2),
    defaultValue: 0
  },
  totalHours: {
    type: DataTypes.DECIMAL(6, 2),
    defaultValue: 0
  },
  regularPay: {
    type: DataTypes.DECIMAL(10, 2),
    defaultValue: 0
  },
  overtimePay: {
    type: DataTypes.DECIMAL(10, 2),
    defaultValue: 0
  },
  totalPay: {
    type: DataTypes.DECIMAL(10, 2),
    defaultValue: 0
  },
  status: {
    type: DataTypes.ENUM('draft', 'submitted', 'approved', 'rejected'),
    defaultValue: 'draft'
  },
  submittedAt: {
    type: DataTypes.DATE,
    allowNull: true
  },
  approvedBy: {
    type: DataTypes.INTEGER,
    allowNull: true,
    references: {
      model: 'users',
      key: 'id'
    }
  },
  approvedAt: {
    type: DataTypes.DATE,
    allowNull: true
  },
  rejectionReason: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  notes: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  dailyBreakdown: {
    type: DataTypes.JSON,
    allowNull: true
    // Format: [{ date, checkIn, checkOut, regularHours, overtimeHours }]
  }
}, {
  tableName: 'timesheets'
});

module.exports = Timesheet;

