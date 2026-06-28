// Setup global Jest — force NODE_ENV=test pour bypass JWT_SECRET check
process.env.NODE_ENV = 'test';
process.env.JWT_SECRET =
  process.env.JWT_SECRET || 'test_only_secret_do_not_use_in_production_xyz123';

afterAll(async () => {
  const { sequelize } = require('../models');
  await sequelize.close();
});
