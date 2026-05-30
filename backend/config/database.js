const { Sequelize } = require('sequelize');
const path = require('path');
require('dotenv').config();

const dbPath = path.resolve(__dirname, '../../database/schema/pslsh.db');

const sequelize = new Sequelize({
  dialect: 'sqlite',
  storage: dbPath,
  logging: process.env.NODE_ENV === 'development' ? false : false,
  define: {
    underscored: false,
    timestamps: true,
    paranoid: true,
  },
});

module.exports = sequelize;
