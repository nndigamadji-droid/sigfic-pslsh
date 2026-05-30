const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const RubriqueBudgetaire = sequelize.define(
  'RubriqueBudgetaire',
  {
    id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    code: { type: DataTypes.STRING(20), unique: true },
    libelle: { type: DataTypes.STRING(200), allowNull: false },
    nature: {
      type: DataTypes.ENUM('charges', 'immobilisations', 'autres'),
      defaultValue: 'charges',
    },
    parent_id: { type: DataTypes.INTEGER },
    niveau: { type: DataTypes.INTEGER, defaultValue: 1 },
  },
  { tableName: 'rubriques_budgetaires', paranoid: false, timestamps: false }
);

module.exports = RubriqueBudgetaire;
