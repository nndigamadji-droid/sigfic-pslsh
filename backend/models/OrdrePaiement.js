const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const OrdrePaiement = sequelize.define(
  'OrdrePaiement',
  {
    id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    dossier_id: { type: DataTypes.INTEGER, allowNull: false },
    liquidation_id: { type: DataTypes.INTEGER },
    reference: { type: DataTypes.STRING(30), unique: true },
    date_emission: { type: DataTypes.DATEONLY },
    montant: { type: DataTypes.DECIMAL(18, 2), allowNull: false },
    mode_paiement: {
      type: DataTypes.ENUM('virement', 'cheque', 'cash', 'mobile_money'),
      defaultValue: 'virement',
    },
    beneficiaire_id: { type: DataTypes.INTEGER },
    fournisseur_id: { type: DataTypes.INTEGER },
    compte_bancaire: { type: DataTypes.STRING(50) },
    banque: { type: DataTypes.STRING(100) },
    statut: {
      type: DataTypes.ENUM('brouillon', 'emis', 'execute', 'rejete'),
      defaultValue: 'brouillon',
    },
    emis_par: { type: DataTypes.INTEGER },
    signe_par: { type: DataTypes.INTEGER },
  },
  { tableName: 'ordres_paiement', paranoid: true }
);

module.exports = OrdrePaiement;
