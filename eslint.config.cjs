const js = require('@eslint/js');
const globals = require('globals');
const react = require('eslint-plugin-react');
const reactHooks = require('eslint-plugin-react-hooks');
const prettierConfig = require('eslint-config-prettier');

module.exports = [
    { ignores: ['dist/**', 'node_modules/**', '.husky/**', '.vscode/**'] },
    js.configs.recommended,
    prettierConfig,
    {
        files: ['**/*.{js,jsx}'],
        languageOptions: {
            ecmaVersion: 2022,
            sourceType: 'module',
            globals: globals.browser,
            parserOptions: {
                ecmaFeatures: {
                    jsx: true,
                },
            },
        },
        plugins: {
            react,
            'react-hooks': reactHooks,
        },
        rules: {
            'react-hooks/rules-of-hooks': 'error',
            'react-hooks/exhaustive-deps': 'warn',
            'no-console': 'warn',
            'no-var': 'error',
            'prefer-const': ['error', { destructuring: 'all' }],
            'no-unused-vars': ['warn', { argsIgnorePattern: '^_', varsIgnorePattern: '^_' }],
            'no-multi-assign': 'warn',
            eqeqeq: ['error', 'smart'],
            curly: ['error', 'all'],
            'arrow-body-style': ['warn', 'as-needed'],
            'max-lines-per-function': ['warn', { max: 300, skipBlankLines: true, skipComments: true }],
            complexity: ['warn', 30],
        },
    },
];
