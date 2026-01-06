const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const MaterialUsage = sequelize.define('MaterialUsage', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  materialId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'materials',
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
  quantity: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: false
  },
  totalCost: {
    type: DataTypes.DECIMAL(12, 2),
    allowNull: true
  },
  usageDate: {
    type: DataTypes.DATEONLY,
    defaultValue: DataTypes.NOW
  },
  notes: {
    type: DataTypes.TEXT,
    allowNull: true
  }
}, {
  tableName: 'material_usage'
});

module.exports = MaterialUsage;

