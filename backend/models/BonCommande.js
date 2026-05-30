const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const BonCommande = sequelize.define(
  'BonCommande',
  {
    id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    dossier_id: { type: DataTypes.INTEGER, allowNull: false },
    fournisseur_id: { type: DataTypes.INTEGER, allowNull: false },
    attribution_id: { type: DataTypes.INTEGER },
    reference: { type: DataTypes.STRING(30), unique: true },
    date_emission: { type: DataTypes.DATEONLY },
    date_livraison_prevue: { type: DataTypes.DATEONLY },
    montant_total: { type: DataTypes.DECIMAL(18, 2), defaultValue: 0 },
    statut: {
      type: DataTypes.ENUM('brouillon', 'emis', 'partiel', 'execute', 'annule'),
      defaultValue: 'brouillon',
    },
    signataire_id: { type: DataTypes.INTEGER },
    created_by: { type: DataTypes.INTEGER },
  },
  { tableName: 'bons_commande', paranoid: true }
);

module.exports = BonCommande;
