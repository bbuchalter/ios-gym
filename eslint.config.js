import jest from 'eslint-plugin-jest';
import tseslint from 'typescript-eslint';

export default [
  ...tseslint.configs.recommended,
  {
    files: ['src/**/__tests__/**/*.ts'],
    ...jest.configs['flat/recommended'],
    languageOptions: {
      parser: tseslint.parser,
      parserOptions: {
        project: './tsconfig.json',
      },
      globals: {
        ...jest.environments.globals.globals,
      },
    },
  },
];

