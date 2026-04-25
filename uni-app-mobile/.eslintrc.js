module.exports = {
  root: true,
  env: {
    node: true,
    browser: true,
    es2021: true,
    jest: true
  },
  extends: [
    'plugin:vue/vue3-recommended',
    'eslint:recommended'
  ],
  parserOptions: {
    ecmaVersion: 'latest',
    parser: '@typescript-eslint/parser',
    sourceType: 'module'
  },
  plugins: [
    'vue',
    '@typescript-eslint'
  ],
  rules: {
    'no-console': 'warn',
    'no-debugger': 'warn',
    'no-unused-vars': 'warn',
    'vue/multi-word-component-names': 'off',
    'vue/no-v-html': 'warn'
  },
  globals: {
    uni: 'readonly',
    wx: 'readonly',
    plus: 'readonly'
  }
}
