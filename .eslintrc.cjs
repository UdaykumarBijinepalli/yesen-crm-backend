// Named .cjs deliberately: package.json declares "type": "module", so a
// plain .eslintrc.js would be parsed as ESM and this file's
// `module.exports` would break. ESLint's own config loader is fine with
// .cjs regardless of the package type.
module.exports = {
  root: true,
  env: {
    node: true,
    es2022: true,
  },
  parserOptions: {
    ecmaVersion: 2022,
    sourceType: 'module',
  },
  extends: ['airbnb-base', 'prettier'],
  rules: {
    'no-console': ['warn', { allow: ['warn', 'error'] }],
    'no-underscore-dangle': ['error', { allow: ['_id'] }],
    'consistent-return': 'off', // Express handlers routinely `return res.json(...)` in some branches, `next()` in others
    'no-unused-vars': ['error', { argsIgnorePattern: '^(req|res|next)$', ignoreRestSiblings: true }],
    'import/no-extraneous-dependencies': ['error', { devDependencies: ['**/smoke-test.js', '**/*.test.js'] }],
    // Relative imports must carry an explicit .js extension under ESM (Node
    // doesn't resolve extension-less specifiers), so require it locally
    // while leaving bare package imports ("express", "mongoose") alone.
    'import/extensions': ['error', 'ignorePackages', { js: 'always' }],
    camelcase: 'off', // Mongo/third-party payloads occasionally use snake_case
    // We use named exports consistently across the codebase (including
    // single-export files like validators) so import sites read the same
    // way everywhere, rather than mixing default and named exports.
    'import/prefer-default-export': 'off',
  },
  ignorePatterns: ['node_modules/', 'uploads/', 'coverage/', 'logs/'],
};
