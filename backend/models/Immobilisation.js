const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Immobilisation = sequelize.define(
  'Immobilisation',
  {
    id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    code: { type: DataTypes.STRING(30), unique: true },
    designation: { type: DataTypes.STRING(300), allowNull: false },
    categorie: { type: DataTypes.STRING(100) },
    date_acquisition: { type: DataTypes.DATEONLY },
    valeur_acquisition: { type: DataTypes.DECIMAL(18, 2), defaultValue: 0 },
    valeur_nette_comptable: { type: DataTypes.DECIMAL(18, 2), defaultValue: 0 },
    fournisseur_id: { type: DataTypes.INTEGER },
    dossier_id: { type: DataTypes.INTEGER },
    emplacement: { type: DataTypes.STRING(150) },
    responsable_id: { type: DataTypes.INTEGER },
    statut: { type: DataTypes.ENUM('actif', 'hors_service', 'cede'), defaultValue: 'actif' },
  },
  { tableName: 'immobilisations', paranoid: true }
);

module.exports = Immobilisation;
