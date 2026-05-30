const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const JournalComptable = sequelize.define(
  'JournalComptable',
  {
    id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    code: { type: DataTypes.STRING(10), allowNull: false, unique: true },
    libelle: { type: DataTypes.STRING(150), allowNull: false },
    type: {
      type: DataTypes.ENUM('caisse', 'banque', 'od', 'achats', 'ventes', 'analytique'),
      defaultValue: 'od',
    },
  },
  { tableName: 'journaux_comptables', paranoid: false, timestamps: false }
);

module.exports = JournalComptable;
