const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Departement = sequelize.define(
  'Departement',
  {
    id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    nom: { type: DataTypes.STRING(150), allowNull: false },
    code: { type: DataTypes.STRING(20), allowNull: false, unique: true },
    description: { type: DataTypes.TEXT },
    responsable_id: { type: DataTypes.INTEGER },
  },
  { tableName: 'departements', paranoid: true }
);

module.exports = Departement;
