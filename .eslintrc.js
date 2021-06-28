module.exports = {
  root: true,
  extends: [
    'airbnb-base',
    'eslint:recommended',
    'prettier',
  ],
  rules: {
    'no-console': process.env.NODE_ENV === 'production' ? 'warn' : 'off',
    'no-debugger': process.env.NODE_ENV === 'production' ? 'warn' : 'off',
    'no-var': 2,
    'prefer-const': 2,
    'no-param-reassign': 'off'
  },
  globals: {
    document: 'readonly',
    localStorage: 'readonly',
    unsafeWindow: 'readonly',
    // can't use window, use unsafeWindow!
  }
}
