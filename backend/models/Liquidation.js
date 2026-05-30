const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Liquidation = sequelize.define(
  'Liquidation',
  {
    id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    dossier_id: { type: DataTypes.INTEGER, allowNull: false },
    facture_id: { type: DataTypes.INTEGER },
    reference: { type: DataTypes.STRING(30), unique: true },
    date_liquidation: { type: DataTypes.DATEONLY },
    montant_liquide: { type: DataTypes.DECIMAL(18, 2), defaultValue: 0 },
    observations: { type: DataTypes.TEXT },
    liquide_par: { type: DataTypes.INTEGER },
    statut: { type: DataTypes.ENUM('en_cours', 'validee', 'rejetee'), defaultValue: 'en_cours' },
  },
  { tableName: 'liquidations', paranoid: true }
);

module.exports = Liquidation;
