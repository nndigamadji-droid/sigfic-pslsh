const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Facture = sequelize.define(
  'Facture',
  {
    id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    dossier_id: { type: DataTypes.INTEGER, allowNull: false },
    fournisseur_id: { type: DataTypes.INTEGER },
    reference_facture: { type: DataTypes.STRING(50) },
    date_facture: { type: DataTypes.DATEONLY },
    date_reception: { type: DataTypes.DATEONLY },
    montant_htva: { type: DataTypes.DECIMAL(18, 2), defaultValue: 0 },
    taux_tva: { type: DataTypes.DECIMAL(5, 2), defaultValue: 0 },
    montant_tva: { type: DataTypes.DECIMAL(18, 2), defaultValue: 0 },
    montant_ttc: { type: DataTypes.DECIMAL(18, 2), defaultValue: 0 },
    fichier_facture: { type: DataTypes.STRING(255) },
    statut: { type: DataTypes.ENUM('recu', 'verifie', 'rejete'), defaultValue: 'recu' },
    verifie_par: { type: DataTypes.INTEGER },
  },
  { tableName: 'factures', paranoid: true }
);

module.exports = Facture;
