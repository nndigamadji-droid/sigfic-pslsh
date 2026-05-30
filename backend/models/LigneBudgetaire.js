const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const LigneBudgetaire = sequelize.define(
  'LigneBudgetaire',
  {
    id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    exercice_id: { type: DataTypes.INTEGER, allowNull: false },
    activite_id: { type: DataTypes.INTEGER },
    rubrique_id: { type: DataTypes.INTEGER, allowNull: false },
    source_financement_id: { type: DataTypes.INTEGER, allowNull: false },
    libelle: { type: DataTypes.STRING(300), allowNull: false },
    montant_initial: { type: DataTypes.DECIMAL(18, 2), defaultValue: 0 },
    montant_revise: { type: DataTypes.DECIMAL(18, 2), defaultValue: 0 },
    montant_engage: { type: DataTypes.DECIMAL(18, 2), defaultValue: 0 },
    montant_liquide: { type: DataTypes.DECIMAL(18, 2), defaultValue: 0 },
    montant_paye: { type: DataTypes.DECIMAL(18, 2), defaultValue: 0 },
    created_by: { type: DataTypes.INTEGER },
  },
  { tableName: 'lignes_budgetaires', paranoid: true }
);

module.exports = LigneBudgetaire;
