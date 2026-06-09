const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const BudgetComptaMapping = sequelize.define('BudgetComptaMapping', {
  id_mapping: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  code_ligne_budget: {
    type: DataTypes.STRING(50),
    allowNull: false,
    unique: true,
    comment: 'Clé budgétaire segmentée Tchad (ex. 02-07-01-6064)',
  },
  compte_syscohada: {
    type: DataTypes.STRING(10),
    allowNull: false,
    comment: 'Compte du plan OHADA révisé (ex. 6064)',
  },
  compte_libelle: {
    type: DataTypes.STRING(200),
  },
  sens_flux: {
    type: DataTypes.STRING(1),
    allowNull: false,
    defaultValue: 'D',
    validate: { isIn: [['D', 'C']] },
    comment: 'D = Débit (Dépense), C = Crédit (Recette)',
  },
  statut_lien: {
    type: DataTypes.BOOLEAN,
    allowNull: false,
    defaultValue: true,
  },
  source: {
    type: DataTypes.STRING(20),
    comment: 'manuel | auto-classifier | seed',
  },
  derive_score: {
    type: DataTypes.INTEGER,
    comment: 'Force du match du classifier (0 si manuel)',
  },
  created_by: { type: DataTypes.INTEGER },
  updated_by: { type: DataTypes.INTEGER },
}, {
  tableName: 't_budget_compta_mapping',
  indexes: [
    { unique: true, fields: ['code_ligne_budget'] },
    { fields: ['compte_syscohada'] },
    { fields: ['sens_flux'] },
  ],
});

module.exports = BudgetComptaMapping;
