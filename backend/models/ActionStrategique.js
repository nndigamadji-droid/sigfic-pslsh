const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const ActionStrategique = sequelize.define(
  'ActionStrategique',
  {
    id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    plan_action_id: { type: DataTypes.INTEGER, allowNull: false },
    code: { type: DataTypes.STRING(20) },
    libelle: { type: DataTypes.STRING(300), allowNull: false },
    objectif_specifique: { type: DataTypes.TEXT },
    ordre: { type: DataTypes.INTEGER, defaultValue: 0 },
  },
  { tableName: 'actions_strategiques', paranoid: true }
);

module.exports = ActionStrategique;
