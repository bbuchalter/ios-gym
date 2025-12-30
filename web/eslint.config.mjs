import { defineConfig, globalIgnores } from "eslint/config";
import nextVitals from "eslint-config-next/core-web-vitals";
import nextTs from "eslint-config-next/typescript";
import tailwind from "eslint-plugin-tailwindcss";

const eslintConfig = defineConfig([
  ...nextVitals,
  ...nextTs,
  ...tailwind.configs["flat/recommended"],
  {
    rules: {
      // Tailwind rules - allow custom animation classes
      'tailwindcss/no-custom-classname': ['warn', {
        whitelist: ['animate-in', 'fade-in'],
      }],
    },
    settings: {
      tailwindcss: {
        // Enforce best practices for responsive design
        callees: ["classnames", "clsx", "ctl", "cn"],
        // Set to false to skip config loading - Tailwind v4 uses CSS-first configuration
        config: false,
        cssFiles: [],
        removeDuplicates: true,
        skipClassAttribute: false,
        whitelist: ['animate-in', 'fade-in'], // Custom animation classes
        classRegex: "^class(Name)?$",
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
