// eslint.config.mjs
import js from '@eslint/js';
import tseslint from 'typescript-eslint';
import react from 'eslint-plugin-react';
import unicorn from 'eslint-plugin-unicorn';
import globals from 'globals';
// import tailwind from "eslint-plugin-tailwindcss"
import prettier from 'eslint-plugin-prettier';
import prettierConfig from 'eslint-config-prettier';

/** @type {import("eslint").FlatConfig.Config[]} */
export default [
  {
    ignores: [
      '.next/**',
      'public/**',
      'next.config.js',
      'postcss.config.js',
      'commitlint.config.js',
      '**/*.config.js',
    ],
  },

  {
    files: ['**/*.{js,jsx,ts,tsx}'],
    languageOptions: {
      ecmaVersion: 'latest',
      sourceType: 'module',
      globals: {
        ...globals.browser,
        ...globals.node,
      },
      parser: tseslint.parser,
      parserOptions: {
        project: './tsconfig.json',
      },
    },
    plugins: {
      '@typescript-eslint': tseslint.plugin,
      react,
      unicorn,
      prettier,
      // tailwind,
    },
    settings: {
      react: {
        version: 'detect',
      },
      next: {
        rootDir: '.',
      },
    },
    rules: {
      ...js.configs.recommended.rules,
      ...tseslint.configs.recommended[0].rules,
      ...react.configs.recommended.rules,
      ...unicorn.configs.recommended.rules,

      // TypeScript / React tweaks
      'no-undef': 'error',
      'react/react-in-jsx-scope': 'off',
      //'tailwindcss/no-custom-classname': 'off',
      '@typescript-eslint/no-unused-vars': [
        'error',
        {
          argsIgnorePattern: '^_',
          varsIgnorePattern: '^_',
          caughtErrorsIgnorePattern: '^_',
        },
      ],
      'unicorn/prevent-abbreviations': 'off',

      // Prettier integration
      ...prettierConfig.rules,
      'prettier/prettier': [
        'error',
        {
          semi: true,
          singleQuote: true,
          trailingComma: 'all',
          tabWidth: 2,
          printWidth: 100,
          endOfLine: 'lf',
        },
      ],
    },
  },

  {
    files: ['**/*.{jsx,tsx}'],
    rules: {
      'no-console': 'warn',
    },
  },
];
