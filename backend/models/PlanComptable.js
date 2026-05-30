const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const PlanComptable = sequelize.define(
  'PlanComptable',
  {
    id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    compte: { type: DataTypes.STRING(10), allowNull: false, unique: true },
    libelle: { type: DataTypes.STRING(300), allowNull: false },
    classe: { type: DataTypes.INTEGER },
    type: { type: DataTypes.ENUM('actif', 'passif', 'charge', 'produit'), defaultValue: 'charge' },
    is_analytique: { type: DataTypes.BOOLEAN, defaultValue: false },
    parent_id: { type: DataTypes.INTEGER },
    is_active: { type: DataTypes.BOOLEAN, defaultValue: true },
  },
  { tableName: 'plan_comptable', paranoid: false, timestamps: false }
);

module.exports = PlanComptable;
