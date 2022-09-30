module.exports = {
  env: {
    browser: true,
    es2021: true,
  },
  extends: [
    'airbnb',
    'plugin:react-hooks/recommended',
    'plugin:react/recommended',
    'plugin:@typescript-eslint/eslint-recommended',
    'plugin:@typescript-eslint/recommended',
  ],
  parser: '@typescript-eslint/parser',
  parserOptions: {
    ecmaFeatures: {
      jsx: true,
    },
    ecmaVersion: 12,
    sourceType: 'module',
  },
  plugins: [
    'react',
    '@typescript-eslint',
  ],
  rules: {
    'react/jsx-filename-extension': [2, { extensions: ['.js', '.jsx', '.ts', '.tsx'] }],
    'import/extensions': 'off',
    'no-use-before-define': 'off',
    'react/jsx-props-no-spreading': 'off',
    'jsx-a11y/click-events-have-key-events': 'off',
    'jsx-a11y/no-static-element-interactions': 'off',
    'jsx-a11y/mouse-events-have-key-events': 'off',
    'no-unused-expressions': 'off',
    'react/static-property-placement': 'off',
    'react/no-did-update-set-state': 'off',
    'import/no-extraneous-dependencies': 'off',
    '@typescript-eslint/explicit-module-boundary-types': 'off',
    'linebreak-style': 'off',
    '@typescript-eslint/no-explicit-any': 'off',

  },
  settings: {
    'import/resolver': {
      typescript: {},
    },
  },
};
