const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const Incident = sequelize.define('Incident', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  title: {
    type: DataTypes.STRING(200),
    allowNull: false
  },
  description: {
    type: DataTypes.TEXT,
    allowNull: false
  },
  severity: {
    type: DataTypes.ENUM('low', 'medium', 'high', 'critical'),
    allowNull: false
  },
  status: {
    type: DataTypes.ENUM('reported', 'investigating', 'resolved', 'closed'),
    defaultValue: 'reported'
  },
  siteId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'sites',
      key: 'id'
    }
  },
  reportedBy: {
    type: DataTypes.INTEGER,
    allowNull: true,
    references: {
      model: 'users',
      key: 'id'
    }
  },
  incidentDate: {
    type: DataTypes.DATEONLY,
    defaultValue: DataTypes.NOW
  },
  incidentTime: {
    type: DataTypes.TIME,
    allowNull: true
  },
  injuriesCount: {
    type: DataTypes.INTEGER,
    defaultValue: 0
  },
  actionTaken: {
    type: DataTypes.TEXT,
    allowNull: true
  }
}, {
  tableName: 'incidents'
});

module.exports = Incident;

