const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const EcritureComptable = sequelize.define(
  'EcritureComptable',
  {
    id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    journal_id: { type: DataTypes.INTEGER, allowNull: false },
    dossier_id: { type: DataTypes.INTEGER },
    reference: { type: DataTypes.STRING(30) },
    date_ecriture: { type: DataTypes.DATEONLY, allowNull: false },
    libelle: { type: DataTypes.STRING(300) },
    numero_piece: { type: DataTypes.STRING(50) },
    statut: { type: DataTypes.ENUM('brouillon', 'validee', 'lettree'), defaultValue: 'brouillon' },
    saisie_par: { type: DataTypes.INTEGER },
    validee_par: { type: DataTypes.INTEGER },
    validee_le: { type: DataTypes.DATE },
  },
  { tableName: 'ecritures_comptables', paranoid: true }
);

module.exports = EcritureComptable;
