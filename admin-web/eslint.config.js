import js from '@eslint/js'
import vue from 'eslint-plugin-vue'
import typescript from '@typescript-eslint/eslint-plugin'
import typescriptParser from '@typescript-eslint/parser'
import prettier from 'eslint-plugin-prettier'
import prettierConfig from 'eslint-config-prettier'

export default [
  js.configs.recommended,
  ...vue.configs['flat/recommended'],
  prettierConfig,
  {
    ignores: [
      'node_modules',
      'dist',
      'coverage',
      '*.d.ts',
    ],
    files: ['**/*.{js,ts,vue}'],
    languageOptions: {
      parser: typescriptParser,
      parserOptions: {
        ecmaVersion: 'latest',
        sourceType: 'module',
        extraFileExtensions: ['.vue'],
      },
    },
    plugins: {
      '@typescript-eslint': typescript,
      prettier,
    },
    rules: {
      // TypeScript rules
      '@typescript-eslint/no-unused-vars': 'error',
      '@typescript-eslint/no-explicit-any': 'warn',
      '@typescript-eslint/explicit-function-return-type': 'off',
      '@typescript-eslint/explicit-module-boundary-types': 'off',
      
      // Vue rules
      'vue/multi-word-component-names': 'off',
      'vue/no-v-html': 'warn',
      'vue/require-default-prop': 'off',
      'vue/require-explicit-emits': 'error',
      
      // General rules
      'no-console': process.env.NODE_ENV === 'production' ? 'warn' : 'off',
      'no-debugger': process.env.NODE_ENV === 'production' ? 'warn' : 'off',
      'prefer-const': 'error',
      'no-var': 'error',
      
      // Prettier
      'prettier/prettier': 'error',
    },
  },
  {
    files: ['**/*.vue'],
    languageOptions: {
      parser: vue.parser,
      parserOptions: {
        parser: typescriptParser,
      },
    },
  },
]