const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Reception = sequelize.define(
  'Reception',
  {
    id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    dossier_id: { type: DataTypes.INTEGER, allowNull: false },
    bon_commande_id: { type: DataTypes.INTEGER },
    contrat_id: { type: DataTypes.INTEGER },
    date_reception: { type: DataTypes.DATEONLY, allowNull: false },
    lieu_reception: { type: DataTypes.STRING(200) },
    recepteur_id: { type: DataTypes.INTEGER },
    statut: { type: DataTypes.ENUM('brouillon', 'valide'), defaultValue: 'brouillon' },
    observations: { type: DataTypes.TEXT },
    created_by: { type: DataTypes.INTEGER },
  },
  { tableName: 'receptions', paranoid: true }
);

module.exports = Reception;
