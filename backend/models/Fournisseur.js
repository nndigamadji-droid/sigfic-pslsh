const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Fournisseur = sequelize.define(
  'Fournisseur',
  {
    id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    code: { type: DataTypes.STRING(20), unique: true },
    raison_sociale: { type: DataTypes.STRING(200), allowNull: false },
    type: {
      type: DataTypes.ENUM('personne_physique', 'personne_morale'),
      defaultValue: 'personne_morale',
    },
    nif: { type: DataTypes.STRING(30) },
    telephone: { type: DataTypes.STRING(20) },
    email: { type: DataTypes.STRING(150) },
    adresse: { type: DataTypes.TEXT },
    domaine_activite: { type: DataTypes.STRING(200) },
    is_blacklisted: { type: DataTypes.BOOLEAN, defaultValue: false },
  },
  { tableName: 'fournisseurs', paranoid: true }
);

module.exports = Fournisseur;
