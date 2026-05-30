const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Recommandation = sequelize.define(
  'Recommandation',
  {
    id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    audit_id: { type: DataTypes.INTEGER },
    anomalie_id: { type: DataTypes.INTEGER },
    description: { type: DataTypes.TEXT, allowNull: false },
    responsable_id: { type: DataTypes.INTEGER },
    echeance: { type: DataTypes.DATEONLY },
    statut: {
      type: DataTypes.ENUM('en_attente', 'en_cours', 'implementee', 'rejetee'),
      defaultValue: 'en_attente',
    },
  },
  { tableName: 'recommandations', paranoid: true }
);

module.exports = Recommandation;
