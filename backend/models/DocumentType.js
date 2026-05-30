const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const DocumentType = sequelize.define(
  'DocumentType',
  {
    id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    code: { type: DataTypes.STRING(30), unique: true },
    libelle: { type: DataTypes.STRING(200), allowNull: false },
    module: { type: DataTypes.STRING(50) },
  },
  { tableName: 'document_types', paranoid: false, timestamps: false }
);

module.exports = DocumentType;
