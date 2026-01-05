const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Attendance = sequelize.define('Attendance', {
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
  date: {
    type: DataTypes.DATEONLY,
    allowNull: false,
    defaultValue: DataTypes.NOW
  },
  checkIn: {
    type: DataTypes.TIME,
    allowNull: true
  },
  checkOut: {
    type: DataTypes.TIME,
    allowNull: true
  },
  hoursWorked: {
    type: DataTypes.DECIMAL(5, 2),
    allowNull: true
  },
  status: {
    type: DataTypes.ENUM('present', 'absent', 'late', 'half_day'),
    defaultValue: 'present'
  },
  notes: {
    type: DataTypes.TEXT,
    allowNull: true
  }
}, {
  tableName: 'attendance',
  hooks: {
    beforeSave: (attendance) => {
      // Calculate hours worked if both check-in and check-out are provided
      if (attendance.checkIn && attendance.checkOut) {
        const [inHours, inMinutes] = attendance.checkIn.split(':').map(Number);
        const [outHours, outMinutes] = attendance.checkOut.split(':').map(Number);
        
        const inTotalMinutes = inHours * 60 + inMinutes;
        const outTotalMinutes = outHours * 60 + outMinutes;
        
        attendance.hoursWorked = ((outTotalMinutes - inTotalMinutes) / 60).toFixed(2);
      }
    }
  }
});

module.exports = Attendance;

