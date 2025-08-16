/* eslint-env node */

module.exports = {
  root: true,
  env: {
    browser: true,
    node: true,
    es2024: true,
  },
  parser: '@typescript-eslint/parser',
  parserOptions: {
    ecmaVersion: 2024,
    sourceType: 'module',
    ecmaFeatures: { jsx: true },
  },
  plugins: [
    'react',
    'react-hooks',
    'jsx-a11y',
    '@typescript-eslint',
    'prettier',
  ],
  extends: [
    'eslint:recommended',
    'plugin:react/recommended',
    'plugin:react-hooks/recommended',
    'plugin:jsx-a11y/recommended',
    'plugin:@typescript-eslint/recommended',
    'plugin:prettier/recommended',
  ],
  settings: {
    react: { version: 'detect' },
  },
  rules: {
    // allow empty destructuring (e.g. `export function meta({}: Route.MetaArgs)`)
    'no-empty-pattern': 'off',

    // Modern React
    'react/react-in-jsx-scope': 'off', // React17+
    'react/prop-types': 'off', // TS covers this

    // Unused vars
    'no-unused-vars': 'off',
    '@typescript-eslint/no-unused-vars': ['warn', { argsIgnorePattern: '^_' }],

    // JS safety
    'no-var': 'error',
    'prefer-const': 'error',

    // Relaxers
    'react/no-unescaped-entities': 'off',

    // TS strictness
    '@typescript-eslint/no-explicit-any': 'error',
    '@typescript-eslint/no-non-null-assertion': 'error',

    // Prettier
    'prettier/prettier': 'error',
  },
};
