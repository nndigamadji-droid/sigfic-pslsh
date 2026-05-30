const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

/**
 * LigneExpressionBesoin — lignes de détail d'une expression de besoin.
 *
 * Une expression de besoin contient N lignes décrivant chaque article /
 * service demandé, avec quantité, unité et prix estimé.
 */
const LigneExpressionBesoin = sequelize.define(
  'LigneExpressionBesoin',
  {
    id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    expression_besoin_id: { type: DataTypes.INTEGER, allowNull: false },

    designation: { type: DataTypes.STRING(300), allowNull: false },
    quantite: { type: DataTypes.DECIMAL(10, 2), defaultValue: 1 },
    unite: { type: DataTypes.STRING(30) },
    prix_unitaire_estime: { type: DataTypes.DECIMAL(18, 2), defaultValue: 0 },
    total_estime: {
      type: DataTypes.VIRTUAL,
      get() {
        return parseFloat(this.quantite || 0) * parseFloat(this.prix_unitaire_estime || 0);
      },
    },
    justification: { type: DataTypes.TEXT },
  },
  {
    tableName: 'lignes_expression_besoin',
    paranoid: false,
  }
);

module.exports = LigneExpressionBesoin;
