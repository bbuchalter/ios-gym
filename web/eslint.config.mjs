import { defineConfig, globalIgnores } from 'eslint/config';
import nextVitals from 'eslint-config-next/core-web-vitals';
import nextTs from 'eslint-config-next/typescript';
import prettier from 'eslint-config-prettier';
import importPlugin from 'eslint-plugin-import';
import tailwind from 'eslint-plugin-tailwindcss';

const eslintConfig = defineConfig([
  ...nextVitals,
  ...nextTs,
  ...tailwind.configs['flat/recommended'],
  prettier, // Disables ESLint rules that conflict with Prettier
  {
    plugins: { import: importPlugin },
    rules: {
      'import/no-unresolved': 'off', // TypeScript handles this
      'import/named': 'error',
      'import/default': 'error',
      'import/namespace': 'error',
      'import/no-duplicates': 'error',
      'import/export': 'error',
      'import/no-cycle': 'warn',
      // Disable import/order - too strict for this codebase
      'import/order': 'off',
    },
    settings: {
      'import/resolver': {
        typescript: {
          project: './tsconfig.json',
        },
        node: {
          extensions: ['.js', '.jsx', '.ts', '.tsx'],
        },
      },
      tailwindcss: {
        // Enforce best practices for responsive design
        callees: ['classnames', 'clsx', 'ctl', 'cn'],
        // Set to false to skip config loading - Tailwind v4 uses CSS-first configuration
        config: false,
        cssFiles: [],
        removeDuplicates: true,
        skipClassAttribute: false,
        whitelist: [],
        classRegex: '^class(Name)?$',
      },
    },
  },
  // Override default ignores of eslint-config-next.
  globalIgnores([
    // Default ignores of eslint-config-next:
    ".next/**",
    "out/**",
    "build/**",
    "next-env.d.ts",
  ]),
]);

export default eslintConfig;
