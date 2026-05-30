const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Contrat = sequelize.define(
  'Contrat',
  {
    id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    dossier_id: { type: DataTypes.INTEGER, allowNull: false },
    fournisseur_id: { type: DataTypes.INTEGER, allowNull: false },
    attribution_id: { type: DataTypes.INTEGER },
    reference: { type: DataTypes.STRING(30), unique: true },
    date_signature: { type: DataTypes.DATEONLY },
    date_debut: { type: DataTypes.DATEONLY },
    date_fin: { type: DataTypes.DATEONLY },
    montant_contrat: { type: DataTypes.DECIMAL(18, 2), defaultValue: 0 },
    objet: { type: DataTypes.STRING(300) },
    statut: {
      type: DataTypes.ENUM('actif', 'suspendu', 'resilie', 'execute', 'expire'),
      defaultValue: 'actif',
    },
    signataire_programme_id: { type: DataTypes.INTEGER },
    signataire_fournisseur: { type: DataTypes.STRING(150) },
    created_by: { type: DataTypes.INTEGER },
  },
  { tableName: 'contrats', paranoid: true }
);

module.exports = Contrat;
