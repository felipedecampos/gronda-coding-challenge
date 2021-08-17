module.exports = {
  env: {
    es6: true,
    node: true,
  },
  extends: [
    'airbnb-base',
    'plugin:@typescript-eslint/recommended',
    'prettier/@typescript-eslint',
    'plugin:prettier/recommended'
  ],
  globals: {
    Atomics: 'readonly',
    SharedArrayBuffer: 'readonly',Þ
  },
  parser: '@typescript-eslint/parser',
  parserOptions: {
    ecmaVersion: 2018,
    sourceType: 'module',
  },
  plugins: [
    '@typescript-eslint',
    'import',
  ],
  rules: {
    '@typescript-eslint/indent': ['error', 2],
    '@typescript-eslint/no-var-requires': 0,
    'import/extensions': ['error', 'never', { '.js': 'always', '.ts': 'always' }],
    'import/prefer-default-export': 'off',
    'import/no-extraneous-dependencies': 0,
    'no-console': 0,
    'max-len': [2, 120],
    'no-await-in-loop': 0,
    'no-plusplus': [2, { allowForLoopAfterthoughts: true }],
    'no-restricted-syntax': ['off', 'ForOfStatement'],
    'no-var': 2,
  },
  settings: {
    'import/parsers': {
      '@typescript-eslint/parser': ['.ts'],
    },
    'import/resolver': {
      typescript: {},
    },
  },
};
