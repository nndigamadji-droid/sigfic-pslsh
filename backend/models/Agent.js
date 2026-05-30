const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Agent = sequelize.define(
  'Agent',
  {
    id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    user_id: { type: DataTypes.INTEGER, allowNull: false },
    matricule: { type: DataTypes.STRING(30), unique: true },
    fonction: { type: DataTypes.STRING(150) },
    grade: { type: DataTypes.STRING(100) },
    date_prise_service: { type: DataTypes.DATEONLY },
    signature_path: { type: DataTypes.STRING(255) },
  },
  { tableName: 'agents', paranoid: true }
);

module.exports = Agent;
