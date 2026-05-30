const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Exercice = sequelize.define(
  'Exercice',
  {
    id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    annee: { type: DataTypes.INTEGER, allowNull: false, unique: true },
    libelle: { type: DataTypes.STRING(100) },
    date_debut: { type: DataTypes.DATEONLY },
    date_fin: { type: DataTypes.DATEONLY },
    statut: {
      type: DataTypes.ENUM('preparation', 'en_cours', 'clos'),
      defaultValue: 'preparation',
    },
    created_by: { type: DataTypes.INTEGER },
  },
  { tableName: 'exercices', paranoid: true }
);

module.exports = Exercice;
