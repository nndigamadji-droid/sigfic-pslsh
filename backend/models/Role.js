const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Role = sequelize.define(
  'Role',
  {
    id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    nom: { type: DataTypes.STRING(50), allowNull: false },
    code: { type: DataTypes.STRING(30), allowNull: false, unique: true },
    description: { type: DataTypes.TEXT },
    is_system: { type: DataTypes.BOOLEAN, defaultValue: false },
  },
  { tableName: 'roles', paranoid: false }
);

module.exports = Role;
