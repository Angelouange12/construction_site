const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const Budget = sequelize.define('Budget', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  siteId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    unique: true,
    references: {
      model: 'sites',
      key: 'id'
    }
  },
  plannedAmount: {
    type: DataTypes.DECIMAL(15, 2),
    allowNull: false
  },
  materialBudget: {
    type: DataTypes.DECIMAL(15, 2),
    defaultValue: 0
  },
  laborBudget: {
    type: DataTypes.DECIMAL(15, 2),
    defaultValue: 0
  },
  equipmentBudget: {
    type: DataTypes.DECIMAL(15, 2),
    defaultValue: 0
  },
  contingency: {
    type: DataTypes.DECIMAL(15, 2),
    defaultValue: 0
  },
  notes: {
    type: DataTypes.TEXT,
    allowNull: true
  }
}, {
  tableName: 'budgets'
});

module.exports = Budget;

