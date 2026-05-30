const globals = require('globals');

const aiSignatures = [
  '// Note:', '// Important:', '// Remember:', '// Step \\d',
  '// Helper function', '// This function', '// We need to', '// Let\'s',
  '// Now we', '// First,', '// Then,', '// Finally,',
];

module.exports = [
  {
    ignores: [
      'node_modules/**', '**/node_modules/**',
      'storage/**', 'database/schema/**', 'graphify-out/**',
      'frontend/pages/**/*.html',
      'backend/scripts/seed.js',
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
      complexity: ['error', { max: 12 }],
      'max-lines-per-function': ['warn', { max: 80, skipBlankLines: true, skipComments: true }],
      'max-depth': ['warn', 4],
      'max-params': ['warn', 5],
      'no-unused-vars': ['error', { argsIgnorePattern: '^_', varsIgnorePattern: '^_' }],
      'prefer-const': 'error',
      'no-var': 'error',
      'no-duplicate-imports': 'error',
      'no-console': ['warn', { allow: ['warn', 'error'] }],
      'no-warning-comments': ['warn', { terms: ['todo', 'fixme', 'xxx', 'hack'], location: 'anywhere' }],
      'no-restricted-syntax': [
        'error',
        { selector: 'Program > ExpressionStatement > Literal[value=/^Step \\d/]', message: 'Commentaires de type "Step X" interdits (signature IA).' },
      ],
      eqeqeq: ['error', 'smart'],
      curly: ['error', 'multi-line'],
      'no-multiple-empty-lines': ['error', { max: 2, maxEOF: 1 }],
      'prefer-template': 'warn',
      'object-shorthand': 'warn',
      'no-restricted-globals': ['error', 'event', 'name', 'length'],
    },
  },
  {
    files: ['backend/tests/**/*.js'],
    rules: {
      'max-lines-per-function': 'off',
      'no-console': 'off',
    },
  },
];
