const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const SourceFinancement = sequelize.define(
  'SourceFinancement',
  {
    id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    code: { type: DataTypes.STRING(20), unique: true },
    libelle: { type: DataTypes.STRING(200), allowNull: false },
    type: { type: DataTypes.ENUM('state', 'bailleur', 'propre'), defaultValue: 'bailleur' },
    bailleur: { type: DataTypes.STRING(150) },
    convention: { type: DataTypes.STRING(100) },
    montant_total: { type: DataTypes.DECIMAL(18, 2), defaultValue: 0 },
    devise: { type: DataTypes.STRING(5), defaultValue: 'XOF' },
    taux_change: { type: DataTypes.DECIMAL(10, 4), defaultValue: 1 },
    is_active: { type: DataTypes.BOOLEAN, defaultValue: true },
  },
  { tableName: 'sources_financement', paranoid: true }
);

module.exports = SourceFinancement;
