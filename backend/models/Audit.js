const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Audit = sequelize.define(
  'Audit',
  {
    id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    exercice_id: { type: DataTypes.INTEGER },
    type_audit: { type: DataTypes.ENUM('interne', 'externe', 'bailleur'), defaultValue: 'interne' },
    auditeur: { type: DataTypes.STRING(200) },
    date_debut: { type: DataTypes.DATEONLY },
    date_fin: { type: DataTypes.DATEONLY },
    rapport_path: { type: DataTypes.STRING(255) },
    statut: { type: DataTypes.ENUM('planifie', 'en_cours', 'termine'), defaultValue: 'planifie' },
    created_by: { type: DataTypes.INTEGER },
  },
  { tableName: 'audits', paranoid: true }
);

module.exports = Audit;
