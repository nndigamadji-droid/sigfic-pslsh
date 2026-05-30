const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Document = sequelize.define(
  'Document',
  {
    id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    dossier_id: { type: DataTypes.INTEGER },
    type_id: { type: DataTypes.INTEGER },
    nom_original: { type: DataTypes.STRING(255), allowNull: false },
    nom_stocke: { type: DataTypes.STRING(255), allowNull: false },
    chemin_stockage: { type: DataTypes.STRING(500) },
    mime_type: { type: DataTypes.STRING(100) },
    taille_octets: { type: DataTypes.INTEGER },
    version: { type: DataTypes.INTEGER, defaultValue: 1 },
    description: { type: DataTypes.TEXT },
    is_confidentiel: { type: DataTypes.BOOLEAN, defaultValue: false },
    uploaded_by: { type: DataTypes.INTEGER },
  },
  { tableName: 'documents', paranoid: true }
);

module.exports = Document;
