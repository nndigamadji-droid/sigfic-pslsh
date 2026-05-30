const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const LigneEcriture = sequelize.define(
  'LigneEcriture',
  {
    id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    ecriture_id: { type: DataTypes.INTEGER, allowNull: false },
    compte_id: { type: DataTypes.INTEGER, allowNull: false },
    libelle_ligne: { type: DataTypes.STRING(300) },
    debit: { type: DataTypes.DECIMAL(18, 2), defaultValue: 0 },
    credit: { type: DataTypes.DECIMAL(18, 2), defaultValue: 0 },
  },
  { tableName: 'lignes_ecriture', paranoid: false, timestamps: false }
);

module.exports = LigneEcriture;
