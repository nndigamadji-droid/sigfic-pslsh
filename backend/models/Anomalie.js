const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Anomalie = sequelize.define(
  'Anomalie',
  {
    id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    controle_id: { type: DataTypes.INTEGER },
    dossier_id: { type: DataTypes.INTEGER },
    description: { type: DataTypes.TEXT, allowNull: false },
    gravite: { type: DataTypes.ENUM('mineur', 'majeur', 'bloquant'), defaultValue: 'mineur' },
    statut: {
      type: DataTypes.ENUM('ouverte', 'en_correction', 'resolue', 'ignoree'),
      defaultValue: 'ouverte',
    },
  },
  { tableName: 'anomalies', paranoid: true }
);

module.exports = Anomalie;
