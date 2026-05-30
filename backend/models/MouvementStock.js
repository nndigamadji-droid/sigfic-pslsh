const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const MouvementStock = sequelize.define(
  'MouvementStock',
  {
    id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    article_id: { type: DataTypes.INTEGER, allowNull: false },
    dossier_id: { type: DataTypes.INTEGER },
    type_mouvement: { type: DataTypes.ENUM('entree', 'sortie', 'ajustement'), allowNull: false },
    quantite: { type: DataTypes.DECIMAL(10, 2), allowNull: false },
    date_mouvement: { type: DataTypes.DATEONLY },
    agent_id: { type: DataTypes.INTEGER },
    reference_document: { type: DataTypes.STRING(50) },
  },
  { tableName: 'mouvements_stock', paranoid: false, updatedAt: false }
);

module.exports = MouvementStock;
