const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Attribution = sequelize.define(
  'Attribution',
  {
    id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    dossier_id: { type: DataTypes.INTEGER, allowNull: false },
    fournisseur_id: { type: DataTypes.INTEGER, allowNull: false },
    analyse_comparative_id: { type: DataTypes.INTEGER },
    montant_attribue: { type: DataTypes.DECIMAL(18, 2), defaultValue: 0 },
    date_attribution: { type: DataTypes.DATEONLY },
    numero_lettre_notification: { type: DataTypes.STRING(50) },
    created_by: { type: DataTypes.INTEGER },
  },
  { tableName: 'attributions', paranoid: true }
);

module.exports = Attribution;
