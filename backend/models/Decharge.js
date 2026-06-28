const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Decharge = sequelize.define('Decharge', {
  id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  reference: { type: DataTypes.STRING(40), comment: 'DECH-AAAA-NNNN' },
  // Type de décharge
  type_decharge: {
    type: DataTypes.ENUM('quittance_paiement', 'reception_materiel', 'remise_fonds', 'restitution', 'autre'),
    defaultValue: 'quittance_paiement',
  },
  // Lien
  dossier_ref: { type: DataTypes.STRING(40) },
  ov_reference: { type: DataTypes.STRING(40), comment: 'Si liée à un OV exécuté' },
  // Bénéficiaire de la décharge (qui reçoit / signe le reçu)
  beneficiaire_nom: { type: DataTypes.STRING(150), allowNull: false },
  beneficiaire_fonction: { type: DataTypes.STRING(100) },
  beneficiaire_cni: { type: DataTypes.STRING(30), comment: 'N° CNI ou passeport' },
  // Montant ou objet
  montant: { type: DataTypes.DECIMAL(18, 2) },
  devise: { type: DataTypes.STRING(5), defaultValue: 'FCFA' },
  objet: { type: DataTypes.STRING(300), allowNull: false },
  description: { type: DataTypes.TEXT },
  // Date de la décharge
  date_decharge: { type: DataTypes.DATEONLY, defaultValue: DataTypes.NOW },
  lieu: { type: DataTypes.STRING(80), defaultValue: 'N\'Djamena' },
  // Signature comptable (qui émet) + bénéficiaire (qui reçoit)
  emise_par: { type: DataTypes.INTEGER, comment: 'FK users.id du comptable' },
  emise_le: { type: DataTypes.DATE },
  recue_par_nom: { type: DataTypes.STRING(150) },
  recue_le: { type: DataTypes.DATE },
  // Statut
  statut: {
    type: DataTypes.ENUM('brouillon', 'emise', 'remise', 'archive'),
    defaultValue: 'brouillon',
  },
}, {
  tableName: 'decharges',
  indexes: [
    { unique: true, fields: ['reference'] },
    { fields: ['type_decharge'] },
    { fields: ['statut'] },
    { fields: ['dossier_ref'] },
  ],
});

module.exports = Decharge;
