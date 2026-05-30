const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Permission = sequelize.define(
  'Permission',
  {
    id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    resource: { type: DataTypes.STRING(50), allowNull: false },
    action: { type: DataTypes.STRING(50), allowNull: false },
    description: { type: DataTypes.STRING(200) },
  },
  { tableName: 'permissions', paranoid: false, timestamps: false }
);

module.exports = Permission;
