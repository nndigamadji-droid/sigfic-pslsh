const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const DemandeCotation = sequelize.define(
  'DemandeCotation',
  {
    id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    dossier_id: { type: DataTypes.INTEGER, allowNull: false },
    reference: { type: DataTypes.STRING(30), unique: true },
    date_emission: { type: DataTypes.DATEONLY },
    date_limite_reception: { type: DataTypes.DATEONLY },
    objet: { type: DataTypes.STRING(300) },
    statut: { type: DataTypes.ENUM('brouillon', 'envoye', 'clos'), defaultValue: 'brouillon' },
    created_by: { type: DataTypes.INTEGER },
  },
  { tableName: 'demandes_cotation', paranoid: true }
);

module.exports = DemandeCotation;
