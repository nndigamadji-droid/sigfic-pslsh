const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const AttestationServiceFait = sequelize.define(
  'AttestationServiceFait',
  {
    id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    dossier_id: { type: DataTypes.INTEGER, allowNull: false },
    reception_id: { type: DataTypes.INTEGER },
    reference: { type: DataTypes.STRING(30), unique: true },
    date: { type: DataTypes.DATEONLY },
    agent_validateur_id: { type: DataTypes.INTEGER },
    observations: { type: DataTypes.TEXT },
    statut: { type: DataTypes.ENUM('brouillon', 'signe'), defaultValue: 'brouillon' },
    created_by: { type: DataTypes.INTEGER },
  },
  { tableName: 'attestations_service_fait', paranoid: true }
);

module.exports = AttestationServiceFait;
