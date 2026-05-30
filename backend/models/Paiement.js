const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Paiement = sequelize.define(
  'Paiement',
  {
    id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    ordre_paiement_id: { type: DataTypes.INTEGER, allowNull: false },
    date_paiement: { type: DataTypes.DATEONLY },
    montant_paye: { type: DataTypes.DECIMAL(18, 2) },
    reference_transaction: { type: DataTypes.STRING(100) },
    banque: { type: DataTypes.STRING(100) },
    statut: { type: DataTypes.ENUM('realise', 'rejete'), defaultValue: 'realise' },
    saisie_par: { type: DataTypes.INTEGER },
  },
  { tableName: 'paiements', paranoid: false, updatedAt: false }
);

module.exports = Paiement;
