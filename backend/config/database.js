const { Sequelize } = require('sequelize');
const path = require('path');
require('dotenv').config();

const isProduction = process.env.NODE_ENV === 'production';
const isRender = process.env.RENDER === 'true';
const databaseUrl = process.env.DATABASE_URL;
if ((isProduction || isRender) && !databaseUrl) {
  throw new Error(
    'DATABASE_URL est obligatoire en production. Configurez une base PostgreSQL persistante.'
  );
}

const databaseSsl = process.env.DATABASE_SSL;
const shouldUseSsl =
  databaseSsl === 'true' || (!databaseSsl && (isProduction || isRender));
const sqliteStorage = path.resolve(
  __dirname,
  process.env.DATABASE_STORAGE_PATH || '../../database/schema/pslsh.db'
);

const commonOptions = {
  logging: process.env.NODE_ENV === 'development' ? false : false,
  define: {
    underscored: false,
    timestamps: true,
    paranoid: true,
  },
};

const sequelize = databaseUrl
  ? new Sequelize(databaseUrl, {
      ...commonOptions,
      dialect: 'postgres',
      protocol: 'postgres',
      dialectOptions: shouldUseSsl
        ? {
            ssl: {
              require: true,
              rejectUnauthorized: false,
            },
          }
        : {},
    })
  : new Sequelize({
      ...commonOptions,
      dialect: 'sqlite',
      storage: sqliteStorage,
    });

module.exports = sequelize;
