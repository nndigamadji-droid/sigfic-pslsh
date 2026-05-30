const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const UserRole = sequelize.define(
  'UserRole',
  {
    id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    user_id: { type: DataTypes.INTEGER, allowNull: false },
    role_id: { type: DataTypes.INTEGER, allowNull: false },
    assigned_by: { type: DataTypes.INTEGER },
    assigned_at: { type: DataTypes.DATE, defaultValue: DataTypes.NOW },
  },
  { tableName: 'user_roles', paranoid: false, timestamps: false }
);

module.exports = UserRole;
