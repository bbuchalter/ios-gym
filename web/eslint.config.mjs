import { defineConfig, globalIgnores } from "eslint/config";
import nextVitals from "eslint-config-next/core-web-vitals";
import nextTs from "eslint-config-next/typescript";
import tailwind from "eslint-plugin-tailwindcss";
import prettier from "eslint-config-prettier";

const eslintConfig = defineConfig([
  ...nextVitals,
  ...nextTs,
  ...tailwind.configs["flat/recommended"],
  prettier, // Disables ESLint rules that conflict with Prettier
  {
    settings: {
      tailwindcss: {
        // Enforce best practices for responsive design
        callees: ["classnames", "clsx", "ctl", "cn"],
        // Set to false to skip config loading - Tailwind v4 uses CSS-first configuration
        config: false,
        cssFiles: [],
        removeDuplicates: true,
        skipClassAttribute: false,
        whitelist: [],
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
