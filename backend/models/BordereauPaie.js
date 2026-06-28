const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const BordereauPaie = sequelize.define('BordereauPaie', {
  id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  reference: { type: DataTypes.STRING(40), comment: 'BP-AAAA-MM-NNN' },
  // Période
  mois: { type: DataTypes.STRING(7), allowNull: false, comment: 'YYYY-MM' },
  exercice: { type: DataTypes.INTEGER },
  type_paie: {
    type: DataTypes.ENUM('salaire_principal', 'prime', 'indemnite', 'avance', 'autre'),
    defaultValue: 'salaire_principal',
  },
  // Lignes (stockées en JSON pour rester simple — SQLite-friendly)
  lignes_json: { type: DataTypes.TEXT, comment: 'JSON [{agent_id, nom, montant_brut, retenues, net}]' },
  // Totaux
  nb_agents: { type: DataTypes.INTEGER, defaultValue: 0 },
  total_brut: { type: DataTypes.DECIMAL(18, 2), defaultValue: 0 },
  total_retenues: { type: DataTypes.DECIMAL(18, 2), defaultValue: 0 },
  total_net: { type: DataTypes.DECIMAL(18, 2), defaultValue: 0 },
  // Imputation
  ligne_budgetaire: { type: DataTypes.STRING(50) },
  source_financement: { type: DataTypes.STRING(40) },
  // Signature comptable
  signed_by: { type: DataTypes.INTEGER },
  signed_at: { type: DataTypes.DATE },
  // Statut
  statut: {
    type: DataTypes.ENUM('brouillon', 'emis', 'ordonnance', 'paye', 'archive'),
    defaultValue: 'brouillon',
  },
}, {
  tableName: 'bordereaux_paie',
  indexes: [{ unique: true, fields: ['reference'] }, { fields: ['mois'] }, { fields: ['statut'] }],
});

module.exports = BordereauPaie;
