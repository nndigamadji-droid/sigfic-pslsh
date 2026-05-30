module.exports = {
  testEnvironment: 'node',
  testMatch: ['**/tests/**/*.test.js'],
  setupFiles: ['<rootDir>/tests/setup.js'],
  testTimeout: 20000,
  verbose: true,
  // Évite le hang sur connexions Sequelize ouvertes
  forceExit: true,
  detectOpenHandles: false,
  // Pas de couverture pour le moment
  collectCoverage: false,
};
