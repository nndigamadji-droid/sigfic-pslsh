const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const User = sequelize.define(
  'User',
  {
    id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    nom: { type: DataTypes.STRING(100), allowNull: false },
    prenom: { type: DataTypes.STRING(100), allowNull: false },
    email: { type: DataTypes.STRING(150), allowNull: false, unique: true },
    password_hash: { type: DataTypes.STRING(255), allowNull: false },
    telephone: { type: DataTypes.STRING(20) },
    departement_id: { type: DataTypes.INTEGER },
    service_code: { type: DataTypes.STRING(20) },
    unite_code: { type: DataTypes.STRING(20) },
    fonction: { type: DataTypes.STRING(200) },
    is_active: { type: DataTypes.BOOLEAN, defaultValue: true },
    last_login: { type: DataTypes.DATE },
    created_by: { type: DataTypes.INTEGER },
  },
  { tableName: 'users', paranoid: true }
);

module.exports = User;
