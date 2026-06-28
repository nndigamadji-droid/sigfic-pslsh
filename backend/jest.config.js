module.exports = {
  testEnvironment: 'node',
  testMatch: ['**/tests/**/*.test.js'],
  setupFilesAfterEnv: ['<rootDir>/tests/setup.js'],
  testTimeout: 20000,
  verbose: true,
  // Évite le hang sur connexions Sequelize ouvertes
  forceExit: false,
  detectOpenHandles: false,
  // Pas de couverture pour le moment
  collectCoverage: false,
};
