const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const AvisComptable = sequelize.define('AvisComptable', {
  id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  reference: { type: DataTypes.STRING(40), unique: true },
  // Lien vers l'EB concernée
  eb_id: { type: DataTypes.INTEGER, comment: 'FK expressions_besoins.id' },
  eb_reference: { type: DataTypes.STRING(40), comment: 'EB-AAAA-NNNN' },
  // Données budgétaires examinées
  ligne_budgetaire: { type: DataTypes.STRING(50) },
  source_financement: { type: DataTypes.STRING(40) },
  montant_demande: { type: DataTypes.DECIMAL(18, 2) },
  credit_disponible: { type: DataTypes.DECIMAL(18, 2) },
  // Décision de l'agent comptable
  decision: {
    type: DataTypes.ENUM('favorable', 'defavorable', 'reserve'),
    allowNull: false, defaultValue: 'favorable',
  },
  motif: { type: DataTypes.TEXT, comment: 'Justification de l\'avis' },
  conditions: { type: DataTypes.TEXT, comment: 'Conditions si avis avec réserve' },
  // Signature du comptable
  signed_by: { type: DataTypes.INTEGER, comment: 'FK users.id du comptable principal' },
  signed_at: { type: DataTypes.DATE },
  signature_hash: { type: DataTypes.STRING(64), comment: 'SHA256 de l\'acte' },
  // Statut
  statut: {
    type: DataTypes.ENUM('brouillon', 'emis', 'archive'),
    defaultValue: 'brouillon',
  },
}, {
  tableName: 'avis_comptables',
  indexes: [{ fields: ['eb_reference'] }, { fields: ['decision'] }, { fields: ['signed_by'] }],
});

module.exports = AvisComptable;
