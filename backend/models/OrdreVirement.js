const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const OrdreVirement = sequelize.define('OrdreVirement', {
  id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  reference: { type: DataTypes.STRING(40), unique: true, comment: 'OV-AAAA-NNNN' },
  // Lien vers le dossier d'opération
  dossier_ref: { type: DataTypes.STRING(40), comment: 'DOS-AAAA-NNNN' },
  facture_ref: { type: DataTypes.STRING(40) },
  // Bénéficiaire
  beneficiaire_nom: { type: DataTypes.STRING(150), allowNull: false },
  beneficiaire_banque: { type: DataTypes.STRING(60), comment: 'CBT, Ecobank, UBA, BCC, etc.' },
  beneficiaire_compte: { type: DataTypes.STRING(40), comment: 'IBAN ou n° de compte' },
  // Montant
  montant: { type: DataTypes.DECIMAL(18, 2), allowNull: false },
  devise: { type: DataTypes.STRING(5), defaultValue: 'FCFA' },
  // Imputation
  compte_debit: { type: DataTypes.STRING(10), comment: 'ex. 4011 Fournisseurs' },
  compte_credit: { type: DataTypes.STRING(10), comment: 'ex. 5121 Banque' },
  ligne_budgetaire: { type: DataTypes.STRING(50) },
  // Objet
  objet: { type: DataTypes.STRING(300), allowNull: false },
  date_execution_prevue: { type: DataTypes.DATEONLY },
  // Signature engageante (comptable)
  signed_by: { type: DataTypes.INTEGER, comment: 'FK users.id du comptable' },
  signed_at: { type: DataTypes.DATE },
  // Ordonnancement (coordonnateur)
  ordonnance_by: { type: DataTypes.INTEGER },
  ordonnance_at: { type: DataTypes.DATE },
  // Exécution effective
  execute_at: { type: DataTypes.DATE },
  num_chèque: { type: DataTypes.STRING(40) },
  // Statut
  statut: {
    type: DataTypes.ENUM('brouillon', 'emis', 'ordonnance', 'execute', 'rejete', 'annule'),
    defaultValue: 'brouillon',
  },
  motif_rejet: { type: DataTypes.TEXT },
}, {
  tableName: 'ordres_virement',
  indexes: [{ fields: ['statut'] }, { fields: ['dossier_ref'] }, { fields: ['signed_by'] }],
});

module.exports = OrdreVirement;
