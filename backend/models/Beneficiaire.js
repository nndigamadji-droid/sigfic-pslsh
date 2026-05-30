const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Beneficiaire = sequelize.define(
  'Beneficiaire',
  {
    id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    nom: { type: DataTypes.STRING(150), allowNull: false },
    prenom: { type: DataTypes.STRING(100) },
    type: { type: DataTypes.ENUM('agent', 'fournisseur', 'autre'), defaultValue: 'agent' },
    telephone: { type: DataTypes.STRING(20) },
    email: { type: DataTypes.STRING(150) },
    adresse: { type: DataTypes.TEXT },
  },
  { tableName: 'beneficiaires', paranoid: true }
);

module.exports = Beneficiaire;
