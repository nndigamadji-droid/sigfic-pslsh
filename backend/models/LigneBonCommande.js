const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const LigneBonCommande = sequelize.define(
  'LigneBonCommande',
  {
    id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    bon_commande_id: { type: DataTypes.INTEGER, allowNull: false },
    expression_besoin_id: { type: DataTypes.INTEGER },
    designation: { type: DataTypes.STRING(300), allowNull: false },
    quantite: { type: DataTypes.DECIMAL(10, 2), defaultValue: 1 },
    unite: { type: DataTypes.STRING(30) },
    prix_unitaire: { type: DataTypes.DECIMAL(18, 2), defaultValue: 0 },
    montant_ligne: { type: DataTypes.DECIMAL(18, 2), defaultValue: 0 },
  },
  { tableName: 'lignes_bon_commande', paranoid: false, timestamps: false }
);

module.exports = LigneBonCommande;
