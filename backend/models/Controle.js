const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Controle = sequelize.define(
  'Controle',
  {
    id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    dossier_id: { type: DataTypes.INTEGER, allowNull: false },
    type_controle: {
      type: DataTypes.ENUM('conformite', 'arithmetique', 'budgetaire', 'documentaire'),
      defaultValue: 'conformite',
    },
    statut: {
      type: DataTypes.ENUM('conforme', 'non_conforme', 'en_cours'),
      defaultValue: 'en_cours',
    },
    observations: { type: DataTypes.TEXT },
    controleur_id: { type: DataTypes.INTEGER },
    date_controle: { type: DataTypes.DATEONLY },
  },
  { tableName: 'controles', paranoid: true }
);

module.exports = Controle;
