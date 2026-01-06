const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const Material = sequelize.define('Material', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  name: {
    type: DataTypes.STRING(200),
    allowNull: false
  },
  description: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  unit: {
    type: DataTypes.STRING(50),
    allowNull: false
  },
  unitPrice: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: false,
    defaultValue: 0
  },
  stockQuantity: {
    type: DataTypes.INTEGER,
    defaultValue: 0
  },
  alertThreshold: {
    type: DataTypes.INTEGER,
    defaultValue: 10
  },
  supplier: {
    type: DataTypes.STRING(200),
    allowNull: true
  },
  photo: {
    type: DataTypes.STRING(500),
    allowNull: true
  },
  isActive: {
    type: DataTypes.BOOLEAN,
    defaultValue: true
  }
}, {
  tableName: 'materials'
});

// Virtual field to check if stock is low
Material.prototype.isLowStock = function() {
  return this.stockQuantity <= this.alertThreshold;
};

module.exports = Material;

