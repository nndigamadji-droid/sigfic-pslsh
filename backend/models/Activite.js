const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Activite = sequelize.define(
  'Activite',
  {
    id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    action_strategique_id: { type: DataTypes.INTEGER, allowNull: false },
    code: { type: DataTypes.STRING(20) },
    libelle: { type: DataTypes.STRING(300), allowNull: false },
    description: { type: DataTypes.TEXT },
    responsable_id: { type: DataTypes.INTEGER },
    date_debut_prevue: { type: DataTypes.DATEONLY },
    date_fin_prevue: { type: DataTypes.DATEONLY },
    statut: {
      type: DataTypes.ENUM('planifiee', 'en_cours', 'realisee', 'annulee'),
      defaultValue: 'planifiee',
    },
    created_by: { type: DataTypes.INTEGER },
  },
  { tableName: 'activites', paranoid: true }
);

module.exports = Activite;
