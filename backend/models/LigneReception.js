const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const LigneReception = sequelize.define(
  'LigneReception',
  {
    id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    reception_id: { type: DataTypes.INTEGER, allowNull: false },
    ligne_bon_commande_id: { type: DataTypes.INTEGER },
    designation: { type: DataTypes.STRING(300), allowNull: false },
    quantite_commandee: { type: DataTypes.DECIMAL(10, 2), defaultValue: 0 },
    quantite_recue: { type: DataTypes.DECIMAL(10, 2), defaultValue: 0 },
    unite: { type: DataTypes.STRING(30) },
    observations: { type: DataTypes.TEXT },
  },
  { tableName: 'lignes_reception', paranoid: false, timestamps: false }
);

module.exports = LigneReception;
