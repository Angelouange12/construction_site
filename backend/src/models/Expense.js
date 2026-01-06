const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const Expense = sequelize.define('Expense', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  description: {
    type: DataTypes.STRING(500),
    allowNull: false
  },
  amount: {
    type: DataTypes.DECIMAL(12, 2),
    allowNull: false
  },
  category: {
    type: DataTypes.ENUM('material', 'labor', 'equipment', 'transport', 'other'),
    allowNull: false
  },
  siteId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'sites',
      key: 'id'
    }
  },
  expenseDate: {
    type: DataTypes.DATEONLY,
    defaultValue: DataTypes.NOW
  },
  receipt: {
    type: DataTypes.STRING(500),
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
  isApproved: {
    type: DataTypes.BOOLEAN,
    defaultValue: false
  }
}, {
  tableName: 'expenses'
});

module.exports = Expense;

