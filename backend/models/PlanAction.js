const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const PlanAction = sequelize.define(
  'PlanAction',
  {
    id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    exercice_id: { type: DataTypes.INTEGER, allowNull: false },
    type_plan: { type: DataTypes.ENUM('PTCA', 'PAO', 'PTBA'), allowNull: false },
    version: { type: DataTypes.INTEGER, defaultValue: 1 },
    libelle: { type: DataTypes.STRING(200) },
    date_approbation: { type: DataTypes.DATEONLY },
    statut: { type: DataTypes.ENUM('brouillon', 'approuve', 'revise'), defaultValue: 'brouillon' },
    created_by: { type: DataTypes.INTEGER },
  },
  { tableName: 'plans_action', paranoid: true }
);

module.exports = PlanAction;
