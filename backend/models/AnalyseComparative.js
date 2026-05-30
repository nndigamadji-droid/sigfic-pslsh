const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const AnalyseComparative = sequelize.define(
  'AnalyseComparative',
  {
    id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    demande_cotation_id: { type: DataTypes.INTEGER, allowNull: false },
    created_by: { type: DataTypes.INTEGER },
    date_analyse: { type: DataTypes.DATEONLY },
    conclusion: { type: DataTypes.TEXT },
    fournisseur_selectionne_id: { type: DataTypes.INTEGER },
  },
  { tableName: 'analyses_comparatives', paranoid: true }
);

module.exports = AnalyseComparative;
