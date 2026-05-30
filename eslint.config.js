const globals = require('globals');

module.exports = [
  {
    ignores: [
      'node_modules/**', '**/node_modules/**',
      'storage/**', 'database/schema/**', 'graphify-out/**',
      'frontend/pages/**/*.html',
      'backend/scripts/seed.js',
      'scripts/oneshot/**',
    ],
  },
  {
    files: ['**/*.js'],
    languageOptions: {
      ecmaVersion: 2024,
      sourceType: 'commonjs',
      globals: { ...globals.node, ...globals.browser, ...globals.jest },
    },
    rules: {
      'no-warning-comments': [
        'error',
        {
          terms: ['step 1', 'step 2', 'step 3', 'helper function', 'this function',
                  'we need to', 'let\'s ', 'now we ', 'first,', 'then,', 'finally,'],
          location: 'anywhere',
        },
      ],
    },
  },
];
