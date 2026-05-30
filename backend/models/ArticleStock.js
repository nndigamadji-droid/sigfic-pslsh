const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const ArticleStock = sequelize.define(
  'ArticleStock',
  {
    id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    code: { type: DataTypes.STRING(30), unique: true },
    designation: { type: DataTypes.STRING(300), allowNull: false },
    categorie: { type: DataTypes.STRING(100) },
    unite: { type: DataTypes.STRING(30) },
    stock_actuel: { type: DataTypes.DECIMAL(10, 2), defaultValue: 0 },
    stock_minimum: { type: DataTypes.DECIMAL(10, 2), defaultValue: 0 },
    emplacement: { type: DataTypes.STRING(100) },
  },
  { tableName: 'articles_stock', paranoid: true }
);

module.exports = ArticleStock;
