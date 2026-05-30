const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const AuditLog = sequelize.define(
  'AuditLog',
  {
    id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    user_id: { type: DataTypes.INTEGER },
    action: { type: DataTypes.STRING(100), allowNull: false },
    resource: { type: DataTypes.STRING(100) },
    resource_id: { type: DataTypes.INTEGER },
    old_values: {
      type: DataTypes.TEXT,
      get() {
        const v = this.getDataValue('old_values');
        return v ? JSON.parse(v) : null;
      },
      set(v) {
        this.setDataValue('old_values', v ? JSON.stringify(v) : null);
      },
    },
    new_values: {
      type: DataTypes.TEXT,
      get() {
        const v = this.getDataValue('new_values');
        return v ? JSON.parse(v) : null;
      },
      set(v) {
        this.setDataValue('new_values', v ? JSON.stringify(v) : null);
      },
    },
    ip_address: { type: DataTypes.STRING(45) },
    user_agent: { type: DataTypes.STRING(255) },
  },
  { tableName: 'audit_logs', paranoid: false, updatedAt: false }
);

module.exports = AuditLog;
